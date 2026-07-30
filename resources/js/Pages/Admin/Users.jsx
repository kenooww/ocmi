import React, { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AdminTabs from '@/Components/Admin/AdminTabs';

export default function Users({ users }) {
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name: '', email: '', password: ''
    });
    const [editId, setEditId] = useState(null);
    const [passwordModalUser, setPasswordModalUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            put(route('admin.users.update', editId), { onSuccess: () => { reset(); setEditId(null); } });
        } else {
            post(route('admin.users.store'), { onSuccess: () => reset() });
        }
    };

    const handleEdit = (user) => {
        setEditId(user.id);
        setData({ name: user.name, email: user.email, password: '' });
    };

    const handlePasswordReset = (e) => {
        e.preventDefault();
        router.put(route('admin.users.password', passwordModalUser.id), { password: newPassword }, {
            onSuccess: () => { setPasswordModalUser(null); setNewPassword(''); }
        });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <AdminTabs activeTab="users" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="bg-white p-6 rounded shadow border">
                    <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit User' : 'Add New User'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="block text-sm font-medium">Name</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2 mt-1" />
                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border rounded p-2 mt-1" />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>
                        {!editId && (
                            <div className="mb-3">
                                <label className="block text-sm font-medium">Password</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border rounded p-2 mt-1" />
                                {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                            </div>
                        )}
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">{editId ? 'Update User' : 'Save User'}</button>
                        {editId && <button type="button" onClick={() => { setEditId(null); reset(); }} className="w-full bg-gray-300 text-black p-2 rounded mt-2">Cancel</button>}
                    </form>
                </div>

                {/* Listing Section */}
                <div className="md:col-span-2 bg-white p-6 rounded shadow border">
                    <h2 className="text-lg font-semibold mb-4">Paginated Users Listing</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm">
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map(user => (
                                <tr key={user.id} className="border-b text-sm">
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => setPasswordModalUser(user)} className="text-amber-600 hover:underline">Reset Pass</button>
                                        <button onClick={() => confirm('Delete user?') && destroy(route('admin.users.destroy', user.id))} className="text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Links */}
                    <div className="flex justify-between items-center mt-4">
                        {users.links.map((link, idx) => (
                            <Link key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`p-2 text-sm ${link.active ? 'font-bold text-blue-600' : 'text-gray-600'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Reset Password Modal */}
            {passwordModalUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full">
                        <h3 className="text-md font-bold mb-3">Reset Password for {passwordModalUser.name}</h3>
                        <form onSubmit={handlePasswordReset}>
                            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border rounded p-2 mb-3" required />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setPasswordModalUser(null)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}