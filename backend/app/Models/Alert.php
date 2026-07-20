<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\HasAuditLogs;

class Alert extends Model
{
    use HasFactory, HasAuditLogs;

    protected $fillable = [
        'alert_rule_id',
        'stock_id',
        'type_alerte',
        'message',
        'statut',
        'date_creation',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
    ];

    public function alertRule(): BelongsTo
    {
        return $this->belongsTo(AlertRule::class);
    }

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }
}
