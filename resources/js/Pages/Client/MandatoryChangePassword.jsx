import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { KeyRound, Save } from 'lucide-react';

const PALETTE = {
    navy: '#0F3049',
    paper: '#EEF2F0',
    card: '#FFFFFF',
    line: '#DCE3DF',
    brass: '#B8863B',
    rust: '#A23E34',
    ink: '#16222B',
    sub: '#5B6B70',
};

export default function MandatoryChangePassword() {
    const { companySettings } = usePage().props;
    const company = companySettings || {};
    const companyName = company.company_name || 'Alpha Omega Crewing';
    const logoUrl = company.logo ? `/storage/${company.logo}` : null;
    const { data, setData, put, processing, errors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        put(route('seafarers.password.mandatory.update'), {
            preserveScroll: true,
        });
    };

    const fieldStyle = (error) => ({
        backgroundColor: '#fff',
        border: `1px solid ${error ? PALETTE.rust : PALETTE.line}`,
        color: PALETTE.ink,
    });

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 py-10" style={{ backgroundColor: PALETTE.paper, fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
            `}</style>

            <div className="w-full max-w-md">
                <div className="mb-6 flex items-center justify-center gap-3">
                    {logoUrl && <img src={logoUrl} alt={companyName} className="h-10 w-10 rounded bg-white object-contain p-1" />}
                    <div>
                        <p className="text-xl leading-tight" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}>
                            {company.portal_name || 'Anchor Point'}
                        </p>
                        <p className="text-xs" style={{ color: PALETTE.sub }}>{company.tagline || 'Crewing & recruitment'}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="rounded p-6 shadow-sm sm:p-8" style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
                    <div className="mb-6 flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded" style={{ backgroundColor: '#E1EBE6', color: '#1F6F5C' }}>
                            <KeyRound size={20} />
                        </span>
                        <div>
                            <h1 className="text-xl font-semibold" style={{ color: PALETTE.ink }}>Change temporary password</h1>
                            <p className="mt-1 text-sm" style={{ color: PALETTE.sub }}>
                                Please create a new password before continuing.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium" style={{ color: PALETTE.ink }}>Temporary password</label>
                            <input
                                type="password"
                                value={data.current_password}
                                onChange={(event) => setData('current_password', event.target.value)}
                                className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                                style={fieldStyle(errors.current_password)}
                                autoComplete="current-password"
                                required
                            />
                            {errors.current_password && <p className="mt-1 text-xs" style={{ color: PALETTE.rust }}>{errors.current_password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium" style={{ color: PALETTE.ink }}>New password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                                style={fieldStyle(errors.password)}
                                autoComplete="new-password"
                                required
                            />
                            {errors.password && <p className="mt-1 text-xs" style={{ color: PALETTE.rust }}>{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium" style={{ color: PALETTE.ink }}>Confirm new password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
                                style={fieldStyle(errors.password_confirmation)}
                                autoComplete="new-password"
                                required
                            />
                            {errors.password_confirmation && <p className="mt-1 text-xs" style={{ color: PALETTE.rust }}>{errors.password_confirmation}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                        style={{ backgroundColor: PALETTE.navy }}
                    >
                        <Save size={16} />
                        {processing ? 'Saving...' : 'Save New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
