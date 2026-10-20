import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrate, openDb } from './db.ts';

let db: DatabaseSync;

beforeEach(() => {
	db = openDb(join(mkdtempSync(join(tmpdir(), 'hub-schema-')), 's.db'));
	migrate(db);
});

afterEach(() => {
	db.close();
});

const NOW = '2026-10-19T08:00:00.000Z';

function recipe(title = 'Soup', servings = 2): number {
	const r = db
		.prepare('INSERT INTO recipes (title, servings, created_at, updated_at) VALUES (?, ?, ?, ?)')
		.run(title, servings, NOW, NOW);
	return Number(r.lastInsertRowid);
}

function entry(recipeId: number | null, servings: number | null, text: string | null, slot = 'dinner') {
	return db
		.prepare(
			"INSERT INTO plan_entries (date, slot, position, recipe_id, servings, text) VALUES ('2026-10-19', ?, 0, ?, ?, ?)"
		)
		.run(slot, recipeId, servings, text);
}

function item(category = 'other', origin = 'manual') {
	return db
		.prepare(
			'INSERT INTO shopping_items (name, name_key, category, origin, position, created_at) VALUES (?, ?, ?, ?, 0, ?)'
		)
		.run('Onions', 'onion', category, origin, NOW);
}

describe('0002_core schema', () => {
	it('creates every table', () => {
		const names = db
			.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
			.all()
			.map((r) => String(r.name));

		expect(names).toEqual(
			expect.arrayContaining([
				'category_memory',
				'images',
				'ingredient_lines',
				'plan_entries',
				'recipe_tags',
				'recipes',
				'shopping_items',
				'step_lines',
				'tags'
			])
		);
	});

	it('refuses a plan entry with both a recipe and text', () => {
		expect(() => entry(recipe(), 2, 'Leftovers')).toThrow(/CHECK/);
	});

	it('refuses a plan entry with neither, a blank text or a recipe without servings', () => {
		expect(() => entry(null, null, null)).toThrow(/CHECK/);
		expect(() => entry(null, null, '   ')).toThrow(/CHECK/);
		expect(() => entry(recipe(), null, null)).toThrow(/CHECK/);
		expect(() => entry(recipe(), 0, null)).toThrow(/CHECK/);
		expect(() => entry(null, 2, 'Takeaway')).toThrow(/CHECK/);
	});

	it('accepts a recipe entry and a free-text entry', () => {
		expect(() => entry(recipe(), 4, null)).not.toThrow();
		expect(() => entry(null, null, 'Takeaway')).not.toThrow();
	});

	it('refuses an unknown slot', () => {
		expect(() => entry(null, null, 'Takeaway', 'brunch')).toThrow(/CHECK/);
	});

	it('refuses a blank title and fewer than one serving', () => {
		expect(() => recipe('   ')).toThrow(/CHECK/);
		expect(() => recipe('Soup', 0)).toThrow(/CHECK/);
	});

	it('refuses an unknown shopping category or origin', () => {
		expect(() => item('sweets')).toThrow(/CHECK/);
		expect(() => item('other', 'robot')).toThrow(/CHECK/);
		expect(() => item('produce', 'plan')).not.toThrow();
	});

	it('refuses to delete a recipe that a plan entry still uses', () => {
		const id = recipe();
		entry(id, 2, null);

		expect(() => db.prepare('DELETE FROM recipes WHERE id = ?').run(id)).toThrow(/FOREIGN KEY/);
	});

	it('cascades a recipe delete to its tags and lines and nulls the image', () => {
		const img = db
			.prepare("INSERT INTO images (mime, width, height, bytes, created_at) VALUES ('image/webp', 1, 1, x'00', ?)")
			.run(NOW).lastInsertRowid;
		const id = recipe();
		db.prepare('UPDATE recipes SET image_id = ? WHERE id = ?').run(img, id);
		db.prepare('INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, 1)').run(id);
		db.prepare(
			"INSERT INTO ingredient_lines (recipe_id, section, position, text, name) VALUES (?, 0, 0, '1 onion', 'onion')"
		).run(id);
		db.prepare("INSERT INTO step_lines (recipe_id, section, position, text) VALUES (?, 0, 0, 'Chop')").run(id);

		db.prepare('DELETE FROM images WHERE id = ?').run(img);
		expect(db.prepare('SELECT image_id FROM recipes WHERE id = ?').get(id)?.image_id).toBeNull();

		db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
		for (const t of ['recipe_tags', 'ingredient_lines', 'step_lines'])
			expect(db.prepare(`SELECT count(*) AS n FROM ${t}`).get()?.n, t).toBe(0);
	});
});
