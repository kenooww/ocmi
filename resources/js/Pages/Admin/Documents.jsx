import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, FileText, FolderOpen, Search } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

function Pagination({ clients }) {
    if (clients.last_page <= 1) return null;

    return <nav aria-label="Seafarer document folders" className="flex flex-wrap gap-2">{clients.links.map((link, index) => <Link key={index} href={link.url || '#'} aria-disabled={!link.url} dangerouslySetInnerHTML={{ __html: link.label }} className={`min-w-9 rounded border px-3 py-2 text-center text-sm ${link.active ? 'border-[#B8863B] bg-[#F5EBDA] font-semibold text-[#8A642C]' : link.url ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50' : 'pointer-events-none border-slate-100 bg-slate-50 text-slate-300'}`} />)}</nav>;
}

export default function Documents({ clients, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [openClient, setOpenClient] = useState(null);

    const submit = (event) => {
        event.preventDefault();
        router.get(route('admin.documents.index'), search.trim() ? { search: search.trim() } : {}, { preserveState: true, replace: true });
    };

    return <AdminTabs activeTab="documents" title="Seafarer Documents">
        <Head title="Seafarer Documents" />
        <div className="mx-auto max-w-7xl space-y-5 p-3 sm:p-4">
            <header><p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">File library</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Seafarer Documents</h2><p className="mt-2 text-sm text-slate-500">Browse uploaded files organized by seafarer and document category.</p></header>
            <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
                <div className="min-w-0 flex-1"><label htmlFor="document-search" className="mb-1 block text-xs font-medium text-slate-600">Find a seafarer</label><input id="document-search" value={search} onChange={(event) => setSearch(event.target.value)} maxLength={255} placeholder="Name or email" className="w-full rounded border-slate-300 text-sm focus:border-[#B8863B] focus:ring-[#B8863B]" /></div>
                <button type="submit" className="inline-flex items-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12364F]"><Search size={16} />Search</button>
            </form>
            <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h3 className="text-sm font-semibold text-slate-800">Seafarer folders</h3><span className="text-xs text-slate-500">{clients.total} folders</span></div>
                <div className="divide-y divide-slate-100">
                    {clients.data.length ? clients.data.map((client) => {
                        const expanded = openClient === client.id;
                        const categories = client.documents.reduce((grouped, document) => {
                            (grouped[document.category] ||= []).push(document);
                            return grouped;
                        }, {});

                        return <article key={client.id}>
                            <button type="button" aria-expanded={expanded} onClick={() => setOpenClient(expanded ? null : client.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50">
                                <FolderOpen size={20} className="shrink-0 text-[#B8863B]" />
                                <span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold text-slate-900">{client.name}</span><span className="mt-0.5 block break-words text-xs text-slate-500">{client.rank || 'Rank not set'}{client.email ? ` · ${client.email}` : ''}</span></span>
                                <span className="shrink-0 text-xs text-slate-500">{client.documents.length} {client.documents.length === 1 ? 'file' : 'files'}</span>
                            </button>
                            {expanded && <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 pl-12">
                                {Object.keys(categories).length ? <div className="space-y-5">{Object.entries(categories).map(([category, documentsInCategory]) => <section key={category}>
                                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{category}</h4>
                                    <ul className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">{documentsInCategory.map((document) => <li key={`${document.folder}-${document.id}`} className="flex flex-wrap items-center gap-3 px-3 py-3">
                                        <FileText size={17} className="shrink-0 text-slate-400" />
                                        <span className="min-w-0 flex-1"><span className="block break-all text-sm font-medium text-slate-800">{document.name}</span>{document.record_label && document.record_label !== category && <span className="mt-0.5 block text-xs text-slate-500">{document.record_label}</span>}</span>
                                        {document.view_url && <a href={document.view_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Eye size={14} />View</a>}
                                        <a href={document.download_url} className="inline-flex items-center gap-1.5 rounded bg-[#0A2436] px-3 py-2 text-xs font-semibold text-white hover:bg-[#12364F]"><Download size={14} />Download</a>
                                    </li>)}</ul>
                                </section>)}</div> : <p className="text-sm text-slate-500">No uploaded documents for this seafarer.</p>}
                            </div>}
                        </article>;
                    }) : <p className="px-5 py-14 text-center text-sm text-slate-500">{filters.search ? 'No seafarers match your search.' : 'No seafarers found.'}</p>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500"><span>Showing {clients.from || 0}–{clients.to || 0} of {clients.total}</span><Pagination clients={clients} /></div>
            </section>
        </div>
    </AdminTabs>;
}