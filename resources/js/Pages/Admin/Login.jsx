import React from 'react';
import { useForm } from '@inertiajs/react';

export default function ClientLogin() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/client/login');
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded shadow border">
                <h2 className="text-2xl font-bold mb-6 text-center">Client Portal Login</h2>
                {errors.email && <div className="bg-red-100 text-red-700 p-2 text-xs rounded mb-4">{errors.email}</div>}
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Email Address</label>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border rounded p-2 mt-1" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border rounded p-2 mt-1" required />
                    </div>
                    <button type="submit" disabled={processing} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
                </form>
            </div>
        </div>
    );
}