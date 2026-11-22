import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';
import { useEffect, useState } from 'react';

function display(value) {
    return value || '';
}

function dateDisplay(value) {
    if (!value) return '';
    const date = new Date(String(value).slice(0, 10) + 'T00:00:00');
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
}

export default function ContractPrint({ contract }) {
    const c = contract || {};
    const [pdfResult, setPdfResult] = useState({ url: null, error: null });

    useEffect(() => {
        let cancelled = false;
        let url;

        (async () => {
            const [{ buildContractPdf }, contractResponse, allotmentResponse] = await Promise.all([
                import('@/Utils/contractPdf'),
                fetch('/forms/Contract.pdf'),
                fetch('/forms/ACC01%20Certificate%20of%20Crew%20Salary%20Allotment.pdf'),
            ]);

            if (!contractResponse.ok) throw new Error('Unable to load Contract.pdf.');
            if (!allotmentResponse.ok) throw new Error('Unable to load the allotment certificate template.');

            const { bytes } = await buildContractPdf(
                await contractResponse.arrayBuffer(),
                c,
                await allotmentResponse.arrayBuffer(),
            );
            if (cancelled) return;

            url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
            setPdfResult({ url, error: null });
        })().catch((error) => {
            if (!cancelled) setPdfResult({ url: null, error: error.message || 'Unable to prepare contract PDF.' });
        });

        return () => {
            cancelled = true;
            if (url) URL.revokeObjectURL(url);
        };
    }, [contract]);

    if (pdfResult.url || pdfResult.error) {
        return (
            <AdminTabs activeTab="contracts" title="Contract PDF">
                <Head title={`Contract ${c.contract_number || ''}`} />
                <div className="space-y-4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link href={route('admin.contracts.edit', c.id)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"><ArrowLeft size={15} /> Back to Edit</Link>
                        {pdfResult.url && (
                            <div className="flex gap-2">
                                <a href={pdfResult.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white"><Printer size={16} /> Open / Print PDF</a>
                                <a href={pdfResult.url} download={`Contract-${c.contract_number || c.id}.pdf`} className="rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Download PDF</a>
                            </div>
                        )}
                    </div>
                    {pdfResult.error ? (
                        <div className="rounded bg-red-50 p-4 text-sm text-red-700">{pdfResult.error}</div>
                    ) : (
                        <iframe title="Completed contract PDF" src={pdfResult.url} className="h-[82vh] w-full rounded border border-slate-200 bg-white" />
                    )}
                </div>
            </AdminTabs>
        );
    }

    return (
        <AdminTabs activeTab="contracts" title="Contract Preview">
            <Head title={`Contract ${c.contract_number || ''}`} />
            <style>{`
                .contract-print-root { width: 100%; }
                .contract-screen { max-width: 820px; margin: 0 auto; }
                .contract-paper { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; color: #111; font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; line-height: 1.22; padding: 10mm 13mm 8mm; box-sizing: border-box; }
                .contract-paper table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                .contract-paper td { vertical-align: bottom; height: 18px; }
                .contract-paper .line-value { display: block; width: 100%; min-height: 15px; border-bottom: 1px solid #111; padding: 0 3px 1px; font-weight: 700; }
                .contract-paper .plain-line { display: block; min-height: 15px; border-bottom: 1px solid #111; }
                .contract-paper .section-title { font-weight: 800; text-align: center; margin: 10px 0 7px; }
                .contract-paper ol, .contract-paper ul { margin: 0; }
                .contract-paper .terms td { height: 18px; }
                .contract-paper .signature-line { display: block; border-top: 1px solid #111; margin: 0 auto 3px; width: 82%; padding-top: 2px; }
                .contract-party td:nth-child(3), .contract-party tr:nth-child(2) td:nth-child(6), .terms td:last-child { border-bottom: 1px solid #111; }
                .contract-party .identifier-row td { border: 0 !important; vertical-align: bottom; height: 30px; }
                .contract-party .identifier-label { display: block; min-height: 14px; white-space: nowrap; font-weight: 700; }
                .contract-party .identifier-value { display: block; height: 16px; border-bottom: 1px solid #111; padding: 0 4px 1px; font-weight: 700; }
                .contract-party .label-cell { width: 25%; }
                .contract-party .colon-cell { width: 4%; }
                .contract-party .value-cell { border-bottom: 1px solid #111; font-weight: 700; }
                .contract-party .birth-value { width: 31%; }
                .contract-party .birth-label { width: 18%; padding-left: 8px; }
                .contract-party .birth-colon { width: 3%; }
                .contract-line-table td:nth-child(3), .contract-line-table td:nth-child(6), .terms td:last-child { border-bottom: 1px solid #111; }
                @media (max-width: 900px) { .contract-paper { transform-origin: top left; transform: scale(.78); margin-bottom: -65mm; } }
                @media print {
                    @page { size: A4 portrait; margin: 7mm; }
                    html, body { width: 210mm; height: 297mm; background: #fff !important; }
                    body * { visibility: visible; }
                    aside, header, .contract-toolbar, nav, .print\:hidden { display: none !important; }
                    main { width: 210mm !important; padding: 0 !important; margin: 0 !important; background: #fff !important; }
                    .contract-screen { width: 196mm !important; max-width: 196mm !important; margin: 0 auto !important; }
                    .contract-paper { width: 196mm !important; min-height: 283mm !important; margin: 0 !important; padding: 7mm 8mm 5mm !important; font-size: 9px !important; line-height: 1.12 !important; transform: none !important; box-shadow: none !important; }
                    .contract-paper .section-title { margin: 6px 0 4px !important; }
                    .contract-paper td { height: 15px !important; }
                    .contract-paper .identifier-row td { height: 26px !important; }
                    .contract-paper .signature-line { margin-top: 5px !important; }
                }
            `}</style>

            <div className="contract-toolbar mb-4 flex items-center justify-between print:hidden">
                <Link href={route('admin.contracts.edit', c.id)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"><ArrowLeft size={15} /> Back to edit</Link>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white"><Printer size={16} /> Print Contract</button>
            </div>

            <div className="contract-screen contract-print-root">
                <article className="contract-paper">
                    <div style={{ textAlign: 'center', fontSize: '13px' }}>
                        <strong>Republic of the Philippines</strong><br />
                        <strong>DEPARTMENT OF MIGRANT WORKERS</strong>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '14px' }}>
                        <strong>COVERPAGE OF THE</strong><br />
                        <strong>STANDARD EMPLOYMENT CONTRACT GOVERNING OVERSEAS FILIPINO SEAFARERS (SEC-S)</strong>
                    </div>

                    <h3 className="section-title">KNOW ALL MEN BY THESE PRESENTS:</h3>
                    <p>This SEC-S, entered into voluntarily by and between:</p>

                    <table className="contract-party" style={{ marginTop: '10px' }}>
                        <tbody>
                            <tr>
                                <td className="label-cell">Name of Seafarer</td>
                                <td className="colon-cell">:</td>
                                <td className="value-cell" style={{ width: '71%' }}>{display(c.seafarer_name).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td className="label-cell">Date of Birth</td>
                                <td className="colon-cell">:</td>
                                <td className="value-cell birth-value">{dateDisplay(c.date_of_birth)}</td>
                                <td className="birth-label">Place of Birth</td>
                                <td className="birth-colon">:</td>
                                <td className="value-cell">{display(c.place_of_birth).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td className="label-cell">Permanent/Residential Address</td>
                                <td className="colon-cell">:</td>
                                <td className="value-cell" style={{ width: '71%' }}>{display(c.permanent_address).toUpperCase()}</td>
                            </tr>
                            <tr className="identifier-row">
                                <td style={{ width: '33.333%' }}>
                                    <span className="identifier-label">Seafarer's E-Registration No.</span>
                                    <span className="identifier-value">{display(c.registration_no)}</span>
                                </td>
                                <td style={{ width: '33.333%', paddingLeft: '8px' }}>
                                    <span className="identifier-label">SRB No.</span>
                                    <span className="identifier-value">{display(c.srb_no)}</span>
                                </td>
                                <td style={{ width: '33.333%', paddingLeft: '8px' }}>
                                    <span className="identifier-label">SID No.</span>
                                    <span className="identifier-value">{display(c.sid_no)}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <p style={{ marginTop: '10px', textAlign: 'left' }}>And</p>
                    <table className="contract-line-table">
                        <tbody>
                            <tr><td style={{ width: '25%' }}>Name of Licensed Manning Agency</td><td style={{ width: '4%' }}>:</td><td style={{ width: '71%' }}>{display(c.agency_name).toUpperCase()}</td></tr>
                            <tr><td>Name of DMW Accredited Principal</td><td>:</td><td>{display(c.dmw_agency_principal).toUpperCase()}</td></tr>
                            <tr><td>Name of Principal / Shipowner</td><td>:</td><td>{display(c.principal_name).toUpperCase()}</td></tr>
                            <tr><td>Name of Shipper (if any)</td><td>:</td><td>{display(c.shipper_name).toUpperCase()}</td></tr>
                            <tr><td>Address of Shipper (if any)</td><td>:</td><td>{display(c.shipper_address).toUpperCase()}</td></tr>
                        </tbody>
                    </table>

                    <table className="contract-line-table" style={{ marginTop: '10px' }}>
                        <tbody>
                            <tr><td style={{ width: '25%' }}>For the Below Vessel</td><td /></tr>
                            <tr>
                                <td style={{ width: '20%' }}>Name of Vessel</td><td style={{ width: '2%' }}>:</td><td style={{ width: '36%' }}>{display(c.vessel_name).toUpperCase()}</td>
                                <td style={{ width: '11%', paddingLeft: '8px' }}>IMO No.</td><td style={{ width: '2%' }}>:</td><td style={{ width: '29%' }}>{display(c.imo_number)}</td>
                            </tr>
                            <tr>
                                <td>Gross Registered Tonnage (GRT)</td><td>:</td><td>{display(c.gross_registered_tonnage)}</td>
                                <td style={{ paddingLeft: '8px' }}>Year Built</td><td>:</td><td>{display(c.year_built)}</td>
                            </tr>
                            <tr>
                                <td>Flag</td><td>:</td><td>{display(c.flag).toUpperCase()}</td>
                                <td style={{ paddingLeft: '8px' }}>Type of Vessel</td><td>:</td><td>{display(c.vessel_type).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>Classification Society</td><td>:</td><td style={{ width: '71%' }}>{display(c.classification_society).toUpperCase()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className="section-title">WITNESSETH</h3>
                    <ol style={{ margin: '0', paddingLeft: '18px' }}>
                        <li>That the employee shall be employed on board under the following terms and conditions:</li>
                    </ol>
                    <table className="terms" style={{ marginTop: '8px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '58%' }}>1.1. Duration of Contract</td>
                                <td>:</td>
                                <td><strong>{display(c.duration).toUpperCase()}</strong></td>
                            </tr>
                            <tr>
                                <td>1.2. Position</td>
                                <td>:</td>
                                <td>{display(c.position).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>1.3. Basic Monthly Salary</td>
                                <td>:</td>
                                <td>{display(c.basic_monthly_salary).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>1.4. Hours of Work</td>
                                <td>:</td>
                                <td>{display(c.hours_of_work).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>1.5. Overtime</td>
                                <td>:</td>
                                <td>{display(c.overtime).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>1.6. Leave Pay</td>
                                <td>:</td>
                                <td>{display(c.leave_pay).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>1.7. Point of Hire</td>
                                <td>:</td>
                                <td>{display(c.coverage_of_cba || c.collective_bargaining_agreement).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>1.8. Collective Bargaining Agreement, if any</td>
                                <td>:</td>
                                <td>{display(c.collective_bargaining_agreement).toUpperCase() || 'NONE'}</td>
                            </tr>
                        </tbody>
                    </table>

                    <ol start="2" style={{ marginTop: '7px', paddingLeft: '18px' }}>
                        <li style={{ marginBottom: '2px' }}>2. This Cover Page is a quick reference guide on the basic terms and conditions of employment. This shall be attached to the DMW Approved SEC-S and shall form an integral part thereof.</li>
                        <li style={{ marginBottom: '2px' }}>3. The terms and conditions in accordance with the Department Circular No. 07, Series of 2020, shall be strictly and faithfully observed.</li>
                        <li style={{ marginBottom: '2px' }}>4. Any alterations or changes in any part of this Cover Page shall be evaluated, verified, processed and approved by the DMW.</li>
                        <li style={{ marginBottom: '2px' }}> Upon approval, the same shall be deemed an integral part of the SEC-S.</li>
                        <li>5. Violations of the terms and conditions of this SEC-S with its approved addendum shall be grounds for disciplinary actions against the erring party.</li>
                    </ol>

                    <p style={{ marginTop: '8px' }}>
                        IN WITNESS WHEREOF the parties have hereunto set their hands this {dateDisplay(c.contract_date)} at {display(c.contract_place).toUpperCase()}.
                    </p>

                    <table style={{ marginTop: '24px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '48%', textAlign: 'center', verticalAlign: 'bottom' }}>
                                    <span style={{ display: 'block', fontWeight: '700' }}>{display(c.seafarer_signature_name).toUpperCase()}</span>
                                    <span className="signature-line" />
                                    SEAFARER
                                </td>
                                <td style={{ width: '4%' }} />
                                <td style={{ width: '48%', textAlign: 'center', verticalAlign: 'bottom' }}>
                                    <span style={{ display: 'block', fontWeight: '700' }}>{display(c.employer_name).toUpperCase()}</span>
                                    <span className="signature-line" />
                                    <strong>for the Employer</strong><br />
                                    Name and Signature/Designation
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ marginTop: '28px', textAlign: 'center' }}>
                        <strong>Approved by the DMW:</strong><br />
                        <div style={{ display: 'inline-block', width: '260px', minHeight: '70px', border: '1px solid #111', marginTop: '8px', paddingTop: '7px' }}>
                            <strong>{display(c.approved_by_name).toUpperCase()}</strong><br />
                            {display(c.approved_by_designation).toUpperCase()}<br />
                            {display(c.dmw_place).toUpperCase()}<br />
                            {dateDisplay(c.approved_date)}
                        </div>
                    </div>
                </article>
            </div>
        </AdminTabs>
    );
}
