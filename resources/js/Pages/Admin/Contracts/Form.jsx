import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Printer, Save } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';
import { useEffect, useState } from 'react';

const emptyContract = {
    client_id: '', contract_number: '', status: 'Draft', seafarer_name: '', date_of_birth: '', place_of_birth: '', permanent_address: '', registration_no: '', srb_no: '', sid_no: '',
    agency_name: '', agency_address: '', dmw_agency_principal: '', principal_name: '', principal_address: '', shipper_name: '', shipper_address: '',
    vessel_name: '', imo_number: '', gross_registered_tonnage: '', year_built: '', flag: '', vessel_type: '', classification_society: '',
    duration: '', position: '', basic_monthly_salary: '', hours_of_work: '', overtime: '', coverage_of_cba: '', leave_pay: '', collective_bargaining_agreement: '',
    contract_date: '', contract_place: '', contract_status: '', end_contract_date: '', seafarer_signature_name: '', employer_name: '', employer_designation: '', approved_by_name: '',
    approved_by_designation: '', dmw_place: '', approved_date: '',
    allotment_seafarer_name: '', allotment_position: '', allotment_vessel_name: '', allotment_monthly_salary: '', allotment_amount: '',
    allottee_name: '', allottee_relationship: '', allottee_address: '', allottee_bank: '', allottee_account_number: '',
    allotment_amount_2: '', allottee_2_name: '', allottee_2_relationship: '', allottee_2_address: '', allottee_2_bank: '', allottee_2_account_number: '',
    allotment_amount_3: '', allottee_3_name: '', allottee_3_relationship: '', allottee_3_address: '', allottee_3_bank: '', allottee_3_account_number: '',
    allotment_date: '', allotment_place: '',
};

function dateValue(value) {
    return value ? String(value).slice(0, 10) : '';
}

function ContractSection({ title, children }) {
    return (
        <section className="rounded border border-slate-200 bg-white shadow-sm">
            <h3 className="border-b border-slate-200 px-5 py-3 text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h3>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
        </section>
    );
}

export default function ContractForm({ contract, seafarers = [], principals = [], defaults = {} }) {
    const initial = contract ? {
        ...emptyContract,
        ...contract,
        date_of_birth: dateValue(contract.date_of_birth),
        contract_date: dateValue(contract.contract_date),
        end_contract_date: dateValue(contract.end_contract_date),
        approved_date: dateValue(contract.approved_date),
        allotment_date: dateValue(contract.allotment_date),
    } : { ...emptyContract, ...defaults };

    const { data, setData, post, put, processing, errors } = useForm(initial);
    const [activeTab, setActiveTab] = useState('contract');
    const [seafarerSearch, setSeafarerSearch] = useState(initial.seafarer_name || '');
    const [seafarerDropdownOpen, setSeafarerDropdownOpen] = useState(false);

    const seafarerName = (seafarer) => [seafarer.first_name, seafarer.middle_name, seafarer.last_name].filter(Boolean).join(' ') || seafarer.name || '';
    const seafarerMatches = seafarerSearch.trim()
        ? seafarers.filter((seafarer) => seafarerName(seafarer).toLowerCase().includes(seafarerSearch.trim().toLowerCase())).slice(0, 20)
        : [];

    useEffect(() => {
        setData((current) => ({
            ...current,
            allotment_seafarer_name: current.seafarer_name || '',
            allotment_position: current.position || '',
            allotment_vessel_name: current.vessel_name || '',
            allotment_monthly_salary: current.basic_monthly_salary || '',
        }));
    }, [data.seafarer_name, data.position, data.vessel_name, data.basic_monthly_salary]);

    const selectSeafarer = (clientId) => {
        const seafarer = seafarers.find((item) => String(item.id) === String(clientId));
        if (!seafarer) {
            setData((current) => ({ ...current, client_id: '' }));
            return;
        }

        const name = [seafarer.first_name, seafarer.middle_name, seafarer.last_name].filter(Boolean).join(' ') || seafarer.name || '';
        setData((current) => ({
            ...current,
            client_id: seafarer.id,
            seafarer_name: name,
            date_of_birth: dateValue(seafarer.date_of_birth),
            place_of_birth: seafarer.place_of_birth || '',
            permanent_address: seafarer.current_home_address || '',
            registration_no: seafarer.e_registration_number || '',
            srb_no: '',
            sid_no: seafarer.e_registration_number || '',
            position: seafarer.current_position || current.position,
            seafarer_signature_name: name,
            allotment_seafarer_name: name,
            allotment_position: seafarer.current_position || current.position,
            allotment_monthly_salary: current.basic_monthly_salary || '',
            allotment_vessel_name: current.vessel_name || '',
        }));
    };

    const submit = (event) => {
        event.preventDefault();
        if (contract) put(route('admin.contracts.update', contract.id));
        else post(route('admin.contracts.store'));
    };

    const field = (key, label, type = 'text', options = {}) => (
        <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
            {type === 'textarea' ? (
                <textarea rows={options.rows || 3} value={data[key] || ''} onChange={(event) => setData(key, event.target.value)} className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
            ) : (
                <input type={type} value={data[key] || ''} onChange={(event) => setData(key, event.target.value)} required={options.required || false} disabled={options.disabled || false} className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500" />
            )}
            {errors[key] && <span className="mt-1 block text-xs text-red-600">{errors[key]}</span>}
        </label>
    );

    const Section = ContractSection;

    useEffect(() => {
        if (activeTab === 'allotment') {
            setData((current) => ({
                ...current,
                allotment_seafarer_name: current.seafarer_name,
                allotment_position: current.position,
                allotment_monthly_salary: current.basic_monthly_salary,
                allotment_vessel_name: current.vessel_name,
            }));
        }
    }, [activeTab, contract, seafarers]);

    return (
        <AdminTabs activeTab="contracts" title={contract ? 'Edit Contract' : 'New Contract'}>
            <Head title={contract ? 'Edit Contract' : 'New Contract'} />
            <form onSubmit={submit} className="mx-auto max-w-7xl space-y-5">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link href={route('admin.contracts.index')} className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft size={15} /> Back to contracts</Link>
                        <h2 className="text-2xl font-semibold text-slate-900">{contract ? 'Edit Standard Employment Contract' : 'Standard Employment Contract'}</h2>
                    </div>
                    <div className="flex gap-2">
                        {contract && <Link href={route('admin.contracts.print', contract.id)} className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Printer size={16} /> Print</Link>}
                        <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} /> {processing ? 'Saving...' : 'Save Contract'}</button>
                    </div>
                </header>

                <div className="flex gap-2 border-b border-slate-200">
                    <button type="button" onClick={() => setActiveTab('contract')} className={`border-b-2 px-4 py-3 text-sm font-semibold ${activeTab === 'contract' ? 'border-[#B8863B] text-[#8A642C]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Contract</button>
                    <button type="button" onClick={() => setActiveTab('allotment')} className={`border-b-2 px-4 py-3 text-sm font-semibold ${activeTab === 'allotment' ? 'border-[#B8863B] text-[#8A642C]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Certificate of Allotment</button>
                </div>

                {activeTab === 'contract' && (
                    <>
                        <Section title="Contract Information">
                            <div className="relative block">
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Seafarer</span>
                                <input
                                    type="text"
                                    value={seafarerSearch}
                                    onChange={(event) => {
                                        setSeafarerSearch(event.target.value);
                                        setSeafarerDropdownOpen(Boolean(event.target.value.trim()));
                                        if (!event.target.value) setData((current) => ({ ...current, client_id: '' }));
                                    }}
                                    onFocus={() => setSeafarerDropdownOpen(Boolean(seafarerSearch.trim()))}
                                    onBlur={() => setSeafarerDropdownOpen(false)}
                                    placeholder="Search seafarer"
                                    className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                />
                                {seafarerDropdownOpen && seafarerMatches.length > 0 && (
                                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-200 bg-white shadow-lg">
                                        {seafarerMatches.map((seafarer) => (
                                            <button
                                                key={seafarer.id}
                                                type="button"
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={() => {
                                                    setSeafarerSearch(seafarerName(seafarer));
                                                    setSeafarerDropdownOpen(false);
                                                    selectSeafarer(seafarer.id);
                                                }}
                                                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                {seafarerName(seafarer)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {errors.client_id && <span className="mt-1 block text-xs text-red-600">{errors.client_id}</span>}
                            </div>
                            {field('contract_number', 'Contract Number', 'text', { disabled: true })}
                            <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Status</span><select value={data.status} onChange={(event) => setData('status', event.target.value)} className="w-full rounded border-slate-300 text-sm"><option>Draft</option><option>Signed</option><option>Cancelled</option></select></label>
                        </Section>

                        <Section title="Seafarer Details">
                            {field('seafarer_name', 'Name of Seafarer')}
                            {field('date_of_birth', 'Date of Birth', 'date')}
                            {field('place_of_birth', 'Place of Birth')}
                            {field('permanent_address', 'Permanent/Residential Address', 'textarea')}
                            {field('registration_no', "Seafarer's Registration No.")}
                            {field('srb_no', 'SRB No.')}
                            {field('sid_no', 'SID No.')}
                        </Section>

                        <Section title="Agency and Employer">
                            {field('agency_name', 'Licensed Manning Agency')}
                            {field('agency_address', 'Agency Address', 'textarea')}
                            {field('dmw_agency_principal', 'DMW Accredited Principal')}
                            <label className="block">
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Principal/Shipowner</span>
                                <select
                                    value={data.principal_name || ''}
                                    onChange={(event) => {
                                        const principal = principals.find((item) => item.principal_name === event.target.value);
                                        setData((current) => ({
                                            ...current,
                                            principal_name: event.target.value,
                                            principal_address: principal?.address || current.principal_address,
                                        }));
                                    }}
                                    className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                >
                                    <option value="">Select principal/shipowner</option>
                                    {principals.map((principal) => (
                                        <option key={principal.id} value={principal.principal_name}>
                                            {principal.principal_name}{principal.principal_code ? ` (${principal.principal_code})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.principal_name && <span className="mt-1 block text-xs text-red-600">{errors.principal_name}</span>}
                            </label>
                            {field('principal_address', 'Principal Address', 'textarea')}
                            {field('shipper_name', 'Name of Shipper/Shipowner')}
                            {field('shipper_address', 'Shipper Address', 'textarea')}
                        </Section>

                        <Section title="Vessel Details">
                            {field('vessel_name', 'Name of Vessel')}
                            {field('imo_number', 'IMO / IMO Number')}
                            {field('gross_registered_tonnage', 'Gross Registered Tonnage')}
                            {field('year_built', 'Year Built')}
                            {field('flag', 'Flag')}
                            {field('vessel_type', 'Type of Vessel')}
                            {field('classification_society', 'Classification Society')}
                        </Section>

                        <Section title="Contract Terms">
                            {field('duration', 'Duration of Contract')}
                            {field('position', 'Position')}
                            {field('basic_monthly_salary', 'Basic Monthly Salary')}
                            {field('hours_of_work', 'Hours of Work')}
                            {field('overtime', 'Overtime')}
                            {field('leave_pay', 'Leave Pay')}
                            {field('coverage_of_cba', 'Point of Hire')}
                            {field('collective_bargaining_agreement', 'Collective Bargaining Agreement (If Any)')}
                            {field('contract_date', 'Contract Date', 'date', { required: data.contract_status === 'End Contract' })}
                            <label className="block">
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Contract Status</span>
                                <select
                                    value={data.contract_status || ''}
                                    onChange={(event) => setData('contract_status', event.target.value)}
                                    className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                >
                                    <option value="">Select status</option>
                                    <option value="Onboard">Onboard</option>
                                    <option value="Extend">Extend</option>
                                    <option value="End Contract">End Contract</option>
                                </select>
                                {errors.contract_status && <span className="mt-1 block text-xs text-red-600">{errors.contract_status}</span>}
                            </label>
                            {field('end_contract_date', 'End Contract Date', 'date', { required: data.contract_status === 'End Contract' })}
                        </Section>

                        <Section title="Signatures and Approval">
                            {field('seafarer_signature_name', 'Seafarer Signature Name')}
                            {field('employer_name', 'Employer Name')}
                            {field('employer_designation', 'Employer Signature / Designation')}
                            {field('approved_by_name', 'DMW Approved By')}
                            {field('approved_by_designation', 'DMW Official Position')}
                            {field('dmw_place', 'Approval Place')}
                            {field('approved_date', 'Date of Approval', 'date')}
                        </Section>
                    </>
                )}

                {activeTab === 'allotment' && (
                    <>
                        <Section title="Certificate of Salary Allotment">
                            <div>
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Name of Seafarer</span>
                                <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">{data.allotment_seafarer_name || '—'}</div>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Position</span>
                                <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">{data.allotment_position || '—'}</div>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Vessel Name</span>
                                <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">{data.allotment_vessel_name || '—'}</div>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Monthly Salary</span>
                                <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">{data.allotment_monthly_salary || '—'}</div>
                            </div>
                            {field('allotment_date', 'Date', 'date')}
                            {field('allotment_place', 'Place')}
                        </Section>

                        <div className="grid gap-5 lg:grid-cols-3">
                            {[1, 2, 3].map((number) => {
                                const prefix = number === 1 ? '' : `_${number}`;
                                const amountKey = number === 1 ? 'allotment_amount' : `allotment_amount_${number}`;
                                const nameKey = number === 1 ? 'allottee_name' : `allottee_${number}_name`;
                                const relationshipKey = number === 1 ? 'allottee_relationship' : `allottee_${number}_relationship`;
                                const addressKey = number === 1 ? 'allottee_address' : `allottee_${number}_address`;
                                const bankKey = number === 1 ? 'allottee_bank' : `allottee_${number}_bank`;
                                const accountKey = number === 1 ? 'allottee_account_number' : `allottee_${number}_account_number`;
                                void prefix;
                                return (
                                    <section key={number} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                                            <h3 className="text-sm font-bold text-slate-700">ALLOTTEE {number}</h3>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">#{number}</span>
                                        </div>
                                        <div className="grid gap-4 p-5">
                                            {field(amountKey, 'Amount of Allotment')}
                                            {field(nameKey, 'Name of Allottee')}
                                            {field(relationshipKey, 'Relationship to Seafarer')}
                                            {field(addressKey, 'Address', 'textarea', { rows: 3 })}
                                            {field(bankKey, 'Bank')}
                                            {field(accountKey, 'Account Number')}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </>
                )}
            </form>
        </AdminTabs>
    );
}
