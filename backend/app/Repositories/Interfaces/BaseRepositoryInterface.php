<?php

namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface BaseRepositoryInterface
{
    /**
     * Get all records.
     */
    public function all(): Collection;

    /**
     * Find a record by its ID.
     */
    public function find(int $id): ?Model;

    /**
     * Create a new record.
     */
    public function create(array $attributes): Model;

    /**
     * Update an existing record.
     */
    public function update(int $id, array $attributes): bool;

    /**
     * Delete a record by ID.
     */
    public function delete(int $id): bool;
}
