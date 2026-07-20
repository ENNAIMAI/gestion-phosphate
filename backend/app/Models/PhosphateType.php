<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAuditLogs;

class PhosphateType extends Model
{
    use HasFactory, SoftDeletes, HasAuditLogs;

    protected $fillable = [
        'name',
        'code',
        'densite',
        'description',
    ];

    protected $casts = [
        'densite' => 'decimal:2',
    ];

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function alertRules(): HasMany
    {
        return $this->hasMany(AlertRule::class);
    }

    public function demandPredictions(): HasMany
    {
        return $this->hasMany(DemandPrediction::class);
    }
}
