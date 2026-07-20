<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$logs = \App\Models\AuditLog::with('user')
            ->where('auditable_type', \App\Models\DemandPrediction::class)
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get();
            
$history = $logs->map(function($l) {
    return [];
});

echo "Logs empty? " . ($logs->isEmpty() ? 'Yes' : 'No') . "\n";
echo "History empty? " . ($history->isEmpty() ? 'Yes' : 'No') . "\n";
