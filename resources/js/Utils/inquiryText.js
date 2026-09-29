export function inquiryText(value, field = '') {
    if (typeof value !== 'string' || !value) return value;
    if (['email', 'facebook_account', 'offshore_approval', 'vessel_system'].includes(field)) return value;
    const text = value.toLowerCase();
    return text.replace(/\p{L}/u, (letter) => letter.toUpperCase());
}
