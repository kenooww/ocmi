import React, { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { KeyRound, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
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
                <span className="font-medium text-slate-700">{meta.total}</span> users
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

export default function Users({ users, filters = {} }) {
    const { data, setData, post, transform, delete: destroy, reset, errors, clearErrors, processing } = useForm({
        name: '',
        email: '',
        role: 'staff',
        password: '',
        avatar: null,
    });
    const [search, setSearch] = useState(filters.search ?? '');
    const [editId, setEditId] = useState(null);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [passwordModalUser, setPasswordModalUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);

    const clearAvatarPreview = () => {
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }

        setAvatarPreview(null);
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        clearAvatarPreview();
        setEditId(null);
        setUserModalOpen(true);
    };

    const closeUserModal = () => {
        setUserModalOpen(false);
        setEditId(null);
        reset();
        clearErrors();
        clearAvatarPreview();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeUserModal,
        };

        if (editId) {
            transform((formData) => ({ ...formData, _method: 'put' }));
            post(route('admin.users.update', editId), options);
            return;
        }

        transform((formData) => formData);
        post(route('admin.users.store'), options);
    };

    const handleEdit = (user) => {
        clearErrors();
        clearAvatarPreview();
        setEditId(user.id);
        setData({ name: user.name, email: user.email, role: user.role || 'staff', password: '', avatar: null });
        setAvatarPreview(user.avatar ? `/storage/${user.avatar}` : null);
        setUserModalOpen(true);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0] ?? null;

        clearAvatarPreview();
        setData('avatar', file);
        setAvatarPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route('admin.users.index'),
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('admin.users.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handlePasswordReset = (e) => {
        e.preventDefault();
        router.put(route('admin.users.password', passwordModalUser.id), { password: newPassword }, {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordModalUser(null);
                setNewPassword('');
            },
        });
    };

    return (
        <AdminTabs activeTab="users" title="Users">
            <div className="mx-auto max-w-6xl">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">User Management</h2>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12364F]"
                    >
                        <Plus size={17} />
                        Add User
                    </button>
                </div>

                <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Users Listing</h3>
                            <p className="mt-1 text-sm text-slate-500">Search users by name, email, or role.</p>
                        </div>
                        <form onSubmit={handleSearch} className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                            <div className="relative w-full sm:w-80">
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search users"
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
                        <table className="w-full min-w-[680px] border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3">Name</th>
                                    <th className="px-5 py-3">Email</th>
                                    <th className="px-5 py-3">Role</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(users?.data ?? []).length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="text-sm transition hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E1EBE6] text-sm font-semibold text-[#1F6F5C]">
                                                        {user.avatar ? (
                                                            <img src={`/storage/${user.avatar}`} alt={user.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            (user.name || 'U').slice(0, 1).toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-slate-900">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">{user.email}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold uppercase ${
                                                    user.role === 'admin'
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                                                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                                }`}>
                                                    {user.role || 'staff'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(user)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        aria-label={`Edit ${user.name}`}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPasswordModalUser(user)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                                        aria-label={`Reset password for ${user.name}`}
                                                    >
                                                        <KeyRound size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirm('Delete user?') && destroy(route('admin.users.destroy', user.id), { preserveScroll: true })}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        aria-label={`Delete ${user.name}`}
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
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination meta={users} />
                </div>
            </div>

            {userModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">{editId ? 'Edit User' : 'Create User'}</h3>
                            <button type="button" onClick={closeUserModal} className="text-slate-400 hover:text-slate-600" aria-label="Close user form">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E1EBE6] text-lg font-semibold text-[#1F6F5C]">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Photo preview" className="h-full w-full object-cover" />
                                    ) : (
                                        (data.name || 'U').slice(0, 1).toUpperCase()
                                    )}
                                </div>
                                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                    <Upload size={16} />
                                    Upload Photo
                                    <input name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                                </label>
                                {errors.avatar && <div className="text-xs text-red-600">{errors.avatar}</div>}
                            </div>

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
                                <label className="block text-sm font-medium text-slate-700">Role</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && <div className="mt-1 text-xs text-red-600">{errors.role}</div>}
                            </div>
                            {!editId && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Password</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                    />
                                    {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password}</div>}
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={closeUserModal} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12364F] disabled:opacity-60">
                                    {editId ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {passwordModalUser && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">Reset Password</h3>
                            <button type="button" onClick={() => setPasswordModalUser(null)} className="text-slate-400 hover:text-slate-600" aria-label="Close password form">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordReset} className="space-y-4 px-6 py-5">
                            <p className="text-sm text-slate-600">{passwordModalUser.name}</p>
                            <input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setPasswordModalUser(null)} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" className="rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12364F]">
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
