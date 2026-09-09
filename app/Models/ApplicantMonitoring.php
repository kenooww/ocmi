<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApplicantMonitoring extends Model
{
    protected $appends = [
        'monitoring_reference',
    ];

    protected $fillable = [
        'proposed_date',
        'proposed_by',
        'principal_id',
        'crewing',
    ];

    protected $casts = [
        'proposed_date' => 'date',
    ];

    public function principal(): BelongsTo
    {
        return $this->belongsTo(Principal::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ApplicantMonitoringItem::class);
    }

    public function getMonitoringReferenceAttribute(): string
    {
        return 'AM-' . str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
    }
}
