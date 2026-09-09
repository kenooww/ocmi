import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Printer, Search, X } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

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

function Pagination({ meta }) {
    if (!meta || meta.total === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{meta.from ?? 0}</span> to{' '}
                <span className="font-medium text-slate-700">{meta.to ?? 0}</span> of{' '}
                <span className="font-medium text-slate-700">{meta.total}</span> report rows
            </p>
            <div className="flex flex-wrap items-center gap-2">
                {(meta.links ?? []).map((link, index) => (
                    <button
                        key={index}
                        type="button"
                        disabled={!link.url}
                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`min-w-9 rounded border px-3 py-2 text-center text-sm transition ${
                            link.active
                                ? 'border-[#B8863B] bg-[#F5EBDA] font-semibold text-[#8A642C]'
                                : link.url
                                    ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    : 'pointer-events-none border-slate-100 bg-slate-50 text-slate-300'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function ApplicantStatusReport({ rows = [], printRows = [], filters = {}, ranks = [], statusOptions = [] }) {
    const { companySettings } = usePage().props;
    const company = companySettings || {};
    const reportRows = rows?.data ?? rows;
    const hasFiltered = Boolean(filters.filtered);
    const [data, setData] = useState({
        rank: filters.rank || '',
        application_status: filters.application_status || '',
    });

    const submit = (event) => {
        event.preventDefault();
        router.get(route('admin.reports.applicant-status.index'), { ...data, filtered: 1 }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setData({ rank: '', application_status: '' });
        router.get(route('admin.reports.applicant-status.index'), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const exportUrl = route('admin.reports.applicant-status.export', hasFiltered ? { ...data, filtered: 1 } : data);

    return (
        <AdminTabs activeTab="reports-applicant-status" title="Applicant Status Report">
            <Head title="Applicant Status Report" />
            <style>{`
                @media screen { .applicant-status-report-print { display: none; } }
                @media print {
                    @page { size: A4 landscape; margin: 6mm; }
                    .applicant-status-report-screen { display: none !important; }
                    .applicant-status-report-print { display: block !important; color: #000; font-family: Arial, sans-serif; }
                    .applicant-status-report-print table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
                    .applicant-status-report-print th,
                    .applicant-status-report-print td { border: 1px solid #000; padding: 3px 4px; vertical-align: top; word-break: break-word; }
                    .applicant-status-report-print th { text-align: left; font-weight: 700; }
                }
            `}</style>

            <div className="applicant-status-report-screen mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Report</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Applicant Status</h2>
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
                        <a
                            href={exportUrl}
                            className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12364F]"
                        >
                            <Download size={16} />
                            Export CSV
                        </a>
                    </div>
                </div>

                <section className="rounded border border-slate-200 bg-white shadow-sm">
                    <form onSubmit={submit} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-4 px-5 py-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Ranks</label>
                            <select
                                value={data.rank}
                                onChange={(event) => setData((current) => ({ ...current, rank: event.target.value }))}
                                className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                            >
                                <option value="">All Ranks</option>
                                {ranks.map((rank) => (
                                    <option key={rank.id} value={rank.rank_name}>{rank.rank_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Application Status</label>
                            <select
                                value={data.application_status}
                                onChange={(event) => setData((current) => ({ ...current, application_status: event.target.value }))}
                                className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                            >
                                <option value="">All Status</option>
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded bg-[#B8863B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F7332]">
                                <Search size={16} />
                                Filter
                            </button>
                            <button type="button" onClick={clearFilters} className="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-300 text-slate-600 transition hover:bg-slate-50" aria-label="Clear filters">
                                <X size={16} />
                            </button>
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                    <table className="w-full table-fixed border-collapse text-xs">
                        <colgroup>
                            <col className="w-[18%]" />
                            <col className="w-[13%]" />
                            <col className="w-[14%]" />
                            <col className="w-[13%]" />
                            <col className="w-[12%]" />
                            <col className="w-[14%]" />
                            <col className="w-[16%]" />
                        </colgroup>
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                <th className="break-words px-2 py-3">Seafarer</th>
                                <th className="break-words px-2 py-3">Ranks</th>
                                <th className="break-words px-2 py-3">Applied For</th>
                                <th className="break-words px-2 py-3">Contact Number</th>
                                <th className="break-words px-2 py-3">Processed By</th>
                                <th className="break-words px-2 py-3">Application Status (Latest)</th>
                                <th className="break-words px-2 py-3">Application Log (Latest)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reportRows.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-2 py-12 text-center text-sm text-slate-500">
                                        {hasFiltered ? 'No applicant status report records found.' : 'No data to display. Click Filter to load report records.'}
                                    </td>
                                </tr>
                            ) : reportRows.map((row, index) => (
                                <tr key={`${row.seafarer}-${index}`} className="transition hover:bg-slate-50">
                                    <td className="break-words px-2 py-3 font-medium text-slate-900">{row.seafarer || 'Not set'}</td>
                                    <td className="break-words px-2 py-3 text-slate-700">{row.rank || 'Not set'}</td>
                                    <td className="break-words px-2 py-3 text-slate-700">{row.applied_for || 'Not set'}</td>
                                    <td className="break-words px-2 py-3 text-slate-700">{row.contact_number || 'Not set'}</td>
                                    <td className="break-words px-2 py-3 text-slate-700">{row.processed_by || 'Not set'}</td>
                                    <td className="break-words px-2 py-3 text-slate-700">{row.application_status || 'Not set'}</td>
                                    <td className="break-words px-2 py-3 text-slate-700">{row.application_log || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination meta={rows} />
                </section>
            </div>

            <div className="applicant-status-report-print">
                <PrintHeader company={company} />
                <div className="mb-2 text-center text-sm font-bold uppercase">Applicant Status Report</div>
                <table>
                    <thead>
                        <tr>
                            <th>SEAFARER</th>
                            <th>RANKS</th>
                            <th>APPLIED FOR</th>
                            <th>CONTACT NUMBER</th>
                            <th>PROCESSED BY</th>
                            <th>APPLICATION STATUS (LATEST)</th>
                            <th>APPLICATION LOG (LATEST)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printRows.map((row, index) => (
                            <tr key={`${row.seafarer}-print-${index}`}>
                                <td>{row.seafarer}</td>
                                <td>{row.rank}</td>
                                <td>{row.applied_for}</td>
                                <td>{row.contact_number}</td>
                                <td>{row.processed_by}</td>
                                <td>{row.application_status}</td>
                                <td>{row.application_log}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminTabs>
    );
}
