import { useMemo, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Printer, Save, Search, Trash2, X } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

function Pagination({ meta }) {
    if (!meta || meta.total === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{meta.from ?? 0}</span> to{' '}
                <span className="font-medium text-slate-700">{meta.to ?? 0}</span> of{' '}
                <span className="font-medium text-slate-700">{meta.total}</span> monitoring records
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

function formatDate(value) {
    if (!value) {
        return 'Not set';
    }

    return new Date(value).toLocaleDateString();
}

function itemError(errors, index, field) {
    return errors[`items.${index}.${field}`];
}

function clientName(client) {
    if (!client) {
        return 'Seafarer';
    }

    return [client.first_name, client.middle_name, client.last_name].filter(Boolean).join(' ') || client.name || 'Seafarer';
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

function PrintRows({ monitorings }) {
    const rows = monitorings.flatMap((monitoring) => {
        const items = monitoring.items?.length ? monitoring.items : [{}];

        return items.map((item) => ({
            id: `${monitoring.id}-${item.id || 'blank'}`,
            proposedDate: formatDate(monitoring.proposed_date),
            proposedBy: monitoring.proposed_by || '',
            principal: monitoring.principal?.principal_code || monitoring.principal?.principal_name || '',
            crewing: monitoring.crewing || '',
            country: item.country || '',
            rank: item.rank || '',
            name: item.client ? clientName(item.client) : '',
            contact: item.contact || '',
            status: item.status || '',
            remarks: item.remarks || '',
        }));
    });

    return (
        <tbody>
            {rows.map((row) => (
                <tr key={row.id}>
                    <td>{row.proposedDate}</td>
                    <td>{row.proposedBy}</td>
                    <td>{row.principal}</td>
                    <td>{row.crewing}</td>
                    <td>{row.country}</td>
                    <td>{row.rank}</td>
                    <td>{row.name}</td>
                    <td>{row.contact}</td>
                    <td>{row.status}</td>
                    <td>{row.remarks}</td>
                </tr>
            ))}
        </tbody>
    );
}

export default function ApplicantMonitoring({ pageMode = 'records', monitorings = {}, filters = {}, principals = [], seafarers = [], statusOptions = [] }) {
    const { auth, companySettings } = usePage().props;
    const company = companySettings || {};
    const isStaff = auth?.user?.role === 'staff';
    const isCreateMode = pageMode === 'create';
    const [search, setSearch] = useState(filters.search || '');
    const [principalSearch, setPrincipalSearch] = useState('');
    const [seafarerSearch, setSeafarerSearch] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        proposed_date: new Date().toISOString().slice(0, 10),
        principal_id: '',
        crewing: '',
        items: [],
    });

    const rows = monitorings?.data || [];
    const selectedPrincipal = principals.find((principal) => Number(principal.id) === Number(data.principal_id));
    const principalMatches = useMemo(() => {
        const keyword = principalSearch.trim().toLowerCase();

        return principals
            .filter((principal) => {
                if (!keyword) {
                    return true;
                }

                return `${principal.principal_name || ''} ${principal.principal_code || ''}`.toLowerCase().includes(keyword);
            })
            .slice(0, 8);
    }, [principals, principalSearch]);
    const seafarerMatches = useMemo(() => {
        const selectedIds = new Set(data.items.map((item) => Number(item.client_id)));
        const keyword = seafarerSearch.trim().toLowerCase();

        return seafarers
            .filter((seafarer) => !selectedIds.has(Number(seafarer.id)))
            .filter((seafarer) => {
                if (!keyword) {
                    return true;
                }

                return `${seafarer.name || ''} ${seafarer.rank || ''} ${seafarer.contact || ''}`.toLowerCase().includes(keyword);
            })
            .slice(0, 8);
    }, [data.items, seafarers, seafarerSearch]);

    const handleSearch = (event) => {
        event.preventDefault();
        router.get(route('admin.applicant-monitoring.index'), { search }, { preserveScroll: true, preserveState: true, replace: true });
    };

    const addSeafarer = (seafarer) => {
        setData('items', [
            ...data.items,
            {
                client_id: seafarer.id,
                seafarer: seafarer.name,
                country: '',
                rank: seafarer.rank || '',
                contact: seafarer.contact || '',
                status: 'Pending',
                remarks: '',
            },
        ]);
        setSeafarerSearch('');
    };

    const updateItem = (index, field, value) => {
        setData('items', data.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, itemIndex) => itemIndex !== index));
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.applicant-monitoring.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('proposed_date', 'principal_id', 'crewing', 'items');
                setPrincipalSearch('');
                setSeafarerSearch('');
            },
        });
    };

    const removeMonitoring = (monitoring) => {
        if (!confirm('Delete this applicant monitoring record?')) {
            return;
        }

        router.delete(route('admin.applicant-monitoring.destroy', monitoring.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminTabs activeTab={isCreateMode ? 'applicant-monitoring-create' : 'applicant-monitoring-records'} title="Applicant Monitoring">
            <Head title="Applicant Monitoring" />
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
                        <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Applicant Monitoring</h2>
                    </div>
                    {!isCreateMode && <form onSubmit={handleSearch} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <div className="relative w-full sm:w-80">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search reference, principal, crewing, or seafarer"
                                className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-10 text-sm text-slate-800 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(route('admin.applicant-monitoring.index'), {}, { preserveScroll: true, preserveState: true, replace: true });
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    aria-label="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="rounded bg-[#B8863B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F7332]">
                            Search
                        </button>
                    </form>}
                </div>

                {isCreateMode && <section className="rounded border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-lg font-semibold text-slate-900">New Monitoring Record</h3>
                    </div>

                    <form onSubmit={submit} className="space-y-5 px-5 py-5">
                        <div className="grid gap-4 md:grid-cols-3 md:items-start">
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700">Principal</label>
                                <input
                                    type="text"
                                    value={principalSearch || (selectedPrincipal ? `${selectedPrincipal.principal_name}${selectedPrincipal.principal_code ? ` (${selectedPrincipal.principal_code})` : ''}` : '')}
                                    onChange={(event) => {
                                        setPrincipalSearch(event.target.value);
                                        setData('principal_id', '');
                                    }}
                                    placeholder="Search principal"
                                    className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                />
                                {principalMatches.length > 0 && principalSearch && (
                                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-200 bg-white shadow-lg">
                                        {principalMatches.map((principal) => (
                                            <button
                                                key={principal.id}
                                                type="button"
                                                onClick={() => {
                                                    setData('principal_id', principal.id);
                                                    setPrincipalSearch('');
                                                }}
                                                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                {principal.principal_name}{principal.principal_code ? ` (${principal.principal_code})` : ''}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {errors.principal_id && <p className="mt-1 text-sm text-red-600">{errors.principal_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Crewing</label>
                                <input
                                    type="text"
                                    value={data.crewing}
                                    onChange={(event) => setData('crewing', event.target.value)}
                                    className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                />
                                {errors.crewing && <p className="mt-1 text-sm text-red-600">{errors.crewing}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Proposed Date</label>
                                <input
                                    type="date"
                                    value={data.proposed_date}
                                    onChange={(event) => setData('proposed_date', event.target.value)}
                                    className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                />
                                {errors.proposed_date && <p className="mt-1 text-sm text-red-600">{errors.proposed_date}</p>}
                            </div>
                        </div>

                        <div className="rounded border border-slate-200">
                            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-end md:justify-between">
                                <div className="relative w-full md:max-w-lg">
                                    <label className="block text-sm font-medium text-slate-700">Search Seafarer</label>
                                    <div className="relative mt-1">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input
                                            type="search"
                                            value={seafarerSearch}
                                            onChange={(event) => setSeafarerSearch(event.target.value)}
                                            placeholder="Search by name, rank, or contact"
                                            className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-800 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                        />
                                    </div>
                                    {seafarerMatches.length > 0 && seafarerSearch && (
                                        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded border border-slate-200 bg-white shadow-lg">
                                            {seafarerMatches.map((seafarer) => (
                                                <button
                                                    key={seafarer.id}
                                                    type="button"
                                                    onClick={() => addSeafarer(seafarer)}
                                                    className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                >
                                                    <span className="font-medium text-slate-900">{seafarer.name}</span>
                                                    <span className="ml-2 text-slate-500">{seafarer.rank || 'No rank'} · {seafarer.contact || 'No contact'}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500">{data.items.length} seafarer{data.items.length === 1 ? '' : 's'} selected</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1080px] table-fixed border-collapse">
                                    <colgroup>
                                        <col className="w-[23%]" />
                                        <col className="w-[15%]" />
                                        <col className="w-[15%]" />
                                        <col className="w-[18%]" />
                                        <col className="w-[14%]" />
                                        <col className="w-[10%]" />
                                        <col className="w-[5%]" />
                                    </colgroup>
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            <th className="px-3 py-3">Seafarer</th>
                                            <th className="px-3 py-3">Country</th>
                                            <th className="px-3 py-3">Ranks</th>
                                            <th className="px-3 py-3">Contact</th>
                                            <th className="px-3 py-3">Status</th>
                                            <th className="px-3 py-3">Remarks</th>
                                            <th className="px-3 py-3 text-right"> </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.items.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-3 py-10 text-center text-sm text-slate-500">Search and add at least one seafarer.</td>
                                            </tr>
                                        ) : data.items.map((item, index) => (
                                            <tr key={item.client_id} className="text-sm">
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
                                                <td className="break-words px-3 py-2 text-slate-700">
                                                    {item.rank || 'Not set'}
                                                </td>
                                                <td className="break-words px-3 py-2 text-slate-700">
                                                    {item.contact || 'Not set'}
                                                </td>
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
                                                <td className="px-3 py-2 text-right">
                                                    <button type="button" onClick={() => removeItem(index)} className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-100 text-red-600 transition hover:bg-red-50" aria-label="Remove seafarer">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {errors.items && <p className="px-4 py-3 text-sm text-red-600">{errors.items}</p>}
                        </div>

                        <div className="flex justify-end border-t border-slate-200 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12364F] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save size={16} />
                                Save Monitoring
                            </button>
                        </div>
                    </form>
                </section>}

                {!isCreateMode && <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="text-lg font-semibold text-slate-900">Monitoring Records</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] table-fixed border-collapse">
                            <colgroup>
                                <col className="w-[12%]" />
                                <col className="w-[13%]" />
                                <col className="w-[23%]" />
                                <col className="w-[16%]" />
                                <col className="w-[16%]" />
                                <col className="w-[10%]" />
                                <col className="w-[10%]" />
                            </colgroup>
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-3 py-3">Reference ID</th>
                                    <th className="px-3 py-3">Date Proposed</th>
                                    <th className="px-3 py-3">Principal</th>
                                    <th className="px-3 py-3">Crewing</th>
                                    <th className="px-3 py-3">Proposed By</th>
                                    <th className="px-3 py-3">Created Date</th>
                                    <th className="px-3 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-3 py-12 text-center text-sm text-slate-500">No monitoring records yet.</td>
                                    </tr>
                                ) : rows.map((monitoring) => (
                                    <tr key={monitoring.id} className="text-sm transition hover:bg-slate-50">
                                        <td className="px-3 py-4 font-medium text-slate-900">{monitoring.monitoring_reference}</td>
                                        <td className="px-3 py-4 text-slate-700">{formatDate(monitoring.proposed_date)}</td>
                                        <td className="break-words px-3 py-4 text-slate-700">{monitoring.principal?.principal_name || 'Not set'}</td>
                                        <td className="break-words px-3 py-4 text-slate-700">{monitoring.crewing || 'Not set'}</td>
                                        <td className="break-words px-3 py-4 text-slate-700">{monitoring.proposed_by || 'Not set'}</td>
                                        <td className="px-3 py-4 text-slate-700">{formatDate(monitoring.created_at)}</td>
                                        <td className="px-3 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.applicant-monitoring.show', monitoring.id)} className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label="View monitoring">
                                                    <Eye size={15} />
                                                </Link>
                                                <button type="button" onClick={() => window.print()} className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label="Print monitoring">
                                                    <Printer size={15} />
                                                </button>
                                                {!isStaff && (
                                                    <button type="button" onClick={() => removeMonitoring(monitoring)} className="inline-flex h-9 w-9 items-center justify-center rounded border border-red-100 text-red-600 transition hover:bg-red-50" aria-label="Delete monitoring">
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination meta={monitorings} />
                </section>}
            </div>

            {!isCreateMode && (
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
                        <PrintRows monitorings={rows} />
                    </table>
                </div>
            )}
        </AdminTabs>
    );
}
