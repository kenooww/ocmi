import React, { useState } from 'react';
import { Search } from 'lucide-react';

const PALETTE = { card: '#FFFFFF', line: '#DCE3DF', ink: '#16222B', sub: '#5B6B70' };

const STATUS_STYLES = {
  Submitted: { color: '#B8863B', bg: '#F5EBDA' },
  'Under review': { color: '#1F6F5C', bg: '#E1EBE6' },
  'Signed on': { color: '#3F7D3B', bg: '#E7EFDF' },
  Declined: { color: '#A23E34', bg: '#F5E4E1' },
};

function StatusStamp({ status }) {
  const s = STATUS_STYLES[status];
  return (
    <span className="inline-block text-xs tracking-widest uppercase px-3 py-1 border-2 rounded" style={{ color: s.color, borderColor: s.color, backgroundColor: s.bg }}>{status}</span>
  );
}

export default function History({ applications }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const visible = applications.filter((a) => {
    const matchesFilter = filter === 'All' || a.status === filter;
    const matchesQuery = query.trim() === '' || a.name.toLowerCase().includes(query.toLowerCase()) || a.rank.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-1 text-xs flex-wrap overflow-x-auto pb-1 sm:pb-0">
          {['All','Submitted','Under review','Signed on','Declined'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="px-2.5 py-1 rounded whitespace-nowrap shrink-0" style={{ backgroundColor: filter === f ? '#0F3049' : 'transparent', color: filter === f ? '#F4F1E8' : PALETTE.ink, border: `1px solid ${filter === f ? '#0F3049' : PALETTE.line}` }}>{f}</button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search size={15} className="absolute left-2.5 top-2.5" color={PALETTE.sub} />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, rank, or case ID" className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded text-sm outline-none" style={{ backgroundColor: '#fff', border: `1px solid ${PALETTE.line}`, color: PALETTE.ink }} />
        </div>
      </div>

      <div className="sm:hidden space-y-3">
        {visible.length === 0 && (<p className="text-sm py-10 text-center" style={{ color: PALETTE.sub }}>No cases match this search.</p>)}
        {visible.map((a) => (<div key={a.id} className="p-3" style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>{a.name} · {a.rank}</div>))}
      </div>

      <div className="hidden sm:block rounded overflow-hidden" style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '780px' }}>
            <thead>
              <tr style={{ backgroundColor: '#EEF2F0', borderBottom: `1px solid ${PALETTE.line}` }}>
                {['Case ID','Name','Rank','Vessel type','Sea service','Filed','Status'].map((h) => (<th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wide" style={{ color: PALETTE.sub }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {visible.map((a,i) => (
                <tr key={a.id} style={{ borderBottom: i < visible.length - 1 ? `1px solid ${PALETTE.line}` : 'none' }}>
                  <td className="px-4 py-3" style={{ fontFamily: "'IBM Plex Mono', monospace", color: PALETTE.sub }}>{a.id}</td>
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3">{a.rank}</td>
                  <td className="px-4 py-3">{a.vessel}</td>
                  <td className="px-4 py-3">{a.seaService}</td>
                  <td className="px-4 py-3">{a.submittedAt}</td>
                  <td className="px-4 py-3"><StatusStamp status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
