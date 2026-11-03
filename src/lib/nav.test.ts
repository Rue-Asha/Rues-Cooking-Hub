import { describe, expect, it } from 'vitest';
import { activeArea, areas, headerActions } from './nav.ts';

describe('nav', () => {
	it('Scenario: Active area is marked', () => {
		expect(
			[
				'/',
				'/recipes/12',
				'/recipes/new/form',
				'/plan',
				'/list',
				'/eating-out',
				'/eating-out/new',
				'/eating-out/3',
				'/eating-out/3/edit'
			].map(activeArea)
		).toEqual(['home', 'recipes', 'recipes', 'plan', 'list', 'eating-out', 'eating-out', 'eating-out', 'eating-out']);
	});

	it('matches whole segments only', () => {
		expect(activeArea('/recipesque')).toBe('home');
		expect(activeArea('/list/')).toBe('list');
	});

	it('lists the five areas in nav order', () => {
		expect(areas.map((a) => [a.area, a.href, a.label])).toEqual([
			['home', '/', 'Home'],
			['recipes', '/recipes', 'Recipes'],
			['plan', '/plan', 'Plan'],
			['list', '/list', 'List'],
			['eating-out', '/eating-out', 'Eating Out']
		]);
		expect(areas.filter((a) => a.divider).map((a) => a.area)).toEqual(['eating-out']);
	});

	it('Scenario: Header actions per area', () => {
		const recipe = {
			search: { label: 'Search recipes', href: '/recipes' },
			add: { label: 'Add recipe', href: '/recipes/new' }
		};
		for (const area of ['home', 'recipes', 'plan', 'list'] as const) expect(headerActions(area)).toEqual(recipe);
		expect(headerActions('eating-out')).toEqual({
			search: { label: 'Search spots', href: '/eating-out#search' },
			add: { label: 'Add spot', href: '/eating-out/new' }
		});
	});
});
