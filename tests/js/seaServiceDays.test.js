import test from 'node:test';
import assert from 'node:assert/strict';
import { seaServiceDays } from '../../resources/js/Utils/seaServiceDays.js';

test('counts total inclusive days across months and leap years', () => {
    assert.equal(seaServiceDays('2026-01-01', '2026-03-01'), 60);
    assert.equal(seaServiceDays('2024-02-28', '2024-03-01'), 3);
    assert.equal(seaServiceDays('2026-01-01', '2026-01-01'), 1);
    assert.equal(seaServiceDays('2025-12-31', '2026-01-01'), 2);
});

test('uses calendar dates independently of timezones and daylight saving', () => {
    assert.equal(seaServiceDays('2026-03-07T00:00:00-05:00', '2026-03-09T00:00:00-04:00'), 3);
});

test('leaves missing, invalid, and reversed periods blank', () => {
    for (const [from, to] of [[null, null], ['', '2026-01-01'], ['bad', '2026-01-01'], ['2026-02-30', '2026-03-01'], ['2026-03-02', '2026-03-01']]) {
        assert.equal(seaServiceDays(from, to), '');
    }
});
