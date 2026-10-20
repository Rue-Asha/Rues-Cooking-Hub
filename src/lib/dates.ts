import type { IsoDate } from './types.ts';

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

// UTC arithmetic throughout, so a daylight-saving change never moves a date
function toUtc(d: IsoDate): Date {
	const [y, m, day] = d.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, day));
}

function fromUtc(date: Date): IsoDate {
	return date.toISOString().slice(0, 10);
}

export function isIsoDate(s: string): boolean {
	const m = ISO.exec(s);
	return m !== null && fromUtc(toUtc(s)) === s;
}

export function addDays(d: IsoDate, n: number): IsoDate {
	const date = toUtc(d);
	date.setUTCDate(date.getUTCDate() + n);
	return fromUtc(date);
}

export function weekStart(d: IsoDate): IsoDate {
	return addDays(d, -((toUtc(d).getUTCDay() + 6) % 7));
}

export function weekDays(monday: IsoDate): IsoDate[] {
	return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
