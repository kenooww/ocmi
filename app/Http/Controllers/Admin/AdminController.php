<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\ApplicationStatusLog;
use App\Models\User;
use App\Models\Client;
use App\Jobs\SendClientVerificationEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    private const USER_ROLE_OPTIONS = [
        'admin',
        'staff',
    ];

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

    private const APPLICATION_STATUS_OPTIONS = [
        'PENDING/ONHOLD',
        'TO REPORT',
        'FOR REEVAL/FOR APPROVAL',
        'FAILED',
        'PROPOSED',
        'APPROVED',
        'DOCUMENT PROCESSING',
        'DISAPPROVED',
    ];

    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'users' => User::count(),
                'seafarers' => Client::count(),
                'recentSeafarers' => Client::whereDate('created_at', now()->toDateString())->count(),
            ],
            'recentUsers' => User::latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'created_at']),
            'recentSeafarers' => Client::latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'phone', 'avatar', 'created_at']),
        ]);
    }

    public function preferences(Request $request)
    {
        return Inertia::render('Admin/Preferences', [
            'adminUser' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'avatar' => $request->user()->avatar,
            ],
        ]);
    }

    public function updatePreferences(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'avatar' => 'nullable|image|max:2048',
            'current_password' => 'nullable|required_with:password|current_password',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $payload['avatar'] = $request->file('avatar')->store('user-avatars', 'public');
        }

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);

        return back()->with('success', 'Preferences updated successfully.');
    }

    public function companySettings()
    {
        return Inertia::render('Admin/CompanySettings', [
            'companySettings' => CompanySetting::current()->publicData(),
        ]);
    }

    public function updateCompanySettings(Request $request)
    {
        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'portal_name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'company_address' => 'nullable|string|max:2000',
            'company_phone' => 'nullable|string|max:100',
            'company_email' => 'nullable|email|max:255',
            'company_website' => 'nullable|string|max:255',
            'company_logo' => 'nullable|image|max:2048',
        ]);

        $company = CompanySetting::current();
        $companyPayload = [
            'company_name' => $data['company_name'],
            'portal_name' => $data['portal_name'],
            'tagline' => $data['tagline'] ?? '',
            'address' => $data['company_address'] ?? '',
            'phone' => $data['company_phone'] ?? '',
            'email' => $data['company_email'] ?? '',
            'website' => $data['company_website'] ?? '',
        ];

        if ($request->hasFile('company_logo')) {
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }

            $companyPayload['logo'] = $request->file('company_logo')->store('company-logos', 'public');
        }

        $company->update($companyPayload);

        return back()->with('success', 'Company settings updated successfully.');
    }

    // --- USER MANAGEMENT ---
    public function usersIndex(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        return Inertia::render('Admin/Users', [
            'users' => User::query()
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('role', 'like', "%{$search}%");
                }))
                ->latest()
                ->paginate(10)
                ->withQueryString()
                ->through(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'admin',
                    'avatar' => $user->avatar,
                ]),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role' => ['required', 'string', Rule::in(self::USER_ROLE_OPTIONS)],
            'password' => 'required|min:6',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ];

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('user-avatars', 'public');
        }

        User::create($data);

        return back()->with('success', 'User added successfully.');
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => ['required', 'string', Rule::in(self::USER_ROLE_OPTIONS)],
            'avatar' => 'nullable|image|max:2048',
        ]);

        $data = $request->only('name', 'email', 'role');

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $data['avatar'] = $request->file('avatar')->store('user-avatars', 'public');
        }

        $user->update($data);
        return back()->with('success', 'User updated successfully.');
    }

    public function resetUserPassword(Request $request, User $user)
    {
        $request->validate(['password' => 'required|min:6']);
        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password reset successfully.');
    }

    public function deleteUser(User $user)
    {
        $user->delete();
        return back()->with('success', 'User deleted successfully.');
    }

    // --- CLIENT MANAGEMENT ---
    public function clientsIndex(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        return Inertia::render('Admin/Clients', [
            'clients' => Client::query()
                ->with(['applicationStatusLogs' => fn ($query) => $query->latest()])
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('current_position', 'like', "%{$search}%")
                        ->orWhere('position_applied_for', 'like', "%{$search}%")
                        ->orWhere('type_of_job', 'like', "%{$search}%")
                        ->orWhere('whatsapp_number', 'like', "%{$search}%")
                        ->orWhere('processed_by', 'like', "%{$search}%")
                        ->orWhere('application_status', 'like', "%{$search}%");
                }))
                ->latest()
                ->paginate(10)
                ->withQueryString()
                ->through(fn ($client) => [
                    'id' => $client->id,
                    'name' => $client->name,
                    'first_name' => $client->first_name,
                    'middle_name' => $client->middle_name,
                    'last_name' => $client->last_name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'personal_mobile_no' => $client->personal_mobile_no,
                    'address' => $client->address,
                    'avatar' => $client->avatar,
                    'current_position' => $client->current_position,
                    'position_applied_for' => $client->position_applied_for,
                    'type_of_job' => $client->type_of_job,
                    'whatsapp_number' => $client->whatsapp_number,
                    'processed_by' => $client->processed_by,
                    'application_status' => $client->application_status,
                    'application_status_logs' => $client->applicationStatusLogs
                        ->map(fn ($log) => [
                            'id' => $log->id,
                            'previous_status' => $log->previous_status,
                            'status' => $log->status,
                            'processed_by' => $log->processed_by,
                            'remarks' => $log->remarks,
                            'created_at' => optional($log->created_at)->format('Y-m-d H:i'),
                        ])
                        ->values(),
                ]),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function showClient(Client $client)
    {
        $clientData = $this->profilePayload($client);

        return Inertia::render('Admin/ClientDetails', [
            'client' => $clientData,
        ]);
    }

    public function printPreview(Request $request, Client $client)
    {
        $printForm = $request->query('form', 'complete');
        if (! in_array($printForm, ['complete', 'personal', 'certificates', 'sea_service', 'deck_officer', 'zmi', 'flex_fleet', 'dynamic'], true)) {
            $printForm = 'complete';
        }

        return Inertia::render('Admin/PrintPreview', [
            'client' => $this->profilePayload($client),
            'printForm' => $printForm,
        ]);
    }

    private function profilePayload(Client $client): array
    {
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
        $clientData = $client->toArray();
        unset($clientData['password'], $clientData['verification_token']);

        if (! empty($clientData['date_applied'])) {
            $clientData['date_applied'] = optional($client->date_applied)->format('Y-m-d');
        }

        if (! empty($clientData['date_of_birth'])) {
            $clientData['date_of_birth'] = optional($client->date_of_birth)->format('Y-m-d');
        }

        $clientData['created_at_human'] = optional($client->created_at)->toFormattedDateString();
        $clientData['email_verified_at_human'] = optional($client->email_verified_at)->toFormattedDateString();
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

        return $clientData;
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

    public function storeClient(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients',
            'password' => 'required|min:6',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'avatar' => 'nullable|image|max:2048',
            'resume_attachment' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
            'privacy_act_accepted' => 'nullable|boolean',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'application_status' => Client::DEFAULT_APPLICATION_STATUS,
        ];

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        if ($request->hasFile('resume_attachment')) {
            $data['resume_attachment'] = $request->file('resume_attachment')->store('resume-attachments', 'public');
        }

        $client = Client::create($data);

        if (! $client->email_verified_at) {
            $link = route('seafarers.verify', $client->verification_token);
            SendClientVerificationEmail::dispatch($client, $link);
        }

        return back()->with('success', 'Client added successfully.');
    }

    public function updateClient(Request $request, Client $client)
    {
        $data = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'gender' => ['nullable', 'string', Rule::in(self::GENDER_OPTIONS)],
            'status' => ['nullable', 'string', Rule::in(self::STATUS_OPTIONS)],
            'type_of_job' => ['nullable', 'string', Rule::in(self::TYPE_OF_JOB_OPTIONS)],
            'date_applied' => 'nullable|date',
            'place_of_birth' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'mothers_maiden_name' => 'nullable|string|max:255',
            'fathers_name' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'current_position' => 'nullable|string|max:255',
            'position_applied_for' => 'nullable|string|max:255',
            'educational_attainment' => 'nullable|string|max:255',
            'last_salary' => 'nullable|string|max:255',
            'e_registration_number' => 'nullable|string|max:255',
            'body_weight_bmi' => 'nullable|string|max:100',
            'height_cm' => 'nullable|integer|min:0|max:300',
            'coverall_shoe_size' => 'nullable|string|max:100',
            'current_home_address' => 'nullable|string|max:2000',
            'personal_mobile_no' => 'nullable|string|max:50',
            'whatsapp_number' => 'nullable|string|max:50',
            'fax_no' => 'nullable|string|max:50',
            'email_address' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('clients', 'email_address')->ignore($client->id),
            ],
            'nearest_airport' => 'nullable|string|max:255',
            'next_of_kin' => 'nullable|string|max:255',
            'relationship' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'sss_no' => 'nullable|string|max:100',
            'pagibig_no' => 'nullable|string|max:100',
            'philhealth_no' => 'nullable|string|max:100',
            'avatar' => 'nullable|image|max:2048',
            'resume_attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
            'privacy_act_accepted' => 'nullable|boolean',

            'dependents' => 'nullable|array',
            'dependents.*.id' => ['nullable', 'integer', Rule::exists('client_dependents', 'id')->where('client_id', $client->id)],
            'dependents.*.name' => 'nullable|string|max:255',
            'dependents.*.date_of_birth' => 'nullable|date',
            'dependents.*.relationship' => 'nullable|string|max:255',
            'dependents.*.dependent' => 'nullable|string|max:255',
            'dependents.*.beneficiary' => 'nullable|string|max:255',
            'dependents.*.address' => 'nullable|string|max:1000',
            'dependents.*.attachment' => 'nullable',

            'travel_documents' => 'nullable|array',
            'travel_documents.*.id' => ['nullable', 'integer', Rule::exists('client_travel_documents', 'id')->where('client_id', $client->id)],
            'travel_documents.*.document_type' => 'required_with:travel_documents|string|in:' . implode(',', self::TRAVEL_DOCUMENT_TYPES),
            'travel_documents.*.number' => 'nullable|string|max:255',
            'travel_documents.*.place_of_issue' => 'nullable|string|max:255',
            'travel_documents.*.date_of_issue' => 'nullable|date',
            'travel_documents.*.date_of_expiry' => 'nullable|date',
            'travel_documents.*.attachment' => 'nullable',

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
        unset($data['dependents'], $data['travel_documents'], $data['certifications'], $data['proficiency'], $data['vaccinations'], $data['flag_documents'], $data['other_certificates'], $data['employment_history'], $data['sea_service'], $data['deck_officer_experience']);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            if ($client->avatar && Storage::disk('public')->exists($client->avatar)) {
                Storage::disk('public')->delete($client->avatar);
            }
            $data['avatar'] = $path;
        } else {
            unset($data['avatar']);
        }

        if ($request->hasFile('resume_attachment')) {
            $path = $request->file('resume_attachment')->store('resume-attachments', 'public');
            if ($client->resume_attachment && Storage::disk('public')->exists($client->resume_attachment)) {
                Storage::disk('public')->delete($client->resume_attachment);
            }
            $data['resume_attachment'] = $path;
        } else {
            unset($data['resume_attachment']);
        }

        $privacyActAccepted = $request->boolean('privacy_act_accepted');
        $data['privacy_act_accepted'] = $privacyActAccepted;
        $data['privacy_act_accepted_at'] = $privacyActAccepted
            ? ($client->privacy_act_accepted_at ?: now())
            : null;

        $name = collect([$data['first_name'] ?? null, $data['middle_name'] ?? null, $data['last_name'] ?? null])->filter()->implode(' ');
        if ($name !== '') {
            $data['name'] = $name;
        }
        $this->syncDependents($client, $dependentRows, $request);
        $this->syncTravelDocuments($client, $travelDocumentRows, $request);
        $this->syncRows($client, 'certificateCompetencies', $certificationRows, ['name', 'certificate_number', 'place_of_issue', 'date_of_issue', 'date_of_expiry'], 'competency-attachments', 'certifications');
        $this->syncRows($client, 'certificateProficiencies', $proficiencyRows, ['name', 'certificate_number', 'place_of_issue', 'date_of_issue', 'date_of_expiry'], 'proficiency-attachments', 'proficiency');
        $this->syncRows($client, 'vaccinations', $vaccinationRows, ['name', 'number', 'place_of_issue', 'date_of_issue', 'date_of_expiry'], 'vaccination-attachments', 'vaccinations');
        $this->syncRows($client, 'flagDocuments', $flagDocumentRows, ['name', 'number', 'place_of_issue', 'date_of_issue', 'date_of_expiry']);
        $this->syncRows($client, 'otherCertificates', $otherCertificateRows, ['name', 'number', 'place_of_issue', 'date_of_issue', 'date_of_expiry'], 'other-certificate-attachments', 'other_certificates');
        $this->syncRows($client, 'employmentHistories', $employmentHistoryRows, ['company', 'contact_person_name', 'designation', 'contact_person_number', 'country'], 'employment-history-attachments', 'employment_history');
        $seaServiceRows = $this->applySeaServiceDurations($seaServiceRows);
        $this->syncRows($client, 'seaServices', $seaServiceRows, ['from_date', 'to_date', 'duration_months', 'duration_days', 'position', 'vessel_name', 'type_imo_number', 'area_of_operation', 'flag', 'oilfield_yn', 'propulsion_type', 'grt', 'bollard_pull', 'main_engine_type_model', 'main_engine_kw', 'ship_owner_manager_contact']);
        $this->syncRows($client, 'deckOfficerExperiences', $deckOfficerExperienceRows, ['vessel_name', 'charterer', 'area_of_operation', 'dp_operation_hours', 'supply', 'dsv', 'survey', 'anchor_type', 'anchor_weight', 'barges', 'rig_move', 'propelled', 'non_propelled']);

        $client->update($data);

        return back()->with('success', 'Seafarer profile updated successfully.');
    }

    public function updateApplicationStatus(Request $request, Client $client)
    {
        $data = $request->validate([
            'application_status' => ['required', 'string', Rule::in(self::APPLICATION_STATUS_OPTIONS)],
            'remarks' => 'nullable|string|max:5000',
        ]);

        $admin = Auth::user();
        $processedBy = $admin ? ($admin->name ?: $admin->email) : null;
        $previousStatus = $client->application_status;

        $client->update([
            'application_status' => $data['application_status'],
            'processed_by' => $processedBy,
        ]);

        ApplicationStatusLog::create([
            'client_id' => $client->id,
            'previous_status' => $previousStatus,
            'status' => $data['application_status'],
            'processed_by' => $processedBy,
            'remarks' => $data['remarks'] ?? null,
        ]);

        return back()->with('success', 'Application status updated successfully.');
    }

    private function syncDependents(Client $client, array $rows, Request $request): void
    {
        $existingRows = $client->dependents()->get()->keyBy('id');
        $keptIds = [];

        foreach ($rows as $index => $row) {
            $rowId = $row['id'] ?? null;
            $existingRow = $rowId ? $existingRows->get($rowId) : null;
            $attachment = $existingRow ? $existingRow->attachment : null;

            if ($request->hasFile("dependents.{$index}.attachment")) {
                $attachment = $request->file("dependents.{$index}.attachment")->store('dependent-attachments', 'public');

                if ($existingRow && $existingRow->attachment && Storage::disk('public')->exists($existingRow->attachment)) {
                    Storage::disk('public')->delete($existingRow->attachment);
                }
            }

            $payload = [
                'name' => $row['name'] ?? '',
                'date_of_birth' => ($row['date_of_birth'] ?? null) ?: null,
                'relationship' => $row['relationship'] ?? '',
                'dependent' => $row['dependent'] ?? '',
                'beneficiary' => $row['beneficiary'] ?? '',
                'address' => $row['address'] ?? '',
                'attachment' => $attachment,
            ];

            if (! collect($payload)->contains(fn ($value) => filled($value))) {
                continue;
            }

            $savedRow = $client->dependents()->updateOrCreate(['id' => $rowId], $payload);
            $keptIds[] = $savedRow->id;
        }

        $client->dependents()
            ->whereNotIn('id', $keptIds)
            ->get()
            ->each(function ($row) {
                if ($row->attachment && Storage::disk('public')->exists($row->attachment)) {
                    Storage::disk('public')->delete($row->attachment);
                }

                $row->delete();
            });
    }

    private function syncTravelDocuments(Client $client, array $rows, Request $request): void
    {
        $existingRows = $client->travelDocuments()->get()->keyBy('document_type');

        foreach ($rows as $index => $row) {
            $documentType = $row['document_type'] ?? null;

            if (! in_array($documentType, self::TRAVEL_DOCUMENT_TYPES, true)) {
                continue;
            }

            $existingRow = $existingRows->get($documentType);
            $attachment = $existingRow ? $existingRow->attachment : null;

            if ($request->hasFile("travel_documents.{$index}.attachment")) {
                $attachment = $request->file("travel_documents.{$index}.attachment")->store('travel-document-attachments', 'public');

                if ($existingRow && $existingRow->attachment && Storage::disk('public')->exists($existingRow->attachment)) {
                    Storage::disk('public')->delete($existingRow->attachment);
                }
            }

            $payload = [
                'number' => $row['number'] ?? '',
                'place_of_issue' => $row['place_of_issue'] ?? '',
                'date_of_issue' => ($row['date_of_issue'] ?? null) ?: null,
                'date_of_expiry' => ($row['date_of_expiry'] ?? null) ?: null,
                'attachment' => $attachment,
            ];

            if (! collect($payload)->contains(fn ($value) => filled($value))) {
                if ($existingRow && $existingRow->attachment && Storage::disk('public')->exists($existingRow->attachment)) {
                    Storage::disk('public')->delete($existingRow->attachment);
                }

                $client->travelDocuments()->where('document_type', $documentType)->delete();
                continue;
            }

            $client->travelDocuments()->updateOrCreate(['document_type' => $documentType], $payload);
        }
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
                $attachment = request()->file("{$requestKey}.{$index}.attachment")->store($storageFolder, 'public');

                if ($existingRow && $existingRow->attachment && Storage::disk('public')->exists($existingRow->attachment)) {
                    Storage::disk('public')->delete($existingRow->attachment);
                }
            }

            if (! collect(array_values($payload))->push($attachment)->contains(fn ($value) => filled($value))) {
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

            $from = Carbon::parse($fromDate)->startOfDay();
            $to = Carbon::parse($toDate)->startOfDay();

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

    public function deleteClient(Client $client)
    {
        abort_unless(Auth::user() && Auth::user()->role === 'admin', 403);

        $client->delete();
        return back()->with('success', 'Client deleted successfully.');
    }

    public function viewClientResume(Client $client)
    {
        return $this->resumeViewerResponse(
            $client,
            route('admin.seafarers.resume.file', $client),
            route('admin.seafarers.resume.download', $client),
            route('admin.seafarers.show', $client)
        );
    }

    public function inlineClientResume(Client $client)
    {
        return $this->resumeFileResponse($client, false);
    }

    public function downloadClientResume(Client $client)
    {
        return $this->resumeFileResponse($client, true);
    }

    private function resumeViewerResponse(Client $client, string $fileUrl, string $downloadUrl, string $backUrl)
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

    private function resumeFileResponse(Client $client, bool $download = false)
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

    private function resumeAttachmentOrFail(Client $client): string
    {
        abort_unless($client->resume_attachment, 404);
        abort_unless(Storage::disk('public')->exists($client->resume_attachment), 404);

        return $client->resume_attachment;
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('admin.login');
    }
}
