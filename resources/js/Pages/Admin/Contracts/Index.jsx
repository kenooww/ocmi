import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Pencil, Plus, Printer, Search, Trash2 } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

export default function ContractsIndex({ contracts, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [contractStatus, setContractStatus] = useState(filters.contract_status || '');

    const handleSearch = (event) => {
        event.preventDefault();
        router.get(route('admin.contracts.index'), {
            search: search.trim() || undefined,
            contract_status: contractStatus || undefined,
        }, { preserveState: true, replace: true });
    };

    const removeContract = (contract) => {
        if (confirm(`Delete contract ${contract.contract_number || '#' + contract.id}?`)) {
            router.delete(route('admin.contracts.destroy', contract.id), { preserveScroll: true });
        }
    };

    const formatDate = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set';

    return (
        <AdminTabs activeTab="contracts" title="Contracts">
            <Head title="Seafarer Contracts" />
            <div className="mx-auto max-w-7xl space-y-5">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Seafarer Contracts</h2>
                        <p className="mt-1 text-sm text-slate-500">Create and manage standard overseas employment contracts.</p>
                    </div>
                    <Link href={route('admin.contracts.create')} className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#12364F]">
                        <Plus size={17} /> New Contract
                    </Link>
                </header>

                <form onSubmit={handleSearch} className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contract, seafarer, vessel, principal, or status" className="w-full rounded border-slate-300 py-2.5 pl-10 text-sm" />
                    </div>
                    <select value={contractStatus} onChange={(event) => setContractStatus(event.target.value)} className="rounded border-slate-300 py-2.5 text-sm sm:w-52">
                        <option value="">All Contract Status</option>
                        <option value="Onboard">Onboard</option>
                        <option value="Extend">Extend</option>
                        <option value="End Contract">End Contract</option>
                    </select>
                    <button type="submit" className="rounded bg-[#B8863B] px-4 py-2.5 text-sm font-semibold text-white">Search</button>
                </form>

                <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="border-b px-4 py-3">Contract</th>
                                    <th className="border-b px-4 py-3">Seafarer</th>
                                    <th className="border-b px-4 py-3">Vessel</th>
                                    <th className="border-b px-4 py-3">Principal</th>
                                    <th className="border-b px-4 py-3">Status</th>
                                    <th className="border-b px-4 py-3">Contract Date</th>
                                    <th className="border-b px-4 py-3">Contract Status</th>
                                    <th className="border-b px-4 py-3">End Contract</th>
                                    <th className="border-b px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {contracts.data.length ? contracts.data.map((contract) => (
                                    <tr key={contract.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-4 font-semibold text-slate-800"><div className="flex items-center gap-2"><FileText size={16} className="text-[#B8863B]" />{contract.contract_number || `Contract #${contract.id}`}</div></td>
                                        <td className="px-4 py-4 text-slate-700">{contract.seafarer_name || 'Not set'}</td>
                                        <td className="px-4 py-4 text-slate-600">{contract.vessel_name || 'Not set'}</td>
                                        <td className="px-4 py-4 text-slate-600">{contract.principal_name || 'Not set'}</td>
                                        <td className="px-4 py-4"><span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{contract.status}</span></td>
                                        <td className="px-4 py-4">{formatDate(contract.contract_date)}</td>
                                        <td className="px-4 py-4">{contract.contract_status}</td>
                                        <td className="px-4 py-4">{formatDate(contract.end_contract_date)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.contracts.print', contract.id)} className="inline-flex h-8 w-8 items-center justify-center rounded border border-sky-200 text-sky-700 hover:bg-sky-50" title="Print"><Printer size={15} /></Link>
                                                <Link href={route('admin.contracts.edit', contract.id)} className="inline-flex h-8 w-8 items-center justify-center rounded border border-amber-200 text-amber-700 hover:bg-amber-50" title="Edit"><Pencil size={15} /></Link>
                                                <button type="button" onClick={() => removeContract(contract)} className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="9" className="px-5 py-14 text-center text-sm text-slate-500">No contracts found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {contracts.last_page > 1 && (
                        <div className="flex flex-wrap gap-2 border-t px-4 py-3">
                            {contracts.links.map((link, index) => <Link key={index} href={link.url || '#'} preserveState dangerouslySetInnerHTML={{ __html: link.label }} className={`rounded border px-3 py-2 text-sm ${link.active ? 'border-[#B8863B] bg-[#F5EBDA] font-semibold' : 'border-slate-200 text-slate-600'}`} />)}
                        </div>
                    )}
                </section>
            </div>
        </AdminTabs>
    );
}
