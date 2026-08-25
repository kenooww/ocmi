import React from 'react';
import { AlertCircle, CheckCircle2, Ship, UserRound } from 'lucide-react';

const PALETTE = {
  navy: '#0F3049',
  navyDeep: '#0A2436',
  paper: '#EEF2F0',
  card: '#FFFFFF',
  line: '#DCE3DF',
  brass: '#B8863B',
  brassBg: '#F5EBDA',
  teal: '#1F6F5C',
  tealBg: '#E1EBE6',
  green: '#3F7D3B',
  greenBg: '#E7EFDF',
  rust: '#A23E34',
  rustBg: '#F5E4E1',
  ink: '#16222B',
  sub: '#5B6B70',
};

const STATUS_STYLES = {
  Submitted: { color: PALETTE.brass, bg: PALETTE.brassBg },
  'Under review': { color: PALETTE.teal, bg: PALETTE.tealBg },
  'Signed on': { color: PALETTE.green, bg: PALETTE.greenBg },
  Declined: { color: PALETTE.rust, bg: PALETTE.rustBg },
};

function StatusStamp({ status }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-block text-xs tracking-widest uppercase px-3 py-1 border-2 rounded"
      style={{
        color: s.color,
        borderColor: s.color,
        backgroundColor: s.bg,
        fontFamily: "'Fraunces', serif",
        transform: 'rotate(-3deg)',
        letterSpacing: '0.1em',
      }}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded px-4 py-4" style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
      <p className="text-2xl" style={{ fontFamily: "'IBM Plex Mono', monospace", color: PALETTE.ink }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: PALETTE.sub }}>{label}</p>
    </div>
  );
}

const COMPLETENESS_FIELDS = [
  { key: 'avatar', label: 'Profile photo', group: 'Personal' },
  { key: 'current_position', label: 'Current position', group: 'Position' },
  { key: 'first_name', label: 'First name', group: 'Personal' },
  { key: 'last_name', label: 'Last name', group: 'Personal' },
  { key: 'date_applied', label: 'Date applied', group: 'Personal' },
  { key: 'place_of_birth', label: 'Place of birth', group: 'Personal' },
  { key: 'date_of_birth', label: 'Date of birth', group: 'Personal' },
  { key: 'nationality', label: 'Nationality', group: 'Personal' },
  { key: 'position_applied_for', label: 'Position applied for', group: 'Position' },
  { key: 'current_home_address', label: 'Home address', group: 'Contact' },
  { key: 'personal_mobile_no', label: 'Mobile number', group: 'Contact' },
  { key: 'email_address', fallback: 'email', label: 'Email address', group: 'Contact' },
  { key: 'next_of_kin', label: 'Next of kin', group: 'Emergency' },
  { key: 'contact_person', label: 'Emergency contact person', group: 'Emergency' },
  { key: 'emergency_contact', label: 'Emergency contact number', group: 'Emergency' },
  { key: 'sss_no', label: 'SSS number', group: 'Government IDs' },
  { key: 'pagibig_no', label: 'Pag-IBIG number', group: 'Government IDs' },
  { key: 'philhealth_no', label: 'PhilHealth number', group: 'Government IDs' },
];

const COMPLETENESS_SECTIONS = [
  { key: 'dependents', label: 'Dependents', group: 'Tables' },
  { key: 'travel_documents', label: 'Travel documents', group: 'Tables' },
  { key: 'certifications', label: 'Certificate of competency', group: 'Tables' },
  { key: 'gmdss_certificates', label: 'GMDSS certificate', group: 'Tables' },
  { key: 'proficiency', label: 'Certificate of proficiency', group: 'Tables' },
  { key: 'vaccinations', label: 'Vaccinations', group: 'Tables' },
  { key: 'flag_documents', label: 'Flag documents', group: 'Tables' },
  { key: 'additional_stcw_certificates', label: 'STCW Certificate', group: 'Tables' },
  { key: 'offshore_training_certificates', label: 'Offshore Training', group: 'Tables' },
  { key: 'other_certificates', label: 'Other certificates', group: 'Tables' },
  { key: 'employment_history', label: 'Employment history', group: 'Tables', minDetails: 2 },
  { key: 'sea_service', label: 'Sea service', group: 'Tables' },
  { key: 'deck_officer_experience', label: 'Deck officer experience', group: 'Tables' },
];

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.some((item) => {
      if (!item || typeof item !== 'object') {
        return Boolean(item);
      }

      return Object.entries(item).some(([key, fieldValue]) => key !== 'id' && hasValue(fieldValue));
    });
  }

  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim() !== '';
}

function countMeaningfulDetails(value) {
  if (!Array.isArray(value)) {
    return 0;
  }

  return value.reduce((total, item) => {
    if (!item || typeof item !== 'object') {
      return total + (hasValue(item) ? 1 : 0);
    }

    return total + Object.entries(item).filter(([key, fieldValue]) => {
      if (['id', 'attachment', 'created_at', 'updated_at'].includes(key)) {
        return false;
      }

      return hasValue(fieldValue);
    }).length;
  }, 0);
}

function getCompleteness(client) {
  const checks = [
    ...COMPLETENESS_FIELDS.map((field) => ({
      label: field.label,
      group: field.group,
      complete: hasValue(client?.[field.key]) || (field.fallback ? hasValue(client?.[field.fallback]) : false),
    })),
    ...COMPLETENESS_SECTIONS.map((section) => {
      const filledDetails = section.minDetails ? countMeaningfulDetails(client?.[section.key]) : 0;
      const complete = section.minDetails
        ? filledDetails >= section.minDetails
        : hasValue(client?.[section.key]);

      return {
        label: section.label,
        group: section.group,
        complete,
        missingLabel: section.minDetails
          ? `${section.label} incomplete (${filledDetails}/${section.minDetails} details)`
          : section.label,
      };
    }),
  ];

  const completed = checks.filter((check) => check.complete).length;
  const total = checks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    checks,
    completed,
    missing: total - completed,
    missingItems: checks.filter((check) => !check.complete).map((check) => check.missingLabel || check.label),
    percent,
    total,
  };
}

function CompletenessCard({ client, goProfile }) {
  const completeness = getCompleteness(client);
  const statusLabel = completeness.percent === 100 ? 'Complete' : completeness.percent >= 70 ? 'Almost complete' : 'Needs update';
  const statusColor = completeness.percent === 100 ? PALETTE.green : completeness.percent >= 70 ? PALETTE.brass : PALETTE.rust;
  const statusBg = completeness.percent === 100 ? PALETTE.greenBg : completeness.percent >= 70 ? PALETTE.brassBg : PALETTE.rustBg;

  return (
    <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[#E1EBE6] text-[#1F6F5C]">
            <UserRound size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Fraunces', serif" }}>
                Profile completeness
              </h2>
              <span className="rounded px-2.5 py-1 text-xs font-semibold" style={{ color: statusColor, backgroundColor: statusBg }}>
                {statusLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {completeness.completed} of {completeness.total} required profile items are filled.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-3xl font-semibold text-slate-900" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {completeness.percent}%
            </p>
            <p className="text-xs text-slate-500">{completeness.missing} missing</p>
          </div>
          <button
            type="button"
            onClick={goProfile}
            className="rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#12364F]"
          >
            Update profile
          </button>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded bg-slate-100">
        <div className="h-full rounded bg-[#1F6F5C] transition-all" style={{ width: `${completeness.percent}%` }} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.35fr]">
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <CheckCircle2 size={16} className="text-[#3F7D3B]" />
            Completed items
          </div>
          <p className="mt-1 text-sm text-slate-500">{completeness.completed} profile items already saved.</p>
        </div>
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <AlertCircle size={16} className="text-[#A23E34]" />
            Next to complete
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {completeness.missingItems.length > 0 ? (
              completeness.missingItems.slice(0, 5).map((item) => (
                <span key={item} className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                  {item}
                </span>
              ))
            ) : (
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                All required items completed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-800">Completeness table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {completeness.checks.map((check) => (
                <tr key={`${check.group}-${check.label}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{check.group}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{check.label}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold"
                      style={{
                        color: check.complete ? PALETTE.green : PALETTE.rust,
                        backgroundColor: check.complete ? PALETTE.greenBg : PALETTE.rustBg,
                      }}
                    >
                      {check.complete ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      {check.complete ? 'Complete' : 'Missing'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ a }) {
  return (
    <div className="flex gap-4 rounded overflow-hidden" style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
      <div className="w-1.5 shrink-0" style={{ backgroundColor: STATUS_STYLES[a.status].color }} />
      <div className="flex-1 py-3 pr-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs mb-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: PALETTE.sub }}>{a.id}</p>
            <p className="text-base font-medium" style={{ color: PALETTE.ink }}>{a.name}</p>
            <p className="text-sm flex items-center gap-1.5" style={{ color: PALETTE.sub }}><Ship size={13} /> {a.rank} · {a.vessel}</p>
          </div>
          <StatusStamp status={a.status} />
        </div>
        {a.note && <p className="text-sm mt-2" style={{ color: PALETTE.sub }}>{a.note}</p>}
        <p className="text-xs mt-2" style={{ color: PALETTE.sub, opacity: 0.8 }}>Filed {a.submittedAt} · Seaman's book {a.seamanBook} · Sea service {a.seaService}</p>
      </div>
    </div>
  );
}

export default function DashboardMain({ applications = [], client, goNew, goProfile }) {
  const stats = {
    total: applications.length,
    review: applications.filter((a) => a.status === 'Under review').length,
    signed: applications.filter((a) => a.status === 'Signed on').length,
    declined: applications.filter((a) => a.status === 'Declined').length,
  };

  return (
    <div className="px-4 py-5 sm:p-6 space-y-6">
      {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total filed" value={stats.total} />
        <StatCard label="Under review" value={stats.review} />
        <StatCard label="Signed on" value={stats.signed} />
        <StatCard label="Declined" value={stats.declined} />
      </div> */}

      <CompletenessCard client={client} goProfile={goProfile} />

      {/* <div className="rounded p-5 flex items-center justify-between flex-wrap gap-3" style={{ backgroundColor: PALETTE.navy }}>
        <div>
          <p className="text-sm" style={{ color: '#B7C4C9' }}>Ready for your next contract?</p>
          <p className="text-base sm:text-lg" style={{ fontFamily: "'Fraunces', serif", color: '#F4F1E8', fontWeight: 600 }}>File a new seafarer application</p>
        </div>
        <button onClick={goNew} className="w-full sm:w-auto px-4 py-2 rounded text-sm font-medium shrink-0" style={{ backgroundColor: PALETTE.brass, color: '#241B0C' }}>Start application</button>
      </div> */}

      {/* <div>
        <h2 className="text-sm uppercase tracking-wide mb-3" style={{ color: PALETTE.sub, letterSpacing: '0.08em' }}>Recent cases</h2>
        <div className="space-y-3">
          {applications.slice(0, 3).map((a) => (
            <ApplicationCard key={a.id} a={a} />
          ))}
        </div>
      </div> */}
    </div>
  );
}
