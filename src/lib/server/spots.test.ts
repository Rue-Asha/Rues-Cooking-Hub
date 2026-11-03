import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ValidationError } from '#lib/errors.ts';
import { closeDb, getDb } from './db.ts';
import { listTags } from './tags.ts';
import {
	createSpot,
	deleteSpot,
	ensureSpotTags,
	getSpot,
	listSpots,
	markVisited,
	spotCounts,
	spotFacets,
	spotTags,
	spotTotals,
	topSpots,
	updateSpot
} from './spots.ts';
import type { SpotInput, SpotQuery } from '#lib/types.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-spots-')), 's.db');
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

function count(table: string): number {
	return Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);
}

function input(over: Partial<SpotInput> = {}): SpotInput {
	return {
		name: 'Café Müller',
		status: 'want',
		scoreHundredths: null,
		price: null,
		city: null,
		neighbourhood: null,
		address: null,
		website: null,
		notes: null,
		imageId: null,
		tagNames: [],
		...over
	};
}

function image(): number {
	return Number(
		getDb()
			.prepare("INSERT INTO images (mime, width, height, bytes, created_at) VALUES ('image/png', 1, 1, x'00', 'now')")
			.run().lastInsertRowid
	);
}

const names = (tags: { name: string }[]) => tags.map((t) => t.name);

function invalid(fn: () => unknown): Record<string, string> {
	try {
		fn();
	} catch (e) {
		if (e instanceof ValidationError) return e.errors;
		throw e;
	}
	throw new Error('did not throw');
}

describe('spot tags', () => {
	it('Scenario: Spot tags stay apart from recipe tags', () => {
		const before = listTags();

		createSpot(input({ tagNames: ['Brunch', 'soup'] }));

		expect(listTags()).toEqual(before);
		expect(names(before)).toHaveLength(8);
		expect(names(spotTags())).toEqual(['Brunch', 'soup']);
		expect(count('tags')).toBe(8);
	});

	it('Scenario: Spot tag names are reused ignoring case', () => {
		const [brunch, kaese] = ensureSpotTags(['Brunch', 'Käse']);

		const again = ensureSpotTags(['brunch', 'KÄSE']);

		expect(again).toEqual([brunch, kaese]);
		expect(count('spot_tags')).toBe(2);
	});

	it('creates new names once, trimmed, in input order', () => {
		const tags = ensureSpotTags(['  Wine  bar ', 'wine bar', '']);

		expect(names(tags)).toEqual(['Wine bar']);
		expect(count('spot_tags')).toBe(1);
	});

	it('Scenario: Unused spot tag drops out', () => {
		const id = createSpot(input({ tagNames: ['Brunch'] }));

		updateSpot(id, input({ tagNames: [] }));

		expect(spotTags()).toEqual([]);
		expect(count('spot_tags')).toBe(0);
	});
});

describe('create, read, update', () => {
	it('Scenario: Duplicate spot names are allowed', () => {
		const a = createSpot(input({ name: 'Five Guys', city: 'Berlin' }));
		const b = createSpot(input({ name: 'Five Guys', city: 'Hamburg' }));

		expect(a).not.toBe(b);
		expect([getSpot(a)?.city, getSpot(b)?.city]).toEqual(['Berlin', 'Hamburg']);
	});

	it('stores every field trimmed, blanks as null, and reads it back with sorted tags', () => {
		const photo = image();

		const id = createSpot(
			input({
				name: '  Café Müller ',
				status: 'visited',
				scoreHundredths: 875,
				price: 2,
				city: ' Berlin ',
				neighbourhood: '   ',
				address: 'Hauptstraße 5',
				website: 'https://example.com',
				notes: '  Great  ',
				imageId: photo,
				tagNames: ['Coffee', 'Brunch']
			})
		);

		expect(getSpot(id)).toMatchObject({
			id,
			name: 'Café Müller',
			status: 'visited',
			scoreHundredths: 875,
			price: 2,
			city: 'Berlin',
			neighbourhood: null,
			address: 'Hauptstraße 5',
			website: 'https://example.com',
			notes: 'Great',
			imageId: photo
		});
		expect(names(getSpot(id)!.tags)).toEqual(['Brunch', 'Coffee']);
		expect(getSpot(id)!.createdAt).toBe(getSpot(id)!.updatedAt);
		expect(getSpot(id + 1)).toBeNull();
	});

	it('rewrites the search text on create and update', () => {
		const id = createSpot(input({ name: 'Café Müller', city: 'Berlin', notes: 'Ramen', tagNames: ['Brunch'] }));
		const text = () => getDb().prepare('SELECT search_text FROM spots WHERE id = ?').get(id)?.search_text;

		expect(text()).toBe('café müller\nberlin\nbrunch\nramen');

		updateSpot(id, input({ name: 'Bar', tagNames: [] }));

		expect(text()).toBe('bar');
	});

	it('update replaces fields, links and bumps updatedAt, and a Visited spot can go back to Want to go', () => {
		const id = createSpot(input({ status: 'visited', scoreHundredths: 800, tagNames: ['Brunch'] }));
		getDb().prepare("UPDATE spots SET updated_at = '2000-01-01T00:00:00.000Z'").run();

		updateSpot(id, input({ name: 'Renamed', city: 'Köln', tagNames: ['Coffee'] }));

		const spot = getSpot(id)!;
		expect(spot).toMatchObject({ name: 'Renamed', city: 'Köln', status: 'want', scoreHundredths: null });
		expect(names(spot.tags)).toEqual(['Coffee']);
		expect(spot.updatedAt).not.toBe('2000-01-01T00:00:00.000Z');
	});

	it('Scenario: Removing the spot photo deletes the image', () => {
		const photo = image();
		const id = createSpot(input({ imageId: photo }));

		updateSpot(id, input({ imageId: null }));

		expect(getSpot(id)?.imageId).toBeNull();
		expect(count('images')).toBe(0);
	});

	it('replacing the photo deletes the old image row and keeping it keeps the row', () => {
		const first = image();
		const second = image();
		const id = createSpot(input({ imageId: first }));

		updateSpot(id, input({ imageId: first }));
		expect(count('images')).toBe(2);

		updateSpot(id, input({ imageId: second }));
		expect(getSpot(id)?.imageId).toBe(second);
		expect(count('images')).toBe(1);
	});
});

describe('validation', () => {
	it('refuses a blank name, Visited without score and a score outside 100-1000', () => {
		expect(invalid(() => createSpot(input({ name: '   ' })))).toEqual({ name: 'Name is required' });
		expect(invalid(() => createSpot(input({ status: 'visited' })))).toEqual({
			score: 'Visited spots need a score'
		});
		for (const score of [99, 1001, 8.5])
			expect(invalid(() => createSpot(input({ status: 'visited', scoreHundredths: score })))).toHaveProperty('score');
		expect(count('spots')).toBe(0);
	});

	it('refuses a score on a Want to go spot', () => {
		expect(invalid(() => createSpot(input({ scoreHundredths: 800 })))).toHaveProperty('score');
	});

	it('accepts http and https websites only', () => {
		for (const website of ['example.com', 'ftp://example.com', 'javascript:alert(1)'])
			expect(invalid(() => createSpot(input({ website }))), website).toEqual({
				website: 'Enter a valid web address (http or https)'
			});
		expect(() => createSpot(input({ website: 'http://example.com' }))).not.toThrow();
		expect(count('spots')).toBe(1);
	});

	it('a refused update changes nothing', () => {
		const id = createSpot(input({ tagNames: ['Brunch'] }));

		expect(() => updateSpot(id, input({ name: '', tagNames: ['Coffee'] }))).toThrow(ValidationError);

		expect(getSpot(id)?.name).toBe('Café Müller');
		expect(names(spotTags())).toEqual(['Brunch']);
	});
});

describe('markVisited and deleteSpot', () => {
	it('Scenario: Mark visited stores status and score', () => {
		const a = createSpot(input({ name: 'A' }));
		const b = createSpot(input({ name: 'B' }));

		markVisited(a, 875);
		expect(invalid(() => markVisited(b, 1001))).toHaveProperty('score');
		expect(invalid(() => markVisited(b, 0))).toHaveProperty('score');

		expect(getSpot(a)).toMatchObject({ status: 'visited', scoreHundredths: 875 });
		expect(getSpot(b)).toMatchObject({ status: 'want', scoreHundredths: null });
	});

	it('Scenario: Deleting a spot removes its photo and tag links', () => {
		const id = createSpot(input({ imageId: image(), tagNames: ['Brunch', 'Coffee'] }));
		createSpot(input({ name: 'Other', tagNames: ['Coffee'] }));

		deleteSpot(id);

		expect(getSpot(id)).toBeNull();
		expect(count('images')).toBe(0);
		expect(count('spot_tag_links')).toBe(1);
		expect(names(spotTags())).toEqual(['Coffee']);
	});

	it('deleting an unknown spot does nothing', () => {
		createSpot(input({ tagNames: ['Brunch'] }));

		deleteSpot(999);

		expect(count('spots')).toBe(1);
		expect(names(spotTags())).toEqual(['Brunch']);
	});
});

function query(over: Partial<SpotQuery> = {}): SpotQuery {
	return { status: 'visited', q: '', tagIds: [], city: null, price: null, sort: 'score', ...over };
}

function visited(name: string, score: number, over: Partial<SpotInput> = {}): number {
	return createSpot(input({ name, status: 'visited', scoreHundredths: score, ...over }));
}

const listed = (q: SpotQuery) => listSpots(q).map((s) => s.name);

describe('search and filters', () => {
	it('Scenario: Spot search covers name, neighbourhood, city, tags and notes', () => {
		createSpot(input({ name: 'Ramen Bar' }));
		createSpot(input({ name: 'A', neighbourhood: 'Ramen Kiez' }));
		createSpot(input({ name: 'B', city: 'Ramenstadt' }));
		createSpot(input({ name: 'C', tagNames: ['Ramen'] }));
		createSpot(input({ name: 'D', notes: 'best ramen in town' }));
		createSpot(input({ name: 'Other' }));

		expect(listed(query({ status: 'want', q: 'ramen', sort: 'name' }))).toEqual(['A', 'B', 'C', 'D', 'Ramen Bar']);
	});

	it('Scenario: Spot search ignores case for umlauts', () => {
		createSpot(input({ name: 'Café Müller' }));

		const found = (q: string) => listed(query({ status: 'want', q, sort: 'newest' }));

		expect([found('müller'), found('MÜLLER'), found('CAFÉ')]).toEqual([['Café Müller'], ['Café Müller'], ['Café Müller']]);
		expect(found('muller')).toEqual([]);
	});

	it('a query cannot match across the joined parts', () => {
		createSpot(input({ name: 'Alpha', city: 'Beta' }));

		expect(listed(query({ status: 'want', q: 'alpha beta', sort: 'newest' }))).toEqual([]);
	});

	it('Scenario: Spot filters combine within the segment', () => {
		visited('Match', 800, { city: 'Berlin', tagNames: ['Brunch'], price: 2 });
		visited('Wrong price', 800, { city: 'Berlin', tagNames: ['Brunch'], price: 3 });
		visited('Wrong city', 800, { city: 'Hamburg', tagNames: ['Brunch'], price: 2 });
		visited('Wrong tag', 800, { city: 'Berlin', tagNames: ['Coffee'], price: 2 });
		createSpot(input({ name: 'Want', city: 'Berlin', tagNames: ['Brunch'], price: 2 }));
		const brunch = spotTags().find((t) => t.name === 'Brunch')!.id;

		expect(listed(query({ city: 'berlin', tagIds: [brunch], price: 2 }))).toEqual(['Match']);
	});

	it('several tags select spots having all of them', () => {
		visited('Both', 800, { tagNames: ['Brunch', 'Coffee'] });
		visited('One', 700, { tagNames: ['Brunch'] });
		const ids = spotTags().map((t) => t.id);

		expect(listed(query({ tagIds: ids }))).toEqual(['Both']);
		expect(listed(query({ tagIds: [ids[0]] }))).toEqual(['Both', 'One']);
	});

	it('city filter compares folded spellings', () => {
		visited('Upper', 800, { city: 'KÖLN' });
		visited('Lower', 700, { city: 'köln' });

		expect(listed(query({ city: 'köln' }))).toEqual(['Upper', 'Lower']);
	});

	it('Scenario: Segment counts follow the filters', () => {
		visited('B1', 800, { city: 'Berlin' });
		visited('B2', 700, { city: 'Berlin' });
		createSpot(input({ name: 'B3', city: 'Berlin' }));
		visited('H1', 800, { city: 'Hamburg' });
		createSpot(input({ name: 'H2', city: 'Hamburg' }));

		expect(spotCounts(query({ city: 'berlin' }))).toEqual({ visited: 2, want: 1 });
		expect(spotCounts(query({ status: 'want', city: 'berlin' }))).toEqual({ visited: 2, want: 1 });
		expect(spotTotals()).toEqual({ visited: 3, want: 2 });
	});

	it('Scenario: Filters offer only values in use', () => {
		createSpot(input({ name: 'First', city: 'Berlin', tagNames: ['Brunch'] }));
		createSpot(input({ name: 'Second', city: 'berlin' }));
		createSpot(input({ name: 'Third', city: 'Hamburg' }));
		ensureSpotTags(['Coffee']);

		const facets = spotFacets();

		expect(facets.cities).toEqual([
			{ key: 'berlin', name: 'Berlin' },
			{ key: 'hamburg', name: 'Hamburg' }
		]);
		expect(names(facets.tags)).toEqual(['Brunch']);
	});
});

describe('sorting and ranks', () => {
	it('Scenario: Score sort orders ties by name', () => {
		visited('Alpha', 810);
		visited('Zeta', 875);
		visited('beta', 875);

		expect(listed(query())).toEqual(['beta', 'Zeta', 'Alpha']);
	});

	it('Scenario: Name and newest sorts', () => {
		for (const name of ['bistro', 'Alma', 'Café']) createSpot(input({ name }));

		expect(listed(query({ status: 'want', sort: 'name' }))).toEqual(['Alma', 'bistro', 'Café']);
		expect(listed(query({ status: 'want', sort: 'newest' }))).toEqual(['Café', 'Alma', 'bistro']);
	});

	it('newest orders by creation time, then id', () => {
		const a = createSpot(input({ name: 'Old' }));
		const b = createSpot(input({ name: 'Same' }));
		const c = createSpot(input({ name: 'Same time' }));
		getDb().prepare("UPDATE spots SET created_at = '2026-01-01T00:00:00.000Z' WHERE id IN (?, ?)").run(b, c);
		getDb().prepare("UPDATE spots SET created_at = '2025-01-01T00:00:00.000Z' WHERE id = ?").run(a);

		expect(listed(query({ status: 'want', sort: 'newest' }))).toEqual(['Same time', 'Same', 'Old']);
	});

	it('ranks Visited cards sorted by score with competition ranking, and no other list', () => {
		visited('A', 875);
		visited('B', 875);
		visited('C', 810);
		createSpot(input({ name: 'Wish' }));

		expect(listSpots(query()).map((s) => s.rank)).toEqual([1, 1, 3]);
		expect(listSpots(query({ sort: 'name' })).map((s) => s.rank)).toEqual([null, null, null]);
		expect(listSpots(query({ status: 'want', sort: 'newest' })).map((s) => s.rank)).toEqual([null]);
	});

	it('ranks recount within the filtered list', () => {
		visited('Best Berlin', 950, { city: 'Berlin' });
		visited('Hamburg', 800, { city: 'Hamburg' });

		expect(listSpots(query({ city: 'hamburg' })).map((s) => [s.name, s.rank])).toEqual([['Hamburg', 1]]);
	});

	it('cards carry the listed fields and tags by name', () => {
		const photo = image();
		const id = visited('Card', 905, {
			price: 3,
			city: 'Berlin',
			neighbourhood: 'Mitte',
			imageId: photo,
			tagNames: ['Coffee', 'Brunch']
		});

		const [card] = listSpots(query());

		expect(card).toMatchObject({
			id,
			name: 'Card',
			status: 'visited',
			scoreHundredths: 905,
			price: 3,
			city: 'Berlin',
			neighbourhood: 'Mitte',
			imageId: photo,
			rank: 1
		});
		expect(names(card.tags)).toEqual(['Brunch', 'Coffee']);
		expect(card.createdAt).toBe(getSpot(id)!.createdAt);
	});

	it('Scenario: Top spots query returns the four best visited spots', () => {
		for (const [name, score] of [['Alpha', 810], ['Zeta', 875], ['Gamma', 950], ['beta', 875], ['Delta', 700], ['Epsilon', 600]] as const)
			visited(name, score);
		createSpot(input({ name: 'Wish' }));

		const top = topSpots(4);

		expect(top.map((s) => s.name)).toEqual(['Gamma', 'beta', 'Zeta', 'Alpha']);
		expect(top.every((s) => s.rank === null)).toBe(true);
		expect(topSpots(10)).toHaveLength(6);
	});
});
