import { Head, usePage } from '@inertiajs/react';
import { Anchor, Clock3 } from 'lucide-react';

const PALETTE = {
    navy: '#0F3049',
    navyDeep: '#0A2436',
    paper: '#EEF2F0',
    line: '#DCE3DF',
    brass: '#B8863B',
    brassBg: '#F5EBDA',
    teal: '#1F6F5C',
    ink: '#16222B',
    sub: '#5B6B70',
};

export default function Maintenance() {
    const { companySettings } = usePage().props;
    const company = companySettings || {};
    const companyName = company.company_name || 'Alpha Omega Crewing';
    const portalName = company.portal_name || 'Anchor Point';
    const logoUrl = company.logo ? `/storage/${company.logo}` : null;

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center px-4 py-10"
            style={{ backgroundColor: PALETTE.paper, fontFamily: "'Inter', sans-serif" }}
        >
            <Head title="System Under Maintenance" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
            `}</style>

            <main className="w-full max-w-xl text-center">
                <div className="mb-7 flex items-center justify-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt={companyName} className="h-12 w-12 rounded bg-white object-contain p-1 shadow-sm" />
                    ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded bg-white shadow-sm">
                            <Anchor size={24} color={PALETTE.navy} />
                        </span>
                    )}
                    <div className="text-left">
                        <p className="text-xl leading-tight" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}>
                            {portalName}
                        </p>
                        <p className="text-xs" style={{ color: PALETTE.sub }}>{company.tagline || 'Seafarer portal'}</p>
                    </div>
                </div>

                <section className="rounded border bg-white px-6 py-10 shadow-sm sm:px-10" style={{ borderColor: PALETTE.line }}>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: PALETTE.brassBg, color: PALETTE.brass }}>
                        <Clock3 size={30} />
                    </div>

                    <h1 className="mt-6 text-3xl font-semibold text-slate-900" style={{ fontFamily: "'Fraunces', serif" }}>
                        System Under Maintenance
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6" style={{ color: PALETTE.sub }}>
                        The seafarer portal is temporarily unavailable while maintenance is active. Please check back later.
                    </p>

                </section>
            </main>
        </div>
    );
}
