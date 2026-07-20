<?php

namespace App\Observers;

use App\Models\Alert;
use App\Models\AlertRule;
use App\Models\Stock;
use Illuminate\Support\Facades\Log;

class StockObserver
{
    /**
     * Handle the Stock "updated" event.
     */
    public function updated(Stock $stock): void
    {
        $this->checkAlerts($stock);
    }

    /**
     * Handle the Stock "created" event.
     */
    public function created(Stock $stock): void
    {
        $this->checkAlerts($stock);
    }

    /**
     * Check if alert rules are violated and log/create alerts.
     */
    protected function checkAlerts(Stock $stock): void
    {
        $rules = AlertRule::where('phosphate_type_id', $stock->phosphate_type_id)
            ->where('active', true)
            ->get();

        foreach ($rules as $rule) {
            $qty = $stock->quantite;
            $min = $rule->seuil_min;
            $max = $rule->seuil_max;
            $triggered = false;
            $type = '';
            $message = '';

            if ($min !== null && $qty < $min) {
                $triggered = true;
                $type = 'MIN_SEUIL';
                $message = "Le stock actuel ({$qty} T) est inférieur au seuil minimum autorisé ({$min} T) pour le produit.";
            } elseif ($max !== null && $qty > $max) {
                $triggered = true;
                $type = 'MAX_SEUIL';
                $message = "Le stock actuel ({$qty} T) dépasse le seuil maximum autorisé ({$max} T) pour le produit.";
            }

            if ($triggered) {
                // Check if there is already an active alert for this stock and rule
                $exists = Alert::where('stock_id', $stock->id)
                    ->where('alert_rule_id', $rule->id)
                    ->where('statut', 'NEW')
                    ->exists();

                if (!$exists) {
                    Alert::create([
                        'alert_rule_id' => $rule->id,
                        'stock_id' => $stock->id,
                        'type_alerte' => $type,
                        'message' => $message,
                        'statut' => 'NEW',
                        'date_creation' => now(),
                    ]);

                    Log::warning("Alerte critique de stock déclenchée! Stock ID: {$stock->id}, Type: {$type}");
                }
            } else {
                // If stock is back to normal, resolve any active alerts for this rule
                Alert::where('stock_id', $stock->id)
                    ->where('alert_rule_id', $rule->id)
                    ->where('statut', 'NEW')
                    ->update([
                        'statut' => 'RESOLVED'
                    ]);
            }
        }
    }
}
