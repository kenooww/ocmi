<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationStatusLog extends Model
{
    protected $fillable = [
        'client_id',
        'previous_status',
        'status',
        'processed_by',
        'remarks',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
