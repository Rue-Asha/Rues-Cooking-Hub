import { describe, expect, it } from 'vitest';
import {
	defaultSort,
	defaultStatus,
	dropStale,
	hasSpotFilters,
	parseSpotQuery,
	rankScores,
	sortsFor,
	switchStatus,
	toSpotSearch
} from './query.ts';
import type { SpotQuery } from '#lib/types.ts';

const totals = { visited: 1, want: 1 };
const parse = (search: string) => parseSpotQuery(new URLSearchParams(search), totals);
const query = (over: Partial<SpotQuery> = {}): SpotQuery => ({
	status: 'visited',
	q: '',
	tagIds: [],
	city: null,
	price: null,
	sort: 'score',
	...over
});

describe('spot query', () => {
	it('Scenario: Default segment follows what exists', () => {
		expect([
			defaultStatus({ visited: 2, want: 1 }),
			defaultStatus({ visited: 0, want: 2 }),
			defaultStatus({ visited: 0, want: 0 })
		]).toEqual(['visited', 'want', 'visited']);
	});

	it('Scenario: Sort defaults per segment', () => {
		expect(
			['status=visited', 'status=want', 'status=want&sort=score', 'status=want&sort=name'].map((s) => parse(s).sort)
		).toEqual(['score', 'newest', 'newest', 'name']);
		expect([defaultSort('visited'), defaultSort('want')]).toEqual(['score', 'newest']);
		expect(sortsFor('visited')).toEqual(['score', 'newest', 'name']);
		expect(sortsFor('want')).toEqual(['newest', 'name']);
	});

	it('Scenario: Segment switch resets an invalid sort', () => {
		expect(switchStatus(query({ sort: 'score' }), 'want', true).sort).toBe('newest');
		expect(switchStatus(query({ sort: 'name' }), 'want', true)).toMatchObject({ status: 'want', sort: 'name' });
		expect(switchStatus(query({ sort: 'name' }), 'want', false).sort).toBe('newest');
		expect(switchStatus(query({ status: 'want', sort: 'name' }), 'visited', false).sort).toBe('score');
	});

	it('Scenario: Equal scores share a rank', () => {
		expect(rankScores([875, 875, 810, 700, 700])).toEqual([1, 1, 3, 4, 4]);
		expect(rankScores([])).toEqual([]);
	});

	it('uses the default status from the totals when the URL names none or an unknown one', () => {
		expect(parseSpotQuery(new URLSearchParams(''), { visited: 0, want: 3 }).status).toBe('want');
		expect(parseSpotQuery(new URLSearchParams('status=nope'), { visited: 2, want: 3 }).status).toBe('visited');
	});

	it('reads search, tag ids, city and price from the URL', () => {
		expect(parse('status=visited&q=m%C3%BCller&tags=3,1,x,3&city=Berlin&price=2')).toEqual({
			status: 'visited',
			q: 'müller',
			tagIds: [3, 1],
			city: 'berlin',
			price: 2,
			sort: 'score'
		});
		expect(parse('price=9').price).toBeNull();
		expect(parse('city=').city).toBeNull();
	});

	it('serialises in a fixed order, always with status, and omits the default sort', () => {
		expect(toSpotSearch(query({ sort: 'score' }))).toBe('?status=visited');
		expect(toSpotSearch(query({ status: 'want', sort: 'newest' }))).toBe('?status=want');
		expect(
			toSpotSearch(query({ q: 'ramen & co', tagIds: [5, 2], city: 'köln', price: 3, sort: 'name' }))
		).toBe('?status=visited&q=ramen%20%26%20co&tags=2,5&city=k%C3%B6ln&price=3&sort=name');
		expect(toSpotSearch(query({ status: 'want', sort: 'score' }))).toBe('?status=want&sort=score');
	});

	it('round-trips what it writes', () => {
		const q = query({ q: 'müller', tagIds: [1, 4], city: 'berlin', price: 2, sort: 'name' });

		expect(parse(toSpotSearch(q).slice(1))).toEqual(q);
	});

	it('drops stale tags, cities and prices against the facets', () => {
		const facets = { tags: [{ id: 1, name: 'Brunch' }], cities: [{ key: 'berlin', name: 'Berlin' }] };

		expect(dropStale(query({ tagIds: [1, 999], city: 'atlantis', price: 9 as never }), facets)).toEqual(
			query({ tagIds: [1] })
		);
		expect(dropStale(query({ city: 'berlin', price: 4 }), facets)).toEqual(query({ city: 'berlin', price: 4 }));
	});

	it('knows when search or filters are active; status and sort do not count', () => {
		expect(hasSpotFilters(query({ sort: 'name' }))).toBe(false);
		for (const over of [{ q: 'a' }, { tagIds: [1] }, { city: 'berlin' }, { price: 1 as const }])
			expect(hasSpotFilters(query(over))).toBe(true);
		expect(hasSpotFilters(query({ q: '  ' }))).toBe(false);
	});
});
