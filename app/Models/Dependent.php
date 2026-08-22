<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dependent extends Model
{
    protected $table = 'client_dependents';

    protected $fillable = [
        'client_id',
        'name',
        'date_of_birth',
        'relationship',
        'dependent',
        'beneficiary',
        'address',
        'attachment',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
