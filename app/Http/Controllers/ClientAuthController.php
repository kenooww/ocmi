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
use App\Mail\ClientVerificationMail;
use App\Jobs\SendClientVerificationEmail;
use App\Models\Client;
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
        'Landbased/Skilled/Office Job',
        'Seabased/Seaman',
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
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $client = Client::where('email', $credentials['email'])->first();

        if (! $client || ! Hash::check($credentials['password'], $client->password)) {
            return back()->withErrors(['email' => 'Invalid login details.']);
        }

        if (! $client->email_verified_at) {
            // regenerate token and send verification
            $client->verification_token = Str::random(40);
            $client->save();
            $link = route('seafarers.verify', $client->verification_token);
            SendClientVerificationEmail::dispatch($client, $link);

            return back()->withErrors(['email' => 'Your email is not verified. A verification email has been sent.']);
        }

        Auth::guard('client')->login($client);
        $request->session()->regenerate();
        $request->session()->forget('client_authenticated_via_google');

        if ($this->requiresMandatoryPasswordChange($request, $client)) {
            return redirect()->route('seafarers.password.mandatory');
        }

        return $this->redirectToDashboard();
    }

    public function dashboard()
    {
        $client = Auth::guard('client')->user()->load([
            'dependents',
            'travelDocuments',
            'certificateCompetencies',
            'certificateProficiencies',
            'vaccinations',
            'flagDocuments',
            'otherCertificates',
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

        // Keep created_at human-friendly for display
        $clientData['created_at_human'] = $client->created_at->toFormattedDateString();
        $clientData['dependents'] = $client->dependents
            ->map(fn ($dependent) => [
                'id' => $dependent->id,
                'name' => $dependent->name,
                'date_of_birth' => optional($dependent->date_of_birth)->format('Y-m-d'),
                'relationship' => $dependent->relationship,
                'dependent' => $dependent->dependent,
                'beneficiary' => $dependent->beneficiary,
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

        $temporaryPassword = null;

        if (! $client) {
            $temporaryPassword = Str::random(12);
            $client = Client::create([
                'email' => $email,
                'name' => $name,
                'password' => bcrypt($temporaryPassword),
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
        SendClientVerificationEmail::dispatch($client, $link, $temporaryPassword);

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

        if ($client) {
            $client->load([
                'dependents',
                'travelDocuments',
                'certificateCompetencies',
                'certificateProficiencies',
                'vaccinations',
                'flagDocuments',
                'otherCertificates',
                'employmentHistories',
                'seaServices',
                'deckOfficerExperiences',
            ]);
        }

        return Inertia::render('Client/ContinueProfile', ['client' => $client]);
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

        $data = $request->validate([
            // Identity
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => ['nullable', 'string', Rule::in(self::GENDER_OPTIONS)],
            'status' => ['nullable', 'string', Rule::in(self::STATUS_OPTIONS)],
            'type_of_job' => ['nullable', 'string', Rule::in(self::TYPE_OF_JOB_OPTIONS)],
            'date_applied' => 'required|date',

            // Birth & family
            'place_of_birth' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'mothers_maiden_name' => 'required|string|max:255',
            'fathers_name' => 'required|string|max:255',
            'nationality' => 'required|string|max:255',
            'religion' => 'nullable|string|max:255',

            // Position & background
            'current_position' => 'required|string|max:255',
            'position_applied_for' => 'required|string|max:255',
            'educational_attainment' => 'required|string|max:255',
            'last_salary' => 'nullable|string|max:255',
            'e_registration_number' => 'nullable|string|max:255',

            // Physical details
            'body_weight_bmi' => 'required|string|max:100',
            'height_cm' => 'required|integer|min:0|max:300',
            'coverall_shoe_size' => 'required|string|max:100',

            // Contact & address
            'current_home_address' => 'required|string|max:2000',
            'personal_mobile_no' => 'required|string|max:50',
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
            'travel_documents.*.attachment' => 'nullable',

            // Certificates and histories
            'certifications' => 'nullable|array',
            'certifications.*.id' => ['nullable', 'integer', Rule::exists('client_certificate_competencies', 'id')->where('client_id', $client->id)],
            'certifications.*.name' => 'nullable|string|max:255',
            'certifications.*.certificate_number' => 'nullable|string|max:255',
            'certifications.*.place_of_issue' => 'nullable|string|max:255',
            'certifications.*.date_of_issue' => 'nullable|date',
            'certifications.*.date_of_expiry' => 'nullable|date',
            'certifications.*.attachment' => 'nullable',

            'proficiency' => 'nullable|array',
            'proficiency.*.id' => ['nullable', 'integer', Rule::exists('client_certificate_proficiencies', 'id')->where('client_id', $client->id)],
            'proficiency.*.name' => 'nullable|string|max:255',
            'proficiency.*.certificate_number' => 'nullable|string|max:255',
            'proficiency.*.place_of_issue' => 'nullable|string|max:255',
            'proficiency.*.date_of_issue' => 'nullable|date',
            'proficiency.*.date_of_expiry' => 'nullable|date',
            'proficiency.*.attachment' => 'nullable',

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

            'other_certificates' => 'nullable|array',
            'other_certificates.*.id' => ['nullable', 'integer', Rule::exists('client_other_certificates', 'id')->where('client_id', $client->id)],
            'other_certificates.*.name' => 'nullable|string|max:255',
            'other_certificates.*.number' => 'nullable|string|max:255',
            'other_certificates.*.place_of_issue' => 'nullable|string|max:255',
            'other_certificates.*.date_of_issue' => 'nullable|date',
            'other_certificates.*.date_of_expiry' => 'nullable|date',
            'other_certificates.*.attachment' => 'nullable',

            'employment_history' => 'nullable|array',
            'employment_history.*.id' => ['nullable', 'integer', Rule::exists('client_employment_histories', 'id')->where('client_id', $client->id)],
            'employment_history.*.company' => 'nullable|string|max:255',
            'employment_history.*.contact_person_name' => 'nullable|string|max:255',
            'employment_history.*.designation' => 'nullable|string|max:255',
            'employment_history.*.contact_person_number' => 'nullable|string|max:255',
            'employment_history.*.country' => 'nullable|string|max:255',
            'employment_history.*.attachment' => 'nullable',

            'sea_service' => 'nullable|array',
            'sea_service.*.id' => ['nullable', 'integer', Rule::exists('client_sea_services', 'id')->where('client_id', $client->id)],
            'sea_service.*.from_date' => 'nullable|date',
            'sea_service.*.to_date' => 'nullable|date',
            'sea_service.*.duration_months' => 'nullable|integer|min:0',
            'sea_service.*.duration_days' => 'nullable|integer|min:0',
            'sea_service.*.position' => 'nullable|string|max:255',
            'sea_service.*.vessel_name' => 'nullable|string|max:255',
            'sea_service.*.type_imo_number' => 'nullable|string|max:255',
            'sea_service.*.area_of_operation' => 'nullable|string|max:255',
            'sea_service.*.flag' => 'nullable|string|max:255',
            'sea_service.*.oilfield_yn' => 'nullable|string|max:255',
            'sea_service.*.propulsion_type' => 'nullable|string|max:255',
            'sea_service.*.grt' => 'nullable|string|max:255',
            'sea_service.*.bollard_pull' => 'nullable|string|max:255',
            'sea_service.*.main_engine_type_model' => 'nullable|string|max:255',
            'sea_service.*.main_engine_kw' => 'nullable|string|max:255',
            'sea_service.*.ship_owner_manager_contact' => 'nullable|string|max:2000',

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
            'philhealth_no' => 'required|string|max:100',
            // Avatar upload
            'avatar' => 'nullable|image|max:2048',
        ]);

        $dependentRows = $data['dependents'] ?? [];
        $travelDocumentRows = $data['travel_documents'] ?? [];
        $certificationRows = $data['certifications'] ?? [];
        $proficiencyRows = $data['proficiency'] ?? [];
        $vaccinationRows = $data['vaccinations'] ?? [];
        $flagDocumentRows = $data['flag_documents'] ?? [];
        $otherCertificateRows = $data['other_certificates'] ?? [];
        $employmentHistoryRows = $data['employment_history'] ?? [];
        $seaServiceRows = $data['sea_service'] ?? [];
        $deckOfficerExperienceRows = $data['deck_officer_experience'] ?? [];
        unset($data['dependents']);
        unset($data['travel_documents']);
        unset($data['certifications']);
        unset($data['proficiency']);
        unset($data['vaccinations']);
        unset($data['flag_documents']);
        unset($data['other_certificates']);
        unset($data['employment_history']);
        unset($data['sea_service']);
        unset($data['deck_officer_experience']);

        $existingDependents = $client->dependents()->get()->keyBy('id');
        $keptDependentIds = [];

        foreach ($dependentRows as $index => $dependent) {
            $dependentId = $dependent['id'] ?? null;
            $existingDependent = $dependentId ? $existingDependents->get($dependentId) : null;
            $attachment = $existingDependent ? $existingDependent->attachment : null;

            if ($request->hasFile("dependents.{$index}.attachment")) {
                $file = $request->file("dependents.{$index}.attachment");
                $attachment = $file->store('dependent-attachments', 'public');

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
                $attachment,
            ])->contains(fn ($value) => filled($value));

            if (! $hasDependentData) {
                continue;
            }

            $savedDependent = $client->dependents()->updateOrCreate(
                ['id' => $dependentId],
                [
                    'name' => $dependent['name'] ?? '',
                    'date_of_birth' => $dependent['date_of_birth'] ?: null,
                    'relationship' => $dependent['relationship'] ?? '',
                    'dependent' => $dependent['dependent'] ?? '',
                    'beneficiary' => $dependent['beneficiary'] ?? '',
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
                $attachment = $file->store('travel-document-attachments', 'public');

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
                    'place_of_issue' => $travelDocument['place_of_issue'] ?? '',
                    'date_of_issue' => ($travelDocument['date_of_issue'] ?? null) ?: null,
                    'date_of_expiry' => ($travelDocument['date_of_expiry'] ?? null) ?: null,
                    'attachment' => $attachment,
                ]
            );
        }

        $this->syncRows($client, 'certificateCompetencies', $certificationRows, [
            'name',
            'certificate_number',
            'place_of_issue',
            'date_of_issue',
            'date_of_expiry',
        ], 'competency-attachments', 'certifications');
        $this->syncRows($client, 'certificateProficiencies', $proficiencyRows, [
            'name',
            'certificate_number',
            'place_of_issue',
            'date_of_issue',
            'date_of_expiry',
        ], 'proficiency-attachments', 'proficiency');
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
        ]);
        $this->syncRows($client, 'otherCertificates', $otherCertificateRows, [
            'name',
            'number',
            'place_of_issue',
            'date_of_issue',
            'date_of_expiry',
        ], 'other-certificate-attachments', 'other_certificates');
        $this->syncRows($client, 'employmentHistories', $employmentHistoryRows, [
            'company',
            'contact_person_name',
            'designation',
            'contact_person_number',
            'country',
        ], 'employment-history-attachments', 'employment_history');
        $this->syncRows($client, 'seaServices', $seaServiceRows, [
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
        ]);
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

        $data['email_address'] = $this->normalizeEmail($data['email_address'] ?? null) ?: $data['email_address'];
        $client->update($data);
      
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
        $clientData['vaccinations'] = $this->formatRows($client->vaccinations);
        $clientData['flag_documents'] = $this->formatRows($client->flagDocuments);
        $clientData['other_certificates'] = $this->formatRows($client->otherCertificates);
        $clientData['employment_history'] = $this->formatRows($client->employmentHistories);
        $clientData['sea_service'] = $this->formatRows($client->seaServices);
        $clientData['deck_officer_experience'] = $this->formatRows($client->deckOfficerExperiences);
    }

    private function formatRows($rows)
    {
        return $rows
            ->map(function ($row) {
                $data = $row->toArray();

                foreach (['date_of_issue', 'date_of_expiry', 'from_date', 'to_date'] as $field) {
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
                if (in_array($field, ['from_date', 'to_date'], true) || substr($field, 0, 5) === 'date_') {
                    $payload[$field] = $value ?: null;
                    continue;
                }

                if (in_array($field, ['duration_months', 'duration_days'], true)) {
                    $payload[$field] = $value === '' || $value === null ? null : $value;
                    continue;
                }

                $payload[$field] = $value ?? '';
            }

            $attachment = $existingRow ? $existingRow->attachment : null;
            if ($storageFolder && $requestKey && request()->hasFile("{$requestKey}.{$index}.attachment")) {
                $file = request()->file("{$requestKey}.{$index}.attachment");
                $attachment = $file->store($storageFolder, 'public');

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
        if (RouteFacade::has('seafarers.dashboard')) {
            return redirect()->route('seafarers.dashboard', ['section' => 'dashboard']);
        }

        return redirect('/client/dashboard?section=dashboard');
    }

    private function requiresMandatoryPasswordChange(Request $request, Client $client): bool
    {
        return $client->must_change_password && ! (bool) $request->session()->get('client_authenticated_via_google', false);
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
    $request->session()->forget('client_authenticated_via_google');

    return redirect()->route('seafarers.continue');

    
}


}
