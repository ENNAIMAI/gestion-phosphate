<?php

namespace App\Repositories\Interfaces;

use App\Models\Stock;

interface StockRepositoryInterface extends BaseRepositoryInterface
{
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
    ): ?Stock;
}
