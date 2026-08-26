import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

const TRAVEL_DOCUMENT_TYPES = [
    { key: 'passport', label: 'Passport' },
    { key: 'visa', label: 'Available Visa (If Any)' },
    { key: 'seamans_book', label: "Seaman's Book" },
    { key: 'seafarers_identification_document', label: 'Seafarers Identification Document (SID)' },
];

function fullNameFor(client) {
    return [client?.first_name, client?.middle_name, client?.last_name].filter(Boolean).join(' ') || client?.name || 'Seafarer';
}

function upper(value) {
    return value === null || value === undefined ? '' : String(value).toUpperCase();
}

function value(item, key) {
    return upper(item?.[key]);
}

function buildTravelDocuments(documents = []) {
    const documentMap = new Map((documents || []).map((document) => [document.document_type, document]));

    return TRAVEL_DOCUMENT_TYPES.map((type) => ({
        label: type.label,
        number: documentMap.get(type.key)?.number ?? '',
        place_of_issue: documentMap.get(type.key)?.place_of_issue ?? '',
        date_of_issue: documentMap.get(type.key)?.date_of_issue ?? '',
        date_of_expiry: documentMap.get(type.key)?.date_of_expiry ?? '',
        created_at: documentMap.get(type.key)?.created_at ?? '',
        updated_at: documentMap.get(type.key)?.updated_at ?? '',
        id: documentMap.get(type.key)?.id ?? null,
    }));
}

function sortRowsByCreatedDate(rows = []) {
    return [...(rows || [])].sort((a, b) => {
        const aTime = Date.parse(a?.created_at || '') || 0;
        const bTime = Date.parse(b?.created_at || '') || 0;

        if (!aTime && !bTime) {
            return 0;
        }

        if (aTime !== bTime) {
            return bTime - aTime;
        }

        return Number(b?.id || 0) - Number(a?.id || 0);
    });
}

function rowsWithMinimum(rows = [], count = 4) {
    const sortedRows = sortRowsByCreatedDate(rows);
    const blankRows = Array.from({ length: Math.max(count - sortedRows.length, 0) }, () => ({}));
    return [...sortedRows, ...blankRows];
}

function Header({ client, page }) {
    const { companySettings } = usePage().props;
    const company = companySettings || {};
    const logoUrl = company.logo ? `/storage/${company.logo}` : null;

    return (
        <div className="mb-3 grid grid-cols-[1fr_130px] gap-3">
            <div className="border border-black p-2 text-center text-xs">
                <div className="flex items-center justify-center gap-2">
                    {logoUrl && <img src={logoUrl} alt={company.company_name || 'Company'} className="h-9 w-9 object-contain" />}
                    <div>
                        <div className="text-base font-bold">{upper(company.company_name || 'ALPHA OMEGA CREWING MANAGEMENT INC')}</div>
                        <div>{company.address || '1210B 12/F 1350 Roxas Boulevard Service Road, Ermita, Manila'}</div>
                    </div>
                </div>
            </div>
            <div className="border border-black p-2 text-xs">
                <div>Document No.:</div>
                <div>Revision No. & Date:</div>
                <div>Page: {page}</div>
            </div>
        </div>
    );
}

function FieldGrid({ fields }) {
    return (
        <div className="grid grid-cols-2 border-l border-t border-black text-xs">
            {fields.map(([label, text]) => (
                <div key={label} className="grid grid-cols-[145px_1fr] border-b border-r border-black">
                    <div className="bg-slate-100 px-2 py-1 font-semibold">{label}</div>
                    <div className="min-h-7 px-2 py-1">{upper(text)}</div>
                </div>
            ))}
        </div>
    );
}

function SimpleTable({ title, columns, rows, minRows = 4, rowLabelKey }) {
    return (
        <section className="mt-3">
            <h3 className="text-center text-sm font-bold">{title}</h3>
            <table className="mt-1 w-full border-collapse text-xs">
                <thead>
                    <tr>
                        {rowLabelKey && <th className="border border-black px-2 py-1 text-left">Name</th>}
                        {columns.map((column) => (
                            <th key={column.key} className="border border-black px-2 py-1">{column.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rowsWithMinimum(rows, minRows).map((row, index) => (
                        <tr key={index}>
                            {rowLabelKey && <td className="border border-black px-2 py-1">{upper(row.label || row[rowLabelKey])}</td>}
                            {columns.map((column) => (
                                <td key={column.key} className="h-7 border border-black px-2 py-1">{value(row, column.key)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

function SeaServiceTable({ rows }) {
    const columns = [
        ['vessel_name', 'Vessel Name'],
        ['ship_owner_manager_contact', 'Company (Owners)'],
        ['position', 'Rank'],
        ['type_imo_number', 'Type of Vessel'],
        ['propulsion_type', 'Propulsion type AZ, CPP'],
        ['flag', 'Flag'],
        ['area_of_operation', 'Area of operation'],
        ['grt', 'GT'],
        ['main_engine_type_model', 'Type of Engine'],
        ['main_engine_kw', 'BHP'],
        ['bollard_pull', 'Bollard Pull'],
        ['from_date', 'Sign on Date (DD:MM:YY)'],
        ['to_date', 'Sign off Date (DD:MM:YY)'],
    ];

    return (
        <section className="mt-3">
            <div className="print-table-scroll overflow-x-auto">
                <table className="print-wide-table w-full min-w-[1700px] border-collapse text-[10px]">
                    <thead>
                        <tr>
                            <th colSpan={14} className="border border-black px-1 py-1 text-center font-normal">
                                <div>Record of Sea Service</div>
                                <div className="italic">(Recent Vessel/MOU First)</div>
                            </th>
                        </tr>
                        <tr>
                            {columns.map(([key, label]) => (
                                <th key={key} className="border border-black px-1 py-1">{label}</th>
                            ))}
                            <th className="border border-black px-1 py-1">Duration (Days : Month)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowsWithMinimum(rows, 5).map((row, index) => (
                            <tr key={index}>
                                {columns.map(([key]) => (
                                    <td key={key} className="h-8 border border-black px-1 py-1">{value(row, key)}</td>
                                ))}
                                <td className="h-8 border border-black px-1 py-1">
                                    {[row.duration_days, row.duration_months].filter((item) => item !== null && item !== undefined && item !== '').join(' : ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function DeckOfficerTable({ rows }) {
    const columns = [
        ['vessel_name', 'Vessel Name'], ['charterer', 'Charterer'], ['area_of_operation', 'Area of Operation'],
        ['dp_operation_hours', 'DP Operation Hours'], ['supply', 'Supply'], ['dsv', 'DSV'], ['survey', 'Survey'],
        ['anchor_type', 'Anchor Type'], ['anchor_weight', 'Anchor Weight'], ['barges', 'Barges'], ['rig_move', 'Rig Move'],
        ['propelled', 'Propelled'], ['non_propelled', 'None Propelled'],
    ];

    return (
        <section className="mt-3">
            <div className="border border-black bg-slate-200 py-1 text-center text-sm font-bold">DECK Officers Experience</div>
            <div className="print-table-scroll overflow-x-auto">
                <table className="print-wide-table w-full min-w-[1450px] border-collapse text-[10px]">
                    <thead>
                        <tr>
                            <th rowSpan={3} className="border border-black px-1 py-1">Vessel Name</th>
                            <th rowSpan={3} className="border border-black px-1 py-1">Charterer</th>
                            <th rowSpan={3} className="border border-black px-1 py-1">Area of Operation (Oil field)</th>
                            <th rowSpan={3} className="border border-black px-1 py-1">DP (TYPE OF OPERATION, HOURS)</th>
                            <th colSpan={9} className="border border-black px-1 py-1">PERIOD OF OPERATION (in Months)</th>
                        </tr>
                        <tr>
                            <th rowSpan={2} className="border border-black px-1 py-1">SUPPLY</th>
                            <th rowSpan={2} className="border border-black px-1 py-1">DSV</th>
                            <th rowSpan={2} className="border border-black px-1 py-1">SURVEY</th>
                            <th colSpan={2} className="border border-black px-1 py-1">ANCHOR HANDLING</th>
                            <th colSpan={2} className="border border-black px-1 py-1">TOWING</th>
                            <th colSpan={2} className="border border-black px-1 py-1">SELF ELEVATING BARGE</th>
                        </tr>
                        <tr>
                            <th className="border border-black px-1 py-1">ANCHOR TYPE</th>
                            <th className="border border-black px-1 py-1">ANCHOR WEIGHT</th>
                            <th className="border border-black px-1 py-1">BARGES</th>
                            <th className="border border-black px-1 py-1">RIG MOVE</th>
                            <th className="border border-black px-1 py-1">Propelled</th>
                            <th className="border border-black px-1 py-1">None Propelled</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowsWithMinimum(rows, 5).map((row, index) => (
                            <tr key={index}>
                                {columns.map(([key]) => (
                                    <td key={key} className="h-8 border border-black px-1 py-1">{value(row, key)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function ConfirmationBlock() {
    return (
        <div className="mb-3 text-xs">
            <p className="italic">I hereby confirm that all the above furnished details are true.</p>
            <div className="mt-4 grid grid-cols-3 gap-24">
                <div>Name: <span className="inline-block w-40 border-b border-black">&nbsp;</span></div>
                <div>Rank: <span className="inline-block w-40 border-b border-black">&nbsp;</span></div>
                <div>Signature: <span className="inline-block w-44 border-b border-black">&nbsp;</span></div>
            </div>
        </div>
    );
}

function CompanyFieldGrid({ fields, columns = 2 }) {
    return (
        <div className={`grid border-l border-t border-black text-xs ${columns === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {fields.map(([label, text]) => (
                <div key={label} className="grid grid-cols-[150px_1fr] border-b border-r border-black">
                    <div className="bg-slate-100 px-2 py-1 font-semibold">{label}</div>
                    <div className="min-h-7 px-2 py-1">{upper(text)}</div>
                </div>
            ))}
        </div>
    );
}

function documentRowsFor(client) {
    return buildTravelDocuments(client?.travel_documents).map((document) => ({
        name: document.label,
        number: document.number,
        place_of_issue: document.place_of_issue,
        date_of_issue: document.date_of_issue,
        date_of_expiry: document.date_of_expiry,
    }));
}

function certificateRowsFor(client) {
    return [
        ...(client?.certifications || []),
        ...(client?.gmdss_certificates || []),
        ...(client?.proficiency || []),
        ...(client?.vaccinations || []),
        ...(client?.flag_documents || []),
        ...(client?.other_certificates || []),
    ];
}

function findRowByName(rows, terms) {
    return rows.find((row) => {
        const name = String(row?.name || row?.label || '').toLowerCase();
        return terms.some((term) => name.includes(term.toLowerCase()));
    }) || {};
}

function mostRecentRow(rows = []) {
    return [...(rows || [])].sort((a, b) => {
        const aTime = Date.parse(a?.created_at || a?.updated_at || '') || 0;
        const bTime = Date.parse(b?.created_at || b?.updated_at || '') || 0;

        if (aTime !== bTime) {
            return bTime - aTime;
        }

        return Number(b?.id || 0) - Number(a?.id || 0);
    })[0] || {};
}

function flexFleetDocumentRows(client) {
    return [
        ...buildTravelDocuments(client?.travel_documents).map((document) => ({
            name: document.label,
            number: document.number,
            place_of_issue: document.place_of_issue,
            date_of_issue: document.date_of_issue,
            date_of_expiry: document.date_of_expiry,
        })),
        ...(client?.certifications || []).map((certificate) => ({
            name: certificate.name || 'Certificate of Competency',
            number: certificate.certificate_number,
            place_of_issue: certificate.place_of_issue,
            date_of_issue: certificate.date_of_issue,
            date_of_expiry: certificate.date_of_expiry,
        })),
        ...(client?.proficiency || []).map((certificate) => ({
            name: certificate.name || 'Certificate of Proficiency',
            number: certificate.certificate_number,
            place_of_issue: certificate.place_of_issue,
            date_of_issue: certificate.date_of_issue,
            date_of_expiry: certificate.date_of_expiry,
        })),
    ];
}

function flexFleetCourseRows(client) {
    return (client?.other_certificates || []).map((certificate) => ({
        name: certificate.name,
        certificate_number: certificate.number || certificate.certificate_number,
        place_of_issue: certificate.place_of_issue,
        date_of_issue: certificate.date_of_issue,
        date_of_expiry: certificate.date_of_expiry,
    }));
}

function CheckBox({ label, checked = false }) {
    return (
        <span className="mr-3 inline-flex items-center gap-1 whitespace-nowrap">
            <span className="inline-flex h-3 w-3 items-center justify-center border border-black text-[9px] leading-none">
                {checked ? 'X' : ''}
            </span>
            {label}
        </span>
    );
}

function splitCoverallAndShoe(valueText) {
    const text = String(valueText || '').trim();

    if (! text) {
        return ['', ''];
    }

    const parts = text.split(/[\/,|]/).map((part) => part.trim()).filter(Boolean);

    return [parts[0] || text, parts[1] || ''];
}

function ageFromDate(dateText) {
    if (! dateText) {
        return '';
    }

    const birthDate = new Date(dateText);

    if (Number.isNaN(birthDate.getTime())) {
        return '';
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasBirthdayPassed = today.getMonth() > birthDate.getMonth()
        || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (! hasBirthdayPassed) {
        age -= 1;
    }

    return `${age} yrs old`;
}

function DynamicPairRow({ leftLabel, leftValue, rightLabel, rightValue, photo = false, tall = false, rightColSpan = 1 }) {
    return (
        <tr>
            <td className={`border border-black px-2 py-1 align-top font-bold ${tall ? 'h-12' : 'h-7'}`}>
                {leftLabel && <>{leftLabel}: </>}<span className="font-normal">{upper(leftValue)}</span>
            </td>
            <td colSpan={rightColSpan} className={`border border-black px-2 py-1 align-top font-bold ${tall ? 'h-12' : 'h-7'}`}>
                {rightLabel && <>{rightLabel}: </>}<span className="font-normal">{upper(rightValue)}</span>
            </td>
            {photo && (
                <td rowSpan={6} className="w-48 border border-black p-1 text-center text-xs font-bold">
                    <div className="flex h-44 items-center justify-center">
                        {photo === true ? (
                            'PHOTO WITH WHITE BACKGROUND'
                        ) : (
                            <img src={photo} alt="Applicant" className="h-full w-full object-cover" />
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
}

function DynamicHeader() {
    return (
        <div className="mb-2 border-b-2 border-[#0072bc] pb-1">
            <div className="flex items-center gap-4">
                <img src="/images/dynamic-header.jpeg" alt="Dynamic Marine Services" className="h-14 w-48 object-contain" />
                <div className="text-[11px] font-bold leading-4 text-slate-500">
                    P.O. Box: 15201 Dubai, UAE, Phone: +9714 3245525, Fax: +9714 3245527 Email:
                    <br />
                    info@dynamicmarine.net.ae, Website: www.dynamicmarine.net
                </div>
            </div>
        </div>
    );
}

function DynamicApplicationForm({ client }) {
    const fullName = fullNameFor(client);
    const [coverallSize, shoeSize] = splitCoverallAndShoe(client?.coverall_shoe_size);
    const boilerSuitSize = client?.boiler_suit_size || coverallSize;
    const safetyShoeSize = client?.safety_shoe_size || shoeSize;
    const photo = client?.avatar ? `/storage/${client.avatar}` : true;
    const documents = documentRowsFor(client);
    const passport = findRowByName(documents, ['passport']);
    const seamanBook = findRowByName(documents, ["seaman's book", 'seaman book']);
    const certifications = client?.certifications || [];
    const nationalCoc = certifications[0] || {};
    const otherCoc = certifications[1] || {};
    const stcwRows = [
        ...(client?.gmdss_certificates || []),
        ...(client?.proficiency || []),
        ...(client?.vaccinations || []),
    ];
    const namedStcwRows = [
        'T-BOSIET (OPITO Approved)',
        'H2S Training (OPITO Approved)',
        'ADNOC Offshore Safety Induction',
        'ADNOC Welding Safety',
        'ADNOC Safe Lifting',
    ].map((name) => {
        const match = findRowByName(stcwRows, [name]);

        return {
            name,
            number: match.number || match.certificate_number,
            date_of_issue: match.date_of_issue,
            date_of_expiry: match.date_of_expiry,
            place_of_issue: match.place_of_issue,
        };
    });
    const seaServiceRows = (client?.sea_service || []).map((row) => ({
        ...row,
        type_make: row.type_imo_number,
        grt_hp_kw: [row.grt, row.main_engine_kw].filter(Boolean).join(' / '),
        operation_details: [row.area_of_operation, row.oilfield_yn, row.propulsion_type].filter(Boolean).join(' / '),
        company: row.ship_owner_manager_contact,
        end_client: '',
    }));
    const documentColumns = [
        { key: 'number', label: 'NUMBER' },
        { key: 'date_of_issue', label: 'DATE OF ISSUE' },
        { key: 'date_of_expiry', label: 'EXPIRY DATE' },
        { key: 'place_of_issue', label: 'PLACE OF ISSUE' },
    ];

    return (
        <>
            <section className="print-page print-page-landscape min-h-[790px] w-[1120px] max-w-full bg-white p-6 shadow-sm print:w-full">
                <DynamicHeader />
                <table className="w-full table-fixed border-collapse text-[11px]">
                    <tbody>
                        <DynamicPairRow leftLabel="First Name" leftValue={client?.first_name || fullName} rightLabel="Surname" rightValue={client?.last_name} photo={photo} />
                        <DynamicPairRow leftLabel="Rank/Post" leftValue={client?.position_applied_for || client?.current_position} rightLabel="Nationality" rightValue={client?.nationality} />
                        <DynamicPairRow leftLabel="Permanent Address" leftValue={client?.current_home_address} rightLabel="Current Address" rightValue={client?.current_home_address} tall />
                        <DynamicPairRow leftLabel="Date of Birth" leftValue={client?.date_of_birth} rightLabel="Age" rightValue={ageFromDate(client?.date_of_birth)} />
                        <DynamicPairRow leftLabel="Height cm" leftValue={client?.height_cm} rightLabel="Body Weight & BMI" rightValue={client?.body_weight_bmi} />
                        <DynamicPairRow leftLabel="Coverall Size" leftValue={boilerSuitSize} rightLabel="Shoe Size" rightValue={safetyShoeSize} />
                        <DynamicPairRow leftLabel="Religion" leftValue={client?.religion} rightLabel="Nearest Airport" rightValue={client?.nearest_airport} rightColSpan={2} />
                        <DynamicPairRow leftLabel="Mobile" leftValue={client?.personal_mobile_no} rightLabel="Next of Kin Name" rightValue={client?.next_of_kin} rightColSpan={2} />
                        <DynamicPairRow leftLabel="WhatsApp" leftValue={client?.whatsapp_number} rightLabel="Emergency Contact Person" rightValue={client?.contact_person} rightColSpan={2} />
                        <DynamicPairRow leftLabel="Home Tel" leftValue={client?.telephone_numbers || client?.fax_no} rightLabel="Next of Kin Relation" rightValue={client?.relationship} rightColSpan={2} />
                        <DynamicPairRow leftLabel="Email" leftValue={client?.email_address || client?.email} rightLabel="Emergency Contact Number" rightValue={client?.emergency_contact} rightColSpan={2} />
                        <DynamicPairRow leftLabel="Current Salary" leftValue={client?.last_salary} rightLabel="" rightValue="" rightColSpan={2} />
                        <DynamicPairRow leftLabel="Expected Salary" leftValue={client?.expected_salary} rightLabel="" rightValue="" rightColSpan={2} />
                    </tbody>
                </table>

                <SimpleTable
                    title="DOCUMENTS"
                    columns={documentColumns}
                    rows={[
                        { ...passport, name: 'Passport' },
                        { ...seamanBook, name: 'Seaman Book' },
                    ]}
                    minRows={2}
                    rowLabelKey="name"
                />
                <SimpleTable
                    title="COC"
                    columns={documentColumns}
                    rows={[
                        { name: 'National', number: nationalCoc.certificate_number, date_of_issue: nationalCoc.date_of_issue, date_of_expiry: nationalCoc.date_of_expiry, place_of_issue: nationalCoc.place_of_issue },
                        { name: 'Others', number: otherCoc.certificate_number, date_of_issue: otherCoc.date_of_issue, date_of_expiry: otherCoc.date_of_expiry, place_of_issue: otherCoc.place_of_issue },
                    ]}
                    minRows={2}
                    rowLabelKey="name"
                />
                <SimpleTable title="FLAG ENDORESMENT" columns={documentColumns} rows={client?.flag_documents || []} minRows={3} rowLabelKey="name" />
                <SimpleTable title="STCW CERTIFICATES" columns={documentColumns} rows={[...stcwRows, ...namedStcwRows]} minRows={20} rowLabelKey="name" />
                <SimpleTable title="OTHER CERTIFICATES" columns={documentColumns} rows={client?.other_certificates || []} minRows={15} rowLabelKey="name" />
            </section>

            <section className="print-page print-page-landscape min-h-[790px] w-[1120px] max-w-full bg-white p-6 shadow-sm print:w-full">
                <DynamicHeader />
                <h2 className="mb-2 text-center text-sm font-bold">Sea Service History</h2>
                <table className="print-wide-table w-full table-fixed border-collapse text-[10px]">
                    <thead>
                        <tr>
                            {[
                                'Vessel Name',
                                'Type/Make',
                                'GRT/HP/KW',
                                'Rank',
                                'Type of Operation Brief Details',
                                'Company',
                                'End Client',
                                'Area of Operation',
                                'Sign-on',
                                'Sign-off',
                            ].map((label) => (
                                <th key={label} className="border border-black px-1 py-1">{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowsWithMinimum(seaServiceRows, 12).map((row, index) => (
                            <tr key={index}>
                                {[
                                    row.vessel_name,
                                    row.type_make,
                                    row.grt_hp_kw,
                                    row.position,
                                    row.operation_details,
                                    row.company,
                                    row.end_client,
                                    row.area_of_operation,
                                    row.from_date,
                                    row.to_date,
                                ].map((text, cellIndex) => (
                                    <td key={cellIndex} className="h-10 border border-black px-1 py-1 align-top">{upper(text)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </>
    );
}

function ZmiApplicationForm({ client }) {
    const { companySettings, certificateOptions = {} } = usePage().props;
    const company = companySettings || {};
    const fullName = fullNameFor(client);
    const documents = documentRowsFor(client);
    const passport = findRowByName(documents, ['passport']);
    const seamanBook = findRowByName(documents, ["seaman's book", 'seaman book']);
    const allCertificates = certificateRowsFor(client);
    const coc = mostRecentRow(client?.certifications || []);
    const gmdss = mostRecentRow(client?.gmdss_certificates || []);
    const [legacyBoilerSuitSize, legacySafetyShoeSize] = splitCoverallAndShoe(client?.coverall_shoe_size);
    const boilerSuitSize = client?.boiler_suit_size || legacyBoilerSuitSize;
    const safetyShoeSize = client?.safety_shoe_size || legacySafetyShoeSize;
    const defaultStcwNames = [
        'Basic Safety Training',
        'Personal Survival Techniques',
        'Proficiency in Survival Crafts & Rescue Boats',
        'Basic / Advanced Fire Fighting',
        'Basic First Aid / Medical Care / Medical First Aid',
        'Personal Safety & Social Responsibility',
        'Automatic Radar Plotting Aid [ARPA]',
        'Radar Observer Course [ROC]',
        'Ships Security Awareness / Officer',
        'ECDIS',
        'Bridge/Engine resource management',
        'DP Certificate / Maintenance',
    ];
    const defaultOffshoreNames = ['BOSIET - OPITO', 'H2S - OPITO', 'HERTM - OPITO', 'HERTL - OPITO'];
    const stcwNames = (certificateOptions.stcw || []).length
        ? certificateOptions.stcw.map((option) => option.label || option.value).filter(Boolean)
        : defaultStcwNames;
    const offshoreNames = (certificateOptions.offshore || []).length
        ? certificateOptions.offshore.map((option) => option.label || option.value).filter(Boolean)
        : defaultOffshoreNames;
    const additionalStcwRows = client?.additional_stcw_certificates || [];
    const offshoreTrainingRows = client?.offshore_training_certificates || [];
    const stcwSourceRows = [...allCertificates, ...additionalStcwRows];
    const offshoreSourceRows = [...allCertificates, ...offshoreTrainingRows];
    const namedStcwRows = stcwNames.map((name) => ({ ...findRowByName(stcwSourceRows, [name]), name }));
    const extraStcwRows = additionalStcwRows.filter((row) => ! stcwNames.some((name) => String(row?.name || '').toLowerCase() === name.toLowerCase()));
    const namedOffshoreRows = offshoreNames.map((name) => ({ ...findRowByName(offshoreSourceRows, [name]), name }));
    const extraOffshoreRows = offshoreTrainingRows.filter((row) => ! offshoreNames.some((name) => String(row?.name || '').toLowerCase() === name.toLowerCase()));
    const stcwRows = [...namedStcwRows, ...extraStcwRows];
    const offshoreRows = [...namedOffshoreRows, ...extraOffshoreRows];
    const referenceRows = rowsWithMinimum(client?.employment_history || [], 2);
    const ZmiHeader = ({ page }) => (
        <div className="mb-3 grid grid-cols-[145px_1fr_265px] border-l border-t border-black text-xs text-slate-600">
            <div className="flex items-center justify-center border-b border-r border-black px-3 py-2">
                <img src="/images/zmi-holdings-header.jpeg" alt="ZMI Holdings" className="h-9 w-full object-contain" />
            </div>
            <div className="flex items-center justify-center border-b border-r border-black px-3 py-2 text-center text-base font-bold leading-5 text-slate-500">
                FLEET PERSONNEL MANUAL
                <br />
                FORMS
            </div>
            <div className="grid grid-cols-[1fr_1fr]">
                <div className="border-b border-r border-black px-2 py-1">Document No.</div>
                <div className="border-b border-r border-black px-2 py-1">FPM-SP-03-01</div>
                <div className="border-b border-r border-black px-2 py-1">Revision No. & Date</div>
                <div className="border-b border-r border-black px-2 py-1">01, 01.05.2025</div>
                <div className="border-b border-r border-black px-2 py-1">Page</div>
                <div className="border-b border-r border-black px-2 py-1">{page}</div>
            </div>
        </div>
    );
    const ZmiFooter = () => (
        <div className="zmi-footer pointer-events-none absolute bottom-6 left-8">
            <img src="/images/zmi-holdings-header.jpeg" alt="ZMI Holdings" className="h-8 w-40 object-contain opacity-35" />
        </div>
    );
    const ZmiCell = ({ label, valueText, children, colSpan = 1, className = '' }) => (
        <td colSpan={colSpan} className={`border border-black px-2 py-1 align-top ${className}`}>
            {label && <span className="font-bold">{label}: </span>}
            {children || <span>{upper(valueText)}</span>}
        </td>
    );
    const ZmiTitleRow = ({ children, colSpan = 4 }) => (
        <tr>
            <td colSpan={colSpan} className="border border-black bg-slate-100 px-2 py-1 text-center text-xs font-bold">
                {children}
            </td>
        </tr>
    );
    const ZmiCertificateTable = ({ title, rows, minRows }) => (
        <section className="mt-3">
            <table className="w-full border-collapse text-[10px]">
                <thead>
                    <tr>
                        <th colSpan={4} className="border border-black bg-slate-100 px-2 py-1 text-center font-bold">{title}</th>
                    </tr>
                    <tr>
                        <th className="border border-black px-2 py-1 text-left">Certificate</th>
                        <th className="border border-black px-2 py-1">Issue Date</th>
                        <th className="border border-black px-2 py-1">Expiry Date</th>
                        <th className="border border-black px-2 py-1">Issued At</th>
                    </tr>
                </thead>
                <tbody>
                    {rowsWithMinimum(rows, minRows).map((row, index) => (
                        <tr key={index}>
                            <td className="h-7 border border-black px-2 py-1 font-medium">{upper(row.name)}</td>
                            <td className="border border-black px-2 py-1">{upper(row.date_of_issue)}</td>
                            <td className="border border-black px-2 py-1">{upper(row.date_of_expiry)}</td>
                            <td className="border border-black px-2 py-1">{upper(row.place_of_issue)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );

    return (
        <>
            <section className="zmi-page zmi-page-portrait print-page print-page-portrait relative min-h-[1120px] bg-white p-8 pb-20 shadow-sm">
                <ZmiHeader page="1 of 4" />
                <table className="w-full table-fixed border-collapse text-[10px]">
                    <tbody>
                        <tr>
                            <ZmiCell label="Name of Applicant" valueText={client?.last_name} />
                            <ZmiCell valueText={client?.first_name} />
                            <ZmiCell valueText={client?.middle_name} />
                            <td rowSpan={7} className="w-28 border border-black p-1 text-center text-[9px]">
                                {client?.avatar ? <img src={`/storage/${client.avatar}`} alt={fullName} className="h-32 w-full object-cover" /> : 'Photo'}
                            </td>
                        </tr>
                        <tr className="text-center text-[9px]"><td className="border border-black">(Surname)</td><td className="border border-black">(Given Name)</td><td className="border border-black">(Middle Name)</td></tr>
                        <tr><ZmiCell label="Rank Applied for" valueText={client?.position_applied_for} colSpan={3} /></tr>
                        <tr><ZmiCell label="Date of Application" valueText={client?.date_applied} colSpan={3} /></tr>
                        <tr><ZmiCell label="Direct Application" colSpan={3}><CheckBox label="Yes" /><CheckBox label="No" checked /> <span className="text-[9px]">(if No, indicate below the agency name)</span></ZmiCell></tr>
                        <tr><ZmiCell label="Agency Name" valueText={company.company_name || 'Alpha Omega Crewing Mgmt Inc.'} colSpan={3} /></tr>
                        <tr><ZmiCell label="Availability" valueText="Anytime" colSpan={3} /></tr>
                        <ZmiTitleRow>Basic Information</ZmiTitleRow>
                        <tr><ZmiCell label="Nationality" valueText={client?.nationality} colSpan={2} /><ZmiCell label="Mother Full Name" valueText={client?.mothers_maiden_name} colSpan={2} /></tr>
                        <tr><ZmiCell label="Religion" valueText={client?.religion} colSpan={2} /><ZmiCell label="Sector / Sub caste" valueText={client?.sector_sub_caste} colSpan={2} /></tr>
                        <tr><ZmiCell label="Date of Birth & Age" valueText={client?.date_of_birth} colSpan={2} /><ZmiCell label="Place & Country Of Birth" valueText={client?.place_of_birth} colSpan={2} /></tr>
                        <tr><ZmiCell label="Permanent Address" valueText={client?.current_home_address} colSpan={4} /></tr>
                        <tr><ZmiCell label="Telephone Numbers" valueText={client?.telephone_numbers || client?.fax_no} colSpan={2} /><ZmiCell label="Mobile No. (Home)" valueText={client?.personal_mobile_no} colSpan={2} /></tr>
                        <tr><ZmiCell label="Email" valueText={client?.email_address || client?.email} colSpan={2} /><ZmiCell label="WhatsApp No." valueText={client?.whatsapp_number} colSpan={2} /></tr>
                        <tr>
                            <ZmiCell label="Marital Status (please mark)" colSpan={4}>
                                <CheckBox label="Married" checked={String(client?.status || '').toLowerCase() === 'married'} />
                                <CheckBox label="Single" checked={String(client?.status || '').toLowerCase() === 'single'} />
                                <CheckBox label="Other:" checked={Boolean(client?.status) && ! ['married', 'single'].includes(String(client?.status).toLowerCase())} />
                                {client?.status && ! ['married', 'single'].includes(String(client.status).toLowerCase()) ? ` ${upper(client.status)}` : ''}
                            </ZmiCell>
                        </tr>
                        <tr><ZmiCell label="Next of kin / Relative to be contacted (in case of emergency)" colSpan={4}>Name: {upper(client?.next_of_kin)} &nbsp;&nbsp; Relation: {upper(client?.relationship)}</ZmiCell></tr>
                        <tr><ZmiCell label="Emergency Contact Person" valueText={client?.contact_person} colSpan={2} /><ZmiCell label="Emergency Contact Number" valueText={client?.emergency_contact} colSpan={2} /></tr>
                        <tr><ZmiCell label="Nearest International Airport, Country" valueText={client?.nearest_airport} colSpan={4} /></tr>
                        <tr><ZmiCell label="Passport Number" valueText={passport.number} colSpan={2} /><ZmiCell label="Date Issued" valueText={passport.date_of_issue} colSpan={2} /></tr>
                        <tr><ZmiCell label="Country of Issue" valueText={passport.place_of_issue} colSpan={2} /><ZmiCell label="Expiry Date" valueText={passport.date_of_expiry} colSpan={2} /></tr>
                        <tr><ZmiCell label="Seaman Book Number" valueText={seamanBook.number} colSpan={2} /><ZmiCell label="Date Issued" valueText={seamanBook.date_of_issue} colSpan={2} /></tr>
                        <tr><ZmiCell label="Country of Issue" valueText={seamanBook.place_of_issue} colSpan={2} /><ZmiCell label="Expiry Date" valueText={seamanBook.date_of_expiry} colSpan={2} /></tr>
                        <ZmiTitleRow>PPE Details</ZmiTitleRow>
                        <tr><ZmiCell label="Boiler Suite Size" valueText={boilerSuitSize} colSpan={2} /><ZmiCell label="Safety Shoe Size" valueText={safetyShoeSize} colSpan={2} /></tr>
                        <ZmiTitleRow>Certificate of Competency Details</ZmiTitleRow>
                        <tr><ZmiCell label="Certificate Grade" valueText={coc.name} colSpan={2} /><ZmiCell label="Expiry Date" valueText={coc.date_of_expiry} colSpan={2} /></tr>
                        <tr><ZmiCell label="Certificate Number" valueText={coc.certificate_number} colSpan={2} /><ZmiCell label="Country Of Issue" valueText={coc.place_of_issue} colSpan={2} /></tr>
                        <tr><ZmiCell label="STCW Regulation" valueText={coc.stcw_regulation} colSpan={2} /><ZmiCell label="Revalidation Date" valueText={coc.revalidation_date} colSpan={2} /></tr>
                        <tr><ZmiCell label="Endorsement Number" valueText={coc.endorsement_number} colSpan={2} /><ZmiCell label="Expiry Date" valueText={coc.endorsement_expiry_date} colSpan={2} /></tr>
                        <ZmiTitleRow>GMDSS Certificate Details</ZmiTitleRow>
                        <tr><ZmiCell label="Certificate Number" valueText={gmdss.certificate_number || gmdss.number} colSpan={2} /><ZmiCell label="Expiry Date" valueText={gmdss.date_of_expiry} colSpan={2} /></tr>
                        <tr><ZmiCell label="Endorsement Number" valueText={gmdss.endorsement_number} colSpan={2} /><ZmiCell label="Expiry Date" valueText={gmdss.endorsement_expiry_date} colSpan={2} /></tr>
                    </tbody>
                </table>
                <ZmiFooter />
            </section>

            <section className="zmi-page zmi-page-portrait print-page print-page-portrait relative min-h-[1120px] bg-white p-8 pb-20 shadow-sm">
                <ZmiHeader page="2 of 4" />
                <table className="w-full table-fixed border-collapse text-[10px]">
                    <tbody>
                        <ZmiTitleRow colSpan={7}>Flag Documents (If the document is available, provide the expiry date)</ZmiTitleRow>
                        <tr className="text-center font-bold"><td className="border border-black px-1 py-1">Flag</td><td colSpan={2} className="border border-black px-1 py-1">COC</td><td colSpan={2} className="border border-black px-1 py-1">Endorsement</td><td colSpan={2} className="border border-black px-1 py-1">Seaman's Book</td></tr>
                        <tr className="text-center font-bold"><td className="border border-black px-1 py-1" /><td className="border border-black px-1 py-1">Available</td><td className="border border-black px-1 py-1">Expiry Date</td><td className="border border-black px-1 py-1">Available</td><td className="border border-black px-1 py-1">Expiry Date</td><td className="border border-black px-1 py-1">Available</td><td className="border border-black px-1 py-1">Expiry Date</td></tr>
                        {['St. Vincent', 'Panama', 'Others: (Specify)'].map((flag) => {
                            const flagRow = findRowByName(client?.flag_documents || [], [flag]);
                            return (
                                <tr key={flag}>
                                    <td className="border border-black px-2 py-1 font-bold">{flag}</td>
                                    {[0, 1, 2].map((index) => (
                                        <React.Fragment key={index}>
                                            <td className="border border-black px-2 py-1"><CheckBox label="Yes" /><CheckBox label="No" /></td>
                                            <td className="border border-black px-2 py-1">{upper(index === 0 ? flagRow.date_of_expiry : '')}</td>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            );
                        })}
                        <ZmiTitleRow colSpan={7}>Client Approval</ZmiTitleRow>
                        <tr><td colSpan={7} className="border border-black px-2 py-1">Do you have the valid document for the below? If yes, indicate the issue date.</td></tr>
                        <tr><td colSpan={7} className="border border-black px-2 py-1 font-bold">Client Approval Client Name: <span className="font-normal">&nbsp;</span><CheckBox label="Yes" /><CheckBox label="No" /> Issue Date: _____________________</td></tr>
                    </tbody>
                </table>
                <ZmiCertificateTable title="STCW Certificate Details - All must be valid. If validity of certificate is not mentioned, expiry dates to be considered as 3 years from date of issue." rows={stcwRows} minRows={12} />
                <ZmiCertificateTable title="Offshore Training Certificate Details" rows={offshoreRows} minRows={4} />
                <section className="mt-3">
                    <table className="w-full border-collapse text-[10px]">
                        <tbody>
                            <tr><td colSpan={5} className="border border-black bg-slate-100 px-2 py-1 text-center font-bold">Reference From Last Two Employers [All details are Mandatory]</td></tr>
                            {referenceRows.slice(0, 2).map((row, index) => (
                                <React.Fragment key={index}>
                                    <tr><td className="border border-black px-2 py-1 font-bold">Company {index + 1}</td><td colSpan={4} className="border border-black px-2 py-1">Company Name (not the manning agents, must be Owners): {upper(row.company)}</td></tr>
                                    <tr><td colSpan={3} className="border border-black px-2 py-1">Contact Person Name: {upper(row.contact_person_name)}</td><td colSpan={2} className="border border-black px-2 py-1">Designation: {upper(row.designation)}</td></tr>
                                    <tr><td colSpan={3} className="border border-black px-2 py-1">Contact Numbers: {upper(row.contact_person_number)}</td><td colSpan={2} className="border border-black px-2 py-1">Country: {upper(row.country)}</td></tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </section>
                <ZmiFooter />
            </section>

            <section className="zmi-page zmi-page-landscape print-page print-page-landscape relative min-h-[790px] w-[1120px] max-w-full bg-white p-8 pb-20 shadow-sm print:w-full">
                <ZmiHeader page="3 of 4" />
                <SeaServiceTable rows={client?.sea_service || []} />
                <p className="mt-4 text-xs font-bold">Note: Type of Engines &amp; BHP: Mandatory for Engineers</p>
                <ZmiFooter />
            </section>

            <section className="zmi-page zmi-page-landscape print-page print-page-landscape relative min-h-[790px] w-[1120px] max-w-full bg-white p-8 pb-20 shadow-sm print:w-full">
                <ZmiHeader page="4 of 4" />
                <ConfirmationBlock />
                <DeckOfficerTable rows={client?.deck_officer_experience || []} />
                <ZmiFooter />
            </section>
        </>
    );
}

function FleetApplicationForm({ client, title, heading = title, showDocumentHeader = true }) {
    const fullName = fullNameFor(client);
    const documentRows = flexFleetDocumentRows(client);
    const courseRows = flexFleetCourseRows(client);
    const isFlexFleet = !showDocumentHeader;
    const seaServiceRows = (client?.sea_service || []).map((row, index) => ({
        ...row,
        no: index + 1,
    }));
    const FlexFleetHeader = () => (
        <div className="mb-9 grid grid-cols-[72px_1fr_72px] items-start text-center">
            <img src="/images/flex-fleet-corner-logo.png" alt="Flex Fleet" className="h-16 w-16 object-contain" />
            <div className="pt-1 text-sm font-medium text-slate-500">{heading}</div>
            <img src="/images/flex-fleet-corner-logo.png" alt="Flex Fleet" className="ml-auto h-16 w-16 object-contain" />
        </div>
    );

    return (
        <>
            <section className={`print-page print-page-portrait min-h-[1120px] bg-white shadow-sm ${isFlexFleet ? 'flex-fleet-page p-6' : 'p-8'}`}>
                <div className={isFlexFleet ? 'flex-fleet-frame min-h-[1055px] rounded-[34px] border-2 border-slate-400 px-7 py-5' : ''}>
                {showDocumentHeader && <Header client={client} page={`${title} Page 1 of 2`} />}
                {isFlexFleet ? <FlexFleetHeader /> : <h1 className="mb-3 text-center text-base font-bold">{heading}</h1>}
                <h2 className="mb-2 text-center text-sm font-bold">PERSONAL PARTICULAR</h2>
                <CompanyFieldGrid
                    fields={[
                        ['Full Name', fullName],
                        ['Rank', client?.position_applied_for || client?.current_position],
                        ['Place & DOB', [client?.place_of_birth, client?.date_of_birth].filter(Boolean).join(' / ')],
                        ['Next of Kin (NOK)', client?.next_of_kin],
                        ['Nationality', client?.nationality],
                        ['Relation of NOK', client?.relationship],
                        ['Marital Status', client?.status],
                        ['Husband/Wife Name', client?.wife_name],
                        ['Religion', client?.religion],
                        ["Husband/Wife I/C No", client?.wife_ic_no],
                        ['Contact Number', client?.personal_mobile_no],
                        ['WhatsApp Number', client?.whatsapp_number],
                        ["Husband/Wife's Occupation", client?.wife_occupation],
                        ['EPF No', client?.epf_no],
                        ['Emergency Contact Person', client?.contact_person],
                        ['Contact Number NOK', client?.emergency_contact],
                        ['SOCSO No', client?.socso_no],
                        ['No of Children', client?.dependents?.length || ''],
                        ['Income Tax No', ''],
                        ['Marriage Date', client?.marriage_date],
                        ['Current Address', client?.current_home_address],
                        ["Husband/Wife's Income Tax No", client?.wife_income_tax_no],
                        ['Date of Join', client?.date_applied],
                        ['Employee Code', client?.e_registration_number],
                        ['Height', client?.height_cm],
                        ['Blood', client?.blood],
                        ['Weight', client?.body_weight_bmi],
                    ]}
                />
                <SimpleTable
                    title="Document and Certificate Details"
                    columns={[
                        { key: 'number', label: 'Document No' },
                        { key: 'place_of_issue', label: 'Place Issued' },
                        { key: 'date_of_issue', label: 'Date Issued' },
                        { key: 'date_of_expiry', label: 'Expiry Date' },
                    ]}
                    rows={documentRows}
                    minRows={documentRows.length}
                    rowLabelKey="name"
                />
                <SimpleTable
                    title="Course Details"
                    columns={[
                        { key: 'certificate_number', label: 'Document No' },
                        { key: 'place_of_issue', label: 'Place Issued' },
                        { key: 'date_of_issue', label: 'Date Issued' },
                        { key: 'date_of_expiry', label: 'Expiry Date' },
                    ]}
                    rows={courseRows}
                    minRows={courseRows.length}
                    rowLabelKey="name"
                />
                </div>
            </section>

            <section className={`print-page print-page-portrait min-h-[1120px] bg-white shadow-sm ${isFlexFleet ? 'flex-fleet-page p-6' : 'p-8'}`}>
                <div className={isFlexFleet ? 'flex-fleet-frame min-h-[1055px] rounded-[34px] border-2 border-slate-400 px-7 py-5' : ''}>
                {showDocumentHeader && <Header client={client} page={`${title} Page 2 of 2`} />}
                {isFlexFleet && <FlexFleetHeader />}
                <h2 className="mb-2 text-center text-sm font-bold">RECORD OF SEA SERVICE</h2>
                <table className="w-full border-collapse text-[10px]">
                    <thead>
                        <tr>
                            {[
                                'No',
                                'Vessel',
                                'Company',
                                'Sign On',
                                'Sign Off',
                                'No. of Days',
                                'Rank',
                                'Vessel Type',
                            ].map((label) => (
                                <th key={label} className="border border-black px-1 py-1">{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowsWithMinimum(seaServiceRows, 8).map((row, index) => (
                            <tr key={index}>
                                {[
                                    row.no,
                                    row.vessel_name,
                                    row.ship_owner_manager_contact,
                                    row.from_date,
                                    row.to_date,
                                    row.duration_days,
                                    row.position,
                                    row.type_imo_number,
                                ].map((text, cellIndex) => (
                                    <td key={cellIndex} className="h-8 border border-black px-1 py-1 align-top">{upper(text)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-8 grid grid-cols-[1.7fr_1fr] border border-black text-xs text-slate-600">
                    <div className="min-h-24 border-r border-black">
                        <div className="border-b border-black px-3 py-0.5">Date</div>
                        <div className="px-2 py-1">Comment:</div>
                    </div>
                    <div className="min-h-24" />
                </div>
                <div className="mt-8 text-xs text-slate-500">
                    Notes: *Please delete or change if there is an additional certificate.
                </div>
                </div>
            </section>
        </>
    );
}

const FORM_TITLES = {
    complete: 'Complete Print Preview',
    personal: 'Personal Data Printout',
    certificates: 'Certificates and References Printout',
    sea_service: 'Sea Service Printout',
    deck_officer: 'Deck Officer Experience Printout',
    zmi: 'ZMI Application Form',
    flex_fleet: 'Flex Fleet Application Form',
    dynamic: 'Dynamic Application Form',
};

export default function PrintPreview({ client, printForm = 'complete' }) {
    const fullName = fullNameFor(client);
    const selectedForm = FORM_TITLES[printForm] ? printForm : 'complete';
    const isComplete = selectedForm === 'complete';
    const showPersonal = isComplete || selectedForm === 'personal';
    const showCertificates = isComplete || selectedForm === 'certificates';
    const showSeaService = isComplete || selectedForm === 'sea_service';
    const showDeckOfficer = isComplete || selectedForm === 'deck_officer';
    const showZmi = selectedForm === 'zmi';
    const showFlexFleet = selectedForm === 'flex_fleet';
    const showDynamic = selectedForm === 'dynamic';
    const visiblePageCount = [showPersonal, showCertificates, showSeaService, showDeckOfficer].filter(Boolean).length;
    const pageLabel = (pageNumber) => `Page ${pageNumber} of ${visiblePageCount}`;
    const personalFields = [
        ['Current Position', client?.current_position],
        ['First Name', client?.first_name], ['Middle Name', client?.middle_name], ['Last Name', client?.last_name],
        ['Gender', client?.gender], ['Status', client?.status], ['Work Experience', client?.type_of_job],
        ['Place Of Birth', client?.place_of_birth], ['Date of Birth', client?.date_of_birth],
        ['Position applied for', client?.position_applied_for], ["Mother's Maiden Name", client?.mothers_maiden_name],
        ['Religion', client?.religion], ['Sector / Sub caste', client?.sector_sub_caste], ["Father's Name", client?.fathers_name], ['Next of Kin', client?.next_of_kin],
        ['Current Home Address', client?.current_home_address], ['Relationship', client?.relationship],
        ['Nationality', client?.nationality], ['Emergency Contact Person', client?.contact_person],
        ['Emergency Contact Number', client?.emergency_contact],
        ['Educational Attainment', client?.educational_attainment], ['Fax No.', client?.fax_no],
        ['Telephone Numbers', client?.telephone_numbers],
        ['Body Weight and BMI', client?.body_weight_bmi], ['Personal Mobile No.', client?.personal_mobile_no],
        ['WhatsApp Number', client?.whatsapp_number], ['Email Address', client?.email_address || client?.email],
        ['Height in cm', client?.height_cm],
        ['Last Salary', client?.last_salary], ['Expected Salary', client?.expected_salary],
        ['Coverall and Shoe Size', client?.coverall_shoe_size], ['Safety Shoe Size', client?.safety_shoe_size], ['Boiler Suit Size', client?.boiler_suit_size],
        ['E-registration Number', client?.e_registration_number], ['Nearest Airport', client?.nearest_airport],
        ['Husband/Wife Name', client?.wife_name], ["Husband/Wife I/C No", client?.wife_ic_no], ["Husband/Wife's Occupation", client?.wife_occupation],
        ['Marriage Date', client?.marriage_date], ["Husband/Wife's Income Tax No", client?.wife_income_tax_no],
        ['SSS No.', client?.sss_no], ['Pag-ibig No.', client?.pagibig_no], ['EPF No', client?.epf_no], ['SOCSO No', client?.socso_no],
        ['Blood', client?.blood], ['Philhealth No.', client?.philhealth_no],
    ];

    const competencyColumns = [
        { key: 'name', label: 'Certificate Grade' },
        { key: 'certificate_number', label: 'Certificate Number' },
        { key: 'stcw_regulation', label: 'STCW Regulation' },
        { key: 'endorsement_number', label: 'Endorsement Number' },
        { key: 'place_of_issue', label: 'Country Of Issue' },
        { key: 'date_of_expiry', label: 'Expiry Date' },
        { key: 'revalidation_date', label: 'Revalidation Date' },
        { key: 'endorsement_expiry_date', label: 'Endorsement Expiry Date' },
    ];
    const certificateColumns = [
        { key: 'name', label: 'Name' },
        { key: 'certificate_number', label: 'Certificate Number' },
        { key: 'place_of_issue', label: 'Place of Issue' },
        { key: 'date_of_issue', label: 'Date of Issue' },
        { key: 'date_of_expiry', label: 'Date of Expiry' },
    ];
    const numberColumns = [
        { key: 'name', label: 'Name' },
        { key: 'number', label: 'Number' },
        { key: 'place_of_issue', label: 'Place of Issue' },
        { key: 'date_of_issue', label: 'Date of Issue' },
        { key: 'date_of_expiry', label: 'Date of Expiry' },
    ];

    return (
        <AdminTabs activeTab="clients" title={FORM_TITLES[selectedForm]}>
            <div className="min-h-screen bg-slate-100 py-5 text-slate-950 print:bg-white print:py-0">
            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 6mm; }
                    @page portraitPage { size: A4 portrait; margin: 10mm; }
                    @page landscapePage { size: A4 landscape; margin: 6mm; }
                    .print-page-portrait { page: portraitPage; }
                    .print-page-landscape { page: landscapePage; }
                    .print-document { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .print-page { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; min-height: auto !important; padding: 0 !important; page-break-after: always; break-after: page; }
                    .print-page-landscape { width: 285mm !important; max-width: 285mm !important; }
                    .print-page-portrait { width: 190mm !important; max-width: 190mm !important; }
                    .flex-fleet-page { padding: 0 !important; }
                    .flex-fleet-frame { min-height: 277mm !important; border-radius: 12mm !important; padding: 7mm 8mm !important; }
                    .zmi-page { position: relative !important; padding-bottom: 18mm !important; overflow: hidden !important; }
                    .zmi-page-portrait { min-height: 277mm !important; height: 277mm !important; }
                    .zmi-page-landscape { min-height: 198mm !important; height: 198mm !important; }
                    .zmi-footer { bottom: 6mm !important; left: 8mm !important; }
                    .print-page:last-child { page-break-after: auto; }
                    .print-table-scroll { overflow: visible !important; }
                    .print-wide-table { min-width: 0 !important; width: 100% !important; table-layout: fixed !important; font-size: 8px !important; }
                    .print-wide-table th,
                    .print-wide-table td { padding: 2px !important; line-height: 1.15 !important; white-space: normal !important; overflow-wrap: anywhere !important; }
                    .print-wide-table td { height: 22px !important; }
                }
            `}</style>

            <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between px-4 print:hidden">
                <Link href={route('admin.seafarers.index')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    <ArrowLeft size={16} />
                    Back to Seafarers
                </Link>
                <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold text-slate-900">{FORM_TITLES[selectedForm]}</p>
                        <p className="text-xs text-slate-500">{fullName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12364F]"
                    >
                        <Printer size={16} />
                        Print
                    </button>
                </div>
            </div>

            <main className="print-document mx-auto max-w-5xl space-y-5 px-4 print:max-w-none print:space-y-0 print:px-0">
                {showZmi && <ZmiApplicationForm client={client} />}
                {showFlexFleet && <FleetApplicationForm client={client} title="FLEX FLEET APPLICATION FORM" heading="FLEX FLEET SHIP MANAGEMENT SERVIVES LLC" showDocumentHeader={false} />}
                {showDynamic && <DynamicApplicationForm client={client} />}

                {showPersonal && (
                <section className="print-page print-page-portrait min-h-[1120px] bg-white p-8 shadow-sm">
                    <Header client={client} page={isComplete ? 'Page 1 of 4' : pageLabel(1)} />
                    <div className="mb-3 grid grid-cols-[1fr_120px] gap-4">
                        <div>
                            <div className="text-xs font-semibold">DATE APPLIED: {upper(client?.date_applied)}</div>
                            <h1 className="mt-2 text-center text-base font-bold">PERSONAL DATA</h1>
                        </div>
                        <div className="flex h-28 items-center justify-center border border-black text-xs">
                            {client?.avatar ? <img src={`/storage/${client.avatar}`} alt={fullName} className="h-full w-full object-cover" /> : 'Photo'}
                        </div>
                    </div>
                    <p className="mb-3 text-[10px]">
                        Important Note: Please fill-up form as required by AOCMI. Be sure that the information you give is accurate and complete.
                    </p>
                    <FieldGrid fields={personalFields} />
                    <SimpleTable
                        title="Dependents"
                        columns={[
                            { key: 'name', label: 'Name' },
                            { key: 'date_of_birth', label: 'Date of Birth' },
                            { key: 'relationship', label: 'Relationship' },
                            { key: 'dependent', label: 'Dependent/s' },
                            { key: 'beneficiary', label: 'Beneficiaries' },
                            { key: 'address', label: 'Address' },
                        ]}
                        rows={client?.dependents || []}
                        minRows={3}
                    />
                    <SimpleTable
                        title="Travel Documents"
                        columns={[
                            { key: 'number', label: 'Number' },
                            { key: 'place_of_issue', label: 'Place of Issue' },
                            { key: 'date_of_issue', label: 'Date of Issue' },
                            { key: 'date_of_expiry', label: 'Date of Expiry' },
                        ]}
                        rows={buildTravelDocuments(client?.travel_documents)}
                        minRows={4}
                        rowLabelKey="label"
                    />
                </section>
                )}

                {showCertificates && (
                <section className="print-page print-page-portrait min-h-[1120px] bg-white p-8 shadow-sm">
                    <Header client={client} page={isComplete ? 'Page 2 of 4' : pageLabel(1)} />
                    <SimpleTable title="Certificate of Competency" columns={competencyColumns} rows={client?.certifications || []} minRows={4} />
                    <SimpleTable title="Certificate of Profeciency" columns={certificateColumns} rows={client?.proficiency || []} minRows={10} />
                    <SimpleTable title="Vaccinations" columns={numberColumns} rows={client?.vaccinations || []} minRows={4} />
                    <SimpleTable title="Flag Documents" columns={numberColumns} rows={client?.flag_documents || []} minRows={4} />
                    <SimpleTable title="Other Certificates" columns={numberColumns} rows={client?.other_certificates || []} minRows={4} />
                    <SimpleTable
                        title="Reference From Last Two Employers"
                        columns={[
                            { key: 'company', label: 'Company' },
                            { key: 'contact_person_name', label: 'Contact Person Name' },
                            { key: 'designation', label: 'Designation' },
                            { key: 'contact_person_number', label: 'Contact Person Number' },
                            { key: 'country', label: 'Country' },
                        ]}
                        rows={client?.employment_history || []}
                        minRows={2}
                    />
                </section>
                )}

                {showSeaService && (
                <section className="print-page print-page-landscape min-h-[790px] w-[1120px] max-w-full bg-white p-8 shadow-sm print:w-full">
                    <Header client={client} page={isComplete ? 'Page 3 of 4' : pageLabel(1)} />
                    <SeaServiceTable rows={client?.sea_service || []} />
                    <p className="mt-4 text-xs font-bold">Note: Type of Engines &amp; BHP: Mandatory for Engineers</p>
                </section>
                )}

                {showDeckOfficer && (
                <section className="print-page print-page-landscape min-h-[790px] w-[1120px] max-w-full bg-white p-8 shadow-sm print:w-full">
                    <Header client={client} page={isComplete ? 'Page 4 of 4' : pageLabel(1)} />
                    <DeckOfficerTable rows={client?.deck_officer_experience || []} />
                    <div className="mt-10 border-t border-black pt-1 text-xs">Candidate Signature:</div>
                </section>
                )}
            </main>
            </div>
        </AdminTabs>
    );
}
