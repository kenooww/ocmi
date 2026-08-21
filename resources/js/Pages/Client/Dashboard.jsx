import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Anchor, LayoutDashboard, FilePlus2, History as HistoryIcon, User, Menu, X, Ship, LogOut, Settings } from 'lucide-react';
import DashboardMain from './Sections/DashboardMain';
import NewApplication from './Sections/NewApplication';
import History from './Sections/History';
import Profile from './Sections/Profile';

const PALETTE = {
  navy: "#0F3049",
  navyDeep: "#0A2436",
  paper: "#EEF2F0",
  card: "#FFFFFF",
  line: "#DCE3DF",
  brass: "#B8863B",
  brassBg: "#F5EBDA",
  teal: "#1F6F5C",
  tealBg: "#E1EBE6",
  green: "#3F7D3B",
  greenBg: "#E7EFDF",
  rust: "#A23E34",
  rustBg: "#F5E4E1",
  ink: "#16222B",
  sub: "#5B6B70",
};

const STATUS_STYLES = {
  Submitted: { color: PALETTE.brass, bg: PALETTE.brassBg },
  "Under review": { color: PALETTE.teal, bg: PALETTE.tealBg },
  "Signed on": { color: PALETTE.green, bg: PALETTE.greenBg },
  Declined: { color: PALETTE.rust, bg: PALETTE.rustBg },
};

const RANKS = [
  "Master",
  "Chief Officer",
  "Second Officer",
  "Third Officer",
  "Chief Engineer",
  "Second Engineer",
  "Third Engineer",
  "Bosun",
  "Able Seaman",
  "Ordinary Seaman",
  "Oiler",
  "Cook / Steward",
  "Cadet",
];

const VESSEL_TYPES = [
  "Container ship",
  "Bulk carrier",
  "Oil / chemical tanker",
  "LNG carrier",
  "Cruise ship",
  "Offshore support",
  "RoRo / ferry",
];

const SEED = [
  {
    id: "SF-2026-118",
    name: "Renato Cruz",
    email: "renato.cruz@mail.com",
    rank: "Second Officer",
    vessel: "Container ship",
    seamanBook: "SB-3382910",
    seaService: "6 years",
    availability: "Sep 15, 2026",
    note: "STCW II/1 endorsed, available for immediate sign-on.",
    submittedAt: "Aug 3, 2026",
    status: "Under review",
  },
  {
    id: "SF-2026-114",
    name: "Dario Fontanez",
    email: "d.fontanez@mail.com",
    rank: "Chief Engineer",
    vessel: "Bulk carrier",
    seamanBook: "SB-2217743",
    seaService: "14 years",
    availability: "Aug 20, 2026",
    note: "Class NK experience, four contracts on similar tonnage.",
    submittedAt: "Jul 28, 2026",
    status: "Signed on",
  },
  {
    id: "SF-2026-107",
    name: "Kobe Manalastas",
    email: "kobe.m@mail.com",
    rank: "Able Seaman",
    vessel: "Oil / chemical tanker",
    seamanBook: "SB-1190042",
    seaService: "3 years",
    availability: "Oct 1, 2026",
    note: "",
    submittedAt: "Jul 19, 2026",
    status: "Declined",
  },
];

function nextCaseId(count) {
  return `SF-2026-${String(119 + count).padStart(3, "0")}`;
}

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
        transform: "rotate(-3deg)",
        letterSpacing: "0.1em",
      }}
    >
      {status}
    </span>
  );
}

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "profile", label: "Profile", icon: User },
];

function Sidebar({ active, setActive, mobileOpen, setMobileOpen }) {
  const { post } = useForm();
  const { companySettings } = usePage().props;
  const company = companySettings || {};
  const logoUrl = company.logo ? `/storage/${company.logo}` : null;
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:sticky z-30 top-0 left-0 h-screen w-64 shrink-0 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ backgroundColor: PALETTE.navyDeep }}
      >
        <div className="flex items-center gap-2 px-6 py-6">
          {logoUrl ? (
            <img src={logoUrl} alt={company.company_name || company.portal_name || 'Company'} className="h-8 w-8 rounded bg-white object-contain p-1" />
          ) : (
            <Anchor size={22} color={PALETTE.brass} />
          )}
          <div>
            <p
              className="text-lg leading-tight"
              style={{ fontFamily: "'Fraunces', serif", color: "#F4F1E8", fontWeight: 600 }}
            >
              {company.portal_name || 'Anchor Point'}
            </p>
            <p className="text-xs" style={{ color: "#9DB0B8" }}>
              {company.tagline || 'Crewing & recruitment'}
            </p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} color="#EEF2F0" />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActive(item.key);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm"
                style={{
                  backgroundColor: isActive ? "rgba(184,134,59,0.16)" : "transparent",
                  color: isActive ? "#F5EBDA" : "#B7C4C9",
                }}
              >
                <Icon size={17} color={isActive ? PALETTE.brass : "#7F929A"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-5 text-xs" style={{ color: "#6C818A", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-3">Every submission opens a case file, tracked from intake to sign-on.</div>
  
        </div>
      </aside>
    </>
  );
}

function initialsFor(name) {
  if (!name) {
    return "CL";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function fullNameFor(client) {
  return [client?.first_name, client?.middle_name, client?.last_name].filter(Boolean).join(" ") || client?.name || "Seafarer";
}

function Topbar({ title, setMobileOpen, client, goProfile }) {
  const displayName = fullNameFor(client);
  const initials = initialsFor(displayName);
  const [profileOpen, setProfileOpen] = useState(false);
  const { post } = useForm();

  const handleLogout = () => {
    setProfileOpen(false);
    post('/seafarers/logout');
  };

  return (
    <div
      className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10"
      style={{ backgroundColor: PALETTE.card, borderBottom: `1px solid ${PALETTE.line}` }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button className="lg:hidden shrink-0" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={22} color={PALETTE.ink} />
        </button>
        <h1
          className="text-lg sm:text-xl truncate"
          style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}
        >
          {title}
        </h1>
      </div>

      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-[#E1EBE6] text-sm font-semibold text-[#1F6F5C] shadow-sm transition hover:border-[#B8863B]"
          aria-label="Open profile menu"
          aria-expanded={profileOpen}
        >
          {client?.avatar ? (
            <img
              src={`/storage/${client.avatar}`}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-12 z-50 w-72 rounded border border-slate-200 bg-white shadow-xl">
            <span className="absolute -top-2 right-5 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white" />
            <div className="relative px-5 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E1EBE6] text-lg font-semibold text-[#1F6F5C]">
                  {client?.avatar ? (
                    <img src={`/storage/${client.avatar}`} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-blue-600">{displayName}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {client?.email_address || client?.email || 'No email'}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    goProfile();
                  }}
                  className="flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings size={16} className="text-slate-500" />
                  Profile preferences
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 px-5 py-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm text-slate-700 transition hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      className="rounded px-4 py-4"
      style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
    >
      <p className="text-2xl" style={{ fontFamily: "'IBM Plex Mono', monospace", color: PALETTE.ink }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: PALETTE.sub }}>
        {label}
      </p>
    </div>
  );
}

function ApplicationCard({ a }) {
  return (
    <div
      className="flex gap-4 rounded overflow-hidden"
      style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
    >
      <div className="w-1.5 shrink-0" style={{ backgroundColor: STATUS_STYLES[a.status].color }} />
      <div className="flex-1 py-3 pr-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p
              className="text-xs mb-0.5"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: PALETTE.sub }}
            >
              {a.id}
            </p>
            <p className="text-base font-medium" style={{ color: PALETTE.ink }}>
              {a.name}
            </p>
            <p className="text-sm flex items-center gap-1.5" style={{ color: PALETTE.sub }}>
              <Ship size={13} /> {a.rank} · {a.vessel}
            </p>
          </div>
          <StatusStamp status={a.status} />
        </div>
        {a.note && (
          <p className="text-sm mt-2" style={{ color: PALETTE.sub }}>
            {a.note}
          </p>
        )}
        <p className="text-xs mt-2" style={{ color: PALETTE.sub, opacity: 0.8 }}>
          Filed {a.submittedAt} · Seaman's book {a.seamanBook} · Sea service {a.seaService}
        </p>
      </div>
    </div>
  );
}

// The Dashboard, NewApplication, History and Profile views have been moved to
// separate files under resources/js/Pages/Client/Sections/*. They are imported
// above and used instead of the previous in-file components.

export default function SeafarerPortal({ client }) {
  const [applications, setApplications] = useState(SEED);
  let initialActive = 'dashboard';
  if (typeof window !== 'undefined') {
    try {
      const u = new URL(window.location.href);
      const qs = u.searchParams.get('section');
      initialActive = qs || localStorage.getItem('clientDashboardActive') || 'dashboard';
    } catch (e) {
      initialActive = localStorage.getItem('clientDashboardActive') || 'dashboard';
    }
  }

  const [activeState, setActiveState] = useState(initialActive);

  // wrapper so we persist the active section across page reloads and update URL
  function setActive(key) {
    setActiveState(key);
    try {
      if (typeof window !== 'undefined') {
        const u = new URL(window.location.href);
        u.searchParams.set('section', key);
        window.history.replaceState(null, '', u.toString());
        localStorage.setItem('clientDashboardActive', key);
      }
    } catch (e) {
      try { localStorage.setItem('clientDashboardActive', key); } catch (e2) { /* ignore */ }
    }
  }
  const active = activeState;

  // listen to popstate so back/forward updates the active section
  useEffect(() => {
    function onPop() {
      try {
        const u = new URL(window.location.href);
        const qs = u.searchParams.get('section') || 'dashboard';
        setActiveState(qs);
      } catch (e) {
        // ignore
      }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmedId, setConfirmedId] = useState(null);

  function handleNewApplication(form) {
    const id = nextCaseId(applications.length);
    const entry = {
      id,
      name: form.name.trim(),
      email: form.email.trim(),
      rank: form.rank,
      vessel: form.vessel || "No preference",
      seamanBook: form.seamanBook.trim(),
      seaService: form.seaService.trim() || "Not specified",
      availability: form.availability,
      note: form.note.trim(),
      submittedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "Submitted",
    };
    setApplications((list) => [entry, ...list]);
    setConfirmedId(id);
    setActive("history");
    setTimeout(() => setConfirmedId(null), 5000);
  }

  const titles = {
    dashboard: "Dashboard",
    new: "New application",
    history: "Application history",
    profile: "Profile",
  };

  return (
    <div className="w-full min-h-screen flex items-start" style={{ backgroundColor: PALETTE.paper, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
      `}</style>

      <Sidebar active={active} setActive={setActive} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={titles[active]} setMobileOpen={setMobileOpen} client={client} goProfile={() => setActive('profile')} />

        {active === 'dashboard' && (
          <DashboardMain
            applications={applications}
            client={client}
            goNew={() => setActive('new')}
            goProfile={() => setActive('profile')}
          />
        )}
        {/* {active === 'new' && <NewApplication onSubmit={handleNewApplication} confirmedId={confirmedId} />}
        {active === 'history' && <History applications={applications} />} */}
        {active === 'profile' && <Profile client={client} />}
      </div>
    </div>
  );
}
