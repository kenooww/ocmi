import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { KeyRound, Save } from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const { data, setData, put, processing, errors, reset } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  function submit(e) {
    e.preventDefault();
    setSaved(false);

    put(route('seafarers.password.update'), {
      preserveScroll: true,
      onSuccess: () => {
        reset('current_password', 'password', 'password_confirmation');
        setSaved(true);
      },
    });
  }

  return (
    <div className="w-full px-4 py-5 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5">
          <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Settings</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Account Security</h2>
          <p className="mt-2 text-sm text-slate-500">Update your password for signing in to the seafarer portal.</p>
        </div>

        <form onSubmit={submit} className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded bg-[#E1EBE6] text-[#1F6F5C]">
              <KeyRound size={18} />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Update Password</h3>
              <p className="text-sm text-slate-500">Use a password that is hard to guess and at least 6 characters long.</p>
            </div>
          </div>

          {saved && (
            <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Password updated successfully.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Current password</label>
              <input
                type="password"
                value={data.current_password}
                onChange={(event) => setData('current_password', event.target.value)}
                className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                autoComplete="current-password"
              />
              {errors.current_password && <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                value={data.password}
                onChange={(event) => setData('password', event.target.value)}
                className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                autoComplete="new-password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                value={data.password_confirmation}
                onChange={(event) => setData('password_confirmation', event.target.value)}
                className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]"
                autoComplete="new-password"
              />
              {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12364F] disabled:opacity-60"
            >
              <Save size={16} />
              {processing ? 'Saving...' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
