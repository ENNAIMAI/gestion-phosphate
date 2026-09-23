<?php

namespace Tests\Unit;

use App\Services\ChatbotService;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;
use ReflectionMethod;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ChatbotServiceIntentTest extends TestCase
{
    use RefreshDatabase;
    private ChatbotService $service;
    private ReflectionMethod $generateBotResponse;
    private ReflectionMethod $normalizeText;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ChatbotService();
        
        $this->generateBotResponse = new ReflectionMethod(ChatbotService::class, 'generateBotResponse');
        $this->generateBotResponse->setAccessible(true);
        
        $this->normalizeText = new ReflectionMethod(ChatbotService::class, 'normalizeText');
        $this->normalizeText->setAccessible(true);
    }

    /**
     * Testing NLP understanding of generalization.
     */
    #[DataProvider('generalizationMessages')]
    public function test_nlp_understands_generalized_questions(string $message, string $expectedIntentSubString): void
    {
        // To test purely the internal pipeline without creating ChatbotConversation models in DB,
        // we use the internal protected generateBotResponse method.
        // generateBotResponse logs and caches, so we can check the cache or just check the output string.
        // Actually, we can just intercept the cache to verify the final intent.
        
        $conversationId = 9999; // Mock conversation ID
        $this->generateBotResponse->invoke($this->service, $message, $conversationId);
        
        $context = Cache::get("chatbot_context_{$conversationId}");
        $this->assertNotNull($context);
        $this->assertStringContainsString($expectedIntentSubString, $context['intent']);
    }

    public static function generalizationMessages(): array
    {
        return [
            // BPL Generalization
            ["Qu'est-ce que le BPL ?", 'bpl'],
            ["C'est quoi le BPL ?", 'bpl'],
            ["Que signifie BPL ?", 'bpl'],
            ["À quoi sert le BPL ?", 'bpl'],
            ["Explique-moi le BPL.", 'bpl'],
            ["Tu peux m'expliquer ce que veut dire BPL ?", 'bpl'], // Never seen in dataset

            // STOCK Generalization
            ["Quel est le stock ?", 'stock'],
            ["Donne-moi l'état des stocks.", 'stock'],
            ["Combien avons-nous de phosphate ?", 'stock'],
            ["Quel est le stock du silo 1 ?", 'stock_by_location'],
            ["Combien contient le silo 1 ?", 'stock_by_location'],
            ["Donne-moi le stock BTR.", 'stock_by_bpl'],
            ["Combien y a-t-il dans le silo 1 ?", 'stock_by_location'], // Generalization

            // ALERTS
            ["Quelles sont les alertes ?", 'alert'],
            ["Y a-t-il des alertes ?", 'alert'],
            ["Quels stocks sont critiques ?", 'alert'],
            ["Montre-moi les alertes actuelles.", 'alert'],
            ["Est-ce qu'il y a quelque chose d'anormal au niveau des stocks ?", 'alert'], // Generalization

            // PREDICTIONS
            ["Quelle est la prochaine prévision ?", 'prediction'],
            ["Que prévoit l'IA ?", 'prediction'],
            ["Quelles sont les prévisions ?", 'prediction'],
            ["Quelle sera la demande ?", 'prediction'],
            ["Que prédit Prophet ?", 'prediction'],
            
            // SITES
            ["Quels sont les sites ?", 'sites_list'],
            ["Quels sont les emplacements ?", 'location_information'],
            ["Où est stocké le phosphate ?", 'stock'],

            // CONVERSATIONAL
            ["Bonjour", 'greeting'],
            ["CC", 'greeting'],
            ["cv", 'casual'],
            ["slm", 'greeting'],
            ["salam", 'greeting'],
            ["merci", 'thanks'],
            ["chokran", 'thanks'], // Darija

            // COMPOSED & HYBRID
            ["Salut, quel est le stock du silo 1 ?", 'stock_by_location'],
            ["CC, donne-moi le stock BTR.", 'stock_by_bpl'],
            ["SLM, quelles sont les alertes ?", 'alerts_general'],
            ["Merci, quelle est la prochaine prévision ?", 'prediction_next'],
            
            // DARIJA
            ["chno howa BPL", 'bpl_definition'],
            ["achno howa BPL", 'bpl_definition'],
            ["donne moi stock BTR", 'stock_by_bpl'],
            ["ch7al kayn f BTR", 'stock_by_bpl'],
            ["ch7al f silo 1", 'stock_by_location'],
            ["wach kaynin alertes", 'alerts_general'],
            
            // FALLBACK
            ["xyzabc123", 'fallback'],
            ["blablabla quelque chose", 'fallback'],
            ["qwerty test", 'fallback'],
        ];
    }
    
    public function test_context_is_maintained_across_messages(): void
    {
        $conversationId = 8888;
        
        // 1. User asks for a silo
        $this->generateBotResponse->invoke($this->service, "Quel est le stock du silo 1 ?", $conversationId);
        $context1 = Cache::get("chatbot_context_{$conversationId}");
        $this->assertEquals('stock_by_location', $context1['intent']);
        $this->assertEquals('1', $context1['params']['location_name_raw']);
        
        // 2. User asks contextually
        $this->generateBotResponse->invoke($this->service, "Et le silo 2 ?", $conversationId);
        $context2 = Cache::get("chatbot_context_{$conversationId}");
        
        $this->assertEquals('stock_by_location', $context2['intent']);
        $this->assertEquals('2', $context2['params']['location_name_raw']);
    }
}
