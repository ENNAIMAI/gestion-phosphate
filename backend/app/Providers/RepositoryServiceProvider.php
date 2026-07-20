<?php

namespace App\Providers;

use App\Repositories\Eloquent\StockRepository;
use App\Repositories\Interfaces\StockRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(StockRepositoryInterface::class, StockRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
