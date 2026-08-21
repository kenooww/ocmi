import React, { useState } from 'react';

const PALETTE = {
  card: '#FFFFFF',
  line: '#DCE3DF',
  ink: '#16222B',
  sub: '#5B6B70',
  navy: '#0F3049',
  rust: '#A23E34',
  teal: '#1F6F5C',
  tealBg: '#E7EFDF',
};

const RANKS = [
  'Master','Chief Officer','Second Officer','Third Officer','Chief Engineer','Second Engineer','Third Engineer','Bosun','Able Seaman','Ordinary Seaman','Oiler','Cook / Steward','Cadet',
];

const VESSEL_TYPES = [
  'Container ship','Bulk carrier','Oil / chemical tanker','LNG carrier','Cruise ship','Offshore support','RoRo / ferry',
];

export default function NewApplication({ onSubmit, confirmedId }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', rank: '', vessel: '', seamanBook: '', seaService: '', availability: '', note: '' });
  const [errors, setErrors] = useState({});

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }
  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter your full name.';
    if (!form.email.trim()) errs.email = 'Enter an email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.rank) errs.rank = 'Select your rank.';
    if (!form.seamanBook.trim()) errs.seamanBook = "Enter your seaman's book number.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(form);
    setForm({ name: '', email: '', phone: '', rank: '', vessel: '', seamanBook: '', seaService: '', availability: '', note: '' });
  }

  const fieldStyle = (err) => ({ backgroundColor: '#fff', border: `1px solid ${err ? PALETTE.rust : PALETTE.line}`, color: PALETTE.ink });

  return (
    <div className="px-4 py-5 sm:p-6 max-w-2xl">
      <div className="rounded p-4 sm:p-6" style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
        <h2 className="text-xl mb-1" style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}>Seafarer application</h2>
        <p className="text-sm mb-6" style={{ color: PALETTE.sub }}>Fields marked with an asterisk are required.</p>

        {confirmedId && (<div className="mb-5 px-4 py-3 rounded text-sm" style={{ backgroundColor: '#E7EFDF', color: '#3F7D3B', border: `1px solid #3F7D3B` }}>Application received. Case {confirmedId} was opened.</div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>Full name *</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Renato Cruz" className="w-full px-3 py-2 rounded text-sm outline-none" />
            {errors.name && <p className="text-xs mt-1" style={{ color: '#A23E34' }}>{errors.name}</p>}
          </div>
          {/* simplified form fields for brevity */}
          <button type="submit" className="w-full py-2.5 rounded text-sm font-medium mt-2" style={{ backgroundColor: PALETTE.navy, color: '#F4F1E8' }}>Submit application</button>
        </form>
      </div>
    </div>
  );
}
