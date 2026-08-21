<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmploymentHistory extends Model
{
    protected $table = 'client_employment_histories';

    protected $fillable = [
        'client_id',
        'company',
        'contact_person_name',
        'designation',
        'contact_person_number',
        'country',
        'attachment',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
