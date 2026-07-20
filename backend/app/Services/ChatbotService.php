<?php

namespace App\Services;

use App\Models\ChatbotConversation;
use App\Models\ChatbotMessage;
use App\Models\Stock;
use App\Models\Alert;
use Illuminate\Support\Str;

class ChatbotService
{
    /**
     * Send a message to the chatbot conversation and get an AI response.
     */
    public function sendMessage(int $conversationId, string $userMessageText): ChatbotMessage
    {
        $conversation = ChatbotConversation::findOrFail($conversationId);

        // 1. Save user message
        ChatbotMessage::create([
            'chatbot_conversation_id' => $conversationId,
            'sender' => 'user',
            'message' => $userMessageText,
        ]);

        // 2. Generate stock-aware response
        $botResponseText = $this->generateBotResponse($userMessageText);

        // 3. Save bot message
        return ChatbotMessage::create([
            'chatbot_conversation_id' => $conversationId,
            'sender' => 'bot',
            'message' => $botResponseText,
        ]);
    }

    /**
     * Parse the user question and return a structured response reflecting stock levels.
     */
    protected function generateBotResponse(string $message): string
    {
        $lowerMessage = Str::lower($message);

        // Query: BPL classes and quality check
        if (Str::contains($lowerMessage, ['bpl', 'qualité', 'classe'])) {
            $stocks = Stock::with(['location.site', 'phosphateType'])->get();
            if ($stocks->isEmpty()) {
                return "Désolé, il n'y a actuellement aucun stock enregistré dans le système.";
            }

            $response = "Voici la répartition actuelle de nos stocks par **classe BPL** :\n\n";
            $bplGroups = [];
            foreach ($stocks as $stock) {
                $bpl = $stock->bpl_class ?? 'SHT';
                $bplGroups[$bpl] = ($bplGroups[$bpl] ?? 0.0) + (float) $stock->quantite;
            }

            $bplMap = [
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

            foreach ($bplGroups as $bpl => $qty) {
                $label = $bplMap[$bpl] ?? $bpl;
                $response .= "• **{$bpl}** ({$label}) : **" . number_format($qty, 2) . " T** en stock.\n";
            }
            return $response;
        }

        // Query: Stock levels check
        if (Str::contains($lowerMessage, ['stock', 'quantité', 'volume', 'combien'])) {
            $stocks = Stock::with(['location.site', 'phosphateType'])->get();
            if ($stocks->isEmpty()) {
                return "Désolé, il n'y a actuellement aucun stock enregistré dans le système.";
            }

            $response = "Voici l'état actuel des stocks de phosphate :\n";
            foreach ($stocks as $stock) {
                $response .= "• **{$stock->location->site->name}** ({$stock->location->name}) : **" . number_format($stock->quantite, 2) . " T** de *{$stock->phosphateType->name}*.\n";
            }
            return $response;
        }

        // Query: Alerts check
        if (Str::contains($lowerMessage, ['alerte', 'critique', 'danger', 'dépassement'])) {
            $alerts = Alert::with(['stock.location.site', 'stock.phosphateType'])
                ->where('statut', 'NEW')
                ->get();

            if ($alerts->isEmpty()) {
                return "Bonne nouvelle! Aucun dépassement de seuil ou alerte critique n'est actif sur la plateforme.";
            }

            $response = "Attention, il y a actuellement **{$alerts->count()} alerte(s) active(s)** :\n";
            foreach ($alerts as $alert) {
                $response .= "⚠️ **{$alert->type_alerte}** sur *{$alert->stock->location->site->name}* (*{$alert->stock->location->name}*) : {$alert->message}\n";
            }
            return $response;
        }

        // Query: Help or general
        return "Bonjour! Je suis votre assistant virtuel PhosphateStock. Je peux vous renseigner sur :\n\n" .
               "1. L'état des stocks (tapez 'stock')\n" .
               "2. Les alertes en cours (tapez 'alerte')\n" .
               "3. Les prévisions de demande générées par l'IA Prophet (tapez 'IA')";
    }
}
