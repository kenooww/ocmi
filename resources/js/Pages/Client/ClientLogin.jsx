import React from 'react';
import { usePage } from '@inertiajs/react';

const PALETTE = {
    navy: '#0F3049',
    navyDeep: '#0A2436',
    paper: '#EEF2F0',
    card: '#FFFFFF',
    line: '#DCE3DF',
    teal: '#1F6F5C',
    tealBg: '#E1EBE6',
    ink: '#16222B',
    sub: '#5B6B70',
};

function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M533.5 278.4c0-18.5-1.5-37-4.7-54.6H272v103.3h147.4c-6.3 34-25.1 62.8-53.6 82v68.3h86.5c50.6-46.6 81.2-115.4 81.2-199z" fill="#4285f4" />
            <path d="M272 544.3c72.6 0 133.7-24 178.3-65.3l-86.5-68.3c-24.1 16.2-55.2 25.7-91.8 25.7-70.5 0-130.3-47.6-151.6-111.5H32.9v69.9C77.6 487 168.8 544.3 272 544.3z" fill="#34a853" />
            <path d="M120.4 326.9c-11.6-34.6-11.6-71.8 0-106.4V150.6H32.9c-39.2 77.2-39.2 168.5 0 245.7l87.5-69.4z" fill="#fbbc04" />
            <path d="M272 107.6c39.6-.6 77.6 14.4 106.5 41.6l79.8-79.8C400.9 24.9 344.9 0 272 0 168.8 0 77.6 57.2 32.9 150.6l87.5 69.9C141.7 155.2 201.5 107.6 272 107.6z" fill="#ea4335" />
        </svg>
    );
}

function AnchorIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center px-4 py-10"
            style={{ backgroundColor: PALETTE.paper, fontFamily: "'Inter', sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
            `}</style>

            <div className="w-full max-w-md">
                <div className="mb-7 flex items-center justify-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt={companyName} className="h-11 w-11 rounded bg-white object-contain p-1 shadow-sm" />
                    ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded bg-white shadow-sm">
                            <AnchorIcon />
                        </span>
                    )}
                    <div>
                        <p className="text-xl leading-tight" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}>
                            {company.portal_name || 'Anchor Point'}
                        </p>
                        <p className="text-xs" style={{ color: PALETTE.sub }}>{company.tagline || 'Seafarer portal'}</p>
                    </div>
                </div>

                <div
                    className="overflow-hidden rounded border bg-white shadow-sm"
                    style={{ borderColor: PALETTE.line }}
                >
                    <div className="px-6 py-7 text-center sm:px-8">
                        <div
                            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                            style={{ backgroundColor: PALETTE.tealBg, color: PALETTE.teal }}
                        >
                            <GoogleIcon />
                        </div>
                        <h1
                            className="text-2xl"
                            style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}
                        >
                            Sign in with Gmail
                        </h1>
                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6" style={{ color: PALETTE.sub }}>
                            Use your Gmail account to access your {companyName} seafarer profile.
                        </p>

                        <a
                            href="/seafarers/register/google"
                            className="mt-7 flex w-full items-center justify-center gap-3 rounded px-4 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                            style={{ backgroundColor: PALETTE.navyDeep, color: '#F4F1E8' }}
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded bg-white">
                                <GoogleIcon />
                            </span>
                            Continue with Gmail
                        </a>

                        <p className="mt-5 text-sm" style={{ color: PALETTE.sub }}>
                            Don't have an account?{' '}
                            <a href="https://alphaomegacrew.com/seafarers/register/google" className="font-medium hover:underline" style={{ color: PALETTE.teal }}>
                                Create one
                            </a>
                        </p>
                    </div>

                    <div className="border-t px-6 py-4 text-center text-xs sm:px-8" style={{ borderColor: PALETTE.line, color: PALETTE.sub, backgroundColor: '#F8FAF9' }}>
                        New and existing seafarers use the same Gmail sign-in.
                    </div>
                </div>
            </div>
        </div>
    );
}
