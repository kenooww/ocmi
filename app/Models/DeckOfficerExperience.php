<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeckOfficerExperience extends Model
{
    protected $table = 'client_deck_officer_experiences';

    protected $fillable = [
        'client_id',
        'vessel_name',
        'charterer',
        'area_of_operation',
        'dp_operation_hours',
        'supply',
        'dsv',
        'survey',
        'anchor_type',
        'anchor_weight',
        'barges',
        'rig_move',
        'propelled',
        'non_propelled',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
