<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeaService extends Model
{
    protected $table = 'client_sea_services';

    protected $fillable = [
        'client_id',
        'from_date',
        'to_date',
        'duration_months',
        'duration_days',
        'position',
        'vessel_name',
        'type_imo_number',
        'area_of_operation',
        'flag',
        'oilfield_yn',
        'propulsion_type',
        'grt',
        'bollard_pull',
        'main_engine_type_model',
        'main_engine_kw',
        'ship_owner_manager_contact',
    ];

    protected $casts = [
        'from_date' => 'date',
        'to_date' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
