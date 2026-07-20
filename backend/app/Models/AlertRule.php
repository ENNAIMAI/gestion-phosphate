<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAuditLogs;

class AlertRule extends Model
{
    use HasFactory, SoftDeletes, HasAuditLogs;

    protected $fillable = [
        'name',
        'phosphate_type_id',
        'seuil_min',
        'seuil_max',
        'active',
    ];

    protected $casts = [
        'seuil_min' => 'decimal:2',
        'seuil_max' => 'decimal:2',
        'active' => 'boolean',
    ];

    public function phosphateType(): BelongsTo
    {
        return $this->belongsTo(PhosphateType::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }
}
