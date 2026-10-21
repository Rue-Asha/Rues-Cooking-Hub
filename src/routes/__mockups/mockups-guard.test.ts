import { isHttpError } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { load } from './+layout.server.ts';

const run = () => load({} as Parameters<typeof load>[0]);

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('/__mockups guard', () => {
	it('Scenario: Mockup routes are hidden without the test flag', () => {
		for (const value of [undefined, '', '0', 'true']) {
			vi.stubEnv('COOKING_HUB_TEST', value);
			let thrown: unknown;
			try {
				run();
			} catch (e) {
				thrown = e;
			}
			expect(isHttpError(thrown, 404), String(value)).toBe(true);
		}
	});

	it('answers with the test flag', () => {
		vi.stubEnv('COOKING_HUB_TEST', '1');
		expect(run).not.toThrow();
	});
});
