<?php

namespace App\Services;

use App\Models\ChatbotConversation;
use App\Models\ChatbotMessage;
use App\Models\Stock;
use App\Models\Alert;
use App\Models\DemandPrediction;
use App\Models\Site;
use App\Models\Location;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Services\ML\NaiveBayesClassifier;
use App\Services\ML\ChatbotDataset;

class ChatbotService
{
    protected $bplMap = [
        'SHT' => 'Super High Grade (>75% BPL)',
        'THT' => 'Très Haute Teneur (73-75% BPL)',
        'HTN' => 'Haute Teneur Normale (71.5-73% BPL)',
        'HTM' => 'Haute Teneur Moyenne (69.5-71.5% BPL)',
        'MT'  => 'Moyenne Teneur (68-69.5% BPL)',
        'BTR' => 'Bas Teneur Riche (65-68% BPL)',
        'BTN' => 'Bas Teneur Normale (63-65% BPL)',
        'BTP' => 'Bas Teneur Pauvre (61-63% BPL)',
        'TBT' => 'Très Basse Teneur (56-61% BPL)',
        'XBT' => 'Extrêmement Basse Teneur (<56% BPL)',
    ];

    public function sendMessage(int $conversationId, string $userMessageText): ChatbotMessage
    {
        $conversation = ChatbotConversation::findOrFail($conversationId);

        ChatbotMessage::create([
            'chatbot_conversation_id' => $conversationId,
            'sender' => 'user',
            'message' => $userMessageText,
        ]);

        $botResponseText = $this->generateBotResponse($userMessageText, $conversationId);

        return ChatbotMessage::create([
            'chatbot_conversation_id' => $conversationId,
            'sender' => 'bot',
            'message' => $botResponseText,
        ]);
    }

    protected function generateBotResponse(string $message, int $conversationId): string
    {
        // 1. Normalization
        $normalized = $this->normalizeText($message);
        
        // 2. Extract parameters (Entities)
        $params = $this->extractParameters($normalized);
        
        // 3. NLP / ML Understanding
        $mlResult = $this->classifyIntentML($normalized);
        $intent = $mlResult['intent'];
        $confidence = $mlResult['confidence'];

        // 4. Resolve Context & Parameters
        $contextKey = "chatbot_context_{$conversationId}";
        $previousContext = Cache::get($contextKey, ['intent' => null, 'params' => []]);
        
        // If it's a contextual question like "Et le silo 2 ?" or "Et Jorf Lasfar ?"
        if (str_starts_with($normalized, 'et ') && $confidence < 0.6) {
            if ($previousContext['intent']) {
                $intent = $previousContext['intent'];
                // Keep the old parameters unless overwritten
                $params = array_merge($previousContext['params'], $params);
            }
        }

        // Apply Business Rules to override/refine ML intent based on parameters
        $finalIntent = $this->refineIntentWithBusinessRules($intent, $confidence, $params, $normalized);

        // Save context for next message
        Cache::put($contextKey, [
            'intent' => $finalIntent,
            'params' => $params
        ], 600); // 10 minutes

        Log::info("Chatbot Full Pipeline", [
            'original' => $message,
            'normalized' => $normalized,
            'ml_intent' => $intent,
            'ml_confidence' => $confidence,
            'final_intent' => $finalIntent,
            'params' => $params,
            'context_used' => $previousContext['intent'] !== null
        ]);

        // 5. Database lookup & Response Generation
        return $this->handleIntent($finalIntent, $params, $normalized);
    }

    private function normalizeText(string $text): string
    {
        $text = mb_strtolower(trim($text), 'UTF-8');
        
        $replacementsExact = [
            'ç' => 'c',
            'ça va' => 'ca va',
            'salam alikoum' => 'salam',
            'salam 3likom' => 'salam',
            'salam 3alaykom' => 'salam',
            'chno howa' => 'qu est ce que',
            'achno howa' => 'qu est ce que',
            'ch7al kayn' => 'combien',
            'ch7al' => 'combien',
            'wach kaynin' => 'y a t il',
        ];
        foreach ($replacementsExact as $search => $replace) {
            $text = str_replace($search, $replace, $text);
        }

        $text = str_replace(['’', '‘', '`', "'", "-"], " ", $text);
        $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text) ?: $text;
        $text = preg_replace('/[?.,!;:()"]/', ' ', $text);
        
        $replacements = [
            'stocks' => 'stock',
            'quantites' => 'quantite',
            'volumes' => 'stock',
            'volume' => 'stock',
            'alertes' => 'alerte',
            'previsions' => 'prevision',
            'predictions' => 'prevision',
            'prediction' => 'prevision',
            'sites' => 'site',
            'silos' => 'silo',
            'emplacements' => 'silo',
            'emplacement' => 'silo'
        ];
        
        $words = explode(' ', $text);
        foreach ($words as &$word) {
            if (isset($replacements[$word])) {
                $word = $replacements[$word];
            }
        }
        
        $text = implode(' ', $words);
        $text = preg_replace('/\s+/', ' ', $text);
        
        return trim($text);
    }

    private function extractParameters(string $normalized): array
    {
        $params = [];

        // 1. Extract BPL Classes
        $params['bpl_classes'] = [];
        $bplClasses = array_keys($this->bplMap);
        foreach ($bplClasses as $bpl) {
            if (preg_match('/\b' . strtolower($bpl) . '\b/', $normalized)) {
                $params['bpl_classes'][] = $bpl;
            }
        }
        if (!empty($params['bpl_classes'])) {
            $params['bpl_class'] = $params['bpl_classes'][0];
        }

        // 2. Extract Site
        $sites = Site::all();
        foreach ($sites as $site) {
            $siteNormalized = $this->normalizeText($site->name);
            $siteWords = explode(' ', $siteNormalized);
            $lastWord = end($siteWords);
            
            if (strpos($normalized, $siteNormalized) !== false || (strlen($lastWord) > 3 && strpos($normalized, $lastWord) !== false)) {
                $params['site_id'] = $site->id;
                $params['site_name'] = $site->name;
                break;
            }
        }

        // 3. Extract Silo / Location
        if (preg_match('/\bsilo\s+([a-z0-9]+)\b/', $normalized, $matches) || preg_match('/\bsilo([a-z0-9]+)\b/', $normalized, $matches)) {
            $siloSearch = trim($matches[1]);
            $loc = Location::where('name', 'LIKE', "%{$siloSearch}%")->first();
            if ($loc) {
                $params['location_id'] = $loc->id;
                $params['location_name'] = $loc->name;
            } else {
                $params['location_name_raw'] = $siloSearch;
            }
        }

        return $params;
    }

    private function classifyIntentML(string $normalized): array
    {
        // 1. Exact Match for ultra-short slang
        $shortExacts = [
            'cc' => 'greeting',
            'cv' => 'casual',
            'slm' => 'greeting',
            'hi' => 'greeting',
            'kifach nta' => 'casual',
            'labass' => 'casual',
            'labas' => 'casual',
        ];
        
        if (isset($shortExacts[$normalized])) {
            return ['intent' => $shortExacts[$normalized], 'confidence' => 1.0];
        }

        // 2. ML Prediction
        $mlClassifier = new NaiveBayesClassifier();
        $mlClassifier->train(ChatbotDataset::getTrainingData());
        
        return $mlClassifier->predict($normalized);
    }

    private function refineIntentWithBusinessRules(string $mlIntent, float $mlConfidence, array $params, string $normalized): string
    {
        // Rule 1: If ML confidence is very low, let's look for strong keywords
        $hasStockKeyword = preg_match('/\b(stock|quantite|combien)\b/', $normalized);
        $hasAlertKeyword = preg_match('/\b(alerte|danger|critique|probleme)\b/', $normalized);
        $hasPredictionKeyword = preg_match('/\b(prevision|predit|prophet|demande)\b/', $normalized);
        $hasBplKeyword = preg_match('/\b(bpl)\b/', $normalized);

        // Base intent from ML if confident, otherwise 'unknown'
        $intent = ($mlConfidence > 0.40) ? $mlIntent : 'unknown';

        // Override conversational or wrong intents if business keywords exist
        $isConversational = in_array($intent, ['greeting', 'casual', 'thanks', 'help']);
        if ($isConversational && ($hasStockKeyword || $hasAlertKeyword || $hasPredictionKeyword || !empty($params) || $hasBplKeyword)) {
            $intent = 'unknown'; // Needs re-evaluation
        }
        if ($hasPredictionKeyword && !str_starts_with($intent, 'prediction_')) {
            $intent = 'unknown'; 
        }

        // Rule 2: Route parameters to specific intents if general intent was detected
        if (str_starts_with($intent, 'stock_') || $intent === 'unknown') {
            if ($hasStockKeyword || str_starts_with($intent, 'stock_')) {
                if (isset($params['location_id']) || isset($params['location_name_raw'])) {
                    return 'stock_by_location';
                }
                if (isset($params['site_id'])) {
                    return 'stock_by_site';
                }
                if (isset($params['bpl_class'])) {
                    return 'stock_by_bpl';
                }
                if (preg_match('/\b(total|global)\b/', $normalized)) {
                    return 'stock_total';
                }
                if ($hasStockKeyword) {
                    return 'stock_general';
                }
            }
        }

        if (str_starts_with($intent, 'alerts_') || $intent === 'unknown') {
            if ($hasAlertKeyword || str_starts_with($intent, 'alerts_')) {
                if (isset($params['site_id'])) {
                    return 'alerts_by_site';
                }
                if (preg_match('/\b(critique|danger)\b/', $normalized)) {
                    return 'alerts_critical';
                }
                if ($hasAlertKeyword) {
                    return 'alerts_general';
                }
            }
        }

        if ($intent === 'unknown') {
            if ($hasPredictionKeyword) {
                if (preg_match('/\b(prochaine|demain|futur|prochains)\b/', $normalized)) {
                    return 'prediction_next';
                }
                return 'prediction_general';
            }
            if ($hasBplKeyword) {
                if (preg_match('/\b(classe|niveau|classes)\b/', $normalized)) {
                    return 'bpl_classification';
                }
                if (preg_match('/\b(sert|pourquoi)\b/', $normalized)) {
                    return 'bpl_purpose';
                }
                return 'bpl_definition';
            }
            if (preg_match('/\b(silo|emplacement|emplacements)\b/', $normalized)) {
                return 'location_information';
            }
            if (preg_match('/\b(site|sites)\b/', $normalized)) {
                return 'sites_list';
            }
            
            // "Et le BTR ?" without stock keyword -> but previous context handles this
            if (isset($params['bpl_class'])) {
                return 'stock_by_bpl'; // default fallback for BTR alone
            }
        }

        return $intent === 'unknown' ? 'fallback' : $intent;
    }

    private function handleIntent(string $intent, array $params, string $normalized): string
    {
        switch ($intent) {
            // CONVERSATIONAL
            case 'greeting':
                if (in_array($normalized, ['salam', 'slm', 'salam alikoum', 'salam 3likom', 'salam 3alaykom'], true)) {
                    return "Salam 👋 Comment puis-je vous aider ?";
                }
                return "Bonjour 👋 Comment puis-je vous aider avec la gestion des stocks de phosphate ?";
            case 'casual':
                return "Ça va bien, merci 😊 Que souhaitez-vous savoir sur les stocks, les alertes ou les prévisions ?";
            case 'thanks':
                return "Avec plaisir 😊 N'hésitez pas si vous avez une autre question.";
            case 'help':
                return "Je peux vous aider avec les stocks, les alertes, les prévisions de demande, le BPL et les informations sur les sites.";
            
            // BPL
            case 'bpl_definition':
                return "Le BPL (Bone Phosphate of Lime) est l'unité de mesure standard pour évaluer la pureté et la qualité du phosphate. Plus le pourcentage BPL est élevé, plus le phosphate est riche.";
            case 'bpl_purpose':
                return "Le BPL permet de classifier le phosphate selon sa qualité afin de l'orienter vers le bon traitement industriel ou le bon client final.";
            case 'bpl_classification':
                $response = "Voici les différentes classes BPL gérées :\n";
                foreach ($this->bplMap as $code => $desc) {
                    $response .= "• {$code} : {$desc}\n";
                }
                return $response;

            case 'bpl_acronym':
                if (!empty($params['bpl_classes'])) {
                    $response = "Voici les définitions demandées :\n";
                    foreach ($params['bpl_classes'] as $bpl) {
                        $desc = $this->bplMap[$bpl];
                        $response .= "• **{$bpl}** : {$desc}\n";
                    }
                    return $response;
                }
                return "Je connais plusieurs acronymes liés à la qualité (SHT, THT, BTR, etc.). Lequel souhaitez-vous que je vous explique ?";

            // STOCK
            case 'stock_by_bpl':
                if (!isset($params['bpl_class'])) return "De quelle classe BPL parlez-vous (ex: BTR, THT...) ?";
                $bpl = $params['bpl_class'];
                $stocks = Stock::with('location.site')->where('bpl_class', $bpl)->get();
                if ($stocks->isEmpty()) return "Nous n'avons actuellement aucun stock disponible pour la qualité {$bpl}.";
                
                $total = $stocks->sum('quantite');
                $response = "Le stock actuel de phosphate **{$bpl}** est de **" . number_format($total, 2, ',', ' ') . " T**.\n\nRépartition :\n";
                foreach ($stocks as $s) {
                    $response .= "• {$s->location->site->name} ({$s->location->name}) : " . number_format($s->quantite, 2, ',', ' ') . " T\n";
                }
                return $response;

            case 'stock_by_location':
                if (isset($params['location_id'])) {
                    $loc = Location::with('site')->find($params['location_id']);
                    $stocks = Stock::where('location_id', $loc->id)->get();
                    if ($stocks->isEmpty()) return "Le {$loc->name} ({$loc->site->name}) est actuellement vide.";
                    $total = $stocks->sum('quantite');
                    return "Le **{$loc->name}** ({$loc->site->name}) contient actuellement **" . number_format($total, 2, ',', ' ') . " T** de phosphate.";
                } elseif (isset($params['location_name_raw'])) {
                    return "Je n'ai pas trouvé le silo '{$params['location_name_raw']}' dans ma base de données. Pouvez-vous vérifier le nom ?";
                }
                return "Pouvez-vous préciser le nom du silo dont vous cherchez le stock ?";

            case 'stock_by_site':
                if (!isset($params['site_id'])) return "De quel site parlez-vous ?";
                $siteId = $params['site_id'];
                $stocks = Stock::whereHas('location', function($q) use ($siteId) {
                    $q->where('site_id', $siteId);
                })->get();
                if ($stocks->isEmpty()) return "Il n'y a aucun stock enregistré sur le site de {$params['site_name']}.";
                
                $total = $stocks->sum('quantite');
                return "Le site de **{$params['site_name']}** dispose d'un stock total de **" . number_format($total, 2, ',', ' ') . " T**.";

            case 'stock_total':
            case 'stock_general':
                $total = Stock::sum('quantite');
                if ($total == 0) return "Le stock total est actuellement vide.";
                return "Le stock total disponible sur l'ensemble de nos sites est de **" . number_format($total, 2, ',', ' ') . " T**.";

            // ALERTS
            case 'alerts_critical':
            case 'alerts_general':
                $alerts = Alert::with(['stock.location.site'])->where('statut', 'NEW')->get();
                if ($intent === 'alerts_critical' || strpos($normalized, 'critique') !== false) {
                    $alerts = $alerts->where('type_alerte', 'CRITIQUE');
                }
                
                if ($alerts->isEmpty()) return "Bonne nouvelle, il n'y a actuellement aucune alerte active.";
                
                $response = "Voici les alertes actuelles :\n";
                foreach ($alerts as $a) {
                    $response .= "⚠️ [{$a->type_alerte}] {$a->stock->location->site->name} ({$a->stock->location->name}) : {$a->message}\n";
                }
                return $response;

            case 'alerts_by_site':
                $siteId = $params['site_id'];
                $alerts = Alert::with(['stock.location.site'])
                    ->where('statut', 'NEW')
                    ->whereHas('stock.location', function($q) use ($siteId) {
                        $q->where('site_id', $siteId);
                    })->get();
                    
                if ($alerts->isEmpty()) return "Il n'y a aucune alerte active pour le site de {$params['site_name']}.";
                $response = "Alertes pour {$params['site_name']} :\n";
                foreach ($alerts as $a) {
                    $response .= "⚠️ [{$a->type_alerte}] Silo {$a->stock->location->name} : {$a->message}\n";
                }
                return $response;

            // SITES
            case 'sites_list':
                $sites = Site::all();
                if ($sites->isEmpty()) return "Aucun site n'est configuré.";
                $res = "Voici les sites gérés par la plateforme :\n";
                foreach ($sites as $s) {
                    $res .= "• {$s->name}\n";
                }
                return $res;
                
            case 'site_information':
                if (!isset($params['site_id'])) return "L'OCP dispose de plusieurs sites majeurs. De quel site voulez-vous parler en particulier (ex: Youssoufia) ?";
                return "Le site de **{$params['site_name']}** est un site stratégique surveillé par cette plateforme. Pour consulter ses stocks, demandez-moi : 'Quels sont les stocks de {$params['site_name']} ?'";
            
            case 'location_information':
                return "Les emplacements (silos, zones de stockage) dépendent des sites. Vous pouvez me demander par exemple : 'Quel est le stock du silo 1 ?'";

            // PREDICTIONS
            case 'prediction_next':
            case 'prediction_general':
                $predictions = DemandPrediction::with('phosphateType')
                    ->where('date_prediction', '>=', now()->format('Y-m-d'))
                    ->orderBy('date_prediction', 'asc')
                    ->limit(3)
                    ->get();

                if ($predictions->isEmpty()) {
                    return "Les prévisions sont en cours de calcul, mais le système est opérationnel. Que souhaitez-vous savoir d'autre ?";
                }

                $response = "D'après l'IA Prophet, voici les prévisions de la demande :\n";
                foreach ($predictions as $p) {
                    $date = $p->date_prediction->format('d/m/Y');
                    $qty = number_format($p->quantite_predite, 2, ',', ' ');
                    $type = $p->phosphateType ? $p->phosphateType->name : 'Phosphate';
                    $response .= "• Le {$date} : {$qty} T ({$type})\n";
                }
                return $response;

            // FALLBACK
            case 'fallback':
            default:
                if (isset($params['bpl_class'])) {
                    return "J'ai bien compris que vous parlez du **{$params['bpl_class']}**, mais que souhaitez-vous savoir exactement ? (ex: 'Quel est le stock BTR ?')";
                }
                if (isset($params['site_id'])) {
                    return "Concernant **{$params['site_name']}**, souhaitez-vous consulter ses stocks ou ses alertes ?";
                }
                return "Je n'ai pas bien compris votre demande. Je peux vous renseigner sur :\n1. L'état des stocks (tapez 'stock')\n2. Les alertes en cours (tapez 'alerte')\n3. Les prévisions de demande générées par l'IA Prophet (tapez 'IA')";
        }
    }
}
