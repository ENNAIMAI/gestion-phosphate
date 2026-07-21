<?php

namespace App\Services;

use App\Models\Location;
use App\Models\MovementType;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Repositories\Interfaces\StockRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StockService
{
    protected StockRepositoryInterface $stockRepository;

    /**
     * StockService constructor.
     */
    public function __construct(StockRepositoryInterface $stockRepository)
    {
        $this->stockRepository = $stockRepository;
    }

    /**
     * Record a stock movement (transactional).
     *
     * @throws Exception
     */
    public function recordMovement(
        int $locationId,
        int $phosphateTypeId,
        int $movementTypeId,
        float $quantite,
        ?string $description = null,
        string $unite = 'UL',
        string $bplClass = 'SHT',
        string $qualityIndex = 'NONE',
        string $niveau = 'SA2',
        string $zone = 'L30',
        string $carreau = 'BO',
        string $traitement1 = 'B',
        string $traitement2 = 'K',
        ?string $moyenTransport = null
    ): StockMovement {
        return DB::transaction(function () use (
            $locationId, $phosphateTypeId, $movementTypeId, $quantite, $description,
            $unite, $bplClass, $qualityIndex, $niveau, $zone, $carreau, $traitement1, $traitement2, $moyenTransport
        ) {
            $location = Location::findOrFail($locationId);
            $movementType = MovementType::findOrFail($movementTypeId);

            // Find or create Stock
            $stock = $this->stockRepository->findByLocationTypeAndQuality(
                $locationId,
                $phosphateTypeId,
                $unite,
                $bplClass,
                $qualityIndex,
                $niveau,
                $zone,
                $carreau,
                $traitement1,
                $traitement2
            );

            if (!$stock) {
                $stock = Stock::create([
                    'location_id' => $locationId,
                    'phosphate_type_id' => $phosphateTypeId,
                    'unite' => $unite,
                    'bpl_class' => $bplClass,
                    'quality_index' => $qualityIndex,
                    'niveau' => $niveau,
                    'zone' => $zone,
                    'carreau' => $carreau,
                    'traitement_1' => $traitement1,
                    'traitement_2' => $traitement2,
                    'quantite' => 0.00,
                    'derniere_mise_a_jour' => now(),
                ]);
            }

            $currentQty = (float) $stock->quantite;
            $newQty = $currentQty;

            if ($movementType->direction === 'IN') {
                $newQty += $quantite;
                // Check if capacity exceeded
                if ($newQty > (float) $location->capacite_max) {
                    throw new Exception("Capacité maximale dépassée pour la localisation {$location->name}. Capacité max: {$location->capacite_max} T, requis: {$newQty} T.");
                }
            } else {
                $newQty -= $quantite;
                // Check if stock is insufficient
                if ($newQty < 0) {
                    throw new Exception("Quantité en stock insuffisante pour effectuer ce prélèvement. Stock disponible: {$currentQty} T, requis: {$quantite} T.");
                }
            }

            // Update Stock quantity (Observer will trigger checkAlerts automatically!)
            $stock->update([
                'quantite' => $newQty,
                'derniere_mise_a_jour' => now(),
            ]);

            // Save StockMovement
            return StockMovement::create([
                'stock_id' => $stock->id,
                'movement_type_id' => $movementTypeId,
                'quantite' => $quantite,
                'date_mouvement' => now(),
                'user_id' => Auth::id() ?? 1, // fallback to ID 1 if run via CLI
                'description' => $description,
                'moyen_transport' => $moyenTransport,
                'status' => 'en_cours',
            ]);
        });
    }
}
