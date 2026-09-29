import test from 'node:test';
import assert from 'node:assert/strict';
import { ageFromBirthday } from '../../resources/js/Utils/ageFromBirthday.js';

test('counts completed years before, on, and after the birthday', () => {
    assert.equal(ageFromBirthday('1990-09-30T00:00:00.000000Z', new Date(2026, 8, 29)), 35);
    assert.equal(ageFromBirthday('1990-09-30', new Date(2026, 8, 30)), 36);
    assert.equal(ageFromBirthday('1990-09-30', new Date(2026, 9, 1)), 36);
    assert.equal(ageFromBirthday('2026-09-30', new Date(2026, 8, 30)), 0);
});

test('handles leap birthdays and rejects missing, invalid or future birthdays', () => {
    assert.equal(ageFromBirthday('2000-02-29', new Date(2025, 1, 28)), 24);
    assert.equal(ageFromBirthday('2000-02-29', new Date(2025, 2, 1)), 25);
    for (const value of [null, '', 'invalid', '2025-02-29', '2026-10-01']) {
        assert.equal(ageFromBirthday(value, new Date(2026, 8, 30)), null);
    }
});
