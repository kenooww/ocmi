import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, ChevronDown, FileText, Mail, Phone, Printer, Ship, X } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';
import Profile from '@/Pages/Client/Sections/Profile';

const TABS = [
    { key: 'personal', label: 'Personal Information' },
    { key: 'dependents', label: 'Dependents' },
    { key: 'travel_documents', label: 'Travel Documents' },
    { key: 'certifications', label: 'Certificate of Competency' },
    { key: 'gmdss_certificates', label: 'GMDSS Certificate' },
    { key: 'proficiency', label: 'Certificate of Proficiency' },
    { key: 'vaccinations', label: 'Vaccinations' },
    { key: 'flag_documents', label: 'Flag Documents' },
    { key: 'other_certificates', label: 'Other Certificates' },
    { key: 'additional_stcw_certificates', label: 'Additional STCW Certificate' },
    { key: 'offshore_training_certificates', label: 'Offshore Training Certificate' },
    { key: 'employment_history', label: 'Employment History' },
    { key: 'sea_service', label: 'Sea Service' },
    { key: 'deck_officer_experience', label: 'Deck Officer Experience' },
];

const TRAVEL_DOCUMENT_TYPES = [
    { key: 'passport', label: 'Passport' },
    { key: 'visa', label: 'Available Visa (If Any)' },
    { key: 'seamans_book', label: "Seaman's Book" },
    { key: 'seafarers_identification_document', label: 'Seafarers Identification Document (SID)' },
];

const PRINTOUT_FORMS = [
    {
        key: 'complete',
        title: 'Complete Alpha Omega Application Form',
        description: 'Personal data, documents, certificates, sea service, and deck officer experience.',
    },
    // {
    //     key: 'personal',
    //     title: 'Personal data',
    //     description: 'Profile details, dependents, and travel documents.',
    // },
    // {
    //     key: 'certificates',
    //     title: 'Certificates and references',
    //     description: 'Competency, proficiency, vaccinations, flag documents, and employer references.',
    // },
    // {
    //     key: 'sea_service',
    //     title: 'Sea service',
    //     description: 'Sea service table and candidate signature section.',
    // },
    // {
    //     key: 'deck_officer',
    //     title: 'Deck officer experience',
    //     description: 'Deck officer vessel and operation experience table.',
    // },
    {
        key: 'zmi',
        title: 'ZMI Application Form',
        description: 'ZMI applicant details, certificates, offshore training, references, sea service, and deck experience.',
    },
    {
        key: 'flex_fleet',
        title: 'Flex Fleet Application Form',
        description: 'Flex Fleet personal particulars, documents, certificate courses, and sea service.',
    },
    {
        key: 'dynamic',
        title: 'Dynamic Application Form',
        description: 'Dynamic personal particulars, documents, certificate courses, and sea service.',
    },
];

const GROUPS = [
    {
        title: 'Personal Information',
        fields: [
            ['First name', 'first_name'],
            ['Middle name', 'middle_name'],
            ['Last name', 'last_name'],
            ['Date applied', 'date_applied'],
            ['Nationality', 'nationality'],
        ],
    },
    {
        title: 'Birth & Family Details',
        fields: [
            ['Place of birth', 'place_of_birth'],
            ['Date of birth', 'date_of_birth'],
            ["Mother's maiden name", 'mothers_maiden_name'],
            ["Father's name", 'fathers_name'],
            ['Religion', 'religion'],
            ['Sector / Sub caste', 'sector_sub_caste'],
        ],
    },
    {
        title: 'Position & Background',
        fields: [
            ['Current position', 'current_position'],
            ['Position applied for', 'position_applied_for'],
            ['Educational attainment', 'educational_attainment'],
            ['Last salary', 'last_salary'],
            ['Expected salary', 'expected_salary'],
            ['E-registration number', 'e_registration_number'],
        ],
    },
    {
        title: 'Physical Details',
        fields: [
            ['Body weight (lbs)', 'body_weight_bmi'],
            ['Height (cm)', 'height_cm'],
            ['Coverall & shoe size', 'coverall_shoe_size'],
            ['Safety shoe size', 'safety_shoe_size'],
            ['Boiler suit size', 'boiler_suit_size'],
        ],
    },
    {
        title: 'Contact & Address',
        fields: [
            ['Home address', 'current_home_address'],
            ['Personal mobile no.', 'personal_mobile_no'],
            ['Telephone numbers', 'telephone_numbers'],
            ['Fax no.', 'fax_no'],
            ['Email address', 'email_address'],
            ['Nearest airport', 'nearest_airport'],
        ],
    },
    {
        title: 'Next Of Kin / Emergency Contact',
        fields: [
            ['Next of kin', 'next_of_kin'],
            ['Relationship', 'relationship'],
            ['Emergency contact person', 'contact_person'],
            ['Emergency contact number', 'emergency_contact'],
        ],
    },
    {
        title: 'Spouse Details',
        fields: [
            ['Husband/Wife name', 'wife_name'],
            ['Husband/Wife I/C No', 'wife_ic_no'],
            ["Husband/Wife's occupation", 'wife_occupation'],
            ['Marriage date', 'marriage_date'],
            ["Husband/Wife's income tax no", 'wife_income_tax_no'],
        ],
    },
    {
        title: 'Government IDs',
        fields: [
            ['SSS No.', 'sss_no'],
            ['Pag-IBIG No.', 'pagibig_no'],
            ['EPF No', 'epf_no'],
            ['SOCSO No', 'socso_no'],
            ['Blood', 'blood'],
            ['PhilHealth No.', 'philhealth_no'],
        ],
    },
];

function initialsFor(name) {
    return (name || 'SF')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function fullNameFor(client) {
    return [client?.first_name, client?.middle_name, client?.last_name].filter(Boolean).join(' ') || client?.name || 'Seafarer';
}

function buildTravelDocuments(documents = []) {
    const documentMap = new Map((documents || []).map((document) => [document.document_type, document]));

    return TRAVEL_DOCUMENT_TYPES.map((type) => ({
        id: documentMap.get(type.key)?.id ?? null,
        document_type: type.key,
        number: documentMap.get(type.key)?.number ?? '',
        place_of_issue: documentMap.get(type.key)?.place_of_issue ?? '',
        date_of_issue: documentMap.get(type.key)?.date_of_issue ?? '',
        date_of_expiry: documentMap.get(type.key)?.date_of_expiry ?? '',
        attachment: documentMap.get(type.key)?.attachment ?? '',
    }));
}

function FieldRow({ label, value }) {
    return (
        <div className="border-b border-slate-100 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 break-words text-sm font-medium text-slate-900">{value || 'Not provided'}</p>
        </div>
    );
}

function Section({ title, fields, client }) {
    return (
        <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <div className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {fields.map(([label, key]) => (
                    <FieldRow key={key} label={label} value={client?.[key]} />
                ))}
            </div>
        </section>
    );
}

function TabBar({ active, onChange }) {
    const primaryTabs = TABS.slice(0, 4);
    const moreTabs = TABS.slice(4);
    const activeMoreTab = moreTabs.find((tab) => tab.key === active);
    const [moreOpen, setMoreOpen] = useState(false);

    const tabClass = (isActive) => `shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
        isActive
            ? 'border-[#1F6F5C] text-[#1F6F5C]'
            : 'border-transparent text-slate-500 hover:text-slate-800'
    }`;

    const selectTab = (key) => {
        onChange(key);
        setMoreOpen(false);
    };

    return (
        <div className="mb-5 flex flex-wrap items-center gap-1 border-b border-slate-200">
            {primaryTabs.map((tab) => {
                const isActive = active === tab.key;

                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => selectTab(tab.key)}
                        className={tabClass(isActive)}
                    >
                        {tab.label}
                    </button>
                );
            })}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setMoreOpen((open) => !open)}
                    className={`${tabClass(Boolean(activeMoreTab))} inline-flex items-center gap-2`}
                    aria-expanded={moreOpen}
                    aria-haspopup="menu"
                >
                    {activeMoreTab ? activeMoreTab.label : 'More'}
                    <ChevronDown size={15} className={`transition ${moreOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-56 rounded border border-slate-200 bg-white py-1 shadow-lg">
                        {moreTabs.map((tab) => {
                            const isActive = active === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => selectTab(tab.key)}
                                    className={`block w-full px-4 py-2 text-left text-sm transition ${
                                        isActive
                                            ? 'bg-emerald-50 font-medium text-[#1F6F5C]'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                    role="menuitem"
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function RepeatableTable({ items = [], columns, emptyLabel }) {
    if (!items || items.length === 0) {
        return (
            <div className="rounded border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
                {emptyLabel}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {columns.map((column) => (
                                <th key={column.key} className="px-5 py-3">{column.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, index) => (
                            <tr key={index} className="text-sm">
                                {columns.map((column) => (
                                    <td key={column.key} className="px-5 py-4 text-slate-700">
                                        {column.type === 'file' && item[column.key] ? (
                                            <a
                                                href={`/storage/${item[column.key]}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 font-medium text-[#1F6F5C] hover:text-[#155446]"
                                            >
                                                <FileText size={15} />
                                                View attachment
                                            </a>
                                        ) : (
                                            item[column.key] || 'Not provided'
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TravelDocumentsTable({ items }) {
    const columns = [
        { key: 'number', label: 'Number' },
        { key: 'place_of_issue', label: 'Place of issue' },
        { key: 'date_of_issue', label: 'Date of issue' },
        { key: 'date_of_expiry', label: 'Date of expiry' },
        { key: 'attachment', label: 'Attachment', type: 'file' },
    ];

    return (
        <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <th className="px-5 py-3">Travel document</th>
                            {columns.map((column) => (
                                <th key={column.key} className="px-5 py-3">{column.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => {
                            const type = TRAVEL_DOCUMENT_TYPES.find((documentType) => documentType.key === item.document_type);

                            return (
                                <tr key={item.document_type} className="text-sm">
                                    <td className="px-5 py-4 font-medium text-slate-800">{type?.label || item.document_type}</td>
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-5 py-4 text-slate-700">
                                            {column.type === 'file' && item[column.key] ? (
                                                <a
                                                    href={`/storage/${item[column.key]}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 font-medium text-[#1F6F5C] hover:text-[#155446]"
                                                >
                                                    <FileText size={15} />
                                                    View attachment
                                                </a>
                                            ) : (
                                                item[column.key] || 'Not provided'
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SeaServiceTable({ items }) {
    const columns = [
        { key: 'from_date', label: 'From', className: 'min-w-[170px]' },
        { key: 'to_date', label: 'To', className: 'min-w-[170px]' },
        { key: 'duration_months', label: 'Mos.', className: 'min-w-[90px]' },
        { key: 'duration_days', label: 'Days', className: 'min-w-[90px]' },
        { key: 'position', label: 'Position', className: 'min-w-[170px]' },
        { key: 'vessel_name', label: 'Vessel Name', className: 'min-w-[180px]' },
        { key: 'type_imo_number', label: 'Type / IMO #', className: 'min-w-[150px]' },
        { key: 'area_of_operation', label: 'Area of Operation', className: 'min-w-[170px]' },
        { key: 'flag', label: 'Flag', className: 'min-w-[120px]' },
        { key: 'oilfield_yn', label: 'Oilfield Y/N', className: 'min-w-[130px]' },
        { key: 'propulsion_type', label: 'Propulsion Type AZ, CPP', className: 'min-w-[190px]' },
        { key: 'grt', label: 'GRT', className: 'min-w-[120px]' },
        { key: 'bollard_pull', label: 'Bollard Pull', className: 'min-w-[140px]' },
        { key: 'main_engine_type_model', label: 'Types/Model', className: 'min-w-[170px]' },
        { key: 'main_engine_kw', label: 'KW', className: 'min-w-[120px]' },
        { key: 'ship_owner_manager_contact', label: 'Ship Owner/Management/Company, Tel #, Contact Person & Email ID', className: 'min-w-[320px]' },
    ];
    const groupedHeaderColumns = columns.filter((column) => !['position', 'vessel_name', 'ship_owner_manager_contact'].includes(column.key));

    if (!items || items.length === 0) {
        return (
            <div className="rounded border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
                No sea service added yet.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[2600px] table-fixed border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600">
                            <th colSpan={2} className="border-r border-slate-200 px-3 py-3">( Day/Month/Year )</th>
                            <th colSpan={2} className="border-r border-slate-200 px-3 py-3">Duration of Sea Service</th>
                            <th rowSpan={2} className="min-w-[170px] border-r border-slate-200 px-3 py-3">Position</th>
                            <th rowSpan={2} className="min-w-[180px] border-r border-slate-200 px-3 py-3">Vessel Name</th>
                            <th colSpan={7} className="border-r border-slate-200 px-3 py-3">Vessel Name</th>
                            <th colSpan={2} className="border-r border-slate-200 px-3 py-3">Main Engine*</th>
                            <th rowSpan={2} className="min-w-[320px] px-3 py-3 text-red-600">Ship Owner/ Ship Management/Company, Tel #, Contact Person & Email ID</th>
                        </tr>
                        <tr className="border-b border-slate-200 bg-white text-center text-xs font-medium text-slate-500">
                            {groupedHeaderColumns.map((column) => (
                                <th key={column.key} className={`${column.className} border-r border-slate-200 px-3 py-3`}>{column.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, index) => (
                            <tr key={index} className="align-top text-sm">
                                {columns.map((column) => (
                                    <td key={column.key} className={`${column.className} border-r border-slate-100 px-3 py-3 text-slate-700`}>
                                        {item[column.key] || 'Not provided'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DeckOfficerExperienceTable({ items }) {
    const columns = [
        { key: 'vessel_name', label: 'Vessel Name', className: 'min-w-[180px]' },
        { key: 'charterer', label: 'Charterer', className: 'min-w-[160px]' },
        { key: 'area_of_operation', label: 'Area of Operation (Oil field)', className: 'min-w-[190px]' },
        { key: 'dp_operation_hours', label: 'DP (Type of Operation, Hours)', className: 'min-w-[210px]' },
        { key: 'supply', label: 'Supply', className: 'min-w-[110px]' },
        { key: 'dsv', label: 'DSV', className: 'min-w-[110px]' },
        { key: 'survey', label: 'Survey', className: 'min-w-[120px]' },
        { key: 'anchor_type', label: 'Anchor Type', className: 'min-w-[150px]' },
        { key: 'anchor_weight', label: 'Anchor Weight', className: 'min-w-[160px]' },
        { key: 'barges', label: 'Barges', className: 'min-w-[120px]' },
        { key: 'rig_move', label: 'Rig Move', className: 'min-w-[130px]' },
        { key: 'propelled', label: 'Propelled', className: 'min-w-[140px]' },
        { key: 'non_propelled', label: 'Non Propelled', className: 'min-w-[160px]' },
    ];

    if (!items || items.length === 0) {
        return (
            <div className="rounded border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
                No deck officer experience added yet.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[2000px] table-fixed border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-200 text-center text-sm font-semibold text-slate-900">
                            <th colSpan={13} className="px-3 py-2">DECK Officers Experience</th>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600">
                            <th rowSpan={3} className="min-w-[180px] border-r border-slate-200 px-3 py-3">Vessel Name</th>
                            <th rowSpan={3} className="min-w-[160px] border-r border-slate-200 px-3 py-3">Charterer</th>
                            <th rowSpan={3} className="min-w-[190px] border-r border-slate-200 px-3 py-3">Area of Operation (Oil field)</th>
                            <th rowSpan={3} className="min-w-[210px] border-r border-slate-200 px-3 py-3">DP (TYPE OF OPERATION, HOURS)</th>
                            <th colSpan={9} className="border-r border-slate-200 px-3 py-3 text-sm font-medium">PERIOD OF OPERATION (in Months)</th>
                        </tr>
                        <tr className="border-b border-slate-200 bg-white text-center text-xs font-medium text-slate-600">
                            <th rowSpan={2} className="min-w-[110px] border-r border-slate-200 px-3 py-3">SUPPLY</th>
                            <th rowSpan={2} className="min-w-[110px] border-r border-slate-200 px-3 py-3">DSV</th>
                            <th rowSpan={2} className="min-w-[120px] border-r border-slate-200 px-3 py-3">SURVEY</th>
                            <th colSpan={2} className="border-r border-slate-200 px-3 py-3">ANCHOR HANDLING</th>
                            <th colSpan={2} className="border-r border-slate-200 px-3 py-3">TOWING</th>
                            <th colSpan={2} className="border-r border-slate-200 px-3 py-3">SELF ELEVATING BARGE</th>
                        </tr>
                        <tr className="border-b border-slate-200 bg-white text-center text-xs font-medium text-slate-500">
                            <th className="min-w-[150px] border-r border-slate-200 px-3 py-3">ANCHOR TYPE</th>
                            <th className="min-w-[160px] border-r border-slate-200 px-3 py-3">ANCHOR WEIGHT</th>
                            <th className="min-w-[120px] border-r border-slate-200 px-3 py-3">BARGES</th>
                            <th className="min-w-[130px] border-r border-slate-200 px-3 py-3">RIG MOVE</th>
                            <th className="min-w-[140px] border-r border-slate-200 px-3 py-3">Propelled</th>
                            <th className="min-w-[160px] border-r border-slate-200 px-3 py-3">None Propelled</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, index) => (
                            <tr key={index} className="align-top text-sm">
                                {columns.map((column) => (
                                    <td key={column.key} className={`${column.className} border-r border-slate-100 px-3 py-3 text-slate-700`}>
                                        {item[column.key] || 'Not provided'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EmptyTabPanel({ title }) {
    return (
        <div className="rounded border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
            No {title.toLowerCase()} added yet.
        </div>
    );
}

export default function ClientDetails({ client }) {
    const fullName = fullNameFor(client);
    const [printModalOpen, setPrintModalOpen] = useState(false);

    const dependentColumns = [
        { key: 'name', label: 'Name' },
        { key: 'date_of_birth', label: 'Date of birth' },
        { key: 'relationship', label: 'Relationship' },
        { key: 'dependent', label: 'Dependent/s' },
        { key: 'beneficiary', label: 'Beneficiaries' },
        { key: 'address', label: 'Address' },
        { key: 'attachment', label: 'Attachment', type: 'file' },
    ];

    const certificationColumns = [
        { key: 'name', label: 'Name' },
        { key: 'certificate_number', label: 'Certificate number' },
        { key: 'place_of_issue', label: 'Place of issue' },
        { key: 'date_of_issue', label: 'Date of issue' },
        { key: 'date_of_expiry', label: 'Date of expiry' },
        { key: 'attachment', label: 'Attachment', type: 'file' },
    ];

    const numberedDocumentColumns = [
        { key: 'name', label: 'Name' },
        { key: 'number', label: 'Number' },
        { key: 'place_of_issue', label: 'Place of issue' },
        { key: 'date_of_issue', label: 'Date of issue' },
        { key: 'date_of_expiry', label: 'Date of expiry' },
        { key: 'attachment', label: 'Attachment', type: 'file' },
    ];

    const flagDocumentColumns = [
        { key: 'name', label: 'Name' },
        { key: 'number', label: 'Number' },
        { key: 'place_of_issue', label: 'Place of issue' },
        { key: 'date_of_issue', label: 'Date of issue' },
        { key: 'date_of_expiry', label: 'Date of expiry' },
    ];

    const employmentHistoryColumns = [
        { key: 'company', label: 'Company' },
        { key: 'contact_person_name', label: 'Contact person name' },
        { key: 'designation', label: 'Designation' },
        { key: 'contact_person_number', label: 'Contact person number' },
        { key: 'country', label: 'Country' },
        { key: 'attachment', label: 'Attachment', type: 'file' },
    ];

    return (
        <AdminTabs activeTab="clients" title="Seafarer Details">
            <style>{`
                .print-form-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #94a3b8 #f1f5f9;
                }

                .print-form-scroll::-webkit-scrollbar {
                    width: 10px;
                }

                .print-form-scroll::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 999px;
                }

                .print-form-scroll::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #94a3b8, #64748b);
                    border: 2px solid #f1f5f9;
                    border-radius: 999px;
                }

                .print-form-scroll::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #64748b, #475569);
                }
            `}</style>
            <div className="mx-auto max-w-6xl">
                <div className="mb-5">
                    <Link
                        href={route('admin.seafarers.index')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Back to Seafarers
                    </Link>
                </div>

                <Profile
                    client={client}
                    updateRouteName="admin.seafarers.update"
                    updateRouteParams={client.id}
                    methodOverride="PUT"
                    headerActions={(
                        <button
                            type="button"
                            onClick={() => setPrintModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <Printer size={16} />
                            Print Forms
                        </button>
                    )}
                />
            </div>

            {printModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded bg-white shadow-xl">
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Print Forms</h3>
                                <p className="mt-1 text-sm text-slate-500">{fullName}</p>
                            </div>
                            <button type="button" onClick={() => setPrintModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close print forms">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="print-form-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
                            {PRINTOUT_FORMS.map((form) => (
                                <Link
                                    key={form.key}
                                    href={route('admin.seafarers.print-preview', client.id) + `?form=${form.key}`}
                                    className="flex items-start gap-3 rounded border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#E1EBE6] text-[#1F6F5C]">
                                        <FileText size={18} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-slate-900">{form.title}</span>
                                        <span className="mt-1 block text-sm leading-5 text-slate-500">{form.description}</span>
                                    </span>
                                    <Printer className="mt-1 shrink-0 text-slate-400" size={17} />
                                </Link>
                            ))}
                        </div>

                        <div className="flex shrink-0 justify-end border-t border-slate-200 px-6 py-4">
                            <button type="button" onClick={() => setPrintModalOpen(false)} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminTabs>
    );
}
