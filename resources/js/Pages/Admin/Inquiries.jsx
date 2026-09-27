import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Eye, Mail, Search, X } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

const fullName = (item) => [item.first_name, item.middle_name, item.last_name].filter(Boolean).join(' ');
const displayDate = (value) => value ? value.slice(0, 10) : 'Not provided';
const detailFields = [
    ['First name', 'first_name'], ['Middle name', 'middle_name'], ['Last name', 'last_name'],
    ['Birthday', 'birthday'], ['Contact number', 'contact_number'], ['Vessel', 'vessel'],
    ['Current location', 'current_location'], ['Present salary', 'present_salary'],
    ['Document status', 'document_status'],
];

export default function Inquiries({ inquiries, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selected, setSelected] = useState(null);
    const submitSearch = (event) => {
        event.preventDefault();
        router.get(route('admin.inquiries.index'), search.trim() ? { search: search.trim() } : {}, { preserveState: true, replace: true });
    };

    return (
        <AdminTabs activeTab="inquiries" title="Inquiries">
            <Head title="Inquiries" />
            <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
                <div><p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin console</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Website inquiries</h2><p className="mt-2 text-sm text-slate-500">Review submissions from the public inquiry form.</p></div>
                <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="min-w-0 flex-1"><label htmlFor="inquiry-search" className="mb-1 block text-xs font-medium text-slate-600">Search inquiries</label><input id="inquiry-search" value={search} onChange={(event) => setSearch(event.target.value)} maxLength={255} placeholder="Name, contact number, vessel, or location" className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B]" /></div>
                    <button type="submit" className="inline-flex items-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12364F]"><Search size={16} />Search</button>
                    {filters.search && <Link href={route('admin.inquiries.index')} className="rounded border border-slate-300 px-4 py-2.5 text-sm text-slate-600">Clear</Link>}
                </form>
                <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700">{inquiries.total} {inquiries.total === 1 ? 'inquiry' : 'inquiries'}{filters.search ? ' found' : ' received'}</div>
                    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Name', 'Contact number', 'Vessel', 'Current location', 'Submitted', 'Action'].map((label) => <th key={label} scope="col" className="whitespace-nowrap px-5 py-3 font-semibold">{label}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">{inquiries.data.length ? inquiries.data.map((item) => <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="min-w-48 px-5 py-4 font-medium text-slate-900">{fullName(item)}</td><td className="whitespace-nowrap px-5 py-4 text-slate-600">{item.contact_number}</td><td className="max-w-xs break-words px-5 py-4 text-slate-600">{item.vessel}</td><td className="max-w-xs break-words px-5 py-4 text-slate-600">{item.current_location}</td><td className="whitespace-nowrap px-5 py-4 text-slate-500">{displayDate(item.created_at)}</td>
                            <td className="px-5 py-4"><button type="button" onClick={() => setSelected(item)} aria-label={`View inquiry from ${fullName(item)}`} className="inline-flex items-center gap-2 whitespace-nowrap rounded border border-[#1F6F5C]/25 px-3 py-2 text-xs font-semibold text-[#1F6F5C] hover:bg-[#E1EBE6]"><Eye size={15} />View details</button></td>
                        </tr>) : <tr><td colSpan={6} className="px-5 py-14 text-center text-slate-500"><Mail className="mx-auto mb-3 text-slate-400" size={28} />{filters.search ? 'No inquiries match your search.' : 'No inquiries have been submitted yet.'}</td></tr>}</tbody>
                    </table></div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500"><span>Showing {inquiries.from || 0}–{inquiries.to || 0} of {inquiries.total}</span><nav aria-label="Inquiry pagination" className="flex items-center gap-3">{inquiries.prev_page_url ? <Link href={inquiries.prev_page_url} className="rounded border px-3 py-2 hover:bg-slate-50">Previous</Link> : <span className="px-3 py-2 text-slate-400">Previous</span>}<span>Page {inquiries.current_page} of {inquiries.last_page}</span>{inquiries.next_page_url ? <Link href={inquiries.next_page_url} className="rounded border px-3 py-2 hover:bg-slate-50">Next</Link> : <span className="px-3 py-2 text-slate-400">Next</span>}</nav></div>
                </div>
            </div>
            <Dialog open={!!selected} onClose={() => setSelected(null)} className="relative z-[60]">
                <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
                <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6"><div className="flex min-h-full items-center justify-center"><DialogPanel className="w-full max-w-2xl rounded border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5"><div><DialogTitle className="text-lg font-semibold text-[#16222B]">Inquiry details</DialogTitle><p className="mt-1 text-xs text-slate-500">Inquiry #{selected?.id} · Submitted {displayDate(selected?.created_at)}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close inquiry details" className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
                    {selected && <dl className="grid gap-x-8 gap-y-5 px-6 py-6 sm:grid-cols-2">{detailFields.map(([label, key]) => <div key={key} className={key === 'document_status' ? 'sm:col-span-2' : ''}><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-900">{key === 'birthday' ? displayDate(selected[key]) : selected[key] || 'Not provided'}</dd></div>)}</dl>}
                    <div className="flex justify-end border-t border-slate-200 px-6 py-4"><button type="button" onClick={() => setSelected(null)} className="rounded bg-[#0A2436] px-5 py-2 text-sm font-semibold text-white hover:bg-[#12364F]">Close</button></div>
                </DialogPanel></div></div>
            </Dialog>
        </AdminTabs>
    );
}
