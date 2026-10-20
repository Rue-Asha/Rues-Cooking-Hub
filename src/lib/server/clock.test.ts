import { afterEach, describe, expect, it } from 'vitest';
import { setTestToday, today } from './clock.ts';

function localDate(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

afterEach(() => {
	setTestToday(null);
	delete process.env.COOKING_HUB_TEST;
});

describe('clock', () => {
	it('Scenario: Test clock sets today', () => {
		process.env.COOKING_HUB_TEST = '1';

		setTestToday('2026-03-04');
		expect(today()).toBe('2026-03-04');

		setTestToday(null);
		expect(today()).toBe(localDate());
	});

	it('ignores the override without the test flag', () => {
		setTestToday('2026-03-04');

		expect(today()).toBe(localDate());
	});
});
