import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Ship, UserRound, UsersRound } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

function StatCard({ label, value, icon: Icon, tone }) {
    return (
        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded ${tone}`}>
                    <Icon size={22} />
                </div>
            </div>
        </div>
    );
}

function Initials({ name }) {
    const initials = (name || 'NA')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E1EBE6] text-sm font-semibold text-[#1F6F5C]">
            {initials}
        </div>
    );
}

function RecentList({ title, href, items, type }) {
    return (
        <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-[#8A642C] hover:text-[#6F4F22]">
                    View all
                    <ArrowRight size={15} />
                </Link>
            </div>
            <div className="divide-y divide-slate-100">
                {(items ?? []).length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                            {type === 'seafarer' && item.avatar ? (
                                <img src={`/storage/${item.avatar}`} alt={item.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                            ) : (
                                <Initials name={item.name} />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                                <p className="truncate text-sm text-slate-500">{item.email}</p>
                            </div>
                            {type === 'seafarer' && (
                                <p className="hidden text-sm text-slate-500 sm:block">{item.phone || 'No phone'}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="px-5 py-10 text-center text-sm text-slate-500">No records yet.</div>
                )}
            </div>
        </div>
    );
}

export default function Dashboard({ stats = {}, recentUsers = [], recentSeafarers = [] }) {
    const { auth } = usePage().props;
    const isStaff = auth?.user?.role === 'staff';

    return (
        <AdminTabs activeTab="dashboard" title="Dashboard">
            <div className="mx-auto max-w-6xl">
                <div className="mb-5">
                    <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">Dashboard</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        Overview of admin users and seafarer records.
                    </p>
                </div>

                <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isStaff ? '' : 'lg:grid-cols-3'}`}>
                    {!isStaff && (
                        <StatCard label="Total Users" value={stats.users ?? 0} icon={UserRound} tone="bg-blue-50 text-blue-700" />
                    )}
                    <StatCard label="Accepted Seafarers" value={stats.seafarers ?? 0} icon={Ship} tone="bg-[#E1EBE6] text-[#1F6F5C]" />
                    <StatCard label="Accepted Today" value={stats.recentSeafarers ?? 0} icon={UsersRound} tone="bg-[#F5EBDA] text-[#8A642C]" />
                </div>

                <div className={`mt-6 grid grid-cols-1 gap-6 ${isStaff ? '' : 'lg:grid-cols-2'}`}>
                    {!isStaff && (
                        <RecentList title="Recent Users" href={route('admin.users.index')} items={recentUsers} type="user" />
                    )}
                    <RecentList title="Recent Seafarers" href={route('admin.seafarers.index')} items={recentSeafarers} type="seafarer" />
                </div>
            </div>
        </AdminTabs>
    );
}
