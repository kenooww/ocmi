import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AdminTabs from './AdminTabs';

export default function ZmiPdfPreview({ client }) {
    const { companySettings } = usePage().props;
    const [result, setResult] = useState({ url: null, error: null, warnings: [] });
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let cancelled = false;
        let url;
        setResult({ url: null, error: null, warnings: [] });
        (async () => {
            const [{ buildZmiPdf }, response] = await Promise.all([
                import('@/Utils/zmiPdf'), fetch('/forms/zmi-employment-application-blank.pdf'),
            ]);
            if (!response.ok) throw new Error('Unable to load the ZMI PDF template.');
            const { bytes, warnings } = await buildZmiPdf(await response.arrayBuffer(), client, companySettings || {});
            if (cancelled) return;
            url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
            setResult({ url, warnings, error: null });
        })().catch((error) => {
            if (!cancelled) setResult({ url: null, warnings: [], error: error.message || 'Unable to prepare the PDF.' });
        });
        return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
    }, [client, companySettings, attempt]);
    const name = [client.first_name, client.last_name].filter(Boolean).join('-') || 'seafarer';
    return (
        <AdminTabs activeTab="clients" title="ZMI Application Form (PDF)">
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={route('admin.seafarers.index')} className="text-sm text-slate-600">← Back to Seafarers</Link>
                    {result.url && <div className="flex gap-3">
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white">Open PDF / Print</a>
                        <a href={result.url} download={`ZMI-Application-${name}.pdf`} className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Download PDF</a>
                    </div>}
                </div>
                <p className="text-sm text-slate-600">Review the completed form, then print using the PDF viewer’s print control.</p>
                {result.warnings.map((warning) => <p key={warning} className="rounded bg-amber-50 p-3 text-sm text-amber-900">{warning}</p>)}
                {result.error ? <div role="alert" className="rounded bg-red-50 p-4 text-red-800">{result.error} <button type="button" onClick={() => setAttempt((value) => value + 1)} className="ml-3 underline">Retry</button></div>
                    : result.url ? <iframe title="Completed ZMI employment application PDF" src={result.url} className="h-[80vh] w-full rounded border border-slate-200 bg-white" />
                        : <p role="status" className="p-6 text-slate-600">Preparing ZMI application PDF…</p>}
            </div>
        </AdminTabs>
    );
}
