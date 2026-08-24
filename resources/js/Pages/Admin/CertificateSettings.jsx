import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

function Pagination({ meta, itemLabel = 'Certification' }) {
    if (!meta || meta.total === 0) {
        return null;
    }
    
    const links = meta.links ?? [];

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{meta.from ?? 0}</span> to{' '}
                <span className="font-medium text-slate-700">{meta.to ?? 0}</span> of{' '}
                <span className="font-medium text-slate-700">{meta.total}</span> {itemLabel.toLowerCase()} names
            </p>

            <div className="flex flex-wrap items-center gap-2">
                {links.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.url || '#'}
                        preserveScroll
                        preserveState
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

export default function CertificateSettings({ activeType, title, description, certificates = {}, filters = {}, routeBase, nameField = 'certification_name', itemLabel = 'Certification' }) {
    const { auth } = usePage().props;
    const activeTab = activeType === 'rank' ? 'ranks' : (activeType === 'offshore' ? 'certificates-offshore' : 'certificates-stcw');
    const isStaff = auth?.user?.role === 'staff';
    const { data, setData, post, processing, errors, reset } = useForm({
        [nameField]: '',
    });
    const rows = certificates?.data || [];
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const submit = (event) => {
        event.preventDefault();
        post(route(`${routeBase}.store`), {
            preserveScroll: true,
            onSuccess: () => {
                reset(nameField);
                setCreateOpen(false);
            },
        });
    };

    const startEdit = (certificate) => {
        setEditing(certificate.id);
        setEditName(certificate[nameField] || '');
    };

    const cancelEdit = () => {
        setEditing(null);
        setEditName('');
    };

    const saveEdit = (certificate) => {
        router.put(route(`${routeBase}.update`, certificate.id), {
            [nameField]: editName,
        }, {
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const remove = (certificate) => {
        if (!confirm(`Delete "${certificate[nameField]}"?`)) {
            return;
        }

        router.delete(route(`${routeBase}.destroy`, certificate.id), {
            preserveScroll: true,
        });
    };

    const handleSearch = (event) => {
        event.preventDefault();

        router.get(
            route(`${routeBase}.index`),
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route(`${routeBase}.index`), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AdminTabs activeTab={activeTab} title={title}>
            <Head title={title} />

            <div className="mx-auto max-w-6xl">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12364F]"
                    >
                        <Plus size={17} />
                        Add {itemLabel}
                    </button>
                </div>

                <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">{title} Listing</h3>
                            <p className="mt-1 text-sm text-slate-500">{description}</p>
                        </div>
                        <form onSubmit={handleSearch} className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                            <div className="relative w-full sm:w-80">
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder={`Search ${itemLabel.toLowerCase()} name`}
                                    className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-10 text-sm text-slate-800 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        aria-label="Clear search"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="rounded bg-[#B8863B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F7332]"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    <div className="overflow-hidden">
                        <table className="w-full table-fixed border-collapse">
                            <colgroup>
                                <col className="w-[58%]" />
                                <col className="w-[22%]" />
                                <col className="w-[20%]" />
                            </colgroup>
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-3 py-3 leading-tight">{itemLabel} Name</th>
                                    <th className="px-3 py-3 leading-tight">Created</th>
                                    <th className="px-3 py-3 text-right leading-tight">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-3 py-12 text-center text-sm text-slate-500">No {itemLabel.toLowerCase()} names added yet.</td>
                                    </tr>
                                ) : rows.map((certificate) => (
                                    <tr key={certificate.id} className="text-sm transition hover:bg-slate-50">
                                        <td className="break-words px-3 py-4 font-medium leading-snug text-slate-900">
                                            {editing === certificate.id ? (
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(event) => setEditName(event.target.value)}
                                                    className="w-full rounded border border-slate-300 p-2 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                                />
                                            ) : (
                                                certificate[nameField]
                                            )}
                                        </td>
                                        <td className="break-words px-3 py-4 leading-snug text-slate-600">{certificate.created_at ? new Date(certificate.created_at).toLocaleDateString() : 'Not set'}</td>
                                        <td className="px-3 py-4">
                                            <div className="flex justify-end gap-2">
                                                {editing === certificate.id ? (
                                                    <>
                                                        <button type="button" onClick={() => saveEdit(certificate)} className="inline-flex h-9 w-9 items-center justify-center rounded border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50" aria-label="Save certificate">
                                                            <Save size={15} />
                                                        </button>
                                                        <button type="button" onClick={cancelEdit} className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label="Cancel edit">
                                                            <X size={15} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button type="button" onClick={() => startEdit(certificate)} className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900" aria-label="Edit certificate">
                                                            <Pencil size={15} />
                                                        </button>
                                                        {!isStaff && (
                                                            <button type="button" onClick={() => remove(certificate)} className="inline-flex h-9 w-9 items-center justify-center rounded border border-red-100 text-red-600 transition hover:bg-red-50" aria-label="Delete certificate">
                                                                <Trash2 size={15} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination meta={certificates} itemLabel={itemLabel} />
                </section>
            </div>

            {createOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 py-6">
                    <div className="w-full max-w-lg rounded border border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A642C]">New record</p>
                                <h3 className="mt-1 text-lg font-semibold text-slate-900">Add {itemLabel} Name</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    reset(nameField);
                                    setCreateOpen(false);
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                aria-label="Close modal"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-5 px-6 py-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">{itemLabel} Name</label>
                                <input
                                    type="text"
                                    value={data[nameField]}
                                    onChange={(event) => setData(nameField, event.target.value)}
                                    className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                    autoFocus
                                />
                                {errors[nameField] && <p className="mt-1 text-sm text-red-600">{errors[nameField]}</p>}
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset(nameField);
                                        setCreateOpen(false);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12364F] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save size={16} />
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminTabs>
    );
}
