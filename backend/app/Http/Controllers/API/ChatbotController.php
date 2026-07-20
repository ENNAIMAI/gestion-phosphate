<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatbotMessageRequest;
use App\Models\ChatbotConversation;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatbotController extends Controller
{
    protected ChatbotService $chatbotService;

    /**
     * ChatbotController constructor.
     */
    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Start a new chatbot conversation session.
     */
    public function startConversation(Request $request): JsonResponse
    {
        $conversation = ChatbotConversation::create([
            'user_id' => Auth::id() ?? 1,
            'title' => $request->input('title', 'Discussion du ' . now()->format('d/m/Y H:i')),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Session de discussion démarrée.',
            'data' => $conversation,
            'meta' => null
        ], 201);
    }

    /**
     * Send a message to an active conversation and get chatbot response.
     */
    public function sendMessage(ChatbotConversation $conversation, ChatbotMessageRequest $request): JsonResponse
    {
        // Enforce user ownership of conversation session
        if ($conversation->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Discussion non autorisée.',
                'errors' => null,
                'meta' => null
            ], 403);
        }

        $botMessage = $this->chatbotService->sendMessage($conversation->id, $request->message);

        // Return latest messages
        $messages = $conversation->messages()->orderBy('created_at', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Message envoyé.',
            'data' => [
                'bot_reply' => $botMessage,
                'history' => $messages
            ],
            'meta' => null
        ]);
    }

    /**
     * Retrieve messages history.
     */
    public function getHistory(ChatbotConversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé.',
                'errors' => null,
                'meta' => null
            ], 403);
        }

        $messages = $conversation->messages()->orderBy('created_at', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Historique de discussion récupéré.',
            'data' => $messages,
            'meta' => null
        ]);
    }
}
