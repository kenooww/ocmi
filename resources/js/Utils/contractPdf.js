import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const upper = (value) => String(value ?? '').toUpperCase().replace(/\s+/g, ' ').trim();

function formatWitnessDate(value) {
    if (!value) return { day: '', monthYear: '' };
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return { day: String(value), monthYear: '' };

    return {
        day: String(date.getDate()).padStart(2, '0'),
        monthYear: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
    };
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
}

export async function buildContractPdf(templateBytes, contract, allotmentTemplateBytes) {
    const pdf = await PDFDocument.load(templateBytes);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const page = pdf.getPages()[0];
    const c = contract || {};

    const putBaseline = (x, y, width, value, size = 8, useBold = false) => {
        const text = upper(value);
        if (!text) return;

        let fittedSize = size;
        while (fittedSize > 5 && bold.widthOfTextAtSize(text, fittedSize) > width - 4) {
            fittedSize -= 0.25;
        }

        page.drawText(text, {
            x,
            y,
            size: fittedSize,
            font: useBold ? bold : font,
            color: rgb(0, 0, 0),
        });
    };

    // Exact label baselines extracted from Contract.pdf (612 x 936 points).
    putBaseline(145, 746, 430, c.seafarer_name, 8.5, true);
    putBaseline(145, 733, 115, formatDate(c.date_of_birth), 8);
    putBaseline(390, 733, 185, c.place_of_birth, 8);
    putBaseline(180, 720, 395, c.permanent_address, 7.5);

    putBaseline(205, 708, 65, c.registration_no, 7);
    putBaseline(330, 708, 65, c.srb_no, 7);
    putBaseline(490, 708, 85, c.sid_no, 7);

    putBaseline(235, 654, 340, c.agency_name, 8, true);
    putBaseline(245, 641, 330, c.dmw_agency_principal, 8);
    putBaseline(210, 628, 365, c.principal_name, 8);
    putBaseline(145, 615, 430, c.shipper_name, 8);
    putBaseline(155, 602, 420, c.shipper_address, 7.5);

    putBaseline(145, 552, 430, c.vessel_name, 8);
    putBaseline(92, 539, 85, c.imo_number, 8);
    putBaseline(220, 539, 145, c.flag, 8);
    putBaseline(475, 539, 100, c.vessel_type, 8);
    putBaseline(205, 526, 58, c.gross_registered_tonnage, 8);
    putBaseline(300, 526, 55, c.year_built, 8);
    putBaseline(500, 526, 75, c.classification_society, 8);

    putBaseline(170, 452, 400, c.duration, 8);
    putBaseline(120, 439, 450, c.position, 8);
    putBaseline(175, 426, 395, c.basic_monthly_salary, 8);
    putBaseline(160, 413, 410, c.hours_of_work, 8);
    putBaseline(125, 400, 445, c.overtime, 8);
    putBaseline(115, 387, 455, c.leave_pay, 8);
    putBaseline(125, 375, 445, c.coverage_of_cba, 8);
    putBaseline(260, 362, 310, c.collective_bargaining_agreement || 'NONE', 8);

    const witness = formatWitnessDate(c.contract_date);
    putBaseline(318, 225, 45, witness.day, 7.5);
    putBaseline(390, 225, 115, witness.monthYear, 7.5);
    putBaseline(500, 225, 75, c.contract_place, 7.5);

    putBaseline(42, 166, 220, c.seafarer_signature_name, 8, true);
    putBaseline(330, 166, 220, c.employer_name, 8, true);
    putBaseline(330, 128, 220, c.employer_designation, 7.5);

    putBaseline(215, 58, 180, c.approved_by_name, 7.5, true);
    putBaseline(215, 46, 180, c.approved_by_designation, 6.5);
    putBaseline(215, 34, 180, c.dmw_place, 6.5);
    putBaseline(215, 22, 180, formatDate(c.approved_date), 6.5);

    if (allotmentTemplateBytes) {
        const allotmentPdf = await PDFDocument.load(allotmentTemplateBytes);
        const [allotmentCover, allotmentReminder] = await pdf.copyPages(allotmentPdf, [0, 1]);

        const textOnAllotment = (value, x, y, size = 7.5, useBold = false) => {
            const content = upper(value);
            if (!content) return;

            let fittedSize = size;
            while (fittedSize > 5.5 && font.widthOfTextAtSize(content, fittedSize) > 155) {
                fittedSize -= 0.25;
            }

            allotmentCover.drawText(content, {
                x,
                y,
                size: fittedSize,
                font: useBold ? bold : font,
                color: rgb(0, 0, 0),
            });
        };

        // Crew details — coordinates match the uploaded ACC01 form.
        textOnAllotment(c.allotment_seafarer_name || c.seafarer_name, 72, 702, 8, true);
        textOnAllotment(c.allotment_position || c.position, 72, 668, 8);
        textOnAllotment(c.allotment_vessel_name || c.vessel_name, 72, 634, 8);
        textOnAllotment(c.allotment_monthly_salary || c.basic_monthly_salary, 72, 600, 8);
        textOnAllotment('', 72, 566, 8);
        textOnAllotment(c.leave_pay, 72, 532, 8);
        textOnAllotment('', 72, 498, 8);
        textOnAllotment('', 72, 464, 8);
        textOnAllotment('', 72, 430, 8);
        textOnAllotment('', 72, 396, 8);

        textOnAllotment(c.srb_no, 330, 702, 8);
        textOnAllotment(c.registration_no, 330, 668, 8);
        textOnAllotment(c.sid_no, 330, 634, 8);
        textOnAllotment(formatDate(c.date_of_birth), 330, 600, 8);
        textOnAllotment(c.place_of_birth, 330, 566, 8);
        textOnAllotment(c.permanent_address, 330, 532, 7);

        const allotments = [
            { amount: c.allotment_amount, name: c.allottee_name, relationship: c.allottee_relationship, address: c.allottee_address, bank: c.allottee_bank, account: c.allottee_account_number },
            { amount: c.allotment_amount_2, name: c.allottee_2_name, relationship: c.allottee_2_relationship, address: c.allottee_2_address, bank: c.allottee_2_bank, account: c.allottee_2_account_number },
            { amount: c.allotment_amount_3, name: c.allottee_3_name, relationship: c.allottee_3_relationship, address: c.allottee_3_address, bank: c.allottee_3_bank, account: c.allottee_3_account_number },
        ];

        const allotteeRows = [
            { top: 314, nameY: 276, addressY: 232, relationY: 276, allotmentY: 232, paymentY: 205, bankY: 205 },
            { top: 182, nameY: 144, addressY: 100, relationY: 144, allotmentY: 100, paymentY: 73, bankY: 73 },
            { top: 50, nameY: 12, addressY: -32, relationY: 12, allotmentY: -32, paymentY: -59, bankY: -59 },
        ];

        allotments.forEach((allotment, index) => {
            const row = allotteeRows[index];
            textOnAllotment(allotment.name, 72, row.nameY, 8, true);
            textOnAllotment(allotment.address, 72, row.addressY, 7);
            textOnAllotment(allotment.relationship, 330, row.relationY, 8);
            textOnAllotment(allotment.amount, 330, row.allotmentY, 8);
            textOnAllotment('', 330, row.paymentY, 8);
            textOnAllotment(allotment.account, 330, row.bankY, 7);
            textOnAllotment(allotment.bank, 450, row.bankY - 18, 7);
            textOnAllotment(allotment.address, 450, row.bankY - 36, 7);
        });

        const signed = formatWitnessDate(c.allotment_date);
        textOnAllotment(signed.day ? `${signed.day} ${signed.monthYear}` : c.allotment_date, 290, 102, 8);

        pdf.addPage(allotmentCover);
        pdf.addPage(allotmentReminder);
    }

    return { bytes: await pdf.save(), warnings: [] };
}
