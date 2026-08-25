import React, { useEffect, useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ClipboardCheck, Eye, FileText, Plus, Printer, Search, Ship, Trash2, Upload, X } from 'lucide-react';
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

function fullNameFor(client) {
    return [client?.first_name, client?.middle_name, client?.last_name].filter(Boolean).join(' ') || client?.name || 'Seafarer';
}

const PRINTOUT_FORMS = [
    {
        key: 'complete',
        title: 'Alpha Omega Application Form',
        description: 'Personal data, documents, certificates, sea service, and deck officer experience.',
    },
    // {
    //     key: 'personal',
    //     title: 'Personal data',
    //     description: 'Profile details, dependents, and travel documents.',
    // },
    // {
    //     key: 'certificates',
    //     title: 'Certificates and references',
    //     description: 'Competency, proficiency, vaccinations, flag documents, and employer references.',
    // },
    // {
    //     key: 'sea_service',
    //     title: 'Sea service',
    //     description: 'Sea service table and candidate signature section.',
    // },
    // {
    //     key: 'deck_officer',
    //     title: 'Deck officer experience',
    //     description: 'Deck officer vessel and operation experience table.',
    // },
    {
        key: 'zmi',
        title: 'ZMI Application Form',
        description: 'ZMI applicant details, certificates, offshore training, references, sea service, and deck experience.',
    },
    {
        key: 'flex_fleet',
        title: 'Flex Fleet Application Form',
        description: 'Flex Fleet personal particulars, documents, certificate courses, and sea service.',
    },
    {
        key: 'dynamic',
        title: 'Dynamic Application Form',
        description: 'Dynamic personal particulars, documents, certificate courses, and sea service.',
    },
];

const APPLICATION_STATUS_OPTIONS = [
    'PENDING/ONHOLD',
    'TO REPORT',
    'FOR REEVAL/FOR APPROVAL',
    'FAILED',
    'PROPOSED',
    'APPROVED',
    'DOCUMENT PROCESSING',
    'DISAPPROVED',
];

function applicationStatusClass(status) {
    const normalized = String(status || '').toUpperCase();

    if (normalized === 'FAILED') {
        return 'bg-red-100 text-red-700 ring-1 ring-red-200';
    }

    if (normalized === 'DISAPPROVED') {
        return 'bg-rose-100 text-rose-700 ring-1 ring-rose-200';
    }

    if (normalized === 'TO REPORT') {
        return 'bg-lime-100 text-lime-700 ring-1 ring-lime-200';
    }

    if (normalized === 'APPROVED') {
        return 'bg-green-100 text-green-700 ring-1 ring-green-200';
    }

    if (normalized === 'FOR REEVAL/FOR APPROVAL') {
        return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
    }

    if (normalized === 'DOCUMENT PROCESSING') {
        return 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200';
    }

    if (normalized === 'PROPOSED') {
        return 'bg-purple-100 text-purple-700 ring-1 ring-purple-200';
    }

    if (normalized === 'NEW APPLICANT') {
        return 'bg-teal-100 text-teal-700 ring-1 ring-teal-200';
    }

    if (normalized === 'PENDING/ONHOLD') {
        return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
    }

    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

function applicationStatusUpdateValue(status) {
    return APPLICATION_STATUS_OPTIONS.includes(status) ? status : 'PENDING/ONHOLD';
}

export default function Clients({ clients, filters = {} }) {
    const { auth } = usePage().props;
    const adminName = auth?.user?.name || auth?.user?.email || 'Current admin';
    const canDeleteSeafarers = auth?.user?.role !== 'staff';
    const { data, setData, post, delete: destroy, reset, errors, clearErrors, processing } = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        avatar: null,
        resume_attachment: null,
        _method: '',
    });
    const {
        data: applicationData,
        setData: setApplicationData,
        put: putApplicationStatus,
        reset: resetApplicationData,
        errors: applicationErrors,
        clearErrors: clearApplicationErrors,
        processing: applicationProcessing,
    } = useForm({
        application_status: 'PENDING/ONHOLD',
        remarks: '',
    });
    const [search, setSearch] = useState(filters.search ?? '');
    const [editId, setEditId] = useState(null);
    const [preview, setPreview] = useState(null);
    const [resumePath, setResumePath] = useState(null);
    const [seafarerModalOpen, setSeafarerModalOpen] = useState(false);
    const [printClient, setPrintClient] = useState(null);
    const [applicationClient, setApplicationClient] = useState(null);
    const [applicationTab, setApplicationTab] = useState('update');

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
        setResumePath(null);
        setSeafarerModalOpen(true);
    };

    const closeSeafarerModal = () => {
        setSeafarerModalOpen(false);
        setEditId(null);
        reset();
        clearErrors();
        clearPreview();
        setResumePath(null);
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
            resume_attachment: null,
            _method: 'PUT',
        });
        setPreview(client.avatar ? `/storage/${client.avatar}` : null);
        setResumePath(client.resume_attachment || null);
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

    const handleResumeChange = (e) => {
        setData('resume_attachment', e.target.files[0] ?? null);
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

    const openApplicationModal = (client) => {
        clearApplicationErrors();
        setApplicationClient(client);
        setApplicationTab('update');
        setApplicationData({
            application_status: applicationStatusUpdateValue(client.application_status),
            remarks: '',
        });
    };

    const closeApplicationModal = () => {
        setApplicationClient(null);
        setApplicationTab('update');
        resetApplicationData();
        clearApplicationErrors();
    };

    const submitApplicationStatus = (e) => {
        e.preventDefault();

        if (!applicationClient) {
            return;
        }

        putApplicationStatus(route('admin.seafarers.application-status.update', applicationClient.id), {
            preserveScroll: true,
            onSuccess: closeApplicationModal,
        });
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
            <style>{`
                .print-form-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #94a3b8 #f1f5f9;
                }

                .print-form-scroll::-webkit-scrollbar {
                    width: 10px;
                }

                .print-form-scroll::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 999px;
                }

                .print-form-scroll::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #94a3b8, #64748b);
                    border: 2px solid #f1f5f9;
                    border-radius: 999px;
                }

                .print-form-scroll::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #64748b, #475569);
                }
            `}</style>
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
                            <p className="mt-1 text-sm text-slate-500">Search by rank, applied position, job type, WhatsApp, processed by, or status.</p>
                        </div>
                        <form onSubmit={handleSearch} className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                            <div className="relative w-full sm:w-80">
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search visible columns"
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
                                <col className="w-[19%]" />
                                <col className="w-[13%]" />
                                <col className="w-[12%]" />
                                <col className="w-[11%]" />
                                <col className="w-[9%]" />
                                <col className="w-[11%]" />
                                <col className="w-[13%]" />
                                <col className="w-[12%]" />
                            </colgroup>
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-2 py-3 leading-tight">Rank</th>
                                    <th className="px-2 py-3 leading-tight">Applied Position</th>
                                    <th className="px-2 py-3 leading-tight">Type of Job</th>
                                    <th className="px-2 py-3 leading-tight">WhatsApp</th>
                                    <th className="px-2 py-3 leading-tight">Nationality</th>
                                    <th className="px-2 py-3 leading-tight">Processed By</th>
                                    <th className="px-2 py-3 leading-tight">Application Status</th>
                                    <th className="px-2 py-3 text-right leading-tight">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(clients?.data ?? []).length > 0 ? (
                                    clients.data.map((client) => (
                                        <tr key={client.id} className="text-sm transition hover:bg-slate-50">
                                            <td className="px-2 py-4">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    {client.avatar ? (
                                                        <img
                                                            src={`/storage/${client.avatar}`}
                                                            alt={client.name}
                                                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#E1EBE6]"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E1EBE6] text-sm font-semibold text-[#1F6F5C]">
                                                            {initialsFor(client.name)}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="break-words font-medium leading-snug text-slate-900">{client.first_name} {client.middle_name} {client.last_name}</div>
                                                        <div className="mt-1 inline-flex max-w-full items-center gap-1 rounded bg-[#F5EBDA] px-2 py-0.5 text-[11px] font-medium leading-tight text-[#8A642C]">
                                                            <Ship size={12} className="shrink-0" />
                                                            <span className="break-words">{client.current_position || 'Not set'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="break-words px-2 py-4 leading-snug text-slate-600">
                                                {client.position_applied_for || 'Not set'}
                                            </td>
                                            <td className="break-words px-2 py-4 leading-snug text-slate-600">
                                                {client.type_of_job || 'Not set'}
                                            </td>
                                            <td className="break-words px-2 py-4 leading-snug text-slate-600">
                                                {client.whatsapp_number || 'Not set'}
                                            </td>
                                            <td className="break-words px-2 py-4 leading-snug text-slate-600">
                                                {client.nationality || 'Not set'}
                                            </td>
                                            <td className="break-words px-2 py-4 leading-snug text-slate-600">
                                                {client.processed_by || 'Not set'}
                                            </td>
                                            <td className="px-2 py-4">
                                                <span className={`inline-flex max-w-full rounded px-2 py-1 text-center text-[11px] font-medium leading-tight ${applicationStatusClass(client.application_status)}`}>
                                                    <span className="break-words whitespace-normal">{client.application_status || 'Not set'}</span>
                                                </span>
                                            </td>
                                            <td className="px-2 py-4">
                                                <div className="flex flex-nowrap justify-end gap-1">
                                                    <Link
                                                        href={route('admin.seafarers.show', client.id)}
                                                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-100 hover:shadow"
                                                        aria-label={`View ${client.name}`}
                                                    >
                                                        <Eye size={13} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPrintClient(client)}
                                                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-sky-100 bg-sky-50 text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-100 hover:shadow"
                                                        aria-label={`Print forms for ${client.name}`}
                                                    >
                                                        <Printer size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openApplicationModal(client)}
                                                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-amber-100 bg-amber-50 text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-100 hover:shadow"
                                                        aria-label={`Update application status for ${client.name}`}
                                                    >
                                                        <ClipboardCheck size={13} />
                                                    </button>
                                                    {canDeleteSeafarers && (
                                                        <button
                                                            type="button"
                                                            onClick={() => confirm('Delete seafarer record?') && destroy(route('admin.seafarers.destroy', client.id), { preserveScroll: true })}
                                                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-100 hover:shadow"
                                                            aria-label={`Delete ${client.name}`}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-5 py-12 text-center text-sm text-slate-500">
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
                                    Upload Photo
                                    <input name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                                </label>
                                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                    <FileText size={16} />
                                    {editId ? 'Upload Resume' : 'Upload Resume *'}
                                    <input name="resume_attachment" type="file" accept=".pdf,.doc,.docx,image/*" required={!editId} onChange={handleResumeChange} className="sr-only" />
                                </label>
                                {errors.avatar && <div className="text-xs text-red-600">{errors.avatar}</div>}
                                {errors.resume_attachment && <div className="text-xs text-red-600">{errors.resume_attachment}</div>}
                            </div>
                            {resumePath && (
                                <a
                                    href={route('admin.seafarers.resume.view', editId)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-[#1F6F5C] hover:text-[#155444]"
                                >
                                    <FileText size={16} />
                                    View current resume
                                </a>
                            )}

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

            {applicationClient && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Update Application</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {fullNameFor(applicationClient)}
                                </p>
                            </div>
                            <button type="button" onClick={closeApplicationModal} className="text-slate-400 hover:text-slate-600" aria-label="Close update application">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="border-b border-slate-200 px-6 pt-4">
                            <div className="flex gap-2">
                                {[
                                    ['update', 'Update'],
                                    ['logs', 'Approval Logs'],
                                ].map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setApplicationTab(key)}
                                        className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
                                            applicationTab === key
                                                ? 'border-[#1F6F5C] text-[#1F6F5C]'
                                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {applicationTab === 'update' ? (
                            <form onSubmit={submitApplicationStatus} className="space-y-5 overflow-y-auto px-6 py-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Application Status</label>
                                    <select
                                        value={applicationData.application_status}
                                        onChange={(e) => setApplicationData('application_status', e.target.value)}
                                        className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm text-slate-900 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                    >
                                        {APPLICATION_STATUS_OPTIONS.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    {applicationErrors.application_status && <div className="mt-1 text-xs text-red-600">{applicationErrors.application_status}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Processed By</label>
                                    <input
                                        type="text"
                                        value={adminName}
                                        readOnly
                                        className="mt-1 w-full rounded border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Additional Information</label>
                                    <textarea
                                        value={applicationData.remarks}
                                        onChange={(e) => setApplicationData('remarks', e.target.value)}
                                        rows="4"
                                        className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm text-slate-900 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                    />
                                    {applicationErrors.remarks && <div className="mt-1 text-xs text-red-600">{applicationErrors.remarks}</div>}
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
                                    <button type="button" onClick={closeApplicationModal} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={applicationProcessing} className="rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12364F] disabled:opacity-60">
                                        Save
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="print-form-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
                                {(applicationClient.application_status_logs || []).length > 0 ? (
                                    applicationClient.application_status_logs.map((log) => (
                                        <div key={log.id} className="rounded border border-slate-200 p-4">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${applicationStatusClass(log.status)}`}>
                                                        {log.status || 'No status'}
                                                    </span>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Previous: {log.previous_status || 'None'}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-slate-500">{log.created_at || 'No date'}</span>
                                            </div>
                                            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Processed By</p>
                                                    <p className="mt-1 text-slate-700">{log.processed_by || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Additional Information</p>
                                                    <p className="mt-1 whitespace-pre-line text-slate-700">{log.remarks || 'None'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                                        No approval logs yet.
                                    </div>
                                )}
                                <div className="flex justify-end border-t border-slate-200 pt-5">
                                    <button type="button" onClick={closeApplicationModal} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {printClient && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded bg-white shadow-xl">
                        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
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

                        <div className="print-form-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
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

                        <div className="shrink-0 flex justify-end border-t border-slate-200 px-6 py-4">
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
