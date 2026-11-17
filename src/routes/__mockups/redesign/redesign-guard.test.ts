import { isHttpError } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { load } from './+layout.server.ts';
import { mockData } from './fixtures.ts';

const run = () => load({} as Parameters<typeof load>[0]);

function thrown(fn: () => unknown): unknown {
	try {
		fn();
	} catch (e) {
		return e;
	}
}

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('/__mockups/redesign guard', () => {
	it('Scenario: Redesign mockups are hidden without the test flag', () => {
		for (const value of [undefined, '', '0', 'true']) {
			vi.stubEnv('COOKING_HUB_TEST', value);
			expect(isHttpError(thrown(run), 404), String(value)).toBe(true);
		}
		vi.stubEnv('COOKING_HUB_TEST', '1');
		expect(run).not.toThrow();
	});
});

describe('mockData', () => {
	const normal = mockData(new URL('http://x/__mockups/redesign'));
	const worst = mockData(new URL('http://x/__mockups/redesign?data=worst'));

	it('selects the worst-case set with ?data=worst', () => {
		expect(normal.worst).toBe(false);
		expect(worst.worst).toBe(true);
		expect(worst.recipe.title).toHaveLength(120);
		expect(normal.recipe.title.length).toBeLessThan(80);
		expect(worst.list.flatMap((c) => c.items)).toHaveLength(80);
		expect(worst.list).toHaveLength(9);
		expect(worst.recipes).toHaveLength(120);
		expect(worst.tags.find((t) => t.name.length === 60)).toBeDefined();
		expect(worst.recipe.tags).toHaveLength(40);
		expect(worst.recipe.tags.every((t) => t.length === 30)).toBe(true);
		expect(worst.recipe.description).toHaveLength(600);
		expect(worst.recipe.ingredients.flatMap((s) => s.lines)).toHaveLength(50);
		expect(worst.recipe.sourceUrl).toHaveLength(400);
		expect(worst.week.some((d) => Object.values(d.entries).some((e) => e.length === 5))).toBe(true);
		expect(worst.week.flatMap((d) => Object.values(d.entries).flat()).some((e) => (e.text ?? '').length === 200)).toBe(true);
	});

	it('has the empty sets in the worst-case data and a full week in both', () => {
		expect(worst.empty).toEqual({ recipes: [], week: [], list: [], tags: [], spots: [] });
		expect(normal.week).toHaveLength(7);
		expect(worst.week).toHaveLength(7);
		for (const d of [normal, worst]) for (const day of d.week) expect(Object.keys(day.entries)).toEqual(['breakfast', 'lunch', 'dinner', 'snacks']);
	});
});
