<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GmdssCertificate extends Model
{
    protected $table = 'client_gmdss_certificates';

    protected $fillable = [
        'client_id',
        'name',
        'certificate_number',
        'endorsement_number',
        'date_of_expiry',
        'endorsement_expiry_date',
        'attachment',
    ];

    protected $casts = [
        'date_of_expiry' => 'date',
        'endorsement_expiry_date' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
