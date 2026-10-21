import { describe, expect, it } from 'vitest';
import { hasFilters, parseQuery, toSearch, toggleTag, type ParsedQuery } from './query.ts';

const parse = (search: string) => parseQuery(new URLSearchParams(search));

describe('parseQuery', () => {
	it('reads an empty URL as the default archive', () => {
		expect(parse('')).toEqual({ q: '', tagIds: [], favouritesOnly: false, sort: 'newest' });
	});

	it('reads tags, favourites, search and sort', () => {
		expect(parse('?tags=3,5&fav=1&q=k%C3%A4se%20sp%C3%A4tzle&sort=title')).toEqual({
			q: 'käse spätzle',
			tagIds: [3, 5],
			favouritesOnly: true,
			sort: 'title'
		});
	});

	it('drops tag ids that are not numbers and repeated ids', () => {
		expect(parse('?tags=3,x,,5,3,-1').tagIds).toEqual([3, 5]);
	});

	it('falls back to newest for an unknown sort and ignores fav values other than 1', () => {
		expect(parse('?sort=random&fav=yes')).toMatchObject({ sort: 'newest', favouritesOnly: false });
	});
});

describe('toSearch', () => {
	it('gives an empty string for the default archive', () => {
		expect(toSearch({ q: '', tagIds: [], favouritesOnly: false, sort: 'newest' })).toBe('');
		expect(toSearch({})).toBe('');
	});

	it('writes parameters in one order with sorted tag ids', () => {
		expect(toSearch({ sort: 'time', q: 'lemon', favouritesOnly: true, tagIds: [5, 3] })).toBe(
			'?tags=3,5&fav=1&q=lemon&sort=time'
		);
	});

	it('leaves out a search of only spaces', () => {
		expect(toSearch({ q: '   ' })).toBe('');
	});

	it('round-trips through parseQuery, umlauts, spaces and plus signs included', () => {
		const query: ParsedQuery = { q: 'Käse & Spätzle + 2', tagIds: [2, 9], favouritesOnly: true, sort: 'title' };
		expect(parse(toSearch(query))).toEqual(query);
	});
});

describe('toggleTag', () => {
	it('adds a missing tag and removes a present one', () => {
		const q = parse('?tags=3&sort=title');
		expect(toggleTag(q, 5).tagIds).toEqual([3, 5]);
		expect(toggleTag(q, 3).tagIds).toEqual([]);
		expect(toggleTag(q, 5).sort).toBe('title');
	});
});

describe('hasFilters', () => {
	it('counts tags, favourites and a non-blank search, not the sort', () => {
		expect(hasFilters(parse('?sort=title'))).toBe(false);
		expect(hasFilters(parse('?q=%20%20'))).toBe(false);
		expect(hasFilters(parse('?tags=1'))).toBe(true);
		expect(hasFilters(parse('?fav=1'))).toBe(true);
		expect(hasFilters(parse('?q=soup'))).toBe(true);
	});
});
