<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CertificateOfCompetency extends Model
{
    protected $table = 'client_certificate_competencies';

    protected $fillable = [
        'client_id',
        'name',
        'certificate_number',
        'stcw_regulation',
        'endorsement_number',
        'place_of_issue',
        'date_of_issue',
        'date_of_expiry',
        'revalidation_date',
        'endorsement_expiry_date',
        'attachment',
    ];

    protected $casts = [
        'date_of_issue' => 'date',
        'date_of_expiry' => 'date',
        'revalidation_date' => 'date',
        'endorsement_expiry_date' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
