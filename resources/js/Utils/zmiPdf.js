import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const normalize = (text) => String(text ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const recent = (rows = []) => [...rows].sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0) || (b.id || 0) - (a.id || 0));
const find = (rows, names) => recent(rows).find((row) => names.some((name) => normalize(row.name) === normalize(name))) || {};
const date = (value) => value ? String(value).slice(0, 10).split('-').reverse().join(':') : '';

// Convert uploaded image formats (including WebP) to PNG for PDF embedding.
const photoBytes = async (avatar) => {
    const response = await fetch(`/storage/${avatar}`);
    if (!response.ok) throw new Error('Unable to load the seafarer photo.');
    const bitmap = await createImageBitmap(await response.blob());
    try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('Unable to prepare the seafarer photo.');
        return blob.arrayBuffer();
    } finally {
        bitmap.close();
    }
};

// Coordinates use the inspected template at 990px portrait / 1000px landscape.
// Each cell scales to PDF points; text is fitted inside its original borders.
export async function buildZmiPdf(templateBytes, client, company = {}) {
    const pdf = await PDFDocument.load(templateBytes);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const pages = pdf.getPages();
    const warnings = new Set();
    const clean = (value) => [...String(value ?? '').normalize('NFC').toUpperCase()].map((c) => {
        try { font.encodeText(c); return c; } catch { warnings.add('Some unsupported characters were replaced with ?; review names and addresses.'); return '?'; }
    }).join('').replace(/\s+/g, ' ').trim();
    const box = (page, x, top, width, height, value, maxSize = 8, align = 'left') => {
        const text = clean(value);
        if (!text) return;
        const scale = page.getWidth() / (page.getWidth() > 700 ? 1000 : 990);
        const availableWidth = (width - 6) * scale;
        let size = maxSize;
        let lines;
        do {
            lines = [''];
            for (const word of text.split(' ')) {
                let line = lines.length - 1;
                if (lines[line] && font.widthOfTextAtSize(`${lines[line]} ${word}`, size) > availableWidth) { lines.push(''); line++; }
                for (const character of (lines[line] ? ` ${word}` : word)) {
                    if (font.widthOfTextAtSize(lines[line] + character, size) > availableWidth) { lines.push(''); line++; }
                    lines[line] += character;
                }
            }
            if (lines.length * size * 1.12 <= (height - 4) * scale) break;
            size -= 0.25;
        } while (size >= 3);
        if (lines.length * size * 1.12 > (height - 4) * scale) warnings.add('Some long values do not fit the form; review the PDF before printing.');
        const capacity = Math.max(1, Math.floor((height - 4) * scale / (size * 1.12)));
        lines.slice(0, capacity).forEach((line, i) => page.drawText(line, {
            x: align === 'center' ? x * scale + (width * scale - font.widthOfTextAtSize(line, size)) / 2 : (x + 3) * scale,
            y: page.getHeight() - (top + 3) * scale - size - i * size * 1.12,
            size, font,
        }));
    };
    const erase = (page, x, top, width, height) => {
        const s = page.getWidth() / (page.getWidth() > 700 ? 1000 : 990);
        page.drawRectangle({ x: x * s, y: page.getHeight() - (top + height) * s, width: width * s, height: height * s, color: rgb(1, 1, 1) });
    };
    const p = pages[0];
    if (client.avatar) {
        try {
            const photo = await pdf.embedPng(await photoBytes(client.avatar));
            const scale = p.getWidth() / 990;
            // First-page photo box: x 734–905, top 184–389, with an inset for its border.
            const frame = { x: 737 * scale, top: 187 * scale, width: 165 * scale, height: 199 * scale };
            const size = photo.scale(Math.min(frame.width / photo.width, frame.height / photo.height));
            p.drawImage(photo, {
                x: frame.x + (frame.width - size.width) / 2,
                y: p.getHeight() - frame.top - (frame.height + size.height) / 2,
                width: size.width,
                height: size.height,
            });
        } catch {
            warnings.add('The seafarer photo could not be included; review the uploaded photo and retry.');
        }
    }
    const travel = client.travel_documents || [];
    const passport = travel.find((r) => r.document_type === 'passport') || {};
    const book = travel.find((r) => r.document_type === 'seamans_book') || {};
    const coc = recent(client.certifications || [])[0] || {};
    const gmdss = recent(client.gmdss_certificates || [])[0] || {};
    const name = [client.last_name, client.first_name, client.middle_name].filter(Boolean).join(', ') || client.name;
    // Center each name above its corresponding printed label.
    if (client.last_name || client.first_name || client.middle_name) {
        box(p, 280, 187, 150, 30, client.last_name, 10, 'center');
        box(p, 425, 187, 126, 30, client.first_name, 10, 'center');
        box(p, 548, 187, 156, 30, client.middle_name, 10, 'center');
    } else {
        box(p, 270, 187, 444, 30, client.name, 10, 'center');
    }
    box(p, 270, 240, 444, 29, client.position_applied_for);
    box(p, 270, 270, 444, 27, client.date_applied);
    box(p, 341, 302, 16, 20, 'X');
    box(p, 270, 330, 444, 28, company.company_name);
    box(p, 270, 360, 444, 29, client.availability);
    const pair = (top, height, left, right) => { box(p, 270, top, 221, height, left); box(p, 716, top, 188, height, right); };
    pair(434, 28, client.nationality, client.mothers_maiden_name);
    pair(464, 27, client.religion, client.sector_sub_caste);
    pair(493, 28, client.date_of_birth, client.place_of_birth);
    box(p, 270, 523, 634, 27, client.current_home_address);
    pair(552, 28, client.telephone_numbers || client.fax_no, client.personal_mobile_no);
    pair(582, 27, client.email_address || client.email, client.whatsapp_number);
    // The supplied blank has sample X marks. Clear them before applying stored status.
    erase(p, 277, 623, 10, 18);
    const status = normalize(client.status);
    const statusX = status === 'married' ? 289 : status === 'single' ? 415 : status ? 523 : null;
    if (statusX !== null) box(p, statusX, 621, 15, 20, 'X');
    if (status && !['single', 'married'].includes(status)) box(p, 597, 613, 307, 34, client.status);
    erase(p, 345, 654, 558, 22);
    box(p, 329, 650, 574, 27, [client.next_of_kin, client.relationship].filter(Boolean).join(' / '));
    box(p, 405, 680, 498, 27, [client.contact_person, client.emergency_contact].filter(Boolean).join(' / '));
    box(p, 270, 711, 634, 36, client.nearest_airport);
    pair(750, 27, passport.number, passport.date_of_issue);
    pair(779, 27, passport.place_of_issue, passport.date_of_expiry);
    pair(809, 36, book.number, book.date_of_issue);
    pair(848, 27, book.place_of_issue, book.date_of_expiry);
    const legacySizes = String(client.coverall_shoe_size || '').split(/[,/]/).map((v) => v.trim());
    pair(907, 27, client.boiler_suit_size || legacySizes[0], client.safety_shoe_size || legacySizes[1]);
    pair(967, 27, coc.name, coc.date_of_expiry);
    pair(996, 27, coc.certificate_number, coc.place_of_issue);
    pair(1026, 27, coc.stcw_regulation, coc.revalidation_date);
    pair(1056, 40, coc.endorsement_number, coc.endorsement_expiry_date);
    pair(1130, 27, gmdss.certificate_number || gmdss.number, gmdss.date_of_expiry);
    pair(1160, 39, gmdss.endorsement_number, gmdss.endorsement_expiry_date);
    const flagRow = (page, top, names) => {
        const row = find(client.flag_documents || [], names);
        if (row.date_of_expiry) { box(page, 219, top, 17, 28, 'X'); box(page, 323, top, 109, 28, row.date_of_expiry); }
    };
    flagRow(p, 1287, ['St. Vincent', 'Saint Vincent']);
    flagRow(pages[1], 187, ['Panama']);
    erase(pages[1], 417, 318, 13, 19);
    const certificates = [...(client.certifications || []), ...(client.proficiency || []), ...(client.additional_stcw_certificates || []), ...(client.gmdss_certificates || []), ...(client.other_certificates || []), ...(client.offshore_training_certificates || [])];
    const stcw = [
        ['Basic Safety Training'], ['Personal Survival Techniques'], ['Proficiency in Survival Crafts & Rescue Boats'],
        ['Basic / Advanced Fire Fighting'], ['Basic First Aid / Medical Care / Medical First Aid'], ['Personal Safety & Social Responsibility'],
        ['Automatic Radar Plotting Aid [ARPA]', 'ARPA'], ['Radar Observer Course [ROC]', 'ROC'], ['Ships Security Awareness / Officer'],
        ['ECDIS'], ['Bridge/Engine resource management'], ['DP Certificate / Maintenance'],
    ];
    const bounds = [468, 499, 530, 569, 600, 638, 678, 709, 740, 770, 800, 831, 861];
    const certificate = (names, top, bottom) => {
        const row = find(certificates, names);
        [[394, 155, row.date_of_issue], [551, 163, row.date_of_expiry], [716, 188, row.place_of_issue]].forEach(([x, w, v]) => box(pages[1], x, top + 1, w, bottom - top - 1, v));
    };
    stcw.forEach((names, i) => certificate(names, bounds[i], bounds[i + 1]));
    [['BOSIET - OPITO'], ['H2S - OPITO'], ['HERTM - OPITO'], ['HEUET - OPITO', 'HUET - OPITO']].forEach((names, i) => certificate(names, 924 + i * 30.6, 954.6 + i * 30.6));
    recent(client.employment_history || []).slice(0, 2).forEach((row, i) => {
        const top = 1079 + i * 92;
        erase(pages[1], 313, top + 2, 590, 25);
        box(pages[1], 313, top, 590, 29, row.company);
        box(pages[1], 312, top + 31, 247, 28, row.contact_person_name);
        box(pages[1], 678, top + 31, 225, 28, row.designation);
        box(pages[1], 312, top + 62, 247, 28, row.contact_person_number);
        box(pages[1], 635, top + 62, 268, 28, row.country);
    });
    const sea = [...(client.sea_service || [])].sort((a, b) => (Date.parse(b.to_date) || 0) - (Date.parse(a.to_date) || 0));
    const deck = client.deck_officer_experience || [];
    // Preserve every sea service / deck record on copies of the original pages.
    const fillSea = (page, rows) => {
        const columns = [72, 131, 224, 266, 350, 409, 476, 528, 569, 636, 695, 737, 805, 872, 931];
        rows.forEach((row, i) => {
            const values = [row.vessel_name, row.ship_owner_manager_contact, row.position, row.type_imo_number, row.propulsion_type, row.flag, row.area_of_operation, row.grt, row.main_engine_type_model,
                Number.isFinite(Number(row.main_engine_kw)) && row.main_engine_kw ? (Number(row.main_engine_kw) * 1.34102209).toFixed(0) : '', row.bollard_pull, date(row.from_date), date(row.to_date), [row.duration_days, row.duration_months].filter((v) => v !== null && v !== undefined && v !== '').join(' : ')];
            values.forEach((v, j) => box(page, columns[j], 217 + i * 17.25, columns[j + 1] - columns[j], 17.25, v, 6));
        });
        box(page, 111, 565, 158, 19, name);
        box(page, 394, 565, 137, 19, client.position_applied_for);
    };
    const fillDeck = (page, rows) => {
        const columns = [72, 129, 193, 263, 359, 423, 476, 543, 618, 686, 754, 808, 872, 935];
        const keys = ['vessel_name', 'charterer', 'area_of_operation', 'dp_operation_hours', 'supply', 'dsv', 'survey', 'anchor_type', 'anchor_weight', 'barges', 'rig_move', 'propelled', 'non_propelled'];
        rows.forEach((row, i) => keys.forEach((key, j) => box(page, columns[j], 230 + i * 41.6, columns[j + 1] - columns[j], 41.6, row[key], 7)));
        box(page, 112, 549, 152, 19, name);
    };
    fillSea(pages[2], sea.slice(0, 15));
    fillDeck(pages[3], deck.slice(0, 7));
    const original = await PDFDocument.load(templateBytes);
    for (let i = 15; i < sea.length; i += 15) {
        const [page] = await pdf.copyPages(original, [2]); pdf.addPage(page); fillSea(page, sea.slice(i, i + 15));
    }
    for (let i = 7; i < deck.length; i += 7) {
        const [page] = await pdf.copyPages(original, [3]); pdf.addPage(page); fillDeck(page, deck.slice(i, i + 7));
    }
    if (sea.length > 15 || deck.length > 7) warnings.add('Additional sea service or deck records appear on continuation copies of the original pages.');
    return { bytes: await pdf.save(), warnings: [...warnings] };
}
