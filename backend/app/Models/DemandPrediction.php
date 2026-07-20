<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\HasAuditLogs;

class DemandPrediction extends Model
{
    use HasFactory, HasAuditLogs;

    protected $fillable = [
        'phosphate_type_id',
        'date_prediction',
        'quantite_predite',
        'score_confiance',
        'metadonnees',
    ];

    protected $casts = [
        'date_prediction' => 'date',
        'quantite_predite' => 'decimal:2',
        'score_confiance' => 'decimal:2',
        'metadonnees' => 'array',
    ];

    public function phosphateType(): BelongsTo
    {
        return $this->belongsTo(PhosphateType::class);
    }
}
