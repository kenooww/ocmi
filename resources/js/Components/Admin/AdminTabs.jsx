import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Anchor, Award, Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, Ship, UserRound, X } from 'lucide-react';

const PALETTE = {
    navyDeep: '#0A2436',
    paper: '#EEF2F0',
    card: '#FFFFFF',
    line: '#DCE3DF',
    brass: '#B8863B',
    brassBg: '#F5EBDA',
    ink: '#16222B',
    sub: '#5B6B70',
};

function initialsFor(name) {
    return (name || 'A')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();
}

export default function AdminTabs({ activeTab, title, children }) {
    const { auth, companySettings } = usePage().props;
    const user = auth?.user;
    const isStaff = user?.role === 'staff';
    const company = companySettings || {};
    const [profileOpen, setProfileOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({
        certificates: activeTab === 'certificates' || activeTab.startsWith('certificates-'),
    });

    const tabs = [
        { key: 'dashboard', label: 'Dashboard', href: route('admin.dashboard.index'), icon: LayoutDashboard },
        { key: 'users', label: 'Users', href: route('admin.users.index'), icon: UserRound, adminOnly: true },
        { key: 'clients', label: 'Seafarers', href: route('admin.seafarers.index'), icon: Ship },
        {
            key: 'certificates',
            label: 'Certificates',
            href: route('admin.certificates.stcw.index'),
            icon: Award,
            children: [
                { key: 'certificates-stcw', label: 'STCW Certificate', href: route('admin.certificates.stcw.index') },
                { key: 'certificates-offshore', label: 'Offshore Training', href: route('admin.certificates.offshore-training.index') },
            ],
        },
        { key: 'company-settings', label: 'Company Settings', href: route('admin.company-settings.edit'), icon: Settings, adminOnly: true },
    ].filter((tab) => !tab.adminOnly || !isStaff);

    const avatarUrl = user?.avatar ? `/storage/${user.avatar}` : null;
    const logoUrl = company.logo ? `/storage/${company.logo}` : null;
    const userEmail = user?.email;

    const handleLogout = () => {
        setProfileOpen(false);
        router.post('/admin/logout');
    };

    const toggleMenu = (key) => {
        setOpenMenus((menus) => ({ ...menus, [key]: !menus[key] }));
    };

    return (
        <div className="w-full min-h-screen flex items-start print:block" style={{ backgroundColor: PALETTE.paper, fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
            `}</style>

            <input id="admin-menu-toggle" type="checkbox" className="peer hidden" />
            <label
                htmlFor="admin-menu-toggle"
                className="fixed inset-0 bg-black/40 z-20 hidden peer-checked:block lg:peer-checked:hidden"
                aria-label="Close admin menu"
            />

            <aside
                className="fixed lg:sticky z-50 top-0 left-0 h-screen w-64 shrink-0 flex flex-col -translate-x-full peer-checked:translate-x-0 lg:translate-x-0 transition-transform duration-200 print:hidden"
                style={{ backgroundColor: PALETTE.navyDeep }}
            >
                <div className="flex items-center gap-2 px-6 py-6">
                    {logoUrl ? (
                        <img src={logoUrl} alt={company.company_name || company.portal_name || 'Company'} className="h-8 w-8 rounded bg-white object-contain p-1" />
                    ) : (
                        <Anchor size={22} color={PALETTE.brass} />
                    )}
                    <div>
                        <p
                            className="text-lg leading-tight"
                            style={{ fontFamily: "'Fraunces', serif", color: '#F4F1E8', fontWeight: 600 }}
                        >
                            {company.portal_name || 'Anchor Point'}
                        </p>
                        <p className="text-xs" style={{ color: '#9DB0B8' }}>
                            Admin console
                        </p>
                    </div>
                    <label htmlFor="admin-menu-toggle" className="ml-auto lg:hidden cursor-pointer" aria-label="Close menu">
                        <X size={20} color="#EEF2F0" />
                    </label>
                </div>

                <nav className="flex-1 px-3 mt-2 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key || tab.children?.some((child) => child.key === activeTab);
                        const menuOpen = tab.children ? (openMenus[tab.key] ?? isActive) : false;

                        return (
                            <div key={tab.key}>
                                {tab.children ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleMenu(tab.key)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition"
                                        style={{
                                            backgroundColor: isActive ? 'rgba(184,134,59,0.16)' : 'transparent',
                                            color: isActive ? '#F5EBDA' : '#B7C4C9',
                                        }}
                                        aria-expanded={menuOpen}
                                    >
                                        <Icon size={17} color={isActive ? PALETTE.brass : '#7F929A'} />
                                        <span className="flex-1 text-left">{tab.label}</span>
                                        <ChevronDown size={14} color={isActive ? PALETTE.brass : '#7F929A'} className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                ) : (
                                    <Link
                                        href={tab.href}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition"
                                        style={{
                                            backgroundColor: isActive ? 'rgba(184,134,59,0.16)' : 'transparent',
                                            color: isActive ? '#F5EBDA' : '#B7C4C9',
                                        }}
                                    >
                                        <Icon size={17} color={isActive ? PALETTE.brass : '#7F929A'} />
                                        <span className="flex-1">{tab.label}</span>
                                    </Link>
                                )}
                                {tab.children && (
                                    <div className={`ml-8 overflow-hidden border-l border-white/10 pl-3 transition-all duration-200 ease-out ${menuOpen ? 'mt-1 max-h-28 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {tab.children.map((child) => {
                                            const childActive = activeTab === child.key;

                                            return (
                                                <Link
                                                    key={child.key}
                                                    href={child.href}
                                                    className="block rounded px-3 py-2 text-sm"
                                                    style={{
                                                        backgroundColor: childActive ? 'rgba(31,111,92,0.28)' : 'transparent',
                                                        color: childActive ? '#F4F1E8' : '#9DB0B8',
                                                    }}
                                                >
                                                    {child.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
                <div className="px-6 py-5 text-xs" style={{ color: '#6C818A', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {company.company_name || 'Manage users, seafarer records, documents, and print previews from the admin console.'}
                </div>
            </aside>

            <div className="flex-1 min-w-0 flex flex-col print:block">
                <header
                    className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10 print:hidden"
                    style={{ backgroundColor: PALETTE.card, borderBottom: `1px solid ${PALETTE.line}` }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <label htmlFor="admin-menu-toggle" className="lg:hidden shrink-0 cursor-pointer" aria-label="Open menu">
                            <Menu size={22} color={PALETTE.ink} />
                        </label>
                        <h1
                            className="text-lg sm:text-xl truncate"
                            style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}
                        >
                            {title}
                        </h1>
                    </div>

                    <div className="relative flex shrink-0 items-center gap-3">
                        <button
                            type="button"
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                            <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setProfileOpen((open) => !open)}
                            className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-[#E1EBE6] text-sm font-semibold text-[#1F6F5C] shadow-sm transition hover:border-[#B8863B]"
                            aria-label="Open profile menu"
                            aria-expanded={profileOpen}
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user?.name || 'Admin'} className="h-full w-full object-cover" />
                            ) : (
                                initialsFor(user?.name)
                            )}
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-12 z-50 w-72 rounded border border-slate-200 bg-white shadow-xl">
                                <span className="absolute -top-2 right-5 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white" />
                                <div className="relative px-5 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E1EBE6] text-lg font-semibold text-[#1F6F5C]">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt={user?.name || 'Admin'} className="h-full w-full object-cover" />
                                            ) : (
                                                initialsFor(user?.name)
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-blue-600">{user?.name || 'Admin User'}</p>
                                            <p className="mt-1 truncate text-xs text-slate-500">{userEmail || 'Admin console'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-1">
                                        <Link
                                            href="/admin/preferences"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                        >
                                            <Settings size={16} className="text-slate-500" />
                                            Preferences
                                        </Link>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 px-5 py-3">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm text-slate-700 transition hover:bg-red-50 hover:text-red-700"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="p-4 sm:p-6 print:p-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
