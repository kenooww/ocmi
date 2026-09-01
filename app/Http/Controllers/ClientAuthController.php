<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route as RouteFacade;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Services\GoogleOauthService;
use App\Services\ClientAttachmentArchiveService;
use App\Mail\ClientVerificationMail;
use App\Jobs\SendClientVerificationEmail;
use App\Models\Client;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ClientAuthController extends Controller
{
    private const TRAVEL_DOCUMENT_TYPES = [
        'passport',
        'visa',
        'seamans_book',
        'seafarers_identification_document',
    ];

    private const TYPE_OF_JOB_OPTIONS = [
        'No Experience',
        'Landbased/Skilled/Office Job',
        'Seabased/Seaman',
    ];
    private const SEABASED_WORK_EXPERIENCE = 'Seabased/Seaman';
    private const SEA_SERVICE_REQUIRED_FIELDS = [
        'from_date',
        'to_date',
        'duration_months',
        'duration_days',
        'position',
        'vessel_name',
        'type_imo_number',
        'area_of_operation',
        'flag',
        'propulsion_type',
        'grt',
        'bollard_pull',
        'main_engine_type_model',
        'main_engine_kw',
        'ship_owner_manager_contact',
    ];

    private const STATUS_OPTIONS = [
        'single',
        'married',
        'widowed',
        'divorced',
        'separated',
    ];

    private const GENDER_OPTIONS = [
        'Male',
        'Female',
    ];

    public function showLogin()
    {
        return Inertia::render('Client/ClientLogin');
    }

    public function showGoogleRegister()
    {
        return Inertia::render('Client/GoogleRegister');
    }

    public function login(Request $request)
    {
        return redirect()->route('seafarers.register.google');
    }

    public function dashboard()
    {
        $client = Auth::guard('client')->user()->load([
            'dependents',
            'travelDocuments',
            'certificateCompetencies',
            'certificateProficiencies',
            'gmdssCertificates',
            'vaccinations',
            'flagDocuments',
            'otherCertificates',
            'additionalStcwCertificates',
            'offshoreTrainingCertificates',
            'employmentHistories',
            'seaServices',
            'deckOfficerExperiences',
        ]);

        if ($this->requiresMandatoryPasswordChange(request(), $client)) {
            return redirect()->route('seafarers.password.mandatory');
        }

        if (! $client->hasCompletedContinueProfile()) {
            return redirect()
                ->route('seafarers.continue')
                ->withErrors([
                    'profile' => 'Please complete your profile before opening the dashboard. Missing: '
                        . implode(', ', $client->missingContinueProfileFields()) . '.',
                ]);
        }

        // Prepare client payload: include profile fields but exclude sensitive columns
        $clientData = $client->toArray();
        unset($clientData['password'], $clientData['verification_token']);

        // Normalize date fields for form inputs (YYYY-MM-DD)
        if (! empty($clientData['date_applied'])) {
            $clientData['date_applied'] = optional($client->date_applied)->format('Y-m-d');
        }
        if (! empty($clientData['date_of_birth'])) {
            $clientData['date_of_birth'] = optional($client->date_of_birth)->format('Y-m-d');
        }

        if (! empty($clientData['marriage_date'])) {
            $clientData['marriage_date'] = optional($client->marriage_date)->format('Y-m-d');
        }

        // Keep created_at human-friendly for display
        $clientData['created_at_human'] = $client->created_at->toFormattedDateString();
        $clientData['privacy_act_accepted_at_human'] = optional($client->privacy_act_accepted_at)->toFormattedDateString();
        $clientData['dependents'] = $client->dependents
            ->map(fn ($dependent) => [
                'id' => $dependent->id,
                'name' => $dependent->name,
                'date_of_birth' => optional($dependent->date_of_birth)->format('Y-m-d'),
                'relationship' => $dependent->relationship,
                'dependent' => $dependent->dependent,
                'beneficiary' => $dependent->beneficiary,
                'address' => $dependent->address,
                'attachment' => $dependent->attachment,
            ])
            ->values();
        $clientData['travel_documents'] = $this->formatTravelDocuments($client);
        $this->appendDocumentSections($client, $clientData);

        return Inertia::render('Client/Dashboard', [
            'client' => $clientData,
        ]);
    }

    public function googleRedirect()
    {
        $service = new GoogleOauthService();
        return redirect()->away($service->getAuthUrl());
    }

    public function googleCallback(Request $request)
    {
        $code = $request->input('code');
        $state = $request->input('state');

        if (! $code) {
            return Inertia::render('Client/GoogleRegister', ['error' => 'Google did not return an authorization code.']);
        }

        $service = new GoogleOauthService();
        try {
            $googleUser = $service->getUserFromCode($code, $state);
        } catch (\Exception $e) {
            return Inertia::render('Client/GoogleRegister', ['error' => 'Google OAuth failed: ' . $e->getMessage()]);
        }

        $email = $this->normalizeEmail($googleUser['email'] ?? null);
        $name = $googleUser['name'] ?? ($googleUser['given_name'] ?? 'Client');
        $nameParts = $this->namePartsFromGoogleUser($googleUser);

        if (! $email) {
            return Inertia::render('Client/GoogleRegister', ['error' => 'Google did not provide an email address.']);
        }

        $client = Client::whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $client) {
            $client = Client::create([
                'email' => $email,
                'name' => $name,
                'password' => bcrypt(Str::random(32)),
                'must_change_password' => true,
                'first_name' => $nameParts['first_name'],
                'middle_name' => $nameParts['middle_name'],
                'last_name' => $nameParts['last_name'],
                'application_status' => Client::DEFAULT_APPLICATION_STATUS,
            ]);
        }

        if (! $client->wasRecentlyCreated && blank($client->first_name) && blank($client->last_name)) {
            $client->forceFill($nameParts)->save();
        }

        // If the account already exists and is verified, log in and go to dashboard
        if ($client->email_verified_at) {
            Auth::guard('client')->login($client);
            $request->session()->regenerate();
            $request->session()->put('client_authenticated_via_google', true);
            return $this->redirectToDashboard();
        }

        // For new or unverified accounts: generate verification token and send email
        $client->verification_token = Str::random(40);
        $client->save();

        $link = route('seafarers.verify', $client->verification_token);
        SendClientVerificationEmail::dispatch($client, $link);

        return Inertia::render('Client/GoogleRegister', ['notice' => 'A verification email has been sent. Please check your inbox.']);
    }

    public function showMandatoryPassword()
    {
        $client = Auth::guard('client')->user();

        if (! $client) {
            return redirect()->route('seafarers.login');
        }

        if (! $this->requiresMandatoryPasswordChange(request(), $client)) {
            return $this->redirectToDashboard();
        }

        return Inertia::render('Client/MandatoryChangePassword');
    }

    public function updateMandatoryPassword(Request $request)
    {
        $client = Auth::guard('client')->user();

        if (! $client) {
            return redirect()->route('seafarers.login')->withErrors(['auth' => 'You must be logged in to update your password.']);
        }

        $data = $request->validate([
            'current_password' => 'required|current_password:client',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $client->update([
            'password' => Hash::make($data['password']),
            'must_change_password' => false,
        ]);

        if (! $client->hasCompletedContinueProfile()) {
            return redirect()->route('seafarers.continue')->with('notice', 'Password updated successfully. Please complete your profile.');
        }

        return $this->redirectToDashboard()->with('notice', 'Password updated successfully.');
    }

    public function showContinueProfile()
    {
        $client = Auth::guard('client')->user();

        if ($client && $this->requiresMandatoryPasswordChange(request(), $client)) {
            return redirect()->route('seafarers.password.mandatory');
        }

        if ($client && $client->hasCompletedContinueProfile()) {
            return $this->redirectToDashboard();
        }

        $clientData = null;

        if ($client) {
            $client->load([
                'dependents',
                'travelDocuments',
                'certificateCompetencies',
                'certificateProficiencies',
                'gmdssCertificates',
                'vaccinations',
                'flagDocuments',
                'otherCertificates',
                'additionalStcwCertificates',
                'offshoreTrainingCertificates',
                'employmentHistories',
                'seaServices',
                'deckOfficerExperiences',
            ]);

            $clientData = $client->toArray();
            unset($clientData['password'], $clientData['verification_token']);

            if (! empty($clientData['date_applied'])) {
                $clientData['date_applied'] = optional($client->date_applied)->format('Y-m-d');
            }
            if (! empty($clientData['date_of_birth'])) {
                $clientData['date_of_birth'] = optional($client->date_of_birth)->format('Y-m-d');
            }
            if (! empty($clientData['marriage_date'])) {
                $clientData['marriage_date'] = optional($client->marriage_date)->format('Y-m-d');
            }

            $clientData['created_at_human'] = $client->created_at->toFormattedDateString();
            $clientData['privacy_act_accepted_at_human'] = optional($client->privacy_act_accepted_at)->toFormattedDateString();
            $clientData['dependents'] = $client->dependents
                ->map(fn ($dependent) => [
                    'id' => $dependent->id,
                    'name' => $dependent->name,
                    'date_of_birth' => optional($dependent->date_of_birth)->format('Y-m-d'),
                    'relationship' => $dependent->relationship,
                    'dependent' => $dependent->dependent,
                    'beneficiary' => $dependent->beneficiary,
                    'address' => $dependent->address,
                    'attachment' => $dependent->attachment,
                ])
                ->values();
            $clientData['travel_documents'] = $this->formatTravelDocuments($client);
            $this->appendDocumentSections($client, $clientData);
        }

        return Inertia::render('Client/ContinueProfile', ['client' => $clientData]);
    }

    public function continueProfile(Request $request)
    {
        $client = Auth::guard('client')->user();
        if (! $client) {
            return redirect()->route('seafarers.login')->withErrors(['auth' => 'You must be logged in to complete your profile.']);
        }

        if (! $request->hasFile('avatar')) {
            $request->request->remove('avatar');
        }

        if (! $request->hasFile('resume_attachment')) {
            $request->request->remove('resume_attachment');
        }

        $request->merge([
            'sea_service' => $this->applySeaServiceDurations((array) $request->input('sea_service', [])),
        ]);

        $seaServiceIsRequired = $request->input('type_of_job') === self::SEABASED_WORK_EXPERIENCE;
        $seaServicePresenceRule = $seaServiceIsRequired ? 'required' : 'nullable';

        $data = $request->validate([
            // Identity
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => ['nullable', 'string', Rule::in(self::GENDER_OPTIONS)],
            'status' => ['required', 'string', Rule::in(self::STATUS_OPTIONS)],
            'type_of_job' => ['required', 'string', Rule::in(self::TYPE_OF_JOB_OPTIONS)],
            'date_applied' => 'required|date',

            // Birth & family
            'place_of_birth' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'mothers_maiden_name' => 'required|string|max:255',
            'fathers_name' => 'required|string|max:255',
            'nationality' => 'required|string|max:255',
            'religion' => 'nullable|string|max:255',
            'sector_sub_caste' => 'nullable|string|max:255',

            // Position & background
            'current_position' => 'required|string|max:255',
            'position_applied_for' => 'required|string|max:255',
            'educational_attainment' => 'required|string|max:255',
            'last_salary' => 'nullable|string|max:255',
            'expected_salary' => 'nullable|string|max:255',
            'e_registration_number' => 'nullable|string|max:255',

            // Physical details
            'body_weight_bmi' => 'required|string|max:100',
            'height_cm' => 'required|integer|min:0|max:300',
            'coverall_shoe_size' => 'required|string|max:100',
            'safety_shoe_size' => 'nullable|string|max:100',
            'boiler_suit_size' => 'nullable|string|max:100',

            // Contact & address
            'current_home_address' => 'required|string|max:2000',
            'personal_mobile_no' => 'required|string|max:50',
            'telephone_numbers' => 'nullable|string|max:100',
            'whatsapp_number' => 'nullable|string|max:50',
            'fax_no' => 'nullable|string|max:50',
            'email_address' => [
                'required',
                'email',
                'max:255',
                Rule::unique('clients', 'email_address')->ignore($client->id),
            ],
            'nearest_airport' => 'required|string|max:255',

            // Next of kin / emergency
            'next_of_kin' => 'required|string|max:255',
            'relationship' => 'required|string|max:255',
            'wife_name' => 'nullable|string|max:255',
            'wife_ic_no' => 'nullable|string|max:255',
            'wife_occupation' => 'nullable|string|max:255',
            'marriage_date' => 'nullable|date',
            'wife_income_tax_no' => 'nullable|string|max:255',
            'contact_person' => 'required|string|max:255',
            'emergency_contact' => 'required|string|max:255',

            // Dependents
            'dependents' => 'nullable|array',
            'dependents.*.id' => [
                'nullable',
                'integer',
                Rule::exists('client_dependents', 'id')->where('client_id', $client->id),
            ],
            'dependents.*.name' => 'nullable|string|max:255',
            'dependents.*.date_of_birth' => 'nullable|date',
            'dependents.*.relationship' => 'nullable|string|max:255',
            'dependents.*.dependent' => 'nullable|string|max:255',
            'dependents.*.beneficiary' => 'nullable|string|max:255',
            'dependents.*.address' => 'nullable|string|max:1000',
            'dependents.*.attachment' => 'nullable',

            // Travel documents
            'travel_documents' => 'nullable|array',
            'travel_documents.*.id' => [
                'nullable',
                'integer',
                Rule::exists('client_travel_documents', 'id')->where('client_id', $client->id),
            ],
            'travel_documents.*.document_type' => 'required_with:travel_documents|string|in:' . implode(',', self::TRAVEL_DOCUMENT_TYPES),
            'travel_documents.*.number' => 'nullable|string|max:255',
            'travel_documents.*.place_of_issue' => 'nullable|string|max:255',
            'travel_documents.*.date_of_issue' => 'nullable|date',
            'travel_documents.*.date_of_expiry' => 'nullable|date',
            'travel_documents.*.attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',

            // Certificates and histories
            'certifications' => 'nullable|array',
            'certifications.*.id' => ['nullable', 'integer', Rule::exists('client_certificate_competencies', 'id')->where('client_id', $client->id)],
            'certifications.*.name' => 'nullable|string|max:255',
            'certifications.*.certificate_number' => 'nullable|string|max:255',
            'certifications.*.stcw_regulation' => 'nullable|string|max:255',
            'certifications.*.endorsement_number' => 'nullable|string|max:255',
            'certifications.*.place_of_issue' => 'nullable|string|max:255',
            'certifications.*.date_of_issue' => 'nullable|date',
            'certifications.*.date_of_expiry' => 'nullable|date',
            'certifications.*.revalidation_date' => 'nullable|date',
            'certifications.*.endorsement_expiry_date' => 'nullable|date',
            'certifications.*.attachment' => 'nullable',

            'proficiency' => 'nullable|array',
            'proficiency.*.id' => ['nullable', 'integer', Rule::exists('client_certificate_proficiencies', 'id')->where('client_id', $client->id)],
            'proficiency.*.name' => 'nullable|string|max:255',
            'proficiency.*.certificate_number' => 'nullable|string|max:255',
            'proficiency.*.place_of_issue' => 'nullable|string|max:255',
            'proficiency.*.date_of_issue' => 'nullable|date',
            'proficiency.*.date_of_expiry' => 'nullable|date',
            'proficiency.*.attachment' => 'nullable',

            'gmdss_certificates' => 'nullable|array',
            'gmdss_certificates.*.id' => ['nullable', 'integer', Rule::exists('client_gmdss_certificates', 'id')->where('client_id', $client->id)],
            'gmdss_certificates.*.name' => 'nullable|string|max:255',
            'gmdss_certificates.*.certificate_number' => 'nullable|string|max:255',
            'gmdss_certificates.*.endorsement_number' => 'nullable|string|max:255',
            'gmdss_certificates.*.date_of_expiry' => 'nullable|date',
            'gmdss_certificates.*.endorsement_expiry_date' => 'nullable|date',
            'gmdss_certificates.*.attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',

            'vaccinations' => 'nullable|array',
            'vaccinations.*.id' => ['nullable', 'integer', Rule::exists('client_vaccinations', 'id')->where('client_id', $client->id)],
            'vaccinations.*.name' => 'nullable|string|max:255',
            'vaccinations.*.number' => 'nullable|string|max:255',
            'vaccinations.*.place_of_issue' => 'nullable|string|max:255',
            'vaccinations.*.date_of_issue' => 'nullable|date',
            'vaccinations.*.date_of_expiry' => 'nullable|date',
            'vaccinations.*.attachment' => 'nullable',

            'flag_documents' => 'nullable|array',
            'flag_documents.*.id' => ['nullable', 'integer', Rule::exists('client_flag_documents', 'id')->where('client_id', $client->id)],
            'flag_documents.*.name' => 'nullable|string|max:255',
            'flag_documents.*.number' => 'nullable|string|max:255',
            'flag_documents.*.place_of_issue' => 'nullable|string|max:255',
            'flag_documents.*.date_of_issue' => 'nullable|date',
            'flag_documents.*.date_of_expiry' => 'nullable|date',
            'flag_documents.*.attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',

            'other_certificates' => 'nullable|array',
            'other_certificates.*.id' => ['nullable', 'integer', Rule::exists('client_other_certificates', 'id')->where('client_id', $client->id)],
            'other_certificates.*.name' => 'nullable|string|max:255',
            'other_certificates.*.number' => 'nullable|string|max:255',
            'other_certificates.*.place_of_issue' => 'nullable|string|max:255',
            'other_certificates.*.date_of_issue' => 'nullable|date',
            'other_certificates.*.date_of_expiry' => 'nullable|date',
            'other_certificates.*.attachment' => 'nullable',

            'additional_stcw_certificates' => 'nullable|array',
            'additional_stcw_certificates.*.id' => ['nullable', 'integer', Rule::exists('client_additional_stcw_certificates', 'id')->where('client_id', $client->id)],
            'additional_stcw_certificates.*.name' => 'nullable|string|max:255',
            'additional_stcw_certificates.*.place_of_issue' => 'nullable|string|max:255',
            'additional_stcw_certificates.*.date_of_issue' => 'nullable|date',
            'additional_stcw_certificates.*.date_of_expiry' => 'nullable|date',
            'additional_stcw_certificates.*.attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',

            'offshore_training_certificates' => 'nullable|array',
            'offshore_training_certificates.*.id' => ['nullable', 'integer', Rule::exists('client_offshore_training_certificates', 'id')->where('client_id', $client->id)],
            'offshore_training_certificates.*.name' => 'nullable|string|max:255',
            'offshore_training_certificates.*.place_of_issue' => 'nullable|string|max:255',
            'offshore_training_certificates.*.date_of_issue' => 'nullable|date',
            'offshore_training_certificates.*.date_of_expiry' => 'nullable|date',
            'offshore_training_certificates.*.attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',

            'employment_history' => 'nullable|array',
            'employment_history.*.id' => ['nullable', 'integer', Rule::exists('client_employment_histories', 'id')->where('client_id', $client->id)],
            'employment_history.*.company' => 'nullable|string|max:255',
            'employment_history.*.contact_person_name' => 'nullable|string|max:255',
            'employment_history.*.designation' => 'nullable|string|max:255',
            'employment_history.*.contact_person_number' => 'nullable|string|max:255',
            'employment_history.*.country' => 'nullable|string|max:255',
            'employment_history.*.attachment' => 'nullable',

            'sea_service' => [$seaServicePresenceRule, 'array', $seaServiceIsRequired ? 'min:1' : 'nullable'],
            'sea_service.*.id' => ['nullable', 'integer', Rule::exists('client_sea_services', 'id')->where('client_id', $client->id)],
            'sea_service.*.from_date' => [$seaServicePresenceRule, 'date'],
            'sea_service.*.to_date' => [$seaServicePresenceRule, 'date'],
            'sea_service.*.duration_months' => 'exclude',
            'sea_service.*.duration_days' => 'exclude',
            'sea_service.*.position' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.vessel_name' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.type_imo_number' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.area_of_operation' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.flag' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.oilfield_yn' => 'nullable|string|max:255',
            'sea_service.*.propulsion_type' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.grt' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.bollard_pull' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.main_engine_type_model' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.main_engine_kw' => [$seaServicePresenceRule, 'string', 'max:255'],
            'sea_service.*.ship_owner_manager_contact' => [$seaServicePresenceRule, 'string', 'max:2000'],

            'deck_officer_experience' => 'nullable|array',
            'deck_officer_experience.*.id' => ['nullable', 'integer', Rule::exists('client_deck_officer_experiences', 'id')->where('client_id', $client->id)],
            'deck_officer_experience.*.vessel_name' => 'nullable|string|max:255',
            'deck_officer_experience.*.charterer' => 'nullable|string|max:255',
            'deck_officer_experience.*.area_of_operation' => 'nullable|string|max:255',
            'deck_officer_experience.*.dp_operation_hours' => 'nullable|string|max:255',
            'deck_officer_experience.*.supply' => 'nullable|string|max:255',
            'deck_officer_experience.*.dsv' => 'nullable|string|max:255',
            'deck_officer_experience.*.survey' => 'nullable|string|max:255',
            'deck_officer_experience.*.anchor_type' => 'nullable|string|max:255',
            'deck_officer_experience.*.anchor_weight' => 'nullable|string|max:255',
            'deck_officer_experience.*.barges' => 'nullable|string|max:255',
            'deck_officer_experience.*.rig_move' => 'nullable|string|max:255',
            'deck_officer_experience.*.propelled' => 'nullable|string|max:255',
            'deck_officer_experience.*.non_propelled' => 'nullable|string|max:255',

            // Government IDs
            'sss_no' => 'required|string|max:100',
            'pagibig_no' => 'required|string|max:100',
            'epf_no' => 'nullable|string|max:100',
            'socso_no' => 'nullable|string|max:100',
            'blood' => 'nullable|string|max:100',
            'philhealth_no' => 'required|string|max:100',
            // Avatar upload
            'avatar' => [
                $client->avatar ? 'nullable' : 'required',
                'image',
                'max:2048',
            ],
            'resume_attachment' => [
                $client->resume_attachment ? 'nullable' : 'required',
                'file',
                'mimes:pdf,doc,docx,jpg,jpeg,png',
                'max:5120',
            ],
            'privacy_act_accepted' => 'accepted',
        ]);

        $dependentRows = $data['dependents'] ?? [];
        $travelDocumentRows = $data['travel_documents'] ?? [];
        $certificationRows = $data['certifications'] ?? [];
        $proficiencyRows = $data['proficiency'] ?? [];
        $gmdssCertificateRows = $data['gmdss_certificates'] ?? [];
        $vaccinationRows = $data['vaccinations'] ?? [];
        $flagDocumentRows = $data['flag_documents'] ?? [];
        $otherCertificateRows = $data['other_certificates'] ?? [];
        $additionalStcwCertificateRows = $data['additional_stcw_certificates'] ?? [];
        $offshoreTrainingCertificateRows = $data['offshore_training_certificates'] ?? [];
        $employmentHistoryRows = $data['employment_history'] ?? [];
        $seaServiceRows = $data['sea_service'] ?? [];
        $deckOfficerExperienceRows = $data['deck_officer_experience'] ?? [];
        unset($data['dependents']);
        unset($data['travel_documents']);
        unset($data['certifications']);
        unset($data['proficiency']);
        unset($data['gmdss_certificates']);
        unset($data['vaccinations']);
        unset($data['flag_documents']);
        unset($data['other_certificates']);
        unset($data['additional_stcw_certificates']);
        unset($data['offshore_training_certificates']);
        unset($data['employment_history']);
        unset($data['sea_service']);
        unset($data['deck_officer_experience']);
        $data = $this->titleCaseFormData($data);

        $existingDependents = $client->dependents()->get()->keyBy('id');
        $keptDependentIds = [];

        foreach ($dependentRows as $index => $dependent) {
            $dependentId = $dependent['id'] ?? null;
            $existingDependent = $dependentId ? $existingDependents->get($dependentId) : null;
            $attachment = $existingDependent ? $existingDependent->attachment : null;

            if ($request->hasFile("dependents.{$index}.attachment")) {
                $file = $request->file("dependents.{$index}.attachment");
                $attachment = $this->storeAttachmentWithOriginalName($file, 'dependent-attachments');

                if ($existingDependent && $existingDependent->attachment && Storage::disk('public')->exists($existingDependent->attachment)) {
                    Storage::disk('public')->delete($existingDependent->attachment);
                }
            }

            $hasDependentData = collect([
                $dependent['name'] ?? null,
                $dependent['date_of_birth'] ?? null,
                $dependent['relationship'] ?? null,
                $dependent['dependent'] ?? null,
                $dependent['beneficiary'] ?? null,
                $dependent['address'] ?? null,
                $attachment,
            ])->contains(fn ($value) => filled($value));

            if (! $hasDependentData) {
                continue;
            }

            $savedDependent = $client->dependents()->updateOrCreate(
                ['id' => $dependentId],
                [
                    'name' => $this->titleCaseFormValue('name', $dependent['name'] ?? ''),
                    'date_of_birth' => $dependent['date_of_birth'] ?: null,
                    'relationship' => $this->titleCaseFormValue('relationship', $dependent['relationship'] ?? ''),
                    'dependent' => $this->titleCaseFormValue('dependent', $dependent['dependent'] ?? ''),
                    'beneficiary' => $this->titleCaseFormValue('beneficiary', $dependent['beneficiary'] ?? ''),
                    'address' => $this->titleCaseFormValue('address', $dependent['address'] ?? ''),
                    'attachment' => $attachment,
                ]
            );

            $keptDependentIds[] = $savedDependent->id;
        }

        $client->dependents()
            ->whereNotIn('id', $keptDependentIds)
            ->get()
            ->each(function ($dependent) {
                if ($dependent->attachment && Storage::disk('public')->exists($dependent->attachment)) {
                    Storage::disk('public')->delete($dependent->attachment);
                }

                $dependent->delete();
            });

        $existingTravelDocuments = $client->travelDocuments()->get()->keyBy('document_type');

        foreach ($travelDocumentRows as $index => $travelDocument) {
            $documentType = $travelDocument['document_type'] ?? null;

            if (! in_array($documentType, self::TRAVEL_DOCUMENT_TYPES, true)) {
                continue;
            }

            $existingTravelDocument = $existingTravelDocuments->get($documentType);
            $attachment = $existingTravelDocument ? $existingTravelDocument->attachment : null;

            if ($request->hasFile("travel_documents.{$index}.attachment")) {
                $file = $request->file("travel_documents.{$index}.attachment");
                $attachment = $this->storeAttachmentWithOriginalName($file, 'travel-document-attachments');

                if ($existingTravelDocument && $existingTravelDocument->attachment && Storage::disk('public')->exists($existingTravelDocument->attachment)) {
                    Storage::disk('public')->delete($existingTravelDocument->attachment);
                }
            }

            $hasTravelDocumentData = collect([
                $travelDocument['number'] ?? null,
                $travelDocument['place_of_issue'] ?? null,
                $travelDocument['date_of_issue'] ?? null,
                $travelDocument['date_of_expiry'] ?? null,
                $attachment,
            ])->contains(fn ($value) => filled($value));

            if (! $hasTravelDocumentData) {
                if ($existingTravelDocument && $existingTravelDocument->attachment && Storage::disk('public')->exists($existingTravelDocument->attachment)) {
                    Storage::disk('public')->delete($existingTravelDocument->attachment);
                }

                $client->travelDocuments()->where('document_type', $documentType)->delete();
                continue;
            }

            $client->travelDocuments()->updateOrCreate(
                ['document_type' => $documentType],
                [
                    'number' => $travelDocument['number'] ?? '',
                    'place_of_issue' => $this->titleCaseFormValue('place_of_issue', $travelDocument['place_of_issue'] ?? ''),
                    'date_of_issue' => ($travelDocument['date_of_issue'] ?? null) ?: null,
                    'date_of_expiry' => ($travelDocument['date_of_expiry'] ?? null) ?: null,
                    'attachment' => $attachment,
                ]
            );
        }

        $this->syncRows($client, 'certificateCompetencies', $certificationRows, [
            'name',
            'certificate_number',
            'stcw_regulation',
            'endorsement_number',
            'place_of_issue',
            'date_of_issue',
            'date_of_expiry',
            'revalidation_date',
            'endorsement_expiry_date',
        ], 'competency-attachments', 'certifications');
        $this->syncRows($client, 'certificateProficiencies', $proficiencyRows, [
            'name',
            'certificate_number',
            'place_of_issue',
            'date_of_issue',
            'date_of_expiry',
        ], 'proficiency-attachments', 'proficiency');
        $this->syncRows($client, 'gmdssCertificates', $gmdssCertificateRows, [
            'name',
            'certificate_number',
            'endorsement_number',
            'date_of_expiry',
            'endorsement_expiry_date',
        ], 'gmdss-certificate-attachments', 'gmdss_certificates');
        $this->syncRows($client, 'vaccinations', $vaccinationRows, [
            'name',
            'number',
            'place_of_issue',
            'date_of_issue',
            'date_of_expiry',
        ], 'vaccination-attachments', 'vaccinations');
        $this->syncRows($client, 'flagDocuments', $flagDocumentRows, [
            'name',
            'number',
            'place_of_issue',
            'date_of_issue',
            'date_of_expiry',
        ], 'flag-document-attachments', 'flag_documents');
        $this->syncRows($client, 'otherCertificates', $otherCertificateRows, [
            'name',
            'number',
            'place_of_issue',
            'date_of_issue',
            'date_of_expiry',
        ], 'other-certificate-attachments', 'other_certificates');
        $this->syncRows($client, 'additionalStcwCertificates', $additionalStcwCertificateRows, [
            'name',
            'date_of_issue',
            'date_of_expiry',
            'place_of_issue',
        ], 'additional-stcw-certificate-attachments', 'additional_stcw_certificates');
        $this->syncRows($client, 'offshoreTrainingCertificates', $offshoreTrainingCertificateRows, [
            'name',
            'date_of_issue',
            'date_of_expiry',
            'place_of_issue',
        ], 'offshore-training-certificate-attachments', 'offshore_training_certificates');
        $this->syncRows($client, 'employmentHistories', $employmentHistoryRows, [
            'company',
            'contact_person_name',
            'designation',
            'contact_person_number',
            'country',
        ], 'employment-history-attachments', 'employment_history');
        $seaServiceRows = $this->applySeaServiceDurations($seaServiceRows);
        $this->syncRows($client, 'seaServices', $seaServiceRows, self::SEA_SERVICE_REQUIRED_FIELDS);
        $this->syncRows($client, 'deckOfficerExperiences', $deckOfficerExperienceRows, [
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
        ]);

        // Handle avatar upload separately so we can store the file and save path
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $path = $file->store('avatars', 'public');

            // delete previous avatar if exists
            if ($client->avatar && Storage::disk('public')->exists($client->avatar)) {
                Storage::disk('public')->delete($client->avatar);
            }

            $data['avatar'] = $path;
        } else {
            unset($data['avatar']);
        }

        if ($request->hasFile('resume_attachment')) {
            $file = $request->file('resume_attachment');
            $path = $this->storeAttachmentWithOriginalName($file, 'resume-attachments');

            if ($client->resume_attachment && Storage::disk('public')->exists($client->resume_attachment)) {
                Storage::disk('public')->delete($client->resume_attachment);
            }

            $data['resume_attachment'] = $path;
        } else {
            unset($data['resume_attachment']);
        }

        $data['privacy_act_accepted'] = true;
        $data['privacy_act_accepted_at'] = $client->privacy_act_accepted_at ?: now();

        $data = $this->titleCaseFormData($data);
        $data['email_address'] = $this->normalizeEmail($data['email_address'] ?? null) ?: $data['email_address'];
        $client->update($data);

        $client->refresh();
        if (! $client->hasCompletedContinueProfile()) {
            return redirect()
                ->route('seafarers.continue')
                ->withErrors([
                    'profile' => 'Profile saved, but the dashboard is still locked. Missing: '
                        . implode(', ', $client->missingContinueProfileFields()) . '.',
                ]);
        }
      
        return $this->redirectToDashboard()->with('notice', 'Profile saved successfully.');
    }

    private function formatTravelDocuments(Client $client)
    {
        $documents = $client->travelDocuments->keyBy('document_type');

        return collect(self::TRAVEL_DOCUMENT_TYPES)
            ->map(function ($type) use ($documents) {
                $document = $documents->get($type);

                return [
                    'id' => $document ? $document->id : null,
                    'document_type' => $type,
                    'number' => $document ? $document->number : '',
                    'place_of_issue' => $document ? $document->place_of_issue : '',
                    'date_of_issue' => ($document && $document->date_of_issue) ? $document->date_of_issue->format('Y-m-d') : '',
                    'date_of_expiry' => ($document && $document->date_of_expiry) ? $document->date_of_expiry->format('Y-m-d') : '',
                    'attachment' => $document ? $document->attachment : '',
                ];
            })
            ->values();
    }

    private function appendDocumentSections(Client $client, array &$clientData): void
    {
        $clientData['certifications'] = $this->formatRows($client->certificateCompetencies);
        $clientData['proficiency'] = $this->formatRows($client->certificateProficiencies);
        $clientData['gmdss_certificates'] = $this->formatRows($client->gmdssCertificates);
        $clientData['vaccinations'] = $this->formatRows($client->vaccinations);
        $clientData['flag_documents'] = $this->formatRows($client->flagDocuments);
        $clientData['other_certificates'] = $this->formatRows($client->otherCertificates);
        $clientData['additional_stcw_certificates'] = $this->formatRows($client->additionalStcwCertificates);
        $clientData['offshore_training_certificates'] = $this->formatRows($client->offshoreTrainingCertificates);
        $clientData['employment_history'] = $this->formatRows($client->employmentHistories);
        $clientData['sea_service'] = $this->formatRows($client->seaServices);
        $clientData['deck_officer_experience'] = $this->formatRows($client->deckOfficerExperiences);
    }

    private function formatRows($rows)
    {
        return $rows
            ->map(function ($row) {
                $data = $row->toArray();

                foreach (['date_of_issue', 'date_of_expiry', 'revalidation_date', 'endorsement_expiry_date', 'from_date', 'to_date'] as $field) {
                    if ($row->{$field}) {
                        $data[$field] = $row->{$field}->format('Y-m-d');
                    }
                }

                return $data;
            })
            ->values();
    }

    private function namePartsFromGoogleUser(array $googleUser): array
    {
        $givenName = trim((string) ($googleUser['given_name'] ?? ''));
        $familyName = trim((string) ($googleUser['family_name'] ?? ''));
        $displayName = trim((string) ($googleUser['name'] ?? ''));

        if ($givenName !== '' || $familyName !== '') {
            $givenParts = preg_split('/\s+/', $givenName, -1, PREG_SPLIT_NO_EMPTY) ?: [];

            return [
                'first_name' => $givenParts[0] ?? $givenName,
                'middle_name' => count($givenParts) > 1 ? implode(' ', array_slice($givenParts, 1)) : null,
                'last_name' => $familyName ?: null,
            ];
        }

        $parts = preg_split('/\s+/', $displayName, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        if (count($parts) <= 1) {
            return [
                'first_name' => $parts[0] ?? null,
                'middle_name' => null,
                'last_name' => null,
            ];
        }

        return [
            'first_name' => $parts[0],
            'middle_name' => count($parts) > 2 ? implode(' ', array_slice($parts, 1, -1)) : null,
            'last_name' => $parts[count($parts) - 1],
        ];
    }

    private function normalizeEmail(?string $email): ?string
    {
        $email = trim((string) $email);

        return $email === '' ? null : strtolower($email);
    }

    private function titleCaseFormData(array $data): array
    {
        foreach ($data as $field => $value) {
            $data[$field] = $this->titleCaseFormValue($field, $value);
        }

        return $data;
    }

    private function titleCaseFormValue(string $field, $value)
    {
        if (! is_string($value) || $this->shouldKeepFormValueCase($field)) {
            return $value;
        }

        $value = trim($value);

        if ($value === '') {
            return $value;
        }

        return ucwords(strtolower($value), " \t\r\n\f\v-/(");
    }

    private function shouldKeepFormValueCase(string $field): bool
    {
        $exactFields = [
            'email',
            'email_address',
            'password',
            'current_password',
            'password_confirmation',
            'document_type',
            'gender',
            'status',
            'type_of_job',
            'avatar',
            'resume_attachment',
            'attachment',
            'date_applied',
            'date_of_birth',
            'marriage_date',
            'date_of_issue',
            'date_of_expiry',
            'revalidation_date',
            'endorsement_expiry_date',
            'from_date',
            'to_date',
            'duration_months',
            'duration_days',
            'height_cm',
            'phone',
            'personal_mobile_no',
            'telephone_numbers',
            'whatsapp_number',
            'fax_no',
            'emergency_contact',
            'contact_person_number',
            'certificate_number',
            'endorsement_number',
            'number',
            'sss_no',
            'pagibig_no',
            'epf_no',
            'socso_no',
            'philhealth_no',
            'wife_ic_no',
            'wife_income_tax_no',
            'e_registration_number',
            'type_imo_number',
            'grt',
            'main_engine_kw',
            'blood',
        ];

        if (in_array($field, $exactFields, true)) {
            return true;
        }

        return substr($field, -3) === '_no'
            || substr($field, -7) === '_number'
            || substr($field, 0, 5) === 'date_';
    }

    private function storeAttachmentWithOriginalName($file, string $folder): string
    {
        $originalName = basename($file->getClientOriginalName() ?: 'attachment');
        $originalName = trim(preg_replace('/[\/\\\\]+/', '-', $originalName));
        $originalName = $originalName === '' ? 'attachment' : $originalName;

        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $baseName = pathinfo($originalName, PATHINFO_FILENAME) ?: 'attachment';
        $fileName = $originalName;
        $counter = 1;

        while (Storage::disk('public')->exists($folder . '/' . $fileName)) {
            $suffix = ' (' . $counter . ')';
            $fileName = $extension
                ? $baseName . $suffix . '.' . $extension
                : $baseName . $suffix;
            $counter++;
        }

        return $file->storeAs($folder, $fileName, 'public');
    }

    private function syncRows(Client $client, string $relation, array $rows, array $fields, ?string $storageFolder = null, ?string $requestKey = null): void
    {
        $existingRows = $client->{$relation}()->get()->keyBy('id');
        $keptIds = [];

        foreach ($rows as $index => $row) {
            $rowId = $row['id'] ?? null;
            $existingRow = $rowId ? $existingRows->get($rowId) : null;
            $payload = [];

            foreach ($fields as $field) {
                $value = $row[$field] ?? null;
                if (in_array($field, ['from_date', 'to_date', 'revalidation_date', 'endorsement_expiry_date'], true) || substr($field, 0, 5) === 'date_') {
                    $payload[$field] = $value ?: null;
                    continue;
                }

                if (in_array($field, ['duration_months', 'duration_days'], true)) {
                    $payload[$field] = $value === '' || $value === null ? null : $value;
                    continue;
                }

                $payload[$field] = $this->titleCaseFormValue($field, $value ?? '');
            }

            $attachment = $existingRow ? $existingRow->attachment : null;
            if ($storageFolder && $requestKey && request()->hasFile("{$requestKey}.{$index}.attachment")) {
                $file = request()->file("{$requestKey}.{$index}.attachment");
                $attachment = $this->storeAttachmentWithOriginalName($file, $storageFolder);

                if ($existingRow && $existingRow->attachment && Storage::disk('public')->exists($existingRow->attachment)) {
                    Storage::disk('public')->delete($existingRow->attachment);
                }
            }

            $hasData = collect(array_values($payload))
                ->push($attachment)
                ->contains(fn ($value) => filled($value));

            if (! $hasData) {
                continue;
            }

            if ($storageFolder) {
                $payload['attachment'] = $attachment;
            }

            $savedRow = $client->{$relation}()->updateOrCreate(['id' => $rowId], $payload);
            $keptIds[] = $savedRow->id;
        }

        $client->{$relation}()
            ->whereNotIn('id', $keptIds)
            ->get()
            ->each(function ($row) use ($storageFolder) {
                if ($storageFolder && $row->attachment && Storage::disk('public')->exists($row->attachment)) {
                    Storage::disk('public')->delete($row->attachment);
                }

                $row->delete();
            });
    }

    private function applySeaServiceDurations(array $rows): array
    {
        return array_map(function ($row) {
            $fromDate = $row['from_date'] ?? null;
            $toDate = $row['to_date'] ?? null;

            if (! $fromDate || ! $toDate) {
                $row['duration_months'] = null;
                $row['duration_days'] = null;
                return $row;
            }

            try {
                $from = Carbon::parse($fromDate)->startOfDay();
                $to = Carbon::parse($toDate)->startOfDay();
            } catch (\Exception $e) {
                $row['duration_months'] = null;
                $row['duration_days'] = null;
                return $row;
            }

            if ($to->lt($from)) {
                $row['duration_months'] = null;
                $row['duration_days'] = null;
                return $row;
            }

            $months = $from->diffInMonths($to);
            $anchor = $from->copy()->addMonths($months);

            if ($anchor->gt($to)) {
                $months -= 1;
                $anchor = $from->copy()->addMonths($months);
            }

            $row['duration_months'] = max($months, 0);
            $row['duration_days'] = max($anchor->diffInDays($to), 0);

            return $row;
        }, $rows);
    }

    public function resendVerification(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $client = Client::where('email', $data['email'])->first();
        if (! $client) {
            return back()->withErrors(['email' => 'No account found for that email.']);
        }

        if ($client->email_verified_at) {
            return back()->withErrors(['email' => 'Email already verified.']);
        }

        $client->verification_token = Str::random(40);
        $client->save();
        $link = route('seafarers.verify', $client->verification_token);
        SendClientVerificationEmail::dispatch($client, $link);

        return back()->with(['notice' => 'Verification email resent. Please check your inbox.']);
    }

    public function testVerification(Request $request)
    {
        $email = $request->query('email') ?? $request->input('email');

        if ($email) {
            $client = Client::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $email,
                    'password' => bcrypt(Str::random(24)),
                    'application_status' => Client::DEFAULT_APPLICATION_STATUS,
                ]
            );
        } else {
            $client = Auth::guard('client')->user();
            if (! $client) {
                return back()->withErrors(['email' => 'No email provided and no authenticated client.']);
            }
        }

        $client->verification_token = Str::random(40);
        $client->save();

        $link = route('seafarers.verify', $client->verification_token);

        // send synchronously (not queued) so you can test SMTP delivery immediately
        Mail::to($client->email)->send(new ClientVerificationMail($client, $link));

        return back()->with(['notice' => 'Test verification email sent. Check your inbox or logs.']);
    }

    public function logout(Request $request)
    {
        Auth::guard('client')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('seafarers.login');
    }

    public function updatePassword(Request $request)
    {
        $client = Auth::guard('client')->user();

        if (! $client) {
            return redirect()->route('seafarers.login')->withErrors(['auth' => 'You must be logged in to update your password.']);
        }

        $data = $request->validate([
            'current_password' => 'required|current_password:client',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $client->update([
            'password' => Hash::make($data['password']),
            'must_change_password' => false,
        ]);

        return back()->with('notice', 'Password updated successfully.');
    }

    private function redirectToDashboard()
    {
        $client = Auth::guard('client')->user();

        if ($client && ! $client->hasCompletedContinueProfile()) {
            return redirect()->route('seafarers.continue');
        }

        if (RouteFacade::has('seafarers.dashboard')) {
            return redirect()->route('seafarers.dashboard', ['section' => 'dashboard']);
        }

        return redirect('/client/dashboard?section=dashboard');
    }

    private function requiresMandatoryPasswordChange(Request $request, Client $client): bool
    {
        $bypassMandatoryChange = (bool) $request->session()->get('client_authenticated_via_google', false)
            || (bool) $request->session()->get('client_authenticated_via_verification', false);

        return $client->must_change_password && ! $bypassMandatoryChange;
    }

    public function verify(Request $request, $token)
{
    $client = Client::where('verification_token', $token)->first();

    if (!$client) {
        return redirect('/seafarers/login')
            ->with('error', 'Invalid or expired verification link.');
    }

    $client->email_verified_at = now();
    $client->verification_token = null;
    $client->save();

    Auth::guard('client')->login($client);
    $request->session()->regenerate();
    $request->session()->put('client_authenticated_via_verification', true);
    $request->session()->forget('client_authenticated_via_google');

    return redirect()->route('seafarers.continue');

    
}

    public function viewResume(Request $request)
    {
        $client = Auth::guard('client')->user();

        return $this->resumeViewerResponse(
            $client,
            route('seafarers.resume.file'),
            route('seafarers.resume.download'),
            route('seafarers.dashboard') . '?section=profile'
        );
    }

    public function inlineResume(Request $request)
    {
        $client = Auth::guard('client')->user();

        return $this->resumeFileResponse($client, false);
    }

    public function downloadResume(Request $request)
    {
        $client = Auth::guard('client')->user();

        return $this->resumeFileResponse($client, true);
    }

    public function downloadAttachmentsFolder(string $folder, ClientAttachmentArchiveService $archives)
    {
        $client = Auth::guard('client')->user();

        return $archives->download($client, $folder);
    }

    private function resumeViewerResponse(Client $client = null, string $fileUrl, string $downloadUrl, string $backUrl)
    {
        $attachment = $this->resumeAttachmentOrFail($client);
        $extension = strtolower(pathinfo($attachment, PATHINFO_EXTENSION));

        return Inertia::render('ResumeViewer', [
            'title' => 'Resume Attachment',
            'fileName' => basename($attachment),
            'fileType' => $extension,
            'canPreview' => in_array($extension, ['pdf', 'jpg', 'jpeg', 'png'], true),
            'fileUrl' => $fileUrl,
            'downloadUrl' => $downloadUrl,
            'backUrl' => $backUrl,
        ]);
    }

    private function resumeFileResponse(Client $client = null, bool $download = false)
    {
        $attachment = $this->resumeAttachmentOrFail($client);
        $path = Storage::disk('public')->path($attachment);
        $fileName = basename($attachment);

        if ($download) {
            return response()->download($path, $fileName);
        }

        return response()->file($path, [
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        ]);
    }

    private function resumeAttachmentOrFail(Client $client = null): string
    {
        abort_unless($client && $client->resume_attachment, 404);
        abort_unless(Storage::disk('public')->exists($client->resume_attachment), 404);

        return $client->resume_attachment;
    }

}
