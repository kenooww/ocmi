import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Camera, LockKeyhole, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

function initialsFor(name) {
    return (name || 'A').trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
}

export default function Preferences({ adminUser }) {
    const { data, setData, post, transform, errors, processing, recentlySuccessful, reset } = useForm({
        name: adminUser?.name || '',
        email: adminUser?.email || '',
        avatar: null,
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [avatarPreview, setAvatarPreview] = useState(adminUser?.avatar ? `/storage/${adminUser.avatar}` : null);

    const handleAvatarChange = (event) => {
        const file = event.target.files[0] ?? null;
        setData('avatar', file);
        setAvatarPreview(file ? URL.createObjectURL(file) : (adminUser?.avatar ? `/storage/${adminUser.avatar}` : null));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        transform((formData) => ({ ...formData, _method: 'put' }));
        post('/admin/preferences', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset('avatar', 'current_password', 'password', 'password_confirmation'),
        });
    };

    return (
        <AdminTabs activeTab="preferences" title="User Preferences">
            <Head title="User Preferences" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin console</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-900">User Preferences</h2>
                        <p className="mt-2 max-w-2xl text-sm text-slate-500">Manage your admin profile photo, account details, and password.</p>
                    </div>
                    <div className="rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                        Email <span className="font-semibold text-slate-900">{adminUser?.email || 'No email'}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.25fr]">
                        <section className="rounded border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-5">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                    <UserRound size={19} className="text-[#1F6F5C]" />
                                    Profile Photo
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">This appears in the admin header.</p>
                            </div>

                            <div className="flex flex-col items-center px-6 py-8 text-center">
                                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#E1EBE6] text-3xl font-semibold text-[#1F6F5C] ring-4 ring-white shadow">
                                    {avatarPreview ? <img src={avatarPreview} alt={data.name || 'Admin'} className="h-full w-full object-cover" /> : initialsFor(data.name)}
                                </div>
                                <label className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                    <Camera size={16} />
                                    Upload photo
                                    <input name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                                </label>
                                {errors.avatar && <p className="mt-2 text-sm text-red-600">{errors.avatar}</p>}
                            </div>
                        </section>

                        <section className="rounded border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-5">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                    <ShieldCheck size={19} className="text-[#1F6F5C]" />
                                    Account Information
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">Update your admin identity and login credentials.</p>
                            </div>

                            <div className="space-y-5 px-6 py-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Name</label>
                                    <div className="relative mt-1">
                                        <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input type="text" value={data.name} onChange={(event) => setData('name', event.target.value)} className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                                    </div>
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email</label>
                                    <div className="relative mt-1">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                                    </div>
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                <div className="border-t border-slate-200 pt-5">
                                    <div className="mb-4 flex items-center gap-2">
                                        <LockKeyhole size={18} className="text-[#8A642C]" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900">Change Password</h4>
                                            <p className="text-xs text-slate-500">Leave password fields blank to keep your current password.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Current password</label>
                                            <input type="password" value={data.current_password} onChange={(event) => setData('current_password', event.target.value)} className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" autoComplete="current-password" />
                                            {errors.current_password && <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">New password</label>
                                            <input type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" autoComplete="new-password" />
                                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Confirm password</label>
                                            <input type="password" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" autoComplete="new-password" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        {recentlySuccessful ? <p className="text-sm font-medium text-emerald-700">User preferences updated successfully.</p> : <p className="text-sm text-slate-500">Changes apply to your admin account only.</p>}
                        <button type="submit" disabled={processing} className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12364F] disabled:cursor-not-allowed disabled:opacity-60">
                            <Save size={16} />
                            Save preferences
                        </button>
                    </div>
                </form>
            </div>
        </AdminTabs>
    );
}
