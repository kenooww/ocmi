function calendarDate(value) {
    const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
    if (!match) return null;

    const [, year, month, day] = match.map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;

    return date.getTime();
}

// Days on board include both the sign-on and sign-off calendar dates.
export function seaServiceDays(fromDate, toDate) {
    const from = calendarDate(fromDate);
    const to = calendarDate(toDate);
    if (from === null || to === null || to < from) return '';

    return (to - from) / 86400000 + 1;
}
