import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RecipeInput } from '#lib/types.ts';
import { closeDb, getDb } from './db.ts';
import {
	createRecipe,
	featuredRecipes,
	findBySourceUrl,
	getRecipe,
	listRecipes,
	setFavourite
} from './recipes.ts';
import { ensureTags } from './tags.ts';

let clock = Date.parse('2026-10-01T08:00:00.000Z');

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-archive-')), 'a.db');
	vi.useFakeTimers({ toFake: ['Date'] });
	clock = Date.parse('2026-10-01T08:00:00.000Z');
});

afterEach(() => {
	vi.useRealTimers();
	closeDb();
	delete process.env.DATABASE_PATH;
});

// every recipe gets its own creation time, one minute after the previous one
function add(title: string, over: Partial<RecipeInput> = {}, tick = true): number {
	if (tick) clock += 60_000;
	vi.setSystemTime(clock);
	return createRecipe({
		title,
		description: null,
		sourceUrl: null,
		servings: 2,
		prepMinutes: null,
		cookMinutes: null,
		notes: null,
		favourite: false,
		imageId: null,
		tagNames: [],
		ingredients: [],
		steps: [],
		...over
	});
}

const titles = (q: Parameters<typeof listRecipes>[0]) => listRecipes(q).map((r) => r.title);

function tagId(name: string): number {
	return ensureTags([name])[0].id;
}

describe('search', () => {
	it('Scenario: Search covers title, description, ingredients and tags', () => {
		add('Lemon cake');
		add('Pound cake', { description: 'Bright with lemon zest' });
		add('Vinaigrette', { ingredients: [{ title: null, lines: ['2 tbsp lemon juice'] }] });
		add('Fizz', { tagNames: ['Lemon'] });
		add('Brownies');
		expect(titles({ q: 'lemon' }).sort()).toEqual(['Fizz', 'Lemon cake', 'Pound cake', 'Vinaigrette']);
	});

	it('Scenario: Search ignores case for umlauts', () => {
		add('Käse-Spätzle');
		add('Pancakes');
		for (const q of ['spätzle', 'SPÄTZLE', 'Spätzle', ' spätzle ']) expect(titles({ q })).toEqual(['Käse-Spätzle']);
	});

	it('Scenario: Empty search returns all recipes', () => {
		add('A');
		add('B');
		expect(titles({ q: '' })).toHaveLength(2);
		expect(titles({ q: '   ' })).toHaveLength(2);
		expect(titles({})).toHaveLength(2);
	});

	it('Scenario: Search combines with the tag filter', () => {
		add('Lemon tart', { tagNames: ['Dessert'] });
		add('Lemon chicken', { tagNames: ['Main Course'] });
		add('Chocolate tart', { tagNames: ['Dessert'] });
		expect(titles({ q: 'lemon', tagIds: [tagId('Dessert')] })).toEqual(['Lemon tart']);
	});

	it('finds nothing for a word no recipe contains and treats LIKE characters as text', () => {
		add('Lemon tart');
		expect(titles({ q: 'zucchini' })).toEqual([]);
		expect(titles({ q: '%' })).toEqual([]);
		expect(titles({ q: 'lemon ta' })).toEqual(['Lemon tart']);
	});

	it('does not match across the border of two parts', () => {
		add('Tart', { description: 'with lemon', ingredients: [{ title: null, lines: ['juice'] }] });
		expect(titles({ q: 'lemon juice' })).toEqual([]);
	});
});

describe('filters', () => {
	it('Scenario: Tag filter requires all tags on the server', () => {
		add('Both', { tagNames: ['Dessert', 'Baking'] });
		add('Dessert only', { tagNames: ['Dessert'] });
		add('Baking only', { tagNames: ['Baking'] });
		add('Untagged');
		expect(titles({ tagIds: [tagId('Dessert'), tagId('Baking')] })).toEqual(['Both']);
		expect(titles({ tagIds: [tagId('Dessert')] })).toEqual(['Dessert only', 'Both']);
		expect(titles({ tagIds: [tagId('Dessert'), tagId('Dessert')] })).toEqual(['Dessert only', 'Both']);
	});

	it('shows only favourites when asked', () => {
		add('Loved', { favourite: true });
		add('Plain');
		expect(titles({ favouritesOnly: true })).toEqual(['Loved']);
		expect(titles({ favouritesOnly: false })).toEqual(['Plain', 'Loved']);
	});

	it('returns cards with the derived fields and sorted tags', () => {
		const id = add('Cake', {
			description: 'Sweet',
			prepMinutes: 10,
			cookMinutes: 20,
			servings: 6,
			favourite: true,
			tagNames: ['Dessert', 'Baking']
		});
		const [card] = listRecipes({});
		expect(card).toEqual({
			id,
			title: 'Cake',
			description: 'Sweet',
			imageId: null,
			totalMinutes: 30,
			servings: 6,
			favourite: true,
			createdAt: getRecipe(id)!.createdAt,
			tags: [
				{ id: tagId('Baking'), name: 'Baking' },
				{ id: tagId('Dessert'), name: 'Dessert' }
			]
		});
	});
});

describe('sort', () => {
	it('Scenario: Newest first by default', () => {
		add('First');
		add('Second');
		add('Third');
		expect(titles({})).toEqual(['Third', 'Second', 'First']);
		expect(titles({ sort: 'newest' })).toEqual(['Third', 'Second', 'First']);
	});

	it('Scenario: Sort by title', () => {
		add('Banana bread');
		add('apple pie');
		add('Äpfel im Schlafrock');
		expect(titles({ sort: 'title' })).toEqual(['Äpfel im Schlafrock', 'apple pie', 'Banana bread']);
	});

	it('Scenario: Sort by total time puts recipes without time last', () => {
		add('Slow', { prepMinutes: 15, cookMinutes: 30 });
		add('No time');
		add('Quick', { cookMinutes: 15 });
		expect(titles({ sort: 'time' })).toEqual(['Quick', 'Slow', 'No time']);
		expect(listRecipes({ sort: 'time' }).map((r) => r.totalMinutes)).toEqual([15, 45, null]);
	});
});

describe('featuredRecipes', () => {
	it('Scenario: Featured query returns the seven newest recipes', () => {
		for (let i = 1; i <= 9; i++) add(`Recipe ${i}`);
		expect(featuredRecipes().map((r) => r.title)).toEqual([
			'Recipe 9',
			'Recipe 8',
			'Recipe 7',
			'Recipe 6',
			'Recipe 5',
			'Recipe 4',
			'Recipe 3'
		]);
	});

	it('shows what exists when there are fewer and nothing when empty', () => {
		expect(featuredRecipes()).toEqual([]);
		add('Only');
		expect(featuredRecipes().map((r) => r.title)).toEqual(['Only']);
	});

	it('breaks a creation-time tie by newest id', () => {
		const a = add('A');
		const b = add('B', {}, false);
		expect(featuredRecipes().map((r) => r.id)).toEqual([b, a]);
	});
});

describe('setFavourite', () => {
	it('sets and clears the flag and favouritedAt', () => {
		const id = add('Cake');
		expect(getRecipe(id)).toMatchObject({ favourite: false, favouritedAt: null });
		vi.setSystemTime(Date.parse('2026-11-01T10:00:00.000Z'));
		setFavourite(id, true);
		expect(getRecipe(id)).toMatchObject({ favourite: true, favouritedAt: '2026-11-01T10:00:00.000Z' });
		vi.setSystemTime(Date.parse('2026-11-02T10:00:00.000Z'));
		setFavourite(id, true);
		expect(getRecipe(id)!.favouritedAt).toBe('2026-11-01T10:00:00.000Z');
		setFavourite(id, false);
		expect(getRecipe(id)).toMatchObject({ favourite: false, favouritedAt: null });
	});
});

describe('findBySourceUrl', () => {
	it('finds a recipe by its source URL, ignoring a stored hash', () => {
		const id = add('Cake', { sourceUrl: 'https://example.com/cake#comments' });
		add('Pie', { sourceUrl: 'https://example.com/pie' });
		expect(findBySourceUrl('https://example.com/cake')).toEqual({ id, title: 'Cake' });
		expect(findBySourceUrl('https://example.com/pie')).toMatchObject({ title: 'Pie' });
		expect(findBySourceUrl('https://example.com/other')).toBeNull();
		expect(getDb().prepare('SELECT count(*) AS n FROM recipes').get()!.n).toBe(2);
	});
});
