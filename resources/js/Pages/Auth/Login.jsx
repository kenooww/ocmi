import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Anchor, ArrowRight, LockKeyhole, Mail, ShieldCheck, Ship, UsersRound } from 'lucide-react';

export default function Login({ status, canResetPassword, isAdminPortal = false }) {
    const { companySettings } = usePage().props;
    const company = companySettings || {};
    const logoUrl = company.logo ? `/storage/${company.logo}` : null;
    const portalName = company.portal_name || 'Anchor Point';
    const companyName = company.company_name || 'Alpha Omega Crewing';
    const tagline = company.tagline || 'Crewing & recruitment';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route(isAdminPortal ? 'admin.login.submit' : 'login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#EEF2F0] text-slate-900">
            <Head title={isAdminPortal ? 'Admin Login' : 'Log in'} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
            `}</style>

            <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]" style={{ fontFamily: "'Inter', sans-serif" }}>
                <section className="relative flex min-h-[320px] flex-col justify-between overflow-hidden bg-[#0A2436] px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:px-14">
                    <div className="absolute inset-0 opacity-20">
                        <div className="h-full w-full bg-[linear-gradient(135deg,rgba(184,134,59,0.65)_0%,rgba(10,36,54,0)_42%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),rgba(255,255,255,0)_28%)]" />
                    </div>

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded border border-white/15 bg-white/10">
                            {logoUrl ? (
                                <img src={logoUrl} alt={companyName} className="h-8 w-8 object-contain" />
                            ) : (
                                <Anchor size={22} className="text-[#D7A858]" />
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-semibold leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                                {portalName}
                            </p>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-300">{isAdminPortal ? 'Admin Console' : tagline}</p>
                        </div>
                    </div>

                    <div className="relative z-10 max-w-2xl py-10 lg:py-0">
                        <p className="mb-4 inline-flex items-center gap-2 rounded border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#F5EBDA]">
                            <ShieldCheck size={14} />
                            Secure operations portal
                        </p>
                        <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl" style={{ fontFamily: "'Fraunces', serif" }}>
                            {isAdminPortal ? `Manage ${companyName} records with a clear command view.` : `Welcome to ${companyName}.`}
                        </h1>
                        <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                            {isAdminPortal
                                ? 'Review seafarer profiles, documents, users, and print-ready applications from one focused admin workspace.'
                                : tagline}
                        </p>
                    </div>

                    <div className="relative z-10 grid gap-3 border-t border-white/10 pt-5 text-sm text-slate-200 sm:grid-cols-3">
                        <div className="flex items-center gap-2">
                            <UsersRound size={17} className="text-[#D7A858]" />
                            User controls
                        </div>
                        <div className="flex items-center gap-2">
                            <Ship size={17} className="text-[#D7A858]" />
                            Seafarer files
                        </div>
                        <div className="flex items-center gap-2">
                            <LockKeyhole size={17} className="text-[#D7A858]" />
                            Protected access
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8A642C]">
                                {isAdminPortal ? 'Administrator' : 'Account'}
                            </p>
                            <h2 className="mt-2 text-3xl font-semibold text-[#16222B]" style={{ fontFamily: "'Fraunces', serif" }}>
                                Welcome back
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Sign in with your authorized credentials to continue.
                            </p>
                        </div>

                        <div className="rounded border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-5">
                                <h3 className="text-base font-semibold text-slate-900">Sign in</h3>
                                <p className="mt-1 text-sm text-slate-500">Access is limited to registered admin users.</p>
                            </div>

                            <form onSubmit={submit} className="space-y-5 px-6 py-6">
                                {status && (
                                    <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                                        {status}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                        Email address
                                    </label>
                                    <div className="relative mt-1">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="block w-full rounded border border-slate-300 py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-[#B8863B] focus:ring-[#B8863B]"
                                            autoComplete="username"
                                            autoFocus
                                            placeholder="admin@example.com"
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                            Password
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-xs font-semibold text-[#8A642C] transition hover:text-[#0A2436]"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative mt-1">
                                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="block w-full rounded border border-slate-300 py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-[#B8863B] focus:ring-[#B8863B]"
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="ms-2 text-sm text-slate-600">Remember me</span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12364F] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing ? 'Signing in...' : 'Sign in to admin dashboard'}
                                    <ArrowRight size={17} />
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
