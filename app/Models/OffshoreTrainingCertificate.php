<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OffshoreTrainingCertificate extends Model
{
    protected $table = 'client_offshore_training_certificates';

    protected $fillable = [
        'client_id',
        'name',
        'place_of_issue',
        'date_of_issue',
        'date_of_expiry',
        'attachment',
    ];

    protected $casts = [
        'date_of_issue' => 'date',
        'date_of_expiry' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
