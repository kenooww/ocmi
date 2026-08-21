import React from 'react';
import { useForm, usePage } from '@inertiajs/react';

const PALETTE = {
    navy: '#0F3049',
    navyDeep: '#0A2436',
    paper: '#EEF2F0',
    card: '#FFFFFF',
    line: '#DCE3DF',
    brass: '#B8863B',
    brassBg: '#F5EBDA',
    teal: '#1F6F5C',
    tealBg: '#E1EBE6',
    rust: '#A23E34',
    rustBg: '#F5E4E1',
    ink: '#16222B',
    sub: '#5B6B70',
};

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
            <path d="M533.5 278.4c0-18.5-1.5-37-4.7-54.6H272v103.3h147.4c-6.3 34-25.1 62.8-53.6 82v68.3h86.5c50.6-46.6 81.2-115.4 81.2-199z" fill="#4285f4" />
            <path d="M272 544.3c72.6 0 133.7-24 178.3-65.3l-86.5-68.3c-24.1 16.2-55.2 25.7-91.8 25.7-70.5 0-130.3-47.6-151.6-111.5H32.9v69.9C77.6 487 168.8 544.3 272 544.3z" fill="#34a853" />
            <path d="M120.4 326.9c-11.6-34.6-11.6-71.8 0-106.4V150.6H32.9c-39.2 77.2-39.2 168.5 0 245.7l87.5-69.4z" fill="#fbbc04" />
            <path d="M272 107.6c39.6-.6 77.6 14.4 106.5 41.6l79.8-79.8C400.9 24.9 344.9 0 272 0 168.8 0 77.6 57.2 32.9 150.6l87.5 69.9C141.7 155.2 201.5 107.6 272 107.6z" fill="#ea4335" />
        </svg>
    );
}

function AnchorIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2" stroke={PALETTE.navy} strokeWidth="1.6" />
            <path d="M12 7v14M7 13a5 5 0 0010 0M4 13H7M17 13h3M12 21c-3 0-5-1.5-5-1.5"
                stroke={PALETTE.navy} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ClientLogin() {
    const { companySettings } = usePage().props;
    const company = companySettings || {};
    const companyName = company.company_name || 'Alpha Omega Crewing';
    const logoUrl = company.logo ? `/storage/${company.logo}` : null;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const {
        data: resendData,
        setData: setResendData,
        post: postResend,
        processing: resendProcessing,
        errors: resendErrors,
    } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/seafarers/login');
    };

    const fieldStyle = (err) => ({
        backgroundColor: '#fff',
        border: `1px solid ${err ? PALETTE.rust : PALETTE.line}`,
        color: PALETTE.ink,
    });

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10"
            style={{ backgroundColor: PALETTE.paper, fontFamily: "'Inter', sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
            `}</style>

            <div className="w-full max-w-md">
                <div className="mb-6 flex items-center justify-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt={companyName} className="h-10 w-10 rounded bg-white object-contain p-1" />
                    ) : (
                        <AnchorIcon />
                    )}
                    <div>
                        <p className="text-xl leading-tight" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}>
                            {company.portal_name || 'Anchor Point'}
                        </p>
                        <p className="text-xs" style={{ color: PALETTE.sub }}>{company.tagline || 'Crewing & recruitment'}</p>
                    </div>
                </div>
                <div
                    className="rounded p-6 sm:p-8"
                    style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
                >
                    <h1
                        className="text-2xl mb-1 text-center"
                        style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}
                    >
                        Welcome back
                    </h1>
                    <p className="text-sm text-center mb-7" style={{ color: PALETTE.sub }}>
                        Sign in to your {companyName} account.
                    </p>

                    {errors.email && (
                        <div
                            className="mb-5 px-4 py-3 rounded text-sm"
                            style={{ backgroundColor: PALETTE.rustBg, color: PALETTE.rust, border: `1px solid ${PALETTE.rust}` }}
                        >
                            {errors.email}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-3 py-2 rounded text-sm outline-none"
                                style={fieldStyle(errors.email)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-3 py-2 rounded text-sm outline-none"
                                style={fieldStyle(errors.password)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2.5 rounded text-sm font-medium mt-2 disabled:opacity-60"
                            style={{ backgroundColor: PALETTE.navy, color: '#F4F1E8' }}
                        >
                            {processing ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px" style={{ backgroundColor: PALETTE.line }} />
                        <span className="text-xs uppercase tracking-wide" style={{ color: PALETTE.sub, letterSpacing: '0.08em' }}>
                            or
                        </span>
                        <div className="flex-1 h-px" style={{ backgroundColor: PALETTE.line }} />
                    </div>

                    <a
                        href="/seafarers/register/google"
                        className="w-full flex items-center justify-center gap-3 py-2.5 rounded text-sm font-medium"
                        style={{ backgroundColor: '#fff', border: `1px solid ${PALETTE.line}`, color: PALETTE.ink }}
                    >
                        <GoogleIcon />
                        Continue with Google
                    </a>

                    <p className="text-xs text-center mt-6" style={{ color: PALETTE.sub }}>
                        Don't have an account?{' '}
                        <a href="/seafarers/register/google" style={{ color: PALETTE.teal }}>
                            Create one
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
