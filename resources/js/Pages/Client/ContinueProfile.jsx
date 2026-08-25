import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Profile from './Sections/Profile';

const PALETTE = {
    navy: '#0F3049',
    paper: '#EEF2F0',
    card: '#FFFFFF',
    line: '#DCE3DF',
    teal: '#1F6F5C',
    tealBg: '#E1EBE6',
    ink: '#16222B',
    sub: '#5B6B70',
};

function AnchorIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2" stroke={PALETTE.navy} strokeWidth="1.6" />
            <path
                d="M12 7v14M7 13a5 5 0 0010 0M4 13H7M17 13h3M12 21c-3 0-5-1.5-5-1.5"
                stroke={PALETTE.navy}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function NoticeModal({ type, message, onClose }) {
    if (!message) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative mx-4 w-full max-w-lg rounded p-6 shadow-lg" style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
                <div className="flex items-start gap-3">
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: type === 'success' ? PALETTE.tealBg : '#FCEAEA',
                        }}
                    >
                        {type === 'success' ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17l-5-5" stroke={PALETTE.teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9v4" stroke="#A23E34" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 17h.01" stroke="#A23E34" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="9" stroke="#A23E34" strokeWidth="1.6" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold" style={{ color: PALETTE.ink }}>{type === 'success' ? 'Success' : 'Error'}</h3>
                        <p className="mt-2 text-sm" style={{ color: PALETTE.sub, whiteSpace: 'pre-line' }}>{message}</p>
                        <div className="mt-4 text-right">
                            <button type="button" onClick={onClose} className="rounded px-3 py-1.5 text-sm" style={{ backgroundColor: PALETTE.navy, color: '#F4F1E8' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ContinueProfile({ client }) {
    const { props } = usePage();
    const company = props?.companySettings || {};
    const logoUrl = company.logo ? `/storage/${company.logo}` : null;
    const notice = props?.flash?.notice ?? null;
    const profileError = props?.errors?.profile ?? null;
    const [modal, setModal] = useState(null);

    useEffect(() => {
        if (notice) {
            setModal({ type: 'success', message: notice });
        }
    }, [notice]);

    useEffect(() => {
        if (profileError) {
            setModal({ type: 'error', message: profileError });
        }
    }, [profileError]);

    return (
        <div
            className="min-h-screen w-full px-4 py-8"
            style={{ backgroundColor: PALETTE.paper, fontFamily: "'Inter', sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
            `}</style>

            <NoticeModal type={modal?.type} message={modal?.message} onClose={() => setModal(null)} />

            <div className="mx-auto mb-6 flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    {logoUrl ? (
                        <img src={logoUrl} alt={company.company_name || company.portal_name || 'Company'} className="h-8 w-8 rounded bg-white object-contain p-1" />
                    ) : (
                        <AnchorIcon />
                    )}
                    <p
                        className="text-xl"
                        style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}
                    >
                        {company.portal_name || 'Anchor Point'}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs" style={{ color: PALETTE.sub }}>
                    <span style={{ color: PALETTE.teal }}>Account</span>
                    <span>-</span>
                    <span style={{ color: PALETTE.teal }}>Verify</span>
                    <span>-</span>
                    <span style={{ color: PALETTE.ink, fontWeight: 600 }}>Profile</span>
                    <span>-</span>
                    <span>Dashboard</span>
                </div>
            </div>

            <div className="mx-auto max-w-6xl rounded border border-slate-200 bg-white px-5 py-6 text-center shadow-sm">
                <h1
                    className="text-2xl"
                    style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}
                >
                    Complete your profile
                </h1>
                <p className="mx-auto mt-2 max-w-2xl text-sm" style={{ color: PALETTE.sub }}>
                    Fill the required personal information, then move step by step through each profile tab. Optional sections can be skipped and updated later.
                </p>
            </div>

            <Profile client={client} onboarding updateRouteName="seafarers.update-profile" />
        </div>
    );
}
