<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Inquiry', [
            'submitted' => (bool) $request->session()->get('inquiry_submitted', false),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birthday' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'contact_number' => ['required', 'string', 'max:50', 'regex:/^\+?[0-9\s().-]{7,50}$/'],
            'vessel' => ['required', 'string', 'max:255'],
            'document_status' => ['required', 'string', 'max:2000'],
            'current_location' => ['required', 'string', 'max:255'],
            'present_salary' => ['required', 'string', 'max:100'],
            'present_rank' => ['required', 'string', 'max:255'],
            'years_in_present_rank' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'applied_rank' => ['nullable', 'string', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'facebook_account' => ['nullable', 'string', 'max:255'],
            'last_salary' => ['nullable', 'string', 'max:255'],
            'valid_visa_on_hand' => ['nullable', 'string', 'max:255'],
            'nationality' => ['nullable', 'string', 'max:255'],
            'vessel_information' => ['nullable', 'string', 'max:2000'],
            'offshore_vessel_type' => ['nullable', 'string', 'max:255'],
            'years_of_experience' => ['required', 'numeric', 'min:0', 'max:100'],
            'place_of_operation' => ['nullable', 'string', 'max:255'],
            'offshore_approval' => ['nullable', 'string', 'in:QE,ARAMCO,ADNOC'],
            'vessel_system' => ['nullable', 'string', 'in:DP,Non DP'],
            'latest_vessel_experience' => ['nullable', 'string', 'max:2000'],
            'latest_sign_off_date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'other_vessel_experience' => ['nullable', 'string', 'max:2000'],
            'additional_skills' => ['nullable', 'string', 'max:2000'],
        ]);

        foreach ($data as $field => $value) {
            if (is_string($value) && ! in_array($field, ['vessel_system', 'offshore_approval', 'email', 'facebook_account'], true)) {
                $data[$field] = \Illuminate\Support\Str::ucfirst(mb_strtolower($value, 'UTF-8'));
            }
        }

        $data['email'] = mb_strtolower(trim($data['email']));
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
                $inquiry = Inquiry::create($data);
                foreach (\App\Support\InquiryIdentity::keys($data['email'], $data['contact_number']) as $key) {
                    \Illuminate\Support\Facades\DB::table('inquiry_identities')->insert([
                        'identity' => $key, 'inquiry_id' => $inquiry->id,
                    ]);
                }
                \Illuminate\Support\Facades\Mail::to($inquiry->email)->queue(
                    (new \App\Mail\InquiryReceivedMail($inquiry, \App\Models\CompanySetting::current()->publicData()))
                        ->afterCommit()
                );
            });
        } catch (\Illuminate\Database\UniqueConstraintViolationException $exception) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'duplicate' => 'Inquiry already submitted.',
            ]);
        }

        return to_route('inquiry.create')->with('inquiry_submitted', true);
    }
}
