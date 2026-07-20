<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AlertRule;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    /**
     * Get alert rules, users, and audit logs for settings dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'Admin' && $user->role !== 'Responsable Stock') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé aux paramètres.'
            ], 403);
        }

        $rules = AlertRule::with('phosphateType')->get();
        
        // Fetch all active and soft-deleted users
        $users = User::select('id', 'name', 'email', 'role', 'active', 'created_at')
            ->orderBy('name', 'asc')
            ->get();

        // Fetch recent audit logs
        $logs = AuditLog::with('user')
            ->orderBy('id', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'alert_rules' => $rules,
                'users' => $users,
                'audit_logs' => $logs,
                'ai_config' => [
                    'default_model' => 'Prophet AI',
                    'confidence_interval' => 0.95,
                    'yearly_seasonality' => true,
                    'weekly_seasonality' => true,
                    'daily_seasonality' => false
                ]
            ]
        ]);
    }

    /**
     * Update an alert rule threshold.
     */
    public function updateAlertRule(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'Admin' && $user->role !== 'Responsable Stock') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé pour modifier les paramètres.'
            ], 403);
        }

        $request->validate([
            'seuil_min' => 'required|numeric|min:0',
            'seuil_max' => 'required|numeric|gte:seuil_min',
            'active' => 'required|boolean'
        ]);

        $rule = AlertRule::findOrFail($id);
        $rule->update([
            'seuil_min' => $request->seuil_min,
            'seuil_max' => $request->seuil_max,
            'active' => $request->active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Règle d\'alerte mise à jour avec succès.',
            'data' => $rule->load('phosphateType')
        ]);
    }

    /**
     * Store a new user.
     */
    public function storeUser(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les administrateurs peuvent créer de nouveaux utilisateurs.'
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:Admin,Responsable Stock',
            'active' => 'required|boolean'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'active' => $request->active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès.',
            'data' => $user
        ]);
    }

    /**
     * Update an existing user.
     */
    public function updateUser(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les administrateurs peuvent modifier les utilisateurs.'
            ], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'required|in:Admin,Responsable Stock',
            'active' => 'required|boolean'
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'active' => $request->active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès.',
            'data' => $user
        ]);
    }

    /**
     * Delete a user.
     */
    public function destroyUser(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les administrateurs peuvent supprimer des utilisateurs.'
            ], 403);
        }

        if ($currentUser->id == $id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.'
            ], 400);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès.'
        ]);
    }

    /**
     * Reset a user password.
     */
    public function resetPassword(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les administrateurs peuvent réinitialiser les mots de passe.'
            ], 403);
        }

        $request->validate([
            'password' => 'required|string|min:6'
        ]);

        $user = User::findOrFail($id);
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Le mot de passe de l\'utilisateur a été réinitialisé.'
        ]);
    }

    /**
     * Store a new phosphate type.
     */
    public function storePhosphateType(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'Admin' && $currentUser->role !== 'Responsable Stock') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les administrateurs et responsables peuvent créer de nouveaux produits.'
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:phosphate_types',
            'code' => 'required|string|max:50|unique:phosphate_types',
            'densite' => 'required|numeric|min:0.1',
            'description' => 'nullable|string|max:1000',
            'quantite' => 'nullable|numeric|min:0',
            'location_id' => 'nullable|exists:locations,id',
            'seuil_min' => 'nullable|numeric|min:0'
        ]);

        $type = \App\Models\PhosphateType::create([
            'name' => $request->name,
            'code' => $request->code,
            'densite' => $request->densite,
            'description' => $request->description
        ]);

        // Also create a default alert rule for this phosphate type
        AlertRule::create([
            'name' => "Alerte Seuil - {$type->name}",
            'phosphate_type_id' => $type->id,
            'seuil_min' => $request->seuil_min ?? 10000,
            'seuil_max' => 100000,
            'active' => true
        ]);

        // If location and quantity are provided, initialize stock
        if ($request->filled('location_id') && $request->filled('quantite')) {
            \App\Models\Stock::create([
                'location_id' => $request->location_id,
                'phosphate_type_id' => $type->id,
                'quantite' => $request->quantite,
                'qualite_moyenne' => 'N/A'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Type de phosphate créé avec succès.',
            'data' => $type
        ]);
    }

    /**
     * Update an existing phosphate type.
     */
    public function updatePhosphateType(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'Admin' && $currentUser->role !== 'Responsable Stock') {
            return response()->json(['success' => false, 'message' => 'Non autorisé.'], 403);
        }

        $type = \App\Models\PhosphateType::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:phosphate_types,name,' . $id,
            'code' => 'required|string|max:50|unique:phosphate_types,code,' . $id,
            'densite' => 'required|numeric|min:0.1',
            'description' => 'nullable|string|max:1000'
        ]);

        $type->update($request->only(['name', 'code', 'densite', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Type de phosphate mis à jour avec succès.',
            'data' => $type
        ]);
    }

    /**
     * Delete a phosphate type.
     */
    public function destroyPhosphateType(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if ($currentUser->role !== 'Admin' && $currentUser->role !== 'Responsable Stock') {
            return response()->json(['success' => false, 'message' => 'Non autorisé.'], 403);
        }

        $type = \App\Models\PhosphateType::findOrFail($id);
        
        // Delete related stocks first
        \App\Models\Stock::where('phosphate_type_id', $id)->delete();

        // Delete related alert rules
        AlertRule::where('phosphate_type_id', $id)->delete();
        
        $type->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé avec succès.'
        ]);
    }
}
