<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$logs = \App\Models\AuditLog::all();
echo "Total logs: " . $logs->count() . "\n";
$predLogs = \App\Models\AuditLog::where('auditable_type', \App\Models\DemandPrediction::class)->get();
echo "Pred logs: " . $predLogs->count() . "\n";
