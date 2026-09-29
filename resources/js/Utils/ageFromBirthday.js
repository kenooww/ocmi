export function ageFromBirthday(birthday, today = new Date()) {
    const match = typeof birthday === 'string' && /^(\d{4})-(\d{2})-(\d{2})(?:$|T| )/.exec(birthday);
    if (!match || Number.isNaN(today.getTime())) return null;

    const [, year, month, day] = match.map(Number);
    const birth = new Date(0);
    birth.setUTCFullYear(year, month - 1, day);
    if (birth.getUTCFullYear() !== year || birth.getUTCMonth() !== month - 1 || birth.getUTCDate() !== day) return null;

    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--;
    return age >= 0 ? age : null;
}
