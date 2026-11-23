<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeafarerContract extends Model
{
    protected $fillable = [
        'client_id', 'created_by', 'updated_by', 'contract_number', 'status',
        'seafarer_name', 'date_of_birth', 'place_of_birth', 'permanent_address', 'registration_no', 'srb_no', 'sid_no',
        'agency_name', 'agency_address', 'dmw_agency_principal', 'principal_name', 'principal_address',
        'shipper_name', 'shipper_address', 'vessel_name', 'imo_number', 'gross_registered_tonnage',
        'year_built', 'flag', 'vessel_type', 'classification_society', 'duration', 'position',
        'basic_monthly_salary', 'hours_of_work', 'overtime', 'coverage_of_cba', 'leave_pay',
        'collective_bargaining_agreement', 'contract_date', 'contract_place',
        'contract_status', 'end_contract_date',
        'seafarer_signature_name', 'employer_name', 'employer_designation',
        'approved_by_name', 'approved_by_designation', 'dmw_place', 'approved_date',
        'allotment_seafarer_name', 'allotment_position', 'allotment_vessel_name',
        'allotment_monthly_salary', 'allotment_amount', 'allottee_name',
        'allottee_relationship', 'allottee_address', 'allottee_bank',
        'allottee_account_number', 'allotment_date', 'allotment_place',
        'allotment_seafarer_signature', 'allotment_employer_signature',
        'allotment_amount_2', 'allottee_2_name', 'allottee_2_relationship',
        'allottee_2_address', 'allottee_2_bank', 'allottee_2_account_number',
        'allotment_amount_3', 'allottee_3_name', 'allottee_3_relationship',
        'allottee_3_address', 'allottee_3_bank', 'allottee_3_account_number',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'contract_date' => 'date',
        'end_contract_date' => 'date',
        'approved_date' => 'date',
        'allotment_date' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
