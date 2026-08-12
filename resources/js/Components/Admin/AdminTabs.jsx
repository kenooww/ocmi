import { Link, router } from '@inertiajs/react';

export default function AdminTabs({ activeTab }) {
    const tabs = [
        { key: 'users', label: 'Users Management', href: route('admin.users.index') },
        { key: 'clients', label: 'Applicant Information', href: route('admin.clients.index') },
    ];

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="flex items-center justify-between border-b pb-3 mb-6">
            <div className="flex space-x-6">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            className={isActive
                                ? 'font-bold text-blue-600 border-b-2 border-blue-600 pb-3'
                                : 'text-gray-500 hover:text-blue-600'}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
            >
                Logout
            </button>
        </div>
    );
}
