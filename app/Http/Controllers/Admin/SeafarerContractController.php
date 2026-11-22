<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\SeafarerContract;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SeafarerContractController extends Controller
{
    private function seafarers()
    {
        return Client::query()
            ->where('privacy_act_accepted', true)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'name', 'first_name', 'middle_name', 'last_name', 'date_of_birth', 'place_of_birth', 'current_home_address', 'current_position', 'e_registration_number']);
    }

    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $contracts = SeafarerContract::query()
            ->with('client:id,name,first_name,middle_name,last_name')
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('contract_number', 'like', "%{$search}%")
                    ->orWhere('seafarer_name', 'like', "%{$search}%")
                    ->orWhere('vessel_name', 'like', "%{$search}%")
                    ->orWhere('principal_name', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Contracts/Index', [
            'contracts' => $contracts,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        $company = CompanySetting::current();

        return Inertia::render('Admin/Contracts/Form', [
            'contract' => null,
            'seafarers' => $this->seafarers(),
            'defaults' => [
                'agency_name' => $company->company_name,
                'agency_address' => $company->address,
                'contract_place' => 'MANILA, PHILIPPINES',
                'dmw_place' => 'MANILA, PHILIPPINES',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);
        $data['created_by'] = Auth::id();
        $data['updated_by'] = Auth::id();
        $data['contract_number'] = $data['contract_number'] ?: 'SEC-S-'.now()->format('Y').'-'.str_pad((string) (SeafarerContract::count() + 1), 5, '0', STR_PAD_LEFT);

        $contract = SeafarerContract::create($data);

        return redirect()->route('admin.contracts.edit', $contract)->with('success', 'Contract created successfully.');
    }

    public function edit(SeafarerContract $contract)
    {
        $company = CompanySetting::current();

        return Inertia::render('Admin/Contracts/Form', [
            'contract' => $contract->load('client:id,name,first_name,middle_name,last_name'),
            'seafarers' => $this->seafarers(),
            'defaults' => [
                'agency_name' => $company->company_name,
                'agency_address' => $company->address,
                'contract_place' => 'MANILA, PHILIPPINES',
                'dmw_place' => 'MANILA, PHILIPPINES',
            ],
        ]);
    }

    public function update(Request $request, SeafarerContract $contract)
    {
        $data = $this->validatedData($request);
        $data['updated_by'] = Auth::id();
        $contract->update($data);

        return redirect()->route('admin.contracts.edit', $contract)->with('success', 'Contract updated successfully.');
    }

    public function destroy(SeafarerContract $contract)
    {
        $contract->delete();
        return redirect()->route('admin.contracts.index')->with('success', 'Contract deleted successfully.');
    }

    public function print(SeafarerContract $contract)
    {
        return Inertia::render('Admin/Contracts/Print', [
            'contract' => $contract->load('client:id,name,first_name,middle_name,last_name'),
        ]);
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'contract_number' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:Draft,Signed,Cancelled'],
            'seafarer_name' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'place_of_birth' => ['nullable', 'string', 'max:255'],
            'permanent_address' => ['nullable', 'string'],
            'registration_no' => ['nullable', 'string', 'max:100'],
            'srb_no' => ['nullable', 'string', 'max:100'],
            'sid_no' => ['nullable', 'string', 'max:100'],
            'agency_name' => ['nullable', 'string', 'max:255'],
            'agency_address' => ['nullable', 'string'],
            'dmw_agency_principal' => ['nullable', 'string', 'max:255'],
            'principal_name' => ['nullable', 'string', 'max:255'],
            'principal_address' => ['nullable', 'string'],
            'shipper_name' => ['nullable', 'string', 'max:255'],
            'shipper_address' => ['nullable', 'string'],
            'vessel_name' => ['nullable', 'string', 'max:255'],
            'imo_number' => ['nullable', 'string', 'max:100'],
            'gross_registered_tonnage' => ['nullable', 'string', 'max:100'],
            'year_built' => ['nullable', 'string', 'max:20'],
            'flag' => ['nullable', 'string', 'max:100'],
            'vessel_type' => ['nullable', 'string', 'max:255'],
            'classification_society' => ['nullable', 'string', 'max:255'],
            'duration' => ['nullable', 'string', 'max:100'],
            'position' => ['nullable', 'string', 'max:255'],
            'basic_monthly_salary' => ['nullable', 'string', 'max:100'],
            'hours_of_work' => ['nullable', 'string', 'max:255'],
            'overtime' => ['nullable', 'string', 'max:255'],
            'coverage_of_cba' => ['nullable', 'string', 'max:255'],
            'leave_pay' => ['nullable', 'string', 'max:255'],
            'collective_bargaining_agreement' => ['nullable', 'string', 'max:255'],
            'contract_date' => ['nullable', 'date'],
            'contract_place' => ['nullable', 'string', 'max:255'],
            'seafarer_signature_name' => ['nullable', 'string', 'max:255'],
            'employer_name' => ['nullable', 'string', 'max:255'],
            'employer_designation' => ['nullable', 'string', 'max:255'],
            'approved_by_name' => ['nullable', 'string', 'max:255'],
            'approved_by_designation' => ['nullable', 'string', 'max:255'],
            'dmw_place' => ['nullable', 'string', 'max:255'],
            'approved_date' => ['nullable', 'date'],
            'allotment_seafarer_name' => ['nullable', 'string', 'max:255'],
            'allotment_position' => ['nullable', 'string', 'max:255'],
            'allotment_vessel_name' => ['nullable', 'string', 'max:255'],
            'allotment_monthly_salary' => ['nullable', 'string', 'max:100'],
            'allotment_amount' => ['nullable', 'string', 'max:100'],
            'allottee_name' => ['nullable', 'string', 'max:255'],
            'allottee_relationship' => ['nullable', 'string', 'max:255'],
            'allottee_address' => ['nullable', 'string'],
            'allottee_bank' => ['nullable', 'string', 'max:255'],
            'allottee_account_number' => ['nullable', 'string', 'max:255'],
            'allotment_date' => ['nullable', 'date'],
            'allotment_place' => ['nullable', 'string', 'max:255'],
            'allotment_seafarer_signature' => ['nullable', 'string', 'max:255'],
            'allotment_employer_signature' => ['nullable', 'string', 'max:255'],
            'allotment_amount_2' => ['nullable', 'string', 'max:100'],
            'allottee_2_name' => ['nullable', 'string', 'max:255'],
            'allottee_2_relationship' => ['nullable', 'string', 'max:255'],
            'allottee_2_address' => ['nullable', 'string'],
            'allottee_2_bank' => ['nullable', 'string', 'max:255'],
            'allottee_2_account_number' => ['nullable', 'string', 'max:255'],
            'allotment_amount_3' => ['nullable', 'string', 'max:100'],
            'allottee_3_name' => ['nullable', 'string', 'max:255'],
            'allottee_3_relationship' => ['nullable', 'string', 'max:255'],
            'allottee_3_address' => ['nullable', 'string'],
            'allottee_3_bank' => ['nullable', 'string', 'max:255'],
            'allottee_3_account_number' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
