import { testFlag } from './test-flag.ts';
import type { IsoDate } from '../types.ts';

let testToday: IsoDate | null = null;

export function today(): IsoDate {
	if (testFlag() && testToday) return testToday;
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function setTestToday(d: IsoDate | null): void {
	testToday = d;
}
