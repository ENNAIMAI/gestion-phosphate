<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: "/api/login",
        summary: "Authentification utilisateur",
        description: "Connectez-vous pour obtenir un jeton d'accès Sanctum.",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "password", "device_name"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "admin@phosphate.com"),
                    new OA\Property(property: "password", type: "string", format: "password", example: "password"),
                    new OA\Property(property: "device_name", type: "string", example: "web_browser")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Connexion réussie",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "success", type: "boolean", example: true),
                        new OA\Property(property: "message", type: "string", example: "Connexion réussie."),
                        new OA\Property(property: "data", type: "object")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Identifiants incorrects"),
            new OA\Response(response: 422, description: "Erreur de validation")
        ]
    )]
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données de validation incorrectes.',
                'errors' => $validator->errors(),
                'meta' => null
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Les identifiants saisis sont incorrects.',
                'errors' => null,
                'meta' => null
            ], 401);
        }

        // Generate Sanctum token
        $token = $user->createToken($request->device_name)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ],
            'meta' => null
        ]);
    }

    /**
     * Revoke authenticated user token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie.',
            'data' => null,
            'meta' => null
        ]);
    }

    /**
     * Send password reset email link.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'L\'e-mail fourni n\'existe pas dans notre base.',
                'errors' => $validator->errors(),
                'meta' => null
            ], 422);
        }

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Le lien de réinitialisation de mot de passe a été envoyé par e-mail.',
                'data' => null,
                'meta' => null
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Impossible d\'envoyer l\'e-mail de réinitialisation.',
            'errors' => null,
            'meta' => null
        ], 500);
    }

    /**
     * Reset user password using token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation lors de la réinitialisation.',
                'errors' => $validator->errors(),
                'meta' => null
            ], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Votre mot de passe a été modifié avec succès.',
                'data' => null,
                'meta' => null
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Échec de la réinitialisation. Le jeton ou l\'e-mail est invalide.',
            'errors' => null,
            'meta' => null
        ], 400);
    }
}
