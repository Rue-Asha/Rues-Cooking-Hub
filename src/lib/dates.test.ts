import { describe, expect, it } from 'vitest';
import { addDays, isIsoDate, weekDays, weekStart } from './dates.ts';

describe('weekStart', () => {
	it('is the date itself on a Monday', () => {
		expect(weekStart('2026-10-19')).toBe('2026-10-19');
	});

	it('goes back six days from a Sunday', () => {
		expect(weekStart('2026-10-25')).toBe('2026-10-19');
	});

	it('goes back across a year end', () => {
		expect(weekStart('2027-01-01')).toBe('2026-12-28');
		expect(weekStart('2021-01-03')).toBe('2020-12-28');
	});

	it('handles a leap day', () => {
		expect(weekStart('2028-02-29')).toBe('2028-02-28');
	});
});

describe('addDays', () => {
	it('adds and subtracts across month and year ends', () => {
		expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
		expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
		expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
		expect(addDays('2026-10-19', 0)).toBe('2026-10-19');
	});

	it('is not thrown off by a daylight-saving change', () => {
		expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
		expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
		expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
	});
});

describe('weekDays', () => {
	it('lists the seven days from the Monday', () => {
		expect(weekDays('2026-12-28')).toEqual([
			'2026-12-28',
			'2026-12-29',
			'2026-12-30',
			'2026-12-31',
			'2027-01-01',
			'2027-01-02',
			'2027-01-03'
		]);
	});
});

describe('isIsoDate', () => {
	it('accepts real dates', () => {
		expect(isIsoDate('2026-03-04')).toBe(true);
		expect(isIsoDate('2028-02-29')).toBe(true);
	});

	it('rejects malformed and impossible dates', () => {
		for (const s of ['', '2026-3-4', '2026-02-30', '2027-02-29', '2026-13-01', '2026-03-04T00:00', 'tomorrow'])
			expect(isIsoDate(s), s).toBe(false);
	});
});
