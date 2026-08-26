<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantMonitoringItem extends Model
{
    protected $fillable = [
        'applicant_monitoring_id',
        'client_id',
        'country',
        'rank',
        'contact',
        'status',
        'remarks',
    ];

    public function applicantMonitoring(): BelongsTo
    {
        return $this->belongsTo(ApplicantMonitoring::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
