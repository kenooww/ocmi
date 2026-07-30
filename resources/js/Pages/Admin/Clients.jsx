import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminTabs from '@/Components/Admin/AdminTabs';

export default function Clients({ clients }) {
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name: '', email: '', password: '', phone: '', address: ''
    });
    const [editId, setEditId] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            put(route('admin.clients.update', editId), { onSuccess: () => { reset(); setEditId(null); } });
        } else {
            post(route('admin.clients.store'), { onSuccess: () => reset() });
        }
    };

    const handleEdit = (client) => {
        setEditId(client.id);
        setData({ name: client.name, email: client.email, password: '', phone: client.phone || '', address: client.address || '' });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <AdminTabs activeTab="clients" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="bg-white p-6 rounded shadow border">
                    <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit Client Info' : 'Add New Client'}</h2>
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
                        <div className="mb-3">
                            <label className="block text-sm font-medium">Password {editId && '(Leave blank to keep)'}</label>
                            <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border rounded p-2 mt-1" />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium">Phone</label>
                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full border rounded p-2 mt-1" />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium">Address</label>
                            <textarea value={data.address} onChange={e => setData('address', e.target.value)} className="w-full border rounded p-2 mt-1"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">{editId ? 'Update Client' : 'Save Client'}</button>
                        {editId && <button type="button" onClick={() => { setEditId(null); reset(); }} className="w-full bg-gray-300 text-black p-2 rounded mt-2">Cancel</button>}
                    </form>
                </div>

                {/* Listing Section */}
                <div className="md:col-span-2 bg-white p-6 rounded shadow border">
                    <h2 className="text-lg font-semibold mb-4">Paginated Client Personal Info Listing</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm">
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.data.map(client => (
                                <tr key={client.id} className="border-b text-sm">
                                    <td className="p-3">{client.name}</td>
                                    <td className="p-3">{client.email}</td>
                                    <td className="p-3">{client.phone}</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button onClick={() => handleEdit(client)} className="text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => confirm('Delete client record?') && destroy(route('admin.clients.destroy', client.id))} className="text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Links */}
                    <div className="flex justify-between items-center mt-4">
                        {clients.links.map((link, idx) => (
                            <Link key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`p-2 text-sm ${link.active ? 'font-bold text-blue-600' : 'text-gray-600'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}