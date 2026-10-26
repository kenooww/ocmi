<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    public const STATUSES = [
        'NEW' => 'New inquiry awaiting review.',
        'Pending' => 'No offer, no vacancy for the position, incomplete documents, or still onboard.',
        'Floating' => 'Available between assignments.',
        'Not Available' => 'Currently unavailable for placement.',
        'Failed' => 'Insufficient vessel experience, age, medical concern, unfinished contract due to a problem onboard, long standby, or other reasons that may hinder processing of the application.',
        'To report' => 'Passed the initial screening.',
        'To Report to Office' => 'Ready to report to the office.',
        'For application processing' => 'Reported to the office.',
    ];

    protected $attributes = ['status' => 'NEW'];

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'birthday', 'contact_number',
        'vessel', 'document_status', 'current_location', 'present_salary', 'company_type',
        'present_rank', 'years_in_present_rank', 'applied_rank', 'whatsapp_number', 'email', 'facebook_account', 'last_salary', 'valid_visa_on_hand', 'nationality', 'vessel_information', 'offshore_vessel_type', 'years_of_experience', 'place_of_operation', 'offshore_approval', 'vessel_system', 'latest_vessel_experience', 'latest_sign_off_date', 'other_vessel_experience', 'additional_skills',
    ];

    protected $casts = ['birthday' => 'date', 'latest_sign_off_date' => 'date'];

    public function statusLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(InquiryStatusLog::class)->latest()->orderByDesc('id');
    }

}
