import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { useState } from "react";
import {
  Anchor,
  LayoutDashboard,
  FilePlus2,
  History as HistoryIcon,
  User,
  Menu,
  X,
  Ship,
  Search,
} from "lucide-react";

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
  { key: "new", label: "New application", icon: FilePlus2 },
  { key: "history", label: "Application history", icon: HistoryIcon },
  { key: "profile", label: "Profile", icon: User },
];

function Sidebar({ active, setActive, mobileOpen, setMobileOpen }) {
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
          <Anchor size={22} color={PALETTE.brass} />
          <div>
            <p
              className="text-lg leading-tight"
              style={{ fontFamily: "'Fraunces', serif", color: "#F4F1E8", fontWeight: 600 }}
            >
              Anchor Point
            </p>
            <p className="text-xs" style={{ color: "#9DB0B8" }}>
              Crewing & recruitment
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
          Every submission opens a case file, tracked from intake to sign-on.
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

function Topbar({ title, setMobileOpen, client }) {
  const initials = initialsFor(client?.name);

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
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: PALETTE.tealBg, color: PALETTE.teal, fontWeight: 600 }}
        >
          {initials}
        </div>
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

function DashboardView({ applications, goNew }) {
  const stats = {
    total: applications.length,
    review: applications.filter((a) => a.status === "Under review").length,
    signed: applications.filter((a) => a.status === "Signed on").length,
    declined: applications.filter((a) => a.status === "Declined").length,
  };
  return (
    <div className="px-4 py-5 sm:p-6 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total filed" value={stats.total} />
        <StatCard label="Under review" value={stats.review} />
        <StatCard label="Signed on" value={stats.signed} />
        <StatCard label="Declined" value={stats.declined} />
      </div>

      <div
        className="rounded p-5 flex items-center justify-between flex-wrap gap-3"
        style={{ backgroundColor: PALETTE.navy }}
      >
        <div>
          <p className="text-sm" style={{ color: "#B7C4C9" }}>
            Ready for your next contract?
          </p>
          <p className="text-base sm:text-lg" style={{ fontFamily: "'Fraunces', serif", color: "#F4F1E8", fontWeight: 600 }}>
            File a new seafarer application
          </p>
        </div>
        <button
          onClick={goNew}
          className="w-full sm:w-auto px-4 py-2 rounded text-sm font-medium shrink-0"
          style={{ backgroundColor: PALETTE.brass, color: "#241B0C" }}
        >
          Start application
        </button>
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-wide mb-3" style={{ color: PALETTE.sub, letterSpacing: "0.08em" }}>
          Recent cases
        </h2>
        <div className="space-y-3">
          {applications.slice(0, 3).map((a) => (
            <ApplicationCard key={a.id} a={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NewApplicationView({ onSubmit, confirmedId }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    rank: "",
    vessel: "",
    seamanBook: "",
    seaService: "",
    availability: "",
    note: "",
  });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Enter your full name.";
    if (!form.email.trim()) errs.email = "Enter an email address.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.rank) errs.rank = "Select your rank.";
    if (!form.seamanBook.trim()) errs.seamanBook = "Enter your seaman's book number.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(form);
    setForm({
      name: "",
      email: "",
      phone: "",
      rank: "",
      vessel: "",
      seamanBook: "",
      seaService: "",
      availability: "",
      note: "",
    });
  }

  const fieldStyle = (err) => ({
    backgroundColor: "#fff",
    border: `1px solid ${err ? PALETTE.rust : PALETTE.line}`,
    color: PALETTE.ink,
  });

  return (
    <div className="px-4 py-5 sm:p-6 max-w-2xl">
      <div
        className="rounded p-4 sm:p-6"
        style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
      >
        <h2 className="text-xl mb-1" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}>
          Seafarer application
        </h2>
        <p className="text-sm mb-6" style={{ color: PALETTE.sub }}>
          Fields marked with an asterisk are required.
        </p>

        {confirmedId && (
          <div
            className="mb-5 px-4 py-3 rounded text-sm"
            style={{ backgroundColor: PALETTE.tealBg, color: PALETTE.teal, border: `1px solid ${PALETTE.teal}` }}
          >
            Application received. Case {confirmedId} was opened.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
              Full name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Renato Cruz"
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={fieldStyle(errors.name)}
            />
            {errors.name && <p className="text-xs mt-1" style={{ color: PALETTE.rust }}>{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={fieldStyle(errors.email)}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: PALETTE.rust }}>{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 010-0192"
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={fieldStyle()}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                Rank *
              </label>
              <select
                value={form.rank}
                onChange={(e) => update("rank", e.target.value)}
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={fieldStyle(errors.rank)}
              >
                <option value="">Select rank</option>
                {RANKS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.rank && <p className="text-xs mt-1" style={{ color: PALETTE.rust }}>{errors.rank}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                Preferred vessel type
              </label>
              <select
                value={form.vessel}
                onChange={(e) => update("vessel", e.target.value)}
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={fieldStyle()}
              >
                <option value="">Select vessel type</option>
                {VESSEL_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                Seaman's book number *
              </label>
              <input
                type="text"
                value={form.seamanBook}
                onChange={(e) => update("seamanBook", e.target.value)}
                placeholder="SB-1234567"
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={fieldStyle(errors.seamanBook)}
              />
              {errors.seamanBook && (
                <p className="text-xs mt-1" style={{ color: PALETTE.rust }}>{errors.seamanBook}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                Sea service
              </label>
              <input
                type="text"
                value={form.seaService}
                onChange={(e) => update("seaService", e.target.value)}
                placeholder="e.g. 4 years"
                className="w-full px-3 py-2 rounded text-sm outline-none"
                style={fieldStyle()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
              Available from
            </label>
            <input
              type="date"
              value={form.availability}
              onChange={(e) => update("availability", e.target.value)}
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
              Note to the crewing team
            </label>
            <textarea
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              placeholder="Certificates, endorsements, or anything else relevant."
              rows={4}
              className="w-full px-3 py-2 rounded text-sm outline-none resize-none"
              style={fieldStyle()}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded text-sm font-medium mt-2"
            style={{ backgroundColor: PALETTE.navy, color: "#F4F1E8" }}
          >
            Submit application
          </button>
        </form>
      </div>
    </div>
  );
}

function HistoryView({ applications }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const visible = applications.filter((a) => {
    const matchesFilter = filter === "All" || a.status === filter;
    const matchesQuery =
      query.trim() === "" ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.rank.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-1 text-xs flex-wrap overflow-x-auto pb-1 sm:pb-0">
          {["All", "Submitted", "Under review", "Signed on", "Declined"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2.5 py-1 rounded whitespace-nowrap shrink-0"
              style={{
                backgroundColor: filter === f ? PALETTE.navy : "transparent",
                color: filter === f ? "#F4F1E8" : PALETTE.ink,
                border: `1px solid ${filter === f ? PALETTE.navy : PALETTE.line}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search size={15} className="absolute left-2.5 top-2.5" color={PALETTE.sub} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, rank, or case ID"
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded text-sm outline-none"
            style={{ backgroundColor: "#fff", border: `1px solid ${PALETTE.line}`, color: PALETTE.ink }}
          />
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-3">
        {visible.length === 0 && (
          <p className="text-sm py-10 text-center" style={{ color: PALETTE.sub }}>
            No cases match this search.
          </p>
        )}
        {visible.map((a) => (
          <ApplicationCard key={a.id} a={a} />
        ))}
      </div>

      {/* Desktop / tablet: table */}
      <div
        className="hidden sm:block rounded overflow-hidden"
        style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "780px" }}>
            <thead>
              <tr style={{ backgroundColor: PALETTE.paper, borderBottom: `1px solid ${PALETTE.line}` }}>
                {["Case ID", "Name", "Rank", "Vessel type", "Sea service", "Filed", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs uppercase tracking-wide"
                    style={{ color: PALETTE.sub, letterSpacing: "0.06em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((a, i) => (
                <tr
                  key={a.id}
                  style={{
                    borderBottom: i < visible.length - 1 ? `1px solid ${PALETTE.line}` : "none",
                  }}
                >
                  <td
                    className="px-4 py-3 whitespace-nowrap"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: PALETTE.sub }}
                  >
                    {a.id}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: PALETTE.ink }}>
                    {a.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: PALETTE.ink }}>
                    {a.rank}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: PALETTE.sub }}>
                    {a.vessel}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: PALETTE.sub }}>
                    {a.seaService}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: PALETTE.sub }}>
                    {a.submittedAt}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusStamp status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <p className="text-sm py-10 text-center" style={{ color: PALETTE.sub }}>
            No cases match this search.
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span style={{ color: PALETTE.sub }}>{label}</span>
      <span className="text-left sm:text-right break-words" style={{ color: PALETTE.ink }}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

function ProfileView({ client }) {
  const displayName = client?.name || "Client";
  const initials = initialsFor(displayName);

  return (
    <div className="px-4 py-5 sm:p-6 max-w-xl">
      <div
        className="rounded p-4 sm:p-6"
        style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
      >
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: PALETTE.tealBg, color: PALETTE.teal, fontWeight: 600 }}
          >
            {initials}
          </div>
          <div>
            <p className="text-lg" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}>
              {displayName}
            </p>
            <p className="text-sm" style={{ color: PALETTE.sub }}>
              Client profile
            </p>
          </div>
        </div>
        <div className="space-y-3 text-sm" style={{ borderTop: `1px solid ${PALETTE.line}`, paddingTop: "1rem" }}>
          <ProfileField label="Email" value={client?.email} />
          <ProfileField label="Phone" value={client?.phone} />
          <ProfileField label="Address" value={client?.address} />
          <ProfileField label="Client since" value={client?.created_at} />
        </div>
      </div>
    </div>
  );
}

export default function SeafarerPortal({ client }) {
  const [applications, setApplications] = useState(SEED);
  const [active, setActive] = useState("dashboard");
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
        <Topbar title={titles[active]} setMobileOpen={setMobileOpen} client={client} />

        {active === "dashboard" && (
          <DashboardView applications={applications} goNew={() => setActive("new")} />
        )}
        {active === "new" && (
          <NewApplicationView onSubmit={handleNewApplication} confirmedId={confirmedId} />
        )}
        {active === "history" && <HistoryView applications={applications} />}
        {active === "profile" && <ProfileView client={client} />}
      </div>
    </div>
  );
}
