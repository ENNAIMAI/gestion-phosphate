<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Anomaly;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnomalyController extends Controller
{
    /**
     * Liste des anomalies.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = Anomaly::with(['site', 'location', 'user'])->latest();
        
        // Si c'est un opérateur, il ne voit que ses propres anomalies
        if (!$user->isAdmin() && !$user->isManager()) {
            $query->where('user_id', $user->id);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }

    /**
     * L'opérateur (ou autre) signale une anomalie.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
            'site_id' => 'nullable|exists:sites,id',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        $anomaly = Anomaly::create([
            'type' => $validated['type'],
            'description' => $validated['description'],
            'site_id' => $validated['site_id'] ?? null,
            'location_id' => $validated['location_id'] ?? null,
            'user_id' => $request->user()->id,
            'status' => 'NOUVEAU',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Anomalie signalée avec succès.',
            'data' => $anomaly->load(['site', 'location', 'user'])
        ], 201);
    }
    
    /**
     * Mettre à jour le statut (Admin/Responsable).
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isManager()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }
        
        $request->validate([
            'status' => 'required|in:NOUVEAU,EN_COURS,RESOLU'
        ]);
        
        $anomaly = Anomaly::findOrFail($id);
        $anomaly->update(['status' => $request->status]);
        
        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour.',
            'data' => $anomaly
        ]);
    }
}
