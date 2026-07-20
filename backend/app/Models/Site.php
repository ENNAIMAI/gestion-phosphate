<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAuditLogs;

class Site extends Model
{
    use HasFactory, SoftDeletes, HasAuditLogs;

    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }
}
