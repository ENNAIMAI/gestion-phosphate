<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait HasAuditLogs
{
    /**
     * Boot the trait to automatically log eloquent event changes.
     */
    public static function bootHasAuditLogs(): void
    {
        static::created(function ($model) {
            self::logAudit('create', $model, null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $oldValues = array_intersect_key($model->getRawOriginal(), $model->getDirty());
            $newValues = $model->getDirty();
            
            // Clean up timestamp modifications to prevent noise
            unset($oldValues['updated_at'], $newValues['updated_at']);
            if (empty($newValues)) {
                return;
            }
            
            self::logAudit('update', $model, $oldValues, $newValues);
        });

        static::deleted(function ($model) {
            self::logAudit('delete', $model, $model->getAttributes(), null);
        });
    }

    /**
     * Create an audit log record in the database.
     */
    protected static function logAudit(string $action, $model, ?array $oldValues, ?array $newValues): void
    {
        if ($model instanceof AuditLog) {
            return;
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
