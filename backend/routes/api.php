<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\StockController;
use App\Http\Controllers\API\PredictionController;
use App\Http\Controllers\API\ChatbotController;
use App\Http\Controllers\API\SettingsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider or bootstrap/app.php
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes (requires Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard & metadata
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/phosphate-types', [DashboardController::class, 'phosphateTypes']);
    Route::get('/locations', [DashboardController::class, 'locations']);
    
    // Stocks & Movements (enforces validation and policies inside)
    Route::get('/stocks', [StockController::class, 'index']);
    Route::post('/stocks', [StockController::class, 'store']);
    Route::put('/stocks/{id}', [StockController::class, 'update']);
    Route::delete('/stocks/{id}', [StockController::class, 'destroy']);
    Route::post('/movements', [StockController::class, 'storeMovement']);
    Route::post('/movements/{id}/validate', [StockController::class, 'validateMovement']);
    Route::delete('/movements/{id}', [StockController::class, 'destroyMovement']);
    Route::get('/movements', [DashboardController::class, 'movements']);
    Route::get('/audit-logs', [DashboardController::class, 'auditLogs']);
    Route::get('/reports/excel', [StockController::class, 'exportExcel']);
    Route::get('/reports/pdf', [StockController::class, 'exportPdf']);
    Route::post('/reports/generate-gf', [StockController::class, 'generateGFReport']);
    Route::get('/reports/history', [StockController::class, 'reportHistory']);
    Route::post('/reports/preview', [StockController::class, 'reportPreview']);
    
    // AI Predictions
    Route::post('/predict', [PredictionController::class, 'predict']);
    Route::get('/predictions', [DashboardController::class, 'predictions']);
    Route::get('/predictions/history', [PredictionController::class, 'history']);

    // Settings Configuration
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings/alert-rules/{id}', [SettingsController::class, 'updateAlertRule']);
    
    // Anomalies
    Route::get('/anomalies', [\App\Http\Controllers\API\AnomalyController::class, 'index']);
    Route::post('/anomalies', [\App\Http\Controllers\API\AnomalyController::class, 'store']);
    Route::put('/anomalies/{id}', [\App\Http\Controllers\API\AnomalyController::class, 'updateStatus']);
    
    Route::post('/phosphate-types', [SettingsController::class, 'storePhosphateType']);
    Route::put('/phosphate-types/{id}', [SettingsController::class, 'updatePhosphateType']);
    Route::delete('/phosphate-types/{id}', [SettingsController::class, 'destroyPhosphateType']);
    Route::post('/settings/users', [SettingsController::class, 'storeUser']);
    Route::put('/settings/users/{id}', [SettingsController::class, 'updateUser']);
    Route::delete('/settings/users/{id}', [SettingsController::class, 'destroyUser']);
    Route::post('/settings/users/{id}/reset-password', [SettingsController::class, 'resetPassword']);

    // Chatbot Assistant
    Route::post('/chatbot/conversation', [ChatbotController::class, 'startConversation']);
    Route::post('/chatbot/conversation/{conversation}/message', [ChatbotController::class, 'sendMessage']);
    Route::get('/chatbot/conversation/{conversation}/history', [ChatbotController::class, 'getHistory']);
});
