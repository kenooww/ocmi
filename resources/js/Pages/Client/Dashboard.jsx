import React from 'react';
import { Link, useForm } from '@inertiajs/react';

export default function Dashboard({ client }) {
    const { post } = useForm();

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('client.logout'));
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded shadow border">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h1 className="text-xl font-bold">Welcome, {client.name}</h1>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Logout</button>
                </div>
                <div className="space-y-3 text-sm">
                    <div><strong>Email:</strong> {client.email}</div>
                    <div><strong>Phone:</strong> {client.phone || 'N/A'}</div>
                    <div><strong>Address:</strong> {client.address || 'N/A'}</div>
                </div>
            </div>
        </div>
    );
}