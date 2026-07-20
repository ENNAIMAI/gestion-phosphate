<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $controller = app()->make(App\Http\Controllers\API\SettingsController::class);
    $response = $controller->index();
    echo $response->getContent();
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
