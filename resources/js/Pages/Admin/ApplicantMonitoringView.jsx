import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer, Save } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

function formatDate(value) {
    if (!value) {
        return 'Not set';
    }

    return new Date(value).toLocaleDateString();
}

function clientName(client) {
    if (!client) {
        return 'Seafarer';
    }

    return [client.first_name, client.middle_name, client.last_name].filter(Boolean).join(' ') || client.name || 'Seafarer';
}

function itemError(errors, index, field) {
    return errors[`items.${index}.${field}`];
}

function PrintHeader({ company }) {
    const logoUrl = company.logo ? `/storage/${company.logo}` : null;

    return (
        <div className="mb-2 border border-black p-2 text-center text-[10px]">
            <div className="flex items-center justify-center gap-2">
                {logoUrl && <img src={logoUrl} alt={company.company_name || 'Company'} className="h-9 w-9 object-contain" />}
                <div>
                    <div className="text-sm font-bold uppercase">{company.company_name || 'ALPHA OMEGA CREWING MANAGEMENT INC'}</div>
                    <div>{company.address || '1210B 12/F 1350 Roxas Boulevard Service Road, Ermita, Manila'}</div>
                </div>
            </div>
        </div>
    );
}

export default function ApplicantMonitoringView({ monitoring, statusOptions = [] }) {
    const { companySettings } = usePage().props;
    const company = companySettings || {};
    const { data, setData, put, processing, errors } = useForm({
        items: (monitoring.items || []).map((item) => ({
            id: item.id,
            seafarer: clientName(item.client),
            country: item.country || '',
            rank: item.rank || '',
            contact: item.contact || '',
            status: item.status || 'Pending',
            remarks: item.remarks || '',
        })),
    });

    const updateItem = (index, field, value) => {
        setData('items', data.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('admin.applicant-monitoring.update', monitoring.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminTabs activeTab="applicant-monitoring-records" title="Applicant Monitoring">
            <Head title="Applicant Monitoring Details" />
            <style>{`
                @media screen { .applicant-monitoring-print { display: none; } }
                @media print {
                    @page { size: A4 landscape; margin: 6mm; }
                    .applicant-monitoring-screen { display: none !important; }
                    .applicant-monitoring-print { display: block !important; color: #000; font-family: Arial, sans-serif; }
                    .applicant-monitoring-print table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
                    .applicant-monitoring-print th,
                    .applicant-monitoring-print td { border: 1px solid #000; padding: 3px 4px; vertical-align: top; word-break: break-word; }
                    .applicant-monitoring-print th { text-align: left; font-weight: 700; }
                }
            `}</style>

            <div className="applicant-monitoring-screen mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Applicant Monitoring</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Monitoring Details</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <Printer size={16} />
                            Print
                        </button>
                        <Link
                            href={route('admin.applicant-monitoring.index')}
                            className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Link>
                    </div>
                </div>

                <section className="rounded border border-slate-200 bg-white shadow-sm">
                    <div className="grid gap-4 border-b border-slate-200 px-5 py-4 md:grid-cols-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Principal</p>
                            <p className="mt-1 break-words text-sm font-medium text-slate-900">{monitoring.principal?.principal_name || 'Not set'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Crewing</p>
                            <p className="mt-1 break-words text-sm font-medium text-slate-900">{monitoring.crewing || 'Not set'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proposed Date</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(monitoring.proposed_date)}</p>
                        </div>
                    </div>

                    <form onSubmit={submit}>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1080px] table-fixed border-collapse">
                                <colgroup>
                                    <col className="w-[23%]" />
                                    <col className="w-[15%]" />
                                    <col className="w-[15%]" />
                                    <col className="w-[18%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[15%]" />
                                </colgroup>
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        <th className="px-3 py-3">Seafarer</th>
                                        <th className="px-3 py-3">Country</th>
                                        <th className="px-3 py-3">Ranks</th>
                                        <th className="px-3 py-3">Contact</th>
                                        <th className="px-3 py-3">Status</th>
                                        <th className="px-3 py-3">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.items.map((item, index) => (
                                        <tr key={item.id} className="text-sm">
                                            <td className="break-words px-3 py-2 font-medium text-slate-900">{item.seafarer}</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={item.country}
                                                    onChange={(event) => updateItem(index, 'country', event.target.value)}
                                                    required
                                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                                />
                                                {itemError(errors, index, 'country') && <p className="mt-1 text-xs text-red-600">{itemError(errors, index, 'country')}</p>}
                                            </td>
                                            <td className="break-words px-3 py-2 text-slate-700">{item.rank || 'Not set'}</td>
                                            <td className="break-words px-3 py-2 text-slate-700">{item.contact || 'Not set'}</td>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={item.status}
                                                    onChange={(event) => updateItem(index, 'status', event.target.value)}
                                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                                {itemError(errors, index, 'status') && <p className="mt-1 text-xs text-red-600">{itemError(errors, index, 'status')}</p>}
                                            </td>
                                            <td className="px-3 py-2">
                                                <textarea
                                                    value={item.remarks}
                                                    onChange={(event) => updateItem(index, 'remarks', event.target.value)}
                                                    rows="1"
                                                    required={item.status === 'Disapproved'}
                                                    className="w-full resize-y rounded border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                                />
                                                {itemError(errors, index, 'remarks') && <p className="mt-1 text-xs text-red-600">{itemError(errors, index, 'remarks')}</p>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end border-t border-slate-200 px-5 py-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12364F] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save size={16} />
                                Update
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            <div className="applicant-monitoring-print">
                <PrintHeader company={company} />
                <div className="mb-2 text-center text-sm font-bold uppercase">Applicant Monitoring</div>
                <table>
                    <colgroup>
                        <col style={{ width: '9%' }} />
                        <col style={{ width: '9%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '13%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '11%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>DATE PROPOSED</th>
                            <th>PROPOSED BY</th>
                            <th>PRINCIPAL</th>
                            <th>CREWING</th>
                            <th>COUNTRY</th>
                            <th>RANK</th>
                            <th>NAME</th>
                            <th>CONTACT NUMBER</th>
                            <th>STATUS</th>
                            <th>REASON IF NOT APPROVED/ REMARKS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item) => (
                            <tr key={item.id}>
                                <td>{formatDate(monitoring.proposed_date)}</td>
                                <td>{monitoring.proposed_by || ''}</td>
                                <td>{monitoring.principal?.principal_code || monitoring.principal?.principal_name || ''}</td>
                                <td>{monitoring.crewing || ''}</td>
                                <td>{item.country}</td>
                                <td>{item.rank}</td>
                                <td>{item.seafarer}</td>
                                <td>{item.contact}</td>
                                <td>{item.status}</td>
                                <td>{item.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminTabs>
    );
}
