import React, { useEffect, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Eye, FileText, Plus, Printer, Search, Ship, Trash2, Upload, X } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

function Pagination({ meta }) {
    if (!meta || meta.total === 0) {
        return null;
    }

    const links = meta.links ?? [];

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{meta.from ?? 0}</span> to{' '}
                <span className="font-medium text-slate-700">{meta.to ?? 0}</span> of{' '}
                <span className="font-medium text-slate-700">{meta.total}</span> seafarers
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

function initialsFor(name) {
    return (name || 'SF')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

const PRINTOUT_FORMS = [
    {
        key: 'complete',
        title: 'Complete seafarer packet',
        description: 'Personal data, documents, certificates, sea service, and deck officer experience.',
    },
    {
        key: 'personal',
        title: 'Personal data',
        description: 'Profile details, dependents, and travel documents.',
    },
    {
        key: 'certificates',
        title: 'Certificates and references',
        description: 'Competency, proficiency, vaccinations, flag documents, and employer references.',
    },
    {
        key: 'sea_service',
        title: 'Sea service',
        description: 'Sea service table and candidate signature section.',
    },
    {
        key: 'deck_officer',
        title: 'Deck officer experience',
        description: 'Deck officer vessel and operation experience table.',
    },
    {
        key: 'zmi',
        title: 'ZMI application form',
        description: 'ZMI applicant details, certificates, offshore training, references, sea service, and deck experience.',
    },
    {
        key: 'flex_fleet',
        title: 'Flex Fleet application form',
        description: 'Flex Fleet personal particulars, documents, certificate courses, and sea service.',
    },
    {
        key: 'dynamic',
        title: 'Dynamic application form',
        description: 'Dynamic personal particulars, documents, certificate courses, and sea service.',
    },
];

export default function Clients({ clients, filters = {} }) {
    const { data, setData, post, delete: destroy, reset, errors, clearErrors, processing } = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        avatar: null,
        _method: '',
    });
    const [search, setSearch] = useState(filters.search ?? '');
    const [editId, setEditId] = useState(null);
    const [preview, setPreview] = useState(null);
    const [seafarerModalOpen, setSeafarerModalOpen] = useState(false);
    const [printClient, setPrintClient] = useState(null);

    const clearPreview = () => {
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }

        setPreview(null);
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        clearPreview();
        setEditId(null);
        setSeafarerModalOpen(true);
    };

    const closeSeafarerModal = () => {
        setSeafarerModalOpen(false);
        setEditId(null);
        reset();
        clearErrors();
        clearPreview();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeSeafarerModal,
        };

        if (editId) {
            post(route('admin.seafarers.update', editId), options);
            return;
        }

        post(route('admin.seafarers.store'), options);
    };

    const handleEdit = (client) => {
        clearErrors();
        clearPreview();
        setEditId(client.id);
        setData({
            name: client.name,
            email: client.email,
            password: '',
            phone: client.phone || '',
            address: client.address || '',
            avatar: null,
            _method: 'PUT',
        });
        setPreview(client.avatar ? `/storage/${client.avatar}` : null);
        setSeafarerModalOpen(true);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0] ?? null;

        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }

        setData('avatar', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route('admin.seafarers.index'),
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('admin.seafarers.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const closePrintModal = () => {
        setPrintClient(null);
    };

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    return (
        <AdminTabs activeTab="clients" title="Seafarers">
            <div className="mx-auto max-w-6xl">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Seafarer Records</h2>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12364F]"
                    >
                        <Plus size={17} />
                        Add Seafarer
                    </button>
                </div>

                <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Seafarer Listing</h3>
                            <p className="mt-1 text-sm text-slate-500">Search seafarers by name, email, phone, or address.</p>
                        </div>
                        <form onSubmit={handleSearch} className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                            <div className="relative w-full sm:w-80">
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search seafarers"
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

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3">Seafarer</th>
                                    <th className="px-5 py-3">Contact</th>
                                    <th className="px-5 py-3">Address</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(clients?.data ?? []).length > 0 ? (
                                    clients.data.map((client) => (
                                        <tr key={client.id} className="text-sm transition hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {client.avatar ? (
                                                        <img
                                                            src={`/storage/${client.avatar}`}
                                                            alt={client.name}
                                                            className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#E1EBE6]"
                                                        />
                                                    ) : (
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E1EBE6] text-sm font-semibold text-[#1F6F5C]">
                                                            {initialsFor(client.name)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-slate-900">{client.first_name} {client.middle_name} {client.last_name}</div>
                                                        <div className="mt-0.5 inline-flex items-center gap-1 rounded bg-[#F5EBDA] px-2 py-0.5 text-xs font-medium text-[#8A642C]">
                                                            <Ship size={12} />
                                                            Seafarer
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-slate-700">{client.email}</div>
                                                <div className="mt-1 text-slate-500">{client.phone || 'No phone'}</div>
                                            </td>
                                            <td className="max-w-xs px-5 py-4 text-slate-600">
                                                <span className="line-clamp-2">{client.address || 'No address'}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('admin.seafarers.show', client.id)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                                        aria-label={`View ${client.name}`}
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPrintClient(client)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        aria-label={`Print forms for ${client.name}`}
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirm('Delete seafarer record?') && destroy(route('admin.seafarers.destroy', client.id), { preserveScroll: true })}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        aria-label={`Delete ${client.name}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-12 text-center text-sm text-slate-500">
                                            No seafarers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination meta={clients} />
                </div>
            </div>

            {seafarerModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">{editId ? 'Edit Seafarer' : 'Create Seafarer'}</h3>
                            <button type="button" onClick={closeSeafarerModal} className="text-slate-400 hover:text-slate-600" aria-label="Close seafarer form">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5 px-6 py-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E1EBE6] text-lg font-semibold text-[#1F6F5C]">
                                    {preview ? (
                                        <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
                                    ) : (
                                        initialsFor(data.name)
                                    )}
                                </div>
                                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                    <Upload size={16} />
                                    Upload Avatar
                                    <input name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                                </label>
                                {errors.avatar && <div className="text-xs text-red-600">{errors.avatar}</div>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                    />
                                    {errors.name && <div className="mt-1 text-xs text-red-600">{errors.name}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                    />
                                    {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Password {editId && '(leave blank to keep)'}</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                    />
                                    {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Phone</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                    />
                                    {errors.phone && <div className="mt-1 text-xs text-red-600">{errors.phone}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Address</label>
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows="3"
                                    className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                />
                                {errors.address && <div className="mt-1 text-xs text-red-600">{errors.address}</div>}
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
                                <button type="button" onClick={closeSeafarerModal} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12364F] disabled:opacity-60">
                                    {editId ? 'Update Seafarer' : 'Create Seafarer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {printClient && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-xl rounded bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Print Forms</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {printClient.first_name || printClient.name} {printClient.last_name || ''}
                                </p>
                            </div>
                            <button type="button" onClick={closePrintModal} className="text-slate-400 hover:text-slate-600" aria-label="Close print forms">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 px-6 py-5">
                            {PRINTOUT_FORMS.map((form) => (
                                <Link
                                    key={form.key}
                                    href={route('admin.seafarers.print-preview', printClient.id) + `?form=${form.key}`}
                                    className="flex items-start gap-3 rounded border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#E1EBE6] text-[#1F6F5C]">
                                        <FileText size={18} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-slate-900">{form.title}</span>
                                        <span className="mt-1 block text-sm leading-5 text-slate-500">{form.description}</span>
                                    </span>
                                    <Printer className="mt-1 shrink-0 text-slate-400" size={17} />
                                </Link>
                            ))}
                        </div>

                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                            <button type="button" onClick={closePrintModal} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminTabs>
    );
}
