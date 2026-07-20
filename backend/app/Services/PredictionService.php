<?php

namespace App\Services;

use App\Models\DemandPrediction;
use App\Models\PhosphateType;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class PredictionService
{
    /**
     * Fetch predictions from FastAPI microservice and save them in database.
     *
     * @return array
     */
    public function generatePredictions(int $phosphateTypeId, int $days = 30, array $options = []): array
    {
        $phosphateType = PhosphateType::findOrFail($phosphateTypeId);
        $aiServiceUrl = env('AI_SERVICE_URL', 'http://ai-service:8000');

        // Generate 2 years of daily historical data (trend + seasonality + noise)
        $history = $this->generateMockHistory();

        try {
            Log::info("Sending prediction request to AI Service for phosphate type: {$phosphateType->code}");
            
            $response = Http::timeout(25)->post("{$aiServiceUrl}/predict", [
                'history' => $history,
                'days' => $days,
                'yearly_seasonality' => (bool)($options['yearly_seasonality'] ?? true),
                'weekly_seasonality' => (bool)($options['weekly_seasonality'] ?? true),
                'confidence_interval' => (float)($options['confidence_interval'] ?? 0.95),
            ]);

            if ($response->successful()) {
                $predictionsData = $response->json();
                
                // Clear old predictions for this type
                DemandPrediction::where('phosphate_type_id', $phosphateTypeId)->delete();

                $savedList = [];
                foreach ($predictionsData['predictions'] as $pred) {
                    $savedList[] = DemandPrediction::create([
                        'phosphate_type_id' => $phosphateTypeId,
                        'date_prediction' => $pred['ds'],
                        'quantite_predite' => $pred['yhat'],
                        'score_confiance' => 95.50,
                        'metadonnees' => [
                            'yhat_lower' => $pred['yhat_lower'],
                            'yhat_upper' => $pred['yhat_upper'],
                            'model' => $predictionsData['model'] ?? 'prophet'
                        ]
                    ]);
                }

                return [
                    'status' => 'success',
                    'model' => $predictionsData['model'] ?? 'prophet',
                    'predictions' => $savedList,
                    'history' => $history
                ];
            }
            
            throw new Exception("FastAPI returned error code: " . $response->status());
            
        } catch (Exception $e) {
            Log::error("AI prediction microservice error: " . $e->getMessage() . ". Switching to linear fallback.");
            return $this->generateFallbackPredictions($phosphateTypeId, $days, $history);
        }
    }

    /**
     * Fallback prediction calculator using linear progression.
     */
    protected function generateFallbackPredictions(int $phosphateTypeId, int $days, array $history): array
    {
        // Simple fallback calculation
        DemandPrediction::where('phosphate_type_id', $phosphateTypeId)->delete();
        
        $savedList = [];
        $startDate = now();
        $currentValue = count($history) > 0 ? end($history)['y'] : 28000;
        
        for ($i = 1; $i <= $days; $i++) {
            $date = $startDate->copy()->addDays($i)->format('Y-m-d');
            $currentValue += rand(-200, 300) + 50; // mock trend
            
            $savedList[] = DemandPrediction::create([
                'phosphate_type_id' => $phosphateTypeId,
                'date_prediction' => $date,
                'quantite_predite' => $currentValue,
                'score_confiance' => 80.00,
                'metadonnees' => [
                    'model' => 'fallback_linear_php',
                    'yhat_lower' => $currentValue * 0.9,
                    'yhat_upper' => $currentValue * 1.1
                ]
            ]);
        }

        return [
            'status' => 'success',
            'model' => 'fallback_linear_php',
            'predictions' => $savedList,
            'history' => $history
        ];
    }

    /**
     * Helper to generate 2 years (730 days) of daily historical data.
     */
    private function generateMockHistory(): array
    {
        $history = [];
        $startDate = now()->subDays(730);
        $currentValue = 20000;
        
        for ($i = 0; $i < 730; $i++) {
            $date = $startDate->copy()->addDays($i)->format('Y-m-d');
            
            // Tendance croissante
            $trend = $i * 12;
            
            // Saisonnalité annuelle (cycle de 365 jours)
            $seasonality = sin(($i / 365.0) * 2 * M_PI) * 4000;
            
            // Bruit aléatoire
            $noise = rand(-800, 800);
            
            $val = $currentValue + $trend + $seasonality + $noise;
            
            $history[] = [
                'ds' => $date,
                'y' => round(max(5000, $val), 2)
            ];
        }
        return $history;
    }
}
