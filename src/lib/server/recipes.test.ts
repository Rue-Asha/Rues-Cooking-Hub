import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parseIngredient } from '#lib/ingredients/parse.ts';
import { COPY } from '#lib/copy.ts';
import { ValidationError } from '#lib/errors.ts';
import type { RecipeInput } from '#lib/types.ts';
import { closeDb, getDb } from './db.ts';
import { createRecipe, deleteRecipe, getRecipe, planUsage, updateRecipe } from './recipes.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-recipes-')), 'r.db');
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

function input(over: Partial<RecipeInput> = {}): RecipeInput {
	return {
		title: 'Pancakes',
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
	};
}

function count(table: string): number {
	return Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);
}

describe('createRecipe, getRecipe and updateRecipe', () => {
	it('Scenario: Recipe saved with all fields', () => {
		const id = createRecipe(
			input({
				title: 'Käse-Spätzle',
				description: 'Cheesy noodles',
				sourceUrl: 'https://example.com/spaetzle',
				servings: 4,
				prepMinutes: 15,
				cookMinutes: 25,
				notes: '**Crispy** onions on top',
				favourite: true,
				tagNames: ['Main Course', 'Weeknight'],
				ingredients: [
					{ title: 'For the dough', lines: ['300 g flour', '3 eggs'] },
					{ title: 'For the sauce', lines: ['200 g cheese', 'salt'] }
				],
				steps: [
					{ title: 'Dough', lines: ['Mix', 'Rest'] },
					{ title: null, lines: ['Serve'] }
				]
			})
		);
		const r = getRecipe(id)!;
		expect(r).toMatchObject({
			id,
			title: 'Käse-Spätzle',
			description: 'Cheesy noodles',
			sourceUrl: 'https://example.com/spaetzle',
			servings: 4,
			prepMinutes: 15,
			cookMinutes: 25,
			totalMinutes: 40,
			notes: '**Crispy** onions on top',
			favourite: true,
			imageId: null
		});
		expect(r.favouritedAt).not.toBeNull();
		expect(r.createdAt).toBe(r.updatedAt);
		expect(r.tags.map((t) => t.name).sort()).toEqual(['Main Course', 'Weeknight']);
		expect(r.ingredients.map((s) => s.title)).toEqual(['For the dough', 'For the sauce']);
		expect(r.ingredients[0].lines).toEqual(['300 g flour', '3 eggs'].map(parseIngredient));
		expect(r.ingredients[1].lines).toEqual(['200 g cheese', 'salt'].map(parseIngredient));
		expect(r.steps).toEqual([
			{ title: 'Dough', lines: ['Mix', 'Rest'] },
			{ title: null, lines: ['Serve'] }
		]);
	});

	it('Scenario: Server rejects invalid recipe input', () => {
		for (const [over, field, message] of [
			[{ title: '   ' }, 'title', COPY.titleRequired],
			[{ servings: 0 }, 'servings', COPY.servingsMin],
			[{ prepMinutes: -5 }, 'prepMinutes', COPY.minutesInvalid],
			[{ cookMinutes: 1.5 }, 'cookMinutes', COPY.minutesInvalid]
		] as const) {
			let error: unknown;
			try {
				createRecipe(input(over));
			} catch (e) {
				error = e;
			}
			expect(error).toBeInstanceOf(ValidationError);
			expect((error as ValidationError).errors).toEqual({ [field]: message });
		}
		expect(count('recipes')).toBe(0);
		expect(count('ingredient_lines')).toBe(0);

		const id = createRecipe(input());
		expect(() => updateRecipe(id, input({ title: '' }))).toThrow(ValidationError);
		expect(getRecipe(id)!.title).toBe('Pancakes');
	});

	it('Scenario: Empty section is dropped on save', () => {
		const id = createRecipe(
			input({
				ingredients: [
					{ title: 'For the sauce', lines: [] },
					{ title: null, lines: ['2 eggs'] }
				],
				steps: [
					{ title: 'Empty', lines: [] },
					{ title: null, lines: ['Whisk'] }
				]
			})
		);
		const r = getRecipe(id)!;
		expect(r.ingredients).toEqual([{ title: null, lines: [parseIngredient('2 eggs')] }]);
		expect(r.steps).toEqual([{ title: null, lines: ['Whisk'] }]);
		expect(count('ingredient_lines')).toBe(1);
	});

	it('update replaces fields, lines and tags', () => {
		const id = createRecipe(
			input({ tagNames: ['Soup'], ingredients: [{ title: null, lines: ['1 onion'] }] })
		);
		updateRecipe(
			id,
			input({
				title: 'Onion soup',
				servings: 6,
				tagNames: ['Dessert'],
				ingredients: [{ title: 'Base', lines: ['2 onions', '1 l stock'] }],
				steps: [{ title: null, lines: ['Simmer'] }]
			})
		);
		const r = getRecipe(id)!;
		expect(r.title).toBe('Onion soup');
		expect(r.servings).toBe(6);
		expect(r.tags.map((t) => t.name)).toEqual(['Dessert']);
		expect(r.ingredients).toEqual([
			{ title: 'Base', lines: ['2 onions', '1 l stock'].map(parseIngredient) }
		]);
		expect(r.steps).toEqual([{ title: null, lines: ['Simmer'] }]);
		expect(getRecipe(9999)).toBeNull();
	});
});

function image(): number {
	const r = getDb()
		.prepare(
			"INSERT INTO images (mime, width, height, bytes, created_at) VALUES ('image/webp', 4, 3, ?, '2026-10-19T08:00:00.000Z')"
		)
		.run(new Uint8Array([1, 2, 3]));
	return Number(r.lastInsertRowid);
}

function imageExists(id: number): boolean {
	return getDb().prepare('SELECT 1 FROM images WHERE id = ?').get(id) !== undefined;
}

function planEntry(recipeId: number, date: string, slot: string, position: number, servings = 2): number {
	const r = getDb()
		.prepare(
			'INSERT INTO plan_entries (date, slot, position, recipe_id, servings, text) VALUES (?, ?, ?, ?, ?, NULL)'
		)
		.run(date, slot, position, recipeId, servings);
	return Number(r.lastInsertRowid);
}

describe('deleteRecipe and planUsage', () => {
	it("Scenario: Deleted recipe's plan entries become free text", () => {
		const id = createRecipe(input({ title: 'Lasagne', imageId: image() }));
		const other = createRecipe(input({ title: 'Soup' }));
		const entries = [
			planEntry(id, '2026-10-19', 'dinner', 0),
			planEntry(id, '2026-10-19', 'dinner', 2, 4),
			planEntry(id, '2026-10-21', 'lunch', 1)
		];
		const kept = planEntry(other, '2026-10-19', 'dinner', 1);
		expect(planUsage(id)).toBe(3);
		const imageId = getRecipe(id)!.imageId!;

		expect(deleteRecipe(id)).toEqual({ convertedEntries: 3 });

		expect(getRecipe(id)).toBeNull();
		expect(imageExists(imageId)).toBe(false);
		const rows = getDb()
			.prepare('SELECT id, date, slot, position, recipe_id, servings, text FROM plan_entries ORDER BY id')
			.all();
		expect(rows).toHaveLength(4);
		expect(rows.slice(0, 3).map((r) => ({ ...r }))).toEqual([
			{ id: entries[0], date: '2026-10-19', slot: 'dinner', position: 0, recipe_id: null, servings: null, text: 'Lasagne' },
			{ id: entries[1], date: '2026-10-19', slot: 'dinner', position: 2, recipe_id: null, servings: null, text: 'Lasagne' },
			{ id: entries[2], date: '2026-10-21', slot: 'lunch', position: 1, recipe_id: null, servings: null, text: 'Lasagne' }
		]);
		expect(rows[3]).toMatchObject({ id: kept, recipe_id: other, text: null });
		expect(planUsage(other)).toBe(1);
	});

	it('Scenario: Deleting a recipe leaves the shopping list unchanged', () => {
		const id = createRecipe(input({ ingredients: [{ title: null, lines: ['200 g flour', '2 eggs'] }] }));
		const db = getDb();
		const add = db.prepare(
			`INSERT INTO shopping_items (name, name_key, manual_amounts, plan_amounts, category, checked, checked_at, origin,
			                             position, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '2026-10-19T08:00:00.000Z')`
		);
		add.run('flour', 'flour', '[]', '[{"quantity":200,"unit":"g"}]', 'pantry', 0, null, 'plan', 0);
		add.run('eggs', 'egg', '[{"quantity":2,"unit":null}]', '[]', 'dairy-eggs', 1, '2026-10-19T09:00:00.000Z', 'manual', 1);
		const before = db.prepare('SELECT * FROM shopping_items ORDER BY id').all().map((r) => ({ ...r }));

		deleteRecipe(id);

		expect(db.prepare('SELECT * FROM shopping_items ORDER BY id').all().map((r) => ({ ...r }))).toEqual(before);
		expect(before).toHaveLength(2);
	});

	it('removes lines and tag links with the recipe, and a recipe in no entry converts nothing', () => {
		const id = createRecipe(
			input({
				tagNames: ['Soup'],
				ingredients: [{ title: null, lines: ['1 onion'] }],
				steps: [{ title: null, lines: ['Chop'] }]
			})
		);
		expect(planUsage(id)).toBe(0);
		expect(deleteRecipe(id)).toEqual({ convertedEntries: 0 });
		for (const table of ['recipes', 'ingredient_lines', 'step_lines', 'recipe_tags'])
			expect(count(table)).toBe(0);
	});
});

describe('recipe image on update', () => {
	it('Scenario: Replacing the image removes the old blob', () => {
		const oldId = image();
		const newId = image();
		const id = createRecipe(input({ imageId: oldId }));

		updateRecipe(id, input({ imageId: newId }));

		expect(getRecipe(id)!.imageId).toBe(newId);
		expect(imageExists(oldId)).toBe(false);
		expect(imageExists(newId)).toBe(true);
	});

	it('Scenario: Removing the image deletes its blob', () => {
		const oldId = image();
		const id = createRecipe(input({ imageId: oldId }));

		updateRecipe(id, input({ imageId: null }));

		expect(getRecipe(id)!.imageId).toBeNull();
		expect(imageExists(oldId)).toBe(false);
	});

	it('keeps the image when the id is unchanged', () => {
		const imageId = image();
		const id = createRecipe(input({ imageId }));
		updateRecipe(id, input({ title: 'Renamed', imageId }));
		expect(getRecipe(id)!.imageId).toBe(imageId);
		expect(imageExists(imageId)).toBe(true);
	});
});
