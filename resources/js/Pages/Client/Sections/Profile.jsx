import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { CalendarDays, ChevronDown, FileText, Mail, Phone, Plus, Trash2, Upload, X } from 'lucide-react';

const FIELD_KEYS = [
  'avatar', 'first_name', 'middle_name', 'last_name', 'date_applied', 'nationality',
  'place_of_birth', 'date_of_birth', 'mothers_maiden_name', 'fathers_name', 'religion',
  'current_position', 'position_applied_for', 'educational_attainment', 'last_salary', 'e_registration_number',
  'body_weight_bmi', 'height_cm', 'coverall_shoe_size',
  'current_home_address', 'personal_mobile_no', 'fax_no', 'email_address', 'nearest_airport',
  'next_of_kin', 'relationship', 'emergency_contact',
  'sss_no', 'pagibig_no', 'philhealth_no',
];

const EMPTY_DEPENDENT = { name: '', date_of_birth: '', relationship: '', dependent: '', beneficiary: '', attachment: null };
const EMPTY_CERTIFICATE = { name: '', certificate_number: '', place_of_issue: '', date_of_issue: '', date_of_expiry: '', attachment: null };
const EMPTY_NUMBERED_DOCUMENT = { name: '', number: '', place_of_issue: '', date_of_issue: '', date_of_expiry: '', attachment: null };
const EMPTY_FLAG_DOCUMENT = { name: '', number: '', place_of_issue: '', date_of_issue: '', date_of_expiry: '' };
const EMPTY_EMPLOYMENT_HISTORY = { company: '', contact_person_name: '', designation: '', contact_person_number: '', country: '', attachment: null };
const EMPTY_SEA_SERVICE = {
  from_date: '',
  to_date: '',
  duration_months: '',
  duration_days: '',
  position: '',
  vessel_name: '',
  type_imo_number: '',
  area_of_operation: '',
  flag: '',
  oilfield_yn: '',
  propulsion_type: '',
  grt: '',
  bollard_pull: '',
  main_engine_type_model: '',
  main_engine_kw: '',
  ship_owner_manager_contact: '',
};
const EMPTY_DECK_OFFICER_EXPERIENCE = {
  vessel_name: '',
  charterer: '',
  area_of_operation: '',
  dp_operation_hours: '',
  supply: '',
  dsv: '',
  survey: '',
  anchor_type: '',
  anchor_weight: '',
  barges: '',
  rig_move: '',
  propelled: '',
  non_propelled: '',
};
const TRAVEL_DOCUMENT_TYPES = [
  { key: 'passport', label: 'Passport' },
  { key: 'visa', label: 'Available Visa (If Any)' },
  { key: 'seamans_book', label: "Seaman's Book" },
  { key: 'seafarers_identification_document', label: 'Seafarers Identification Document (SID)' },
];

const TABS = [
  { key: 'personal', label: 'Personal Information' },
  { key: 'dependents', label: 'Dependents' },
  { key: 'travel_documents', label: 'Travel Documents' },
  { key: 'certifications', label: 'Certificate of Competency' },
  { key: 'proficiency', label: 'Certificate of Proficiency' },
  { key: 'vaccinations', label: 'Vaccinations' },
  { key: 'flag_documents', label: 'Flag Documents' },
  { key: 'other_certificates', label: 'Other Certificates' },
  { key: 'employment_history', label: 'Employment History' },
  { key: 'sea_service', label: 'Sea Service' },
  { key: 'deck_officer_experience', label: 'Deck Officer Experience' },
];

const GROUPS = [
  {
    title: 'Personal Information',
    fields: [
      ['First name', 'first_name'],
      ['Middle name', 'middle_name'],
      ['Last name', 'last_name'],
      ['Date applied', 'date_applied', 'date'],
      ['Nationality', 'nationality'],
    ],
  },
  {
    title: 'Birth & Family Details',
    fields: [
      ['Place of birth', 'place_of_birth'],
      ['Date of birth', 'date_of_birth', 'date'],
      ["Mother's maiden name", 'mothers_maiden_name'],
      ["Father's name", 'fathers_name'],
      ['Religion', 'religion'],
    ],
  },
  {
    title: 'Position & Background',
    fields: [
      ['Current position', 'current_position'],
      ['Position applied for', 'position_applied_for'],
      ['Educational attainment', 'educational_attainment'],
      ['Last salary', 'last_salary'],
      ['E-registration number', 'e_registration_number'],
    ],
  },
  {
    title: 'Physical Details',
    fields: [
      ['Body weight & BMI', 'body_weight_bmi'],
      ['Height (cm)', 'height_cm', 'number'],
      ['Coverall & shoe size', 'coverall_shoe_size'],
    ],
  },
  {
    title: 'Contact & Address',
    fields: [
      ['Home address', 'current_home_address'],
      ['Personal mobile no.', 'personal_mobile_no'],
      ['Fax no.', 'fax_no'],
      ['Email address', 'email_address', 'email'],
      ['Nearest airport', 'nearest_airport'],
    ],
  },
  {
    title: 'Next Of Kin / Emergency Contact',
    fields: [
      ['Next of kin', 'next_of_kin'],
      ['Relationship', 'relationship'],
      ['Emergency contact person / number', 'emergency_contact'],
    ],
  },
  {
    title: 'Government IDs',
    fields: [
      ['SSS No.', 'sss_no'],
      ['Pag-IBIG No.', 'pagibig_no'],
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

function displayValue(client, key) {
  if (key === 'email_address') {
    return client?.email_address || client?.email;
  }

  return client?.[key];
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

function FieldRow({ label, name, value, editing, data, setData, error, type = 'text' }) {
  if (!editing) {
    return (
      <div className="border-b border-slate-100 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-900">{value || 'Not provided'}</p>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-100 py-3">
      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</label>
      <input
        type={type}
        value={data[name] ?? ''}
        onChange={(e) => setData(name, e.target.value)}
        className={`mt-1 w-full rounded border p-2.5 text-sm text-slate-900 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B] ${
          error ? 'border-red-300' : 'border-slate-300'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Section({ title, fields, client, editing, data, setData, errors }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {fields.map(([label, key, type]) => (
          <FieldRow
            key={key}
            label={label}
            name={key}
            value={displayValue(client, key)}
            editing={editing}
            data={data}
            setData={setData}
            error={errors[key]}
            type={type}
          />
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

function RepeatableList({ items, editing, columns, onChange, onAdd, onRemove, emptyLabel, errorsPrefix, errors }) {
  if (!editing) {
    if (!items || items.length === 0) {
      return (
        <div className="rounded border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
          {emptyLabel}.
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

  return (
    <div className="space-y-4">
      {(items || []).map((item, index) => (
        <div key={index} className="relative rounded border border-slate-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded border border-red-100 text-red-600 transition hover:bg-red-50"
            aria-label="Remove row"
          >
            <Trash2 size={15} />
          </button>
          <div className="grid grid-cols-1 gap-4 pr-10 sm:grid-cols-2">
            {columns.map((column) => {
              const errKey = `${errorsPrefix}.${index}.${column.key}`;

              return (
                <div key={column.key}>
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">{column.label}</label>
                  {column.type === 'file' ? (
                    <>
                      <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        <Upload size={15} />
                        Choose file
                        <input
                          type="file"
                          onChange={(e) => onChange(index, column.key, e.target.files[0] ?? item[column.key] ?? null)}
                          className="sr-only"
                        />
                      </label>
                      {item[column.key] && typeof item[column.key] === 'string' && (
                        <a
                          href={`/storage/${item[column.key]}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 flex items-center gap-2 text-sm font-medium text-[#1F6F5C] hover:text-[#155446]"
                        >
                          <FileText size={15} />
                          Current attachment
                        </a>
                      )}
                      {item[column.key] && typeof item[column.key] !== 'string' && (
                        <p className="mt-2 text-sm text-slate-600">{item[column.key].name}</p>
                      )}
                    </>
                  ) : (
                    <input
                      type={column.type || 'text'}
                      value={item[column.key] ?? ''}
                      onChange={(e) => onChange(index, column.key, e.target.value)}
                      className={`mt-1 w-full rounded border p-2.5 text-sm text-slate-900 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B] ${
                        errors?.[errKey] ? 'border-red-300' : 'border-slate-300'
                      }`}
                    />
                  )}
                  {errors?.[errKey] && <p className="mt-1 text-xs text-red-600">{errors[errKey]}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded bg-[#E1EBE6] px-4 py-2 text-sm font-semibold text-[#1F6F5C] transition hover:bg-[#D5E4DD]"
      >
        <Plus size={16} />
        Add {emptyLabel.replace('No ', '').replace(' added yet', '')}
      </button>
    </div>
  );
}

function TravelDocumentsTable({ items, editing, onChange, errors }) {
  const columns = [
    { key: 'number', label: 'Number' },
    { key: 'place_of_issue', label: 'Place of issue' },
    { key: 'date_of_issue', label: 'Date of issue', type: 'date' },
    { key: 'date_of_expiry', label: 'Date of expiry', type: 'date' },
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
            {items.map((item, index) => {
              const type = TRAVEL_DOCUMENT_TYPES.find((documentType) => documentType.key === item.document_type);

              return (
                <tr key={item.document_type} className="text-sm">
                  <td className="px-5 py-4 font-medium text-slate-800">{type?.label || item.document_type}</td>
                  {columns.map((column) => {
                    const errKey = `travel_documents.${index}.${column.key}`;

                    return (
                      <td key={column.key} className="px-5 py-4 text-slate-700">
                        {editing ? (
                          <>
                            {column.type === 'file' ? (
                              <>
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                  <Upload size={15} />
                                  Choose file
                                  <input
                                    type="file"
                                    onChange={(e) => onChange(index, column.key, e.target.files[0] ?? item[column.key] ?? null)}
                                    className="sr-only"
                                  />
                                </label>
                                {item[column.key] && typeof item[column.key] === 'string' && (
                                  <a
                                    href={`/storage/${item[column.key]}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 flex items-center gap-2 text-sm font-medium text-[#1F6F5C] hover:text-[#155446]"
                                  >
                                    <FileText size={15} />
                                    Current attachment
                                  </a>
                                )}
                                {item[column.key] && typeof item[column.key] !== 'string' && (
                                  <p className="mt-2 text-sm text-slate-600">{item[column.key].name}</p>
                                )}
                              </>
                            ) : (
                              <input
                                type={column.type || 'text'}
                                value={item[column.key] ?? ''}
                                onChange={(e) => onChange(index, column.key, e.target.value)}
                                className={`w-full rounded border p-2.5 text-sm text-slate-900 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B] ${
                                  errors?.[errKey] ? 'border-red-300' : 'border-slate-300'
                                }`}
                              />
                            )}
                            {errors?.[errKey] && <p className="mt-1 text-xs text-red-600">{errors[errKey]}</p>}
                          </>
                        ) : column.type === 'file' && item[column.key] ? (
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
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SeaServiceTable({ items, editing, onChange, onAdd, onRemove, errors }) {
  const columns = [
    { key: 'from_date', label: 'From', type: 'date', className: 'min-w-[170px]' },
    { key: 'to_date', label: 'To', type: 'date', className: 'min-w-[170px]' },
    { key: 'duration_months', label: 'Mos.', type: 'number', className: 'min-w-[90px]' },
    { key: 'duration_days', label: 'Days', type: 'number', className: 'min-w-[90px]' },
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
    { key: 'ship_owner_manager_contact', label: 'Ship Owner/Management/Company, Tel #, Contact Person & Email ID', type: 'textarea', className: 'min-w-[320px]' },
  ];
  const groupedHeaderColumns = columns.filter((column) => !['position', 'vessel_name', 'ship_owner_manager_contact'].includes(column.key));

  if (!editing && (!items || items.length === 0)) {
    return (
      <div className="rounded border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
        No sea service added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                {editing && <th rowSpan={2} className="w-20 px-3 py-3">Action</th>}
              </tr>
              <tr className="border-b border-slate-200 bg-white text-center text-xs font-medium text-slate-500">
                {groupedHeaderColumns.map((column) => (
                  <th key={column.key} className={`${column.className} border-r border-slate-200 px-3 py-3`}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(items || []).map((item, index) => (
                <tr key={index} className="align-top text-sm">
                  {columns.map((column) => {
                    const errKey = `sea_service.${index}.${column.key}`;

                    return (
                      <td key={column.key} className={`${column.className} border-r border-slate-100 px-3 py-3 text-slate-700`}>
                        {editing ? (
                          <>
                            {column.type === 'textarea' ? (
                              <textarea
                                value={item[column.key] ?? ''}
                                onChange={(e) => onChange(index, column.key, e.target.value)}
                                rows={2}
                                className={`w-full rounded border p-2 text-sm text-slate-900 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B] ${
                                  errors?.[errKey] ? 'border-red-300' : 'border-slate-300'
                                }`}
                              />
                            ) : (
                              <input
                                type={column.type || 'text'}
                                value={item[column.key] ?? ''}
                                onChange={(e) => onChange(index, column.key, e.target.value)}
                                className={`w-full rounded border p-2 text-sm text-slate-900 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B] ${
                                  errors?.[errKey] ? 'border-red-300' : 'border-slate-300'
                                }`}
                              />
                            )}
                            {errors?.[errKey] && <p className="mt-1 text-xs text-red-600">{errors[errKey]}</p>}
                          </>
                        ) : (
                          item[column.key] || 'Not provided'
                        )}
                      </td>
                    );
                  })}
                  {editing && (
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-100 text-red-600 transition hover:bg-red-50"
                        aria-label="Remove sea service"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded bg-[#E1EBE6] px-4 py-2 text-sm font-semibold text-[#1F6F5C] transition hover:bg-[#D5E4DD]"
        >
          <Plus size={16} />
          Add sea service
        </button>
      )}
    </div>
  );
}

function DeckOfficerExperienceTable({ items, editing, onChange, onAdd, onRemove, errors }) {
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

  if (!editing && (!items || items.length === 0)) {
    return (
      <div className="rounded border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
        No deck officer experience added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[2000px] table-fixed border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-200 text-center text-sm font-semibold text-slate-900">
                <th colSpan={editing ? 14 : 13} className="px-3 py-2">DECK Officers Experience</th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600">
                <th rowSpan={3} className="min-w-[180px] border-r border-slate-200 px-3 py-3">Vessel Name</th>
                <th rowSpan={3} className="min-w-[160px] border-r border-slate-200 px-3 py-3">Charterer</th>
                <th rowSpan={3} className="min-w-[190px] border-r border-slate-200 px-3 py-3">Area of Operation (Oil field)</th>
                <th rowSpan={3} className="min-w-[210px] border-r border-slate-200 px-3 py-3">DP (TYPE OF OPERATION, HOURS)</th>
                <th colSpan={9} className="border-r border-slate-200 px-3 py-3 text-sm font-medium">PERIOD OF OPERATION (in Months)</th>
                {editing && <th rowSpan={3} className="w-20 px-3 py-3">Action</th>}
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
              {(items || []).map((item, index) => (
                <tr key={index} className="align-top text-sm">
                  {columns.map((column) => {
                    const errKey = `deck_officer_experience.${index}.${column.key}`;

                    return (
                      <td key={column.key} className={`${column.className} border-r border-slate-100 px-3 py-3 text-slate-700`}>
                        {editing ? (
                          <>
                            <input
                              type="text"
                              value={item[column.key] ?? ''}
                              onChange={(e) => onChange(index, column.key, e.target.value)}
                              className={`w-full rounded border p-2 text-sm text-slate-900 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B] ${
                                errors?.[errKey] ? 'border-red-300' : 'border-slate-300'
                              }`}
                            />
                            {errors?.[errKey] && <p className="mt-1 text-xs text-red-600">{errors[errKey]}</p>}
                          </>
                        ) : (
                          item[column.key] || 'Not provided'
                        )}
                      </td>
                    );
                  })}
                  {editing && (
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-100 text-red-600 transition hover:bg-red-50"
                        aria-label="Remove deck officer experience"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded bg-[#E1EBE6] px-4 py-2 text-sm font-semibold text-[#1F6F5C] transition hover:bg-[#D5E4DD]"
        >
          <Plus size={16} />
          Add deck officer experience
        </button>
      )}
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

export default function Profile({ client, updateRouteName = 'seafarers.update-profile', updateRouteParams = [], methodOverride = null }) {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const initialValues = FIELD_KEYS.reduce((acc, key) => {
    acc[key] = client?.[key] ?? (key === 'email_address' ? client?.email ?? '' : '');
    return acc;
  }, {});
  initialValues.dependents = client?.dependents?.length ? client.dependents : [];
  initialValues.travel_documents = buildTravelDocuments(client?.travel_documents);
  initialValues.certifications = client?.certifications?.length ? client.certifications : [];
  initialValues.proficiency = client?.proficiency?.length ? client.proficiency : [];
  initialValues.vaccinations = client?.vaccinations?.length ? client.vaccinations : [];
  initialValues.flag_documents = client?.flag_documents?.length ? client.flag_documents : [];
  initialValues.other_certificates = client?.other_certificates?.length ? client.other_certificates : [];
  initialValues.employment_history = client?.employment_history?.length ? client.employment_history : [];
  initialValues.sea_service = client?.sea_service?.length ? client.sea_service : [];
  initialValues.deck_officer_experience = client?.deck_officer_experience?.length ? client.deck_officer_experience : [];

  const { data, setData, post, processing, errors, reset, transform } = useForm(initialValues);

  const fullName = fullNameFor(client);
  const profileTitle = editing ? fullNameFor(data) : fullName;
  const avatarPreview = data.avatar && typeof data.avatar !== 'string' ? URL.createObjectURL(data.avatar) : null;

  function startEditing() {
    reset();
    setEditing(true);
  }

  function cancelEditing() {
    reset();
    setEditing(false);
  }

  function save(e) {
    e.preventDefault();

    transform((payload) => ({
      ...payload,
      ...(payload.avatar && typeof payload.avatar !== 'string' ? { avatar: payload.avatar } : {}),
      ...(methodOverride ? { _method: methodOverride } : {}),
    }));

    post(route(updateRouteName, updateRouteParams), {
      forceFormData: true,
      onSuccess: () => setEditing(false),
    });
  }

  function updateDependent(index, key, value) {
    const next = [...data.dependents];
    next[index] = { ...next[index], [key]: value };
    setData('dependents', next);
  }

  function addDependent() {
    setData('dependents', [...data.dependents, { ...EMPTY_DEPENDENT }]);
  }

  function removeDependent(index) {
    setData('dependents', data.dependents.filter((_, i) => i !== index));
  }

  function updateTravelDocument(index, key, value) {
    const next = [...data.travel_documents];
    next[index] = { ...next[index], [key]: value };
    setData('travel_documents', next);
  }

  function updateCertification(index, key, value) {
    updateRows('certifications', index, key, value);
  }

  function addCertification() {
    addRow('certifications', EMPTY_CERTIFICATE);
  }

  function removeCertification(index) {
    removeRow('certifications', index);
  }

  function updateRows(section, index, key, value) {
    const next = [...data[section]];
    next[index] = { ...next[index], [key]: value };
    setData(section, next);
  }

  function addRow(section, emptyRow) {
    setData(section, [...data[section], { ...emptyRow }]);
  }

  function removeRow(section, index) {
    setData(section, data[section].filter((_, i) => i !== index));
  }

  const dependentColumns = [
    { key: 'name', label: 'Name' },
    { key: 'date_of_birth', label: 'Date of birth', type: 'date' },
    { key: 'relationship', label: 'Relationship' },
    { key: 'dependent', label: 'Dependent/s' },
    { key: 'beneficiary', label: 'Beneficiaries' },
    { key: 'attachment', label: 'Attachment', type: 'file' },
  ];

  const certificationColumns = [
    { key: 'name', label: 'Name' },
    { key: 'certificate_number', label: 'Certificate number' },
    { key: 'place_of_issue', label: 'Place of issue' },
    { key: 'date_of_issue', label: 'Date of issue', type: 'date' },
    { key: 'date_of_expiry', label: 'Date of expiry', type: 'date' },
    { key: 'attachment', label: 'Attachment', type: 'file' },
  ];

  const numberedDocumentColumns = [
    { key: 'name', label: 'Name' },
    { key: 'number', label: 'Number' },
    { key: 'place_of_issue', label: 'Place of issue' },
    { key: 'date_of_issue', label: 'Date of issue', type: 'date' },
    { key: 'date_of_expiry', label: 'Date of expiry', type: 'date' },
    { key: 'attachment', label: 'Attachment', type: 'file' },
  ];

  const flagDocumentColumns = [
    { key: 'name', label: 'Name' },
    { key: 'number', label: 'Number' },
    { key: 'place_of_issue', label: 'Place of issue' },
    { key: 'date_of_issue', label: 'Date of issue', type: 'date' },
    { key: 'date_of_expiry', label: 'Date of expiry', type: 'date' },
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
    <div className="w-full px-4 py-5 sm:p-6">
      <form onSubmit={save} encType="multipart/form-data" className="mx-auto max-w-6xl">
        <div className="mb-6 overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt={profileTitle} className="h-20 w-20 rounded-full object-cover ring-4 ring-[#E1EBE6]" />
              ) : client?.avatar ? (
                <img src={`/storage/${client.avatar}`} alt={fullName} className="h-20 w-20 rounded-full object-cover ring-4 ring-[#E1EBE6]" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E1EBE6] text-xl font-semibold text-[#1F6F5C]">
                  {initialsFor(profileTitle)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Seafarer Profile</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{profileTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{(editing ? data.position_applied_for : client?.position_applied_for) || 'Applicant information'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:items-end">
              <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:min-w-64">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  <span className="break-all">{(editing ? data.email_address : client?.email_address) || client?.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />
                  <span>{(editing ? data.personal_mobile_no : client?.personal_mobile_no) || client?.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-slate-400" />
                  <span>Applied {(editing ? data.date_applied : client?.date_applied) || client?.created_at_human || 'Not provided'}</span>
                </div>
              </div>

              {!editing ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12364F]"
                >
                  Update Profile
                </button>
              ) : (
                <div className="flex flex-wrap justify-end gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    <Upload size={16} />
                    Upload Avatar
                    <input name="avatar" type="file" accept="image/*" onChange={(e) => setData('avatar', e.target.files[0] ?? null)} className="sr-only" />
                  </label>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12364F] disabled:opacity-60"
                  >
                    {processing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
              {errors.avatar && <p className="text-xs text-red-600">{errors.avatar}</p>}
            </div>
          </div>
        </div>

        <TabBar active={activeTab} onChange={setActiveTab} />

        {activeTab === 'personal' && (
          <div className="space-y-5">
            {GROUPS.map((group) => (
              <Section
                key={group.title}
                title={group.title}
                fields={group.fields}
                client={client}
                editing={editing}
                data={data}
                setData={setData}
                errors={errors}
              />
            ))}
          </div>
        )}

        {activeTab === 'dependents' && (
          <RepeatableList
            items={editing ? data.dependents : (client?.dependents || [])}
            editing={editing}
            columns={dependentColumns}
            onChange={updateDependent}
            onAdd={addDependent}
            onRemove={removeDependent}
            emptyLabel="No dependents added yet"
            errorsPrefix="dependents"
            errors={errors}
          />
        )}

        {activeTab === 'travel_documents' && (
          <TravelDocumentsTable
            items={editing ? data.travel_documents : buildTravelDocuments(client?.travel_documents)}
            editing={editing}
            onChange={updateTravelDocument}
            errors={errors}
          />
        )}

        {activeTab === 'certifications' && (
          <RepeatableList
            items={editing ? data.certifications : (client?.certifications || [])}
            editing={editing}
            columns={certificationColumns}
            onChange={updateCertification}
            onAdd={addCertification}
            onRemove={removeCertification}
            emptyLabel="No certifications added yet"
            errorsPrefix="certifications"
            errors={errors}
          />
        )}

        {activeTab === 'proficiency' && (
          <RepeatableList
            items={editing ? data.proficiency : (client?.proficiency || [])}
            editing={editing}
            columns={certificationColumns}
            onChange={(index, key, value) => updateRows('proficiency', index, key, value)}
            onAdd={() => addRow('proficiency', EMPTY_CERTIFICATE)}
            onRemove={(index) => removeRow('proficiency', index)}
            emptyLabel="No certificate of proficiency added yet"
            errorsPrefix="proficiency"
            errors={errors}
          />
        )}
        {activeTab === 'vaccinations' && (
          <RepeatableList
            items={editing ? data.vaccinations : (client?.vaccinations || [])}
            editing={editing}
            columns={numberedDocumentColumns}
            onChange={(index, key, value) => updateRows('vaccinations', index, key, value)}
            onAdd={() => addRow('vaccinations', EMPTY_NUMBERED_DOCUMENT)}
            onRemove={(index) => removeRow('vaccinations', index)}
            emptyLabel="No vaccinations added yet"
            errorsPrefix="vaccinations"
            errors={errors}
          />
        )}
        {activeTab === 'flag_documents' && (
          <RepeatableList
            items={editing ? data.flag_documents : (client?.flag_documents || [])}
            editing={editing}
            columns={flagDocumentColumns}
            onChange={(index, key, value) => updateRows('flag_documents', index, key, value)}
            onAdd={() => addRow('flag_documents', EMPTY_FLAG_DOCUMENT)}
            onRemove={(index) => removeRow('flag_documents', index)}
            emptyLabel="No flag documents added yet"
            errorsPrefix="flag_documents"
            errors={errors}
          />
        )}
        {activeTab === 'other_certificates' && (
          <RepeatableList
            items={editing ? data.other_certificates : (client?.other_certificates || [])}
            editing={editing}
            columns={numberedDocumentColumns}
            onChange={(index, key, value) => updateRows('other_certificates', index, key, value)}
            onAdd={() => addRow('other_certificates', EMPTY_NUMBERED_DOCUMENT)}
            onRemove={(index) => removeRow('other_certificates', index)}
            emptyLabel="No other certificates added yet"
            errorsPrefix="other_certificates"
            errors={errors}
          />
        )}
        {activeTab === 'employment_history' && (
          <RepeatableList
            items={editing ? data.employment_history : (client?.employment_history || [])}
            editing={editing}
            columns={employmentHistoryColumns}
            onChange={(index, key, value) => updateRows('employment_history', index, key, value)}
            onAdd={() => addRow('employment_history', EMPTY_EMPLOYMENT_HISTORY)}
            onRemove={(index) => removeRow('employment_history', index)}
            emptyLabel="No employment history added yet"
            errorsPrefix="employment_history"
            errors={errors}
          />
        )}
        {activeTab === 'sea_service' && (
          <SeaServiceTable
            items={editing ? data.sea_service : (client?.sea_service || [])}
            editing={editing}
            onChange={(index, key, value) => updateRows('sea_service', index, key, value)}
            onAdd={() => addRow('sea_service', EMPTY_SEA_SERVICE)}
            onRemove={(index) => removeRow('sea_service', index)}
            errors={errors}
          />
        )}
        {activeTab === 'deck_officer_experience' && (
          <DeckOfficerExperienceTable
            items={editing ? data.deck_officer_experience : (client?.deck_officer_experience || [])}
            editing={editing}
            onChange={(index, key, value) => updateRows('deck_officer_experience', index, key, value)}
            onAdd={() => addRow('deck_officer_experience', EMPTY_DECK_OFFICER_EXPERIENCE)}
            onRemove={(index) => removeRow('deck_officer_experience', index)}
            errors={errors}
          />
        )}
      </form>
    </div>
  );
}
