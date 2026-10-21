import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from './db.ts';
import { createRecipe, getRecipe } from './recipes.ts';
import { deleteTag, ensureTags, listTags, renameTag } from './tags.ts';
import type { RecipeInput } from '#lib/types.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-tags-')), 't.db');
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

function count(table: string): number {
	return Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);
}

describe('ensureTags', () => {
	it('Scenario: Duplicate tag name reuses the existing tag', () => {
		const db = getDb();
		db.prepare('INSERT INTO tags (name, name_key) VALUES (?, ?)').run('Käse', 'käse');
		const before = count('tags');
		const dessert = db.prepare("SELECT id FROM tags WHERE name = 'Dessert'").get()!.id;
		const kaese = db.prepare("SELECT id FROM tags WHERE name = 'Käse'").get()!.id;

		const tags = ensureTags(['dessert', 'KÄSE']);

		expect(tags).toEqual([
			{ id: dessert, name: 'Dessert' },
			{ id: kaese, name: 'Käse' }
		]);
		expect(count('tags')).toBe(before);
	});

	it('creates new names once, trimmed, in input order', () => {
		const before = count('tags');
		const tags = ensureTags(['  Weeknight ', 'weeknight', '', 'Quick  Wins']);
		expect(tags.map((t) => t.name)).toEqual(['Weeknight', 'Quick Wins']);
		expect(count('tags')).toBe(before + 2);
		expect(ensureTags(['QUICK wins'])[0].id).toBe(tags[1].id);
	});
});

function recipe(title: string, tagNames: string[]): number {
	const input: RecipeInput = {
		title,
		description: null,
		sourceUrl: null,
		servings: 2,
		prepMinutes: null,
		cookMinutes: null,
		notes: null,
		favourite: false,
		imageId: null,
		tagNames,
		ingredients: [],
		steps: []
	};
	return createRecipe(input);
}

function tagId(name: string): number {
	return Number(getDb().prepare('SELECT id FROM tags WHERE name = ?').get(name)!.id);
}

function tagNames(recipeId: number): string[] {
	return getRecipe(recipeId)!.tags.map((t) => t.name);
}

function searchText(recipeId: number): string {
	return String(getDb().prepare('SELECT search_text FROM recipes WHERE id = ?').get(recipeId)!.search_text);
}

describe('listTags', () => {
	it('lists every tag by name with its recipe count', () => {
		recipe('A', ['Dessert', 'Baking']);
		recipe('B', ['Dessert']);
		const tags = listTags();
		expect(tags.map((t) => t.name)).toEqual([...tags.map((t) => t.name)].sort((a, b) => a.localeCompare(b)));
		expect(tags).toHaveLength(8);
		expect(tags.find((t) => t.name === 'Dessert')).toMatchObject({ count: 2 });
		expect(tags.find((t) => t.name === 'Baking')).toMatchObject({ count: 1 });
		expect(tags.find((t) => t.name === 'Soup')).toMatchObject({ count: 0 });
	});
});

describe('renameTag', () => {
	it('renames in place, keeps the recipes and refreshes their search text', () => {
		const a = recipe('A', ['Snack']);
		const result = renameTag(tagId('Snack'), 'Snacks');
		expect(result).toEqual({ mergedInto: null });
		expect(tagNames(a)).toEqual(['Snacks']);
		expect(searchText(a)).toContain('snacks');
		expect(listTags().some((t) => t.name === 'Snack')).toBe(false);
		expect(ensureTags(['snacks'])[0].name).toBe('Snacks');
	});

	it('changes only the case of a name without merging into itself', () => {
		const a = recipe('A', ['Snack']);
		expect(renameTag(tagId('Snack'), 'SNACK')).toEqual({ mergedInto: null });
		expect(tagNames(a)).toEqual(['SNACK']);
	});

	it('Scenario: Renaming onto an existing name merges the tags', () => {
		const a = recipe('A', ['Side']);
		const b = recipe('B', ['Side', 'Dessert']);
		const c = recipe('C', ['Dessert']);
		const side = tagId('Side');
		const dessert = tagId('Dessert');

		const result = renameTag(side, 'dessert');

		expect(result).toEqual({ mergedInto: dessert });
		expect(listTags().some((t) => t.name === 'Side')).toBe(false);
		for (const id of [a, b, c]) expect(tagNames(id)).toEqual(['Dessert']);
		expect(listTags().find((t) => t.id === dessert)).toMatchObject({ name: 'Dessert', count: 3 });
		expect(
			getDb().prepare('SELECT count(*) AS n FROM recipe_tags WHERE tag_id = ?').get(dessert)!.n
		).toBe(3);
		expect(searchText(a)).toContain('dessert');
		expect(searchText(a)).not.toContain('side');
	});
});

describe('deleteTag', () => {
	it('Scenario: Deleted tag is removed from its recipes', () => {
		const a = recipe('Cake', ['Dessert', 'Baking']);
		const b = recipe('Pie', ['Dessert']);
		const c = recipe('Bread', ['Baking']);
		expect(searchText(a)).toContain('dessert');

		expect(deleteTag(tagId('Dessert'))).toEqual({ removedFrom: 2 });

		expect(tagNames(a)).toEqual(['Baking']);
		expect(tagNames(b)).toEqual([]);
		expect(tagNames(c)).toEqual(['Baking']);
		expect(getRecipe(b)).not.toBeNull();
		for (const id of [a, b]) expect(searchText(id)).not.toContain('dessert');
		expect(searchText(c)).toContain('baking');
		expect(listTags().some((t) => t.name === 'Dessert')).toBe(false);
	});

	it('deletes an unused tag', () => {
		expect(deleteTag(tagId('Soup'))).toEqual({ removedFrom: 0 });
		expect(listTags().some((t) => t.name === 'Soup')).toBe(false);
	});
});
