import { describe, expect, it } from 'vitest';
import { activeArea, areas } from './nav.ts';

describe('nav', () => {
	it('Scenario: Active area is marked', () => {
		expect(['/', '/recipes/12', '/recipes/new/form', '/plan', '/list'].map(activeArea)).toEqual([
			'home',
			'recipes',
			'recipes',
			'plan',
			'list'
		]);
	});

	it('matches whole segments only', () => {
		expect(activeArea('/recipesque')).toBe('home');
		expect(activeArea('/list/')).toBe('list');
	});

	it('lists the four areas in nav order', () => {
		expect(areas.map((a) => [a.area, a.href, a.label])).toEqual([
			['home', '/', 'Home'],
			['recipes', '/recipes', 'Recipes'],
			['plan', '/plan', 'Plan'],
			['list', '/list', 'List']
		]);
	});
});
