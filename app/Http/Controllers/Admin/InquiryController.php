<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Rank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['search' => ['nullable', 'string', 'max:255']]);
        $search = trim((string) $request->query('search', ''));
        $inquiries = Inquiry::query()->with('statusLogs')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    foreach ([
                        'first_name', 'middle_name', 'last_name', 'contact_number', 'vessel',
                        'offshore_vessel_type', 'present_rank', 'applied_rank',
                        'company_type', 'valid_visa_on_hand', 'current_location', 'status',
                    ] as $field) {
                        $query->orWhere($field, 'like', '%'.$search.'%');
                    }
                });
            })
            ->latest()->orderByDesc('id')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Inquiries', [
            'inquiries' => $inquiries,
            'filters' => ['search' => $search],
            'ranks' => Rank::query()
                ->orderByRaw('priority_level IS NULL')
                ->orderBy('priority_level')
                ->orderBy('rank_name')
                ->pluck('rank_name'),
            'statusOptions' => Inquiry::STATUSES,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birthday' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'contact_number' => ['required', 'string', 'max:50', 'regex:/^\\+?[0-9\\s().-]{7,50}$/'],
            'vessel' => ['required', 'string', 'max:255'],
            'document_status' => ['required', 'string', 'max:2000'],
            'current_location' => ['required', 'string', 'max:255'],
            'present_salary' => ['required', 'string', 'max:100'],
            'company_type' => ['required', 'string', 'in:Principal,Manning Agent'],
            'present_rank' => ['required', 'string', 'exists:ranks,rank_name'],
            'years_in_present_rank' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'applied_rank' => ['nullable', 'string', 'exists:ranks,rank_name'],
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
            'status' => ['required', 'string', \Illuminate\Validation\Rule::in(array_keys(Inquiry::STATUSES))],
        ]);

        foreach ($data as $field => $value) {
            if (is_string($value) && ! in_array($field, ['company_type', 'present_rank', 'applied_rank', 'vessel_system', 'offshore_approval', 'email', 'facebook_account', 'status'], true)) {
                $data[$field] = \Illuminate\Support\Str::ucfirst(mb_strtolower($value, 'UTF-8'));
            }
        }

        $data['email'] = mb_strtolower(trim($data['email']));
        $status = $data['status'];
        unset($data['status']);

        try {
            DB::transaction(function () use ($data, $status) {
                $inquiry = Inquiry::create($data);
                $inquiry->status = $status;
                $inquiry->save();

                foreach (\App\Support\InquiryIdentity::keys($data['email'], $data['contact_number']) as $key) {
                    DB::table('inquiry_identities')->insert([
                        'identity' => $key,
                        'inquiry_id' => $inquiry->id,
                    ]);
                }
            });
        } catch (\Illuminate\Database\UniqueConstraintViolationException $exception) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'duplicate' => 'Inquiry already submitted.',
            ]);
        }

        return back();
    }

    public function updateStatus(Request $request, Inquiry $inquiry)
    {
        $data = $request->validate([
            'status' => ['required', 'string', \Illuminate\Validation\Rule::in(array_keys(Inquiry::STATUSES))],
            'remarks' => ['nullable', 'string', 'max:5000'],
        ]);
        \Illuminate\Support\Facades\DB::transaction(function () use ($inquiry, $data, $request) {
            $locked = Inquiry::query()->lockForUpdate()->findOrFail($inquiry->id);
            $locked->statusLogs()->create([
                'user_id' => $request->user()->id,
                'updated_by' => $request->user()->name,
                'from_status' => $locked->status,
                'to_status' => $data['status'],
                'remarks' => isset($data['remarks']) ? \Illuminate\Support\Str::ucfirst(mb_strtolower($data['remarks'], 'UTF-8')) : null,
            ]);
            $locked->status = $data['status'];
            $locked->save();
        });

        return back();
    }

}
