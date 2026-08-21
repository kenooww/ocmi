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
    }));
}

function rowsWithMinimum(rows = [], count = 4) {
    const blankRows = Array.from({ length: Math.max(count - rows.length, 0) }, () => ({}));
    return [...rows, ...blankRows];
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
        ['from_date', 'From'], ['to_date', 'To'], ['duration_months', 'Mos.'], ['duration_days', 'Days'],
        ['position', 'Position'], ['vessel_name', 'Vessel Name'], ['type_imo_number', 'Type / IMO #'],
        ['area_of_operation', 'Area of Operation'], ['flag', 'Flag'], ['oilfield_yn', 'Oilfield Y/N'],
        ['propulsion_type', 'Propulsion Type AZ, CPP'], ['grt', 'GRT'], ['bollard_pull', 'Bollard Pull'],
        ['main_engine_type_model', 'Types/Model'], ['main_engine_kw', 'KW'], ['ship_owner_manager_contact', 'Ship Owner/Management/Company'],
    ];

    return (
        <section className="mt-3">
            <h3 className="text-center text-sm font-bold">Sea Service</h3>
            <div className="print-table-scroll overflow-x-auto">
                <table className="print-wide-table w-full min-w-[1700px] border-collapse text-[10px]">
                    <thead>
                        <tr>
                            <th colSpan={2} className="border border-black px-1 py-1">( Day/Month/Year )</th>
                            <th colSpan={2} className="border border-black px-1 py-1">Duration of Sea Service</th>
                            <th rowSpan={2} className="border border-black px-1 py-1">Position</th>
                            <th rowSpan={2} className="border border-black px-1 py-1">Vessel Name</th>
                            <th colSpan={7} className="border border-black px-1 py-1">Vessel Name</th>
                            <th colSpan={2} className="border border-black px-1 py-1">Main Engine*</th>
                            <th rowSpan={2} className="border border-black px-1 py-1 text-red-600">Ship Owner/Management/Company</th>
                        </tr>
                        <tr>
                            {columns.filter(([key]) => !['position', 'vessel_name', 'ship_owner_manager_contact'].includes(key)).map(([key, label]) => (
                                <th key={key} className="border border-black px-1 py-1">{label}</th>
                            ))}
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

function flexFleetDocumentRows(client) {
    const documents = documentRowsFor(client);
    const certificates = certificateRowsFor(client);
    const passport = findRowByName(documents, ['passport']);
    const seamanBook = findRowByName(documents, ["seaman's book", 'seaman book']);
    const coc = certificates[0] || {};
    const coe = certificates[1] || {};

    return [
        { ...passport, name: 'Passport' },
        { ...seamanBook, name: 'Seaman Book' },
        { name: 'COC', number: coc.certificate_number, place_of_issue: coc.place_of_issue, date_of_issue: coc.date_of_issue, date_of_expiry: coc.date_of_expiry },
        { name: 'COE', number: coe.certificate_number, place_of_issue: coe.place_of_issue, date_of_issue: coe.date_of_issue, date_of_expiry: coe.date_of_expiry },
        { name: 'Medical Certificate' },
        { name: 'Marlins Test' },
        { name: 'H2S' },
        { name: 'Aramco Approval' },
    ];
}

function flexFleetCourseRows(client) {
    const rows = certificateRowsFor(client);
    const courseTitles = [
        'Arpa Simulator',
        'Advance Fire Fighting',
        'Basic Safety Training',
        'Bridge Resource Management',
        'Electronic Charts (ECDIS)',
        'Food Handling (Cook Cert.)',
        'General Operator Certificate',
        'ISM Code',
        'Medical First Aid / Elementary Medical Care',
        'Onboard Prof. Survival Craft & Rescue Boat',
        'Prof. GOC for GMDSS',
        'Radar Simulator',
        'Ship Security Officer',
        'Ship Security Awareness Training',
        'Security Training for Seafarer with Designated Security Duties',
    ];

    return courseTitles.map((name) => {
        const match = findRowByName(rows, [name]);

        return {
            name,
            certificate_number: match.certificate_number,
            place_of_issue: match.place_of_issue,
            date_of_issue: match.date_of_issue,
            date_of_expiry: match.date_of_expiry,
        };
    });
}

function ZmiApplicationForm({ client }) {
    const { companySettings } = usePage().props;
    const company = companySettings || {};
    const fullName = fullNameFor(client);
    const certificateColumns = [
        { key: 'name', label: 'Certificate Grade / Name' },
        { key: 'certificate_number', label: 'Certificate Number' },
        { key: 'place_of_issue', label: 'Country / Place of Issue' },
        { key: 'date_of_issue', label: 'Issue Date' },
        { key: 'date_of_expiry', label: 'Expiry Date' },
    ];

    return (
        <>
            <section className="print-page print-page-portrait min-h-[1120px] bg-white p-8 shadow-sm">
                <Header client={client} page="ZMI Page 1 of 3" />
                <h1 className="mb-3 text-center text-base font-bold">ZMI APPLICATION FORM</h1>
                <CompanyFieldGrid
                    fields={[
                        ['Name of Applicant', fullName],
                        ['Rank Applied for', client?.position_applied_for],
                        ['Date of Application', client?.date_applied],
                        ['Agency Name', company.company_name || 'Alpha Omega Crewing Mgmt Inc.'],
                        ['Availability', 'Anytime'],
                        ['Nationality', client?.nationality],
                        ['Mother Full Name', client?.mothers_maiden_name],
                        ['Religion', client?.religion],
                        ['Date of Birth', client?.date_of_birth],
                        ['Place / Country of Birth', client?.place_of_birth],
                        ['Permanent Address', client?.current_home_address],
                        ['Mobile No.', client?.personal_mobile_no],
                        ['Email', client?.email_address || client?.email],
                        ['Next of Kin', client?.next_of_kin],
                        ['Relation', client?.relationship],
                        ['Contact Details', client?.emergency_contact],
                        ['Nearest International Airport', client?.nearest_airport],
                        ['PPE Boiler Suit Size', client?.coverall_shoe_size],
                        ['Safety Shoe Size', client?.coverall_shoe_size],
                    ]}
                />
                <SimpleTable
                    title="Passport / Seaman Book Details"
                    columns={[
                        { key: 'number', label: 'Number' },
                        { key: 'place_of_issue', label: 'Country of Issue' },
                        { key: 'date_of_issue', label: 'Date Issued' },
                        { key: 'date_of_expiry', label: 'Expiry Date' },
                    ]}
                    rows={documentRowsFor(client)}
                    minRows={4}
                    rowLabelKey="name"
                />
                <SimpleTable title="Certificate of Competency / GMDSS Details" columns={certificateColumns} rows={client?.certifications || []} minRows={5} />
            </section>

            <section className="print-page print-page-portrait min-h-[1120px] bg-white p-8 shadow-sm">
                <Header client={client} page="ZMI Page 2 of 3" />
                <SimpleTable title="STCW Certificate Details" columns={certificateColumns} rows={certificateRowsFor(client)} minRows={12} />
                <SimpleTable title="Offshore Training Certificate Details" columns={certificateColumns} rows={client?.proficiency || []} minRows={4} />
                <SimpleTable
                    title="Reference From Last Two Employers"
                    columns={[
                        { key: 'company', label: 'Company Name' },
                        { key: 'contact_person_name', label: 'Contact Person Name' },
                        { key: 'designation', label: 'Designation' },
                        { key: 'contact_person_number', label: 'Contact Numbers' },
                        { key: 'country', label: 'Country' },
                    ]}
                    rows={client?.employment_history || []}
                    minRows={2}
                />
            </section>

            <section className="print-page print-page-landscape min-h-[790px] w-[1120px] max-w-full bg-white p-8 shadow-sm print:w-full">
                <Header client={client} page="ZMI Page 3 of 3" />
                <SeaServiceTable rows={client?.sea_service || []} />
                <DeckOfficerTable rows={client?.deck_officer_experience || []} />
                <div className="mt-6 grid grid-cols-3 gap-8 text-xs">
                    <div className="border-t border-black pt-1">Name: {upper(fullName)}</div>
                    <div className="border-t border-black pt-1">Rank: {upper(client?.current_position)}</div>
                    <div className="border-t border-black pt-1">Signature:</div>
                </div>
            </section>
        </>
    );
}

function FleetApplicationForm({ client, title, heading = title, showDocumentHeader = true }) {
    const fullName = fullNameFor(client);
    const documentRows = flexFleetDocumentRows(client);
    const courseRows = flexFleetCourseRows(client);
    const seaServiceRows = (client?.sea_service || []).map((row, index) => ({
        ...row,
        no: index + 1,
    }));

    return (
        <>
            <section className="print-page print-page-portrait min-h-[1120px] bg-white p-8 shadow-sm">
                {showDocumentHeader && <Header client={client} page={`${title} Page 1 of 2`} />}
                <h1 className="mb-3 text-center text-base font-bold">{heading}</h1>
                <h2 className="mb-2 text-center text-sm font-bold">PERSONAL PARTICULAR</h2>
                <CompanyFieldGrid
                    fields={[
                        ['Full Name', fullName],
                        ['Rank', client?.position_applied_for || client?.current_position],
                        ['Place & DOB', [client?.place_of_birth, client?.date_of_birth].filter(Boolean).join(' / ')],
                        ['Next of Kin (NOK)', client?.next_of_kin],
                        ['Nationality', client?.nationality],
                        ['Relation of NOK', client?.relationship],
                        ['Marital Status', ''],
                        ['Wife Name', ''],
                        ['Religion', client?.religion],
                        ["Wife I/C No", ''],
                        ['Contact Number', client?.personal_mobile_no],
                        ["Wife's Occupation", ''],
                        ['EPF No', ''],
                        ['Contact Number NOK', client?.emergency_contact],
                        ['SOCSO No', ''],
                        ['No of Children', client?.dependents?.length || ''],
                        ['Income Tax No', ''],
                        ['Marriage Date', ''],
                        ['Current Address', client?.current_home_address],
                        ["Wife's Income Tax No", ''],
                        ['Date of Join', client?.date_applied],
                        ['Employee Code', client?.e_registration_number],
                        ['Height', client?.height_cm],
                        ['Blood', ''],
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
            </section>

            <section className="print-page print-page-portrait min-h-[1120px] bg-white p-8 shadow-sm">
                {showDocumentHeader && <Header client={client} page={`${title} Page 2 of 2`} />}
                {!showDocumentHeader && <h1 className="mb-3 text-center text-base font-bold">{heading}</h1>}
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
        ['First Name', client?.first_name], ['Middle Name', client?.middle_name], ['Last Name', client?.last_name],
        ['Place Of Birth', client?.place_of_birth], ['Current Position', client?.current_position], ['Date of Birth', client?.date_of_birth],
        ['Position applied for', client?.position_applied_for], ["Mother's Maiden Name", client?.mothers_maiden_name],
        ['Religion', client?.religion], ["Father's Name", client?.fathers_name], ['Next of Kin', client?.next_of_kin],
        ['Current Home Address', client?.current_home_address], ['Relationship', client?.relationship],
        ['Nationality', client?.nationality], ['Emergency Contact Person/ Number', client?.emergency_contact],
        ['Educational Attainment', client?.educational_attainment], ['Fax No.', client?.fax_no],
        ['Body Weight and BMI', client?.body_weight_bmi], ['Personal Mobile No.', client?.personal_mobile_no],
        ['Height in cm', client?.height_cm], ['Email Address', client?.email_address || client?.email],
        ['Last Salary', client?.last_salary], ['Coverall and Shoe Size', client?.coverall_shoe_size],
        ['E-registration Number', client?.e_registration_number], ['Nearest Airport', client?.nearest_airport],
        ['SSS No.', client?.sss_no], ['Pag-ibig No.', client?.pagibig_no], ['Philhealth No.', client?.philhealth_no],
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
                {showDynamic && <FleetApplicationForm client={client} title="DYNAMIC APPLICATION FORM" />}

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
                    <SimpleTable title="Certificate of Competency" columns={certificateColumns} rows={client?.certifications || []} minRows={4} />
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
                    <div className="mt-5 text-xs">
                        <div className="font-semibold">SUMMARY:</div>
                        <div className="mt-8 border-t border-black pt-1">Candidate Signature:</div>
                    </div>
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
