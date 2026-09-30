import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ClipboardCheck, Eye, Mail, Search, X } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';
import { inquiryText } from '@/Utils/inquiryText';
import { ageFromBirthday } from '@/Utils/ageFromBirthday';

const fullName = (item) => [item.first_name, item.middle_name, item.last_name].filter(Boolean).map((part) => inquiryText(part)).join(' ');
const displayDate = (value) => value ? value.slice(0, 10) : 'Not provided';
const STATUS_COLORS = {
    NEW: 'border-sky-200 bg-sky-50 text-sky-800',
    Pending: 'border-amber-200 bg-amber-50 text-amber-800',
    Failed: 'border-red-200 bg-red-50 text-red-800',
    'To report': 'border-violet-200 bg-violet-50 text-violet-800',
    'For application processing': 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

function StatusBadge({ status, compact = false }) {
    return <span className={`inline-block max-w-full whitespace-normal break-words rounded border px-1.5 py-1 font-semibold ${compact ? 'text-[9px] xl:text-[10px]' : 'text-xs'} ${STATUS_COLORS[status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{inquiryText(status) || 'Not provided'}</span>;
}

const detailFields = [
    ['First name', 'first_name'], ['Middle name', 'middle_name'], ['Last name', 'last_name'],
    ['Birthday', 'birthday'], ['Age', 'age'], ['Contact number', 'contact_number'], ['Vessel', 'vessel'],
    ['Current location', 'current_location'], ['Present salary', 'present_salary'],
    ['Inquiry status', 'status'],
    ['Document status', 'document_status'],
    ["Present rank", "present_rank"],
    ["Years of experience on present rank", "years_in_present_rank"],
    ["Applied rank", "applied_rank"],
    ["WhatsApp number", "whatsapp_number"],
    ["Email", "email"],
    ["Facebook account", "facebook_account"],
    ["Last salary", "last_salary"],
    ["Valid visa on hand", "valid_visa_on_hand"],
    ["Nationality", "nationality"],
    ["Vessel information", "vessel_information"],
    ["Type of offshore vessel", "offshore_vessel_type"],
    ["Years of experience", "years_of_experience"],
    ["Place of operation", "place_of_operation"],
    ["Offshore approval (offshore only)", "offshore_approval"],
    ["Vessel system", "vessel_system"],
    ["Latest vessel experience", "latest_vessel_experience"],
    ["Latest sign-off date", "latest_sign_off_date"],
    ["Other vessel experience", "other_vessel_experience"],
    ["Additional skills (if any)", "additional_skills"],
];

export default function Inquiries({ inquiries, filters, statusOptions }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selected, setSelected] = useState(null);
    const [statusInquiry, setStatusInquiry] = useState(null);
    const [statusTab, setStatusTab] = useState(0);
    const [notice, setNotice] = useState('');
    const statusForm = useForm({ status: 'NEW', remarks: '' });
    const openStatus = (item) => {
        setNotice('');
        setStatusTab(0);
        statusForm.clearErrors();
        statusForm.setData({ status: item.status, remarks: '' });
        setStatusInquiry(item);
    };
    const saveStatus = (event) => {
        event.preventDefault();
        statusForm.patch(route('admin.inquiries.status.update', statusInquiry.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                setStatusInquiry(page.props.inquiries.data.find((item) => item.id === statusInquiry.id) || null);
                statusForm.setData('remarks', '');
                setNotice('Inquiry status updated successfully.');
            },
        });
    };
    const age = ageFromBirthday(selected?.birthday);
    const submitSearch = (event) => {
        event.preventDefault();
        router.get(route('admin.inquiries.index'), search.trim() ? { search: search.trim() } : {}, { preserveState: true, replace: true });
    };

    return (
        <AdminTabs activeTab="inquiries" title="Inquiries">
            <Head title="Inquiries" />
            <div className="mx-auto w-full min-w-0 space-y-5 p-3 sm:p-4">
                <div><p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin console</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Website inquiries</h2><p className="mt-2 text-sm text-slate-500">Review submissions from the public inquiry form.</p></div>
                {notice && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
                <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="min-w-0 flex-1"><label htmlFor="inquiry-search" className="mb-1 block text-xs font-medium text-slate-600">Search inquiries</label><input id="inquiry-search" value={search} onChange={(event) => setSearch(event.target.value)} maxLength={255} placeholder="Name, contact number, vessel, or location" className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B]" /></div>
                    <button type="submit" className="inline-flex items-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12364F]"><Search size={16} />Search</button>
                    {filters.search && <Link href={route('admin.inquiries.index')} className="rounded border border-slate-300 px-4 py-2.5 text-sm text-slate-600">Clear</Link>}
                </form>
                <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700">{inquiries.total} {inquiries.total === 1 ? 'inquiry' : 'inquiries'}{filters.search ? ' found' : ' received'}</div>
                    <div><table className="w-full table-fixed text-left text-[10px] leading-snug xl:text-xs [&_td]:align-top [&_td]:[overflow-wrap:anywhere] [&_th]:[overflow-wrap:anywhere]">
                        <colgroup>{[13, 10, 9, 9, 10, 10, 10, 8, 11, 10].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup>
                        <thead className="bg-slate-50 text-[9px] xl:text-[10px] uppercase text-slate-500"><tr>{['Name', 'Contact number', 'Applied Rank', 'Visa on Hand', 'Vessel', 'Type of Offshore Vessel', 'Current location', 'Submitted', 'Status', 'Action'].map((label) => <th key={label} scope="col" className="whitespace-normal px-1.5 py-3 font-semibold">{label}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">{inquiries.data.length ? inquiries.data.map((item) => <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="px-1.5 py-3 font-medium text-slate-900">{fullName(item)}</td><td className="whitespace-normal px-1.5 py-3 text-slate-600">{item.contact_number}</td>
                            <td className="break-words px-1.5 py-3 text-slate-600">{inquiryText(item.applied_rank) || 'Not provided'}</td>
                            <td className="break-words px-1.5 py-3 text-slate-600">{inquiryText(item.valid_visa_on_hand) || 'Not provided'}</td><td className="break-words px-1.5 py-3 text-slate-600">{inquiryText(item.vessel)}</td>
                            <td className="break-words px-1.5 py-3 text-slate-600">{inquiryText(item.offshore_vessel_type) || 'Not provided'}</td><td className="break-words px-1.5 py-3 text-slate-600">{inquiryText(item.current_location)}</td><td className="whitespace-normal px-1.5 py-3 text-slate-500">{displayDate(item.created_at)}</td>
                            <td className="px-1.5 py-3"><StatusBadge status={item.status} compact /></td>
                            <td className="px-1.5 py-3">
                                <div className="flex flex-wrap gap-1">
                                    <button type="button" onClick={() => setSelected(item)} title="View details" aria-label={`View inquiry from ${fullName(item)}`} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-100 hover:shadow">
                                        <Eye size={13} />
                                    </button>
                                    <button type="button" onClick={() => openStatus(item)} title="Update status" aria-label={`Update inquiry status for ${fullName(item)}`} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-amber-100 bg-amber-50 text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-100 hover:shadow">
                                        <ClipboardCheck size={13} />
                                    </button>
                                </div>
                            </td>
                        </tr>) : <tr><td colSpan={10} className="px-5 py-14 text-center text-slate-500"><Mail className="mx-auto mb-3 text-slate-400" size={28} />{filters.search ? 'No inquiries match your search.' : 'No inquiries have been submitted yet.'}</td></tr>}</tbody>
                    </table></div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500"><span>Showing {inquiries.from || 0}–{inquiries.to || 0} of {inquiries.total}</span><nav aria-label="Inquiry pagination" className="flex items-center gap-3">{inquiries.prev_page_url ? <Link href={inquiries.prev_page_url} className="rounded border px-3 py-2 hover:bg-slate-50">Previous</Link> : <span className="px-3 py-2 text-slate-400">Previous</span>}<span>Page {inquiries.current_page} of {inquiries.last_page}</span>{inquiries.next_page_url ? <Link href={inquiries.next_page_url} className="rounded border px-3 py-2 hover:bg-slate-50">Next</Link> : <span className="px-3 py-2 text-slate-400">Next</span>}</nav></div>
                </div>
            </div>
            <Dialog open={!!selected} onClose={() => setSelected(null)} className="relative z-[60]">
                <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
                <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6"><div className="flex min-h-full items-center justify-center"><DialogPanel className="w-full max-w-2xl rounded border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5"><div><DialogTitle className="text-lg font-semibold text-[#16222B]">Inquiry details</DialogTitle><p className="mt-1 text-xs text-slate-500">Inquiry #{selected?.id} · Submitted {displayDate(selected?.created_at)}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close inquiry details" className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
                    {selected && <dl className="grid gap-x-8 gap-y-5 px-6 py-6 sm:grid-cols-2">{detailFields.map(([label, key]) => <div key={key} className={key === 'document_status' ? 'sm:col-span-2' : ''}><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-900">{key === 'status' ? <StatusBadge status={selected.status} /> : key === 'age' ? (age === null ? 'Not available' : `${age} ${age === 1 ? 'year' : 'years'} old`) : ['birthday', 'latest_sign_off_date'].includes(key) ? displayDate(selected[key]) : (selected[key] === null || selected[key] === '' ? 'Not provided' : inquiryText(selected[key], key))}</dd></div>)}</dl>}
                    <div className="flex justify-end border-t border-slate-200 px-6 py-4"><button type="button" onClick={() => setSelected(null)} className="rounded bg-[#0A2436] px-5 py-2 text-sm font-semibold text-white hover:bg-[#12364F]">Close</button></div>
                </DialogPanel></div></div>
            </Dialog>
            <Dialog open={!!statusInquiry} onClose={() => { if (!statusForm.processing) setStatusInquiry(null); }} className="relative z-[60]">
                <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
                <div className="fixed inset-0 overflow-y-auto p-4"><div className="flex min-h-full items-center justify-center">
                    <DialogPanel className="w-full max-w-2xl rounded border border-slate-200 bg-white p-6 shadow-xl">
                        <DialogTitle className="text-lg font-semibold text-[#16222B]">Update inquiry status</DialogTitle>
                        <p className="mt-1 break-words text-sm text-slate-500">{statusInquiry && fullName(statusInquiry)}</p>
                        <TabGroup selectedIndex={statusTab} onChange={setStatusTab}>
                            <TabList className="mt-5 flex gap-1 border-b border-slate-200" aria-label="Inquiry status and logs">
                                {['Update Status', 'Logs'].map((label) => <Tab key={label} disabled={statusForm.processing} className={({ selected }) => `border-b-2 px-4 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#B8863B] disabled:opacity-60 ${selected ? 'border-[#1F6F5C] text-[#1F6F5C]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{label}</Tab>)}
                            </TabList>
                            {notice && <p role="status" className="mt-4 text-sm text-emerald-700">{notice}</p>}
                            <TabPanels>
                                <TabPanel>
                        <form onSubmit={saveStatus} className="mt-5">
                            <label htmlFor="inquiry-status" className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                            <select id="inquiry-status" value={statusForm.data.status} onChange={(event) => statusForm.setData('status', event.target.value)} disabled={statusForm.processing} aria-describedby="inquiry-status-error" aria-invalid={!!statusForm.errors.status} className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B]">
                                {Object.keys(statusOptions).map((status) => <option key={status} value={status}>{inquiryText(status)}</option>)}
                            </select>
                            <label htmlFor="inquiry-status-remarks" className="mb-2 mt-4 block text-sm font-medium text-slate-700">Remarks <span className="font-normal text-slate-500">(optional)</span></label>
                            <textarea id="inquiry-status-remarks" rows={4} maxLength={5000} value={statusForm.data.remarks} onChange={(event) => statusForm.setData('remarks', event.target.value)} onBlur={() => statusForm.setData('remarks', inquiryText(statusForm.data.remarks))} disabled={statusForm.processing} placeholder="Enter notes about this update…" aria-invalid={!!statusForm.errors.remarks} aria-describedby="inquiry-remarks-error" className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                            <p id="inquiry-remarks-error" role={statusForm.errors.remarks ? 'alert' : undefined} className="mt-2 text-sm text-red-600">{statusForm.errors.remarks}</p>
                            <p id="inquiry-status-error" role={statusForm.errors.status ? 'alert' : undefined} className="mt-2 text-sm text-red-600">{statusForm.errors.status}</p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" disabled={statusForm.processing} onClick={() => setStatusInquiry(null)} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 disabled:opacity-60">Cancel</button>
                                <button type="submit" disabled={statusForm.processing} className="rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12364F] disabled:opacity-60">{statusForm.processing ? 'Saving…' : 'Save status'}</button>
                            </div>
                        </form>
                                </TabPanel>
                                <TabPanel>
                        <section className="mt-5" aria-labelledby="inquiry-history-heading">
                            <h3 id="inquiry-history-heading" className="text-sm font-semibold text-slate-900">Update history</h3>
                            {statusInquiry?.status_logs?.length ? <ol className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">{statusInquiry.status_logs.map((log) => <li key={log.id} className="rounded border border-slate-200 bg-slate-50 p-3">
                                <div className="flex flex-wrap items-center gap-2"><StatusBadge status={log.from_status} /><span className="text-slate-500" aria-label="changed to">→</span><StatusBadge status={log.to_status} /></div>
                                <p className="mt-1 text-xs text-slate-500">{inquiryText(log.updated_by)} · <time dateTime={log.created_at}>{new Date(log.created_at).toLocaleString()}</time></p>
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{inquiryText(log.remarks) || 'No remarks provided.'}</p>
                            </li>)}</ol> : <p className="mt-3 text-sm text-slate-500">No updates recorded yet.</p>}
                        </section>
                        <div className="mt-6 flex justify-end"><button type="button" onClick={() => setStatusInquiry(null)} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Close</button></div>
                                </TabPanel>
                            </TabPanels>
                        </TabGroup>
                    </DialogPanel>
                </div></div>
            </Dialog>
        </AdminTabs>
    );
}
