<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtherCertificate extends Model
{
    protected $table = 'client_other_certificates';

    protected $fillable = [
        'client_id',
        'name',
        'number',
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
