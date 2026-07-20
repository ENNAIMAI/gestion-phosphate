<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$start = microtime(true);
$controller = app()->make(App\Http\Controllers\API\StockController::class);
$response = $controller->index();
$end = microtime(true);

echo "Time taken: " . ($end - $start) . " seconds\n";
echo substr($response->getContent(), 0, 100) . "...\n";
