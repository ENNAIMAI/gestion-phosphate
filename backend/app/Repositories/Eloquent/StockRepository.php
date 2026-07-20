<?php

namespace App\Repositories\Eloquent;

use App\Models\Stock;
use App\Repositories\Interfaces\StockRepositoryInterface;

class StockRepository extends BaseRepository implements StockRepositoryInterface
{
    /**
     * StockRepository constructor.
     */
    public function __construct(Stock $model)
    {
        parent::__construct($model);
    }

    /**
     * Find stock by location, type, and quality metrics.
     */
    public function findByLocationTypeAndQuality(
        int $locationId,
        int $phosphateTypeId,
        string $unite,
        string $bplClass,
        string $qualityIndex,
        string $niveau,
        string $zone,
        string $carreau,
        string $traitement1,
        string $traitement2
    ): ?Stock {
        return $this->model->where('location_id', $locationId)
            ->where('phosphate_type_id', $phosphateTypeId)
            ->where('unite', $unite)
            ->where('bpl_class', $bplClass)
            ->where('quality_index', $qualityIndex)
            ->where('niveau', $niveau)
            ->where('zone', $zone)
            ->where('carreau', $carreau)
            ->where('traitement_1', $traitement1)
            ->where('traitement_2', $traitement2)
            ->first();
    }
}
