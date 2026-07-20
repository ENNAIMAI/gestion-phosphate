<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasAuditLogs;

class Stock extends Model
{
    use HasFactory, HasAuditLogs;

    protected $fillable = [
        'location_id',
        'phosphate_type_id',
        'quantite',
        'unite',
        'bpl_class',
        'quality_index',
        'niveau',
        'zone',
        'carreau',
        'traitement_1',
        'traitement_2',
        'derniere_mise_a_jour',
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'derniere_mise_a_jour' => 'datetime',
    ];

    /**
     * Get composite readable quality representation.
     */
    public function getQualityStringAttribute(): string
    {
        return "{$this->unite}-{$this->bpl_class}-{$this->quality_index}-{$this->niveau}-{$this->zone}-{$this->carreau}-{$this->traitement_1}-{$this->traitement_2}";
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function phosphateType(): BelongsTo
    {
        return $this->belongsTo(PhosphateType::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }
}
