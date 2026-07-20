<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasAuditLogs;

class StockMovement extends Model
{
    use HasFactory, HasAuditLogs;

    protected $fillable = [
        'stock_id',
        'movement_type_id',
        'quantite',
        'date_mouvement',
        'user_id',
        'description',
        'moyen_transport',
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'date_mouvement' => 'datetime',
    ];

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    public function movementType(): BelongsTo
    {
        return $this->belongsTo(MovementType::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}
