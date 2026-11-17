import { describe, expect, it } from 'vitest';
import { activeArea, areas, headerActions, plusHidden, POSTURE_SWITCH } from './nav.ts';

describe('nav', () => {
	it('Scenario: Active area is derived for sub-routes', () => {
		expect(
			[
				'/',
				'/recipes/12',
				'/recipes/new/form',
				'/recipes/tags',
				'/plan',
				'/list',
				'/eating-out',
				'/eating-out/new',
				'/eating-out/3',
				'/eating-out/3/edit'
			].map(activeArea)
		).toEqual(['home', 'recipes', 'recipes', 'recipes', 'plan', 'list', 'eating-out', 'eating-out', 'eating-out', 'eating-out']);
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

	it('hides the plus on the recipe form routes only', () => {
		expect(['/recipes/new', '/recipes/new/form', '/recipes/12/edit'].map(plusHidden)).toEqual([true, true, true]);
		expect(['/', '/recipes', '/recipes/12', '/recipes/tags', '/plan', '/list', '/eating-out/new', '/eating-out/3/edit'].map(plusHidden)).toEqual(
			Array(8).fill(false)
		);
	});

	it('keeps the posture switch at 1024 and labels Eating Out "Spots" on the phone', () => {
		expect(POSTURE_SWITCH).toBe(1024);
		expect(areas.map((a) => a.phoneLabel)).toEqual(['Home', 'Recipes', 'Plan', 'List', 'Spots']);
	});
});
