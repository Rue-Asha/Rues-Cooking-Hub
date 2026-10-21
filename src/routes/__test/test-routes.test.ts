import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb, openDb, migrate } from '#lib/server/db.ts';
import { setTestToday, today } from '#lib/server/clock.ts';
import { POST as clock } from './clock/+server.ts';
import { POST as reset } from './reset/+server.ts';
import { POST as seed } from './seed/+server.ts';

function post(body: unknown): never {
	return {
		request: new Request('http://localhost/__test', { method: 'POST', body: JSON.stringify(body) })
	} as never;
}

function count(table: string): number {
	return Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);
}

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'hub-test-routes-'));
	process.env.DATABASE_PATH = join(dir, 'h.db');
	process.env.COOKING_HUB_TEST = '1';
});

afterEach(() => {
	closeDb();
	setTestToday(null);
	delete process.env.DATABASE_PATH;
	delete process.env.COOKING_HUB_TEST;
});

describe('test routes', () => {
	it('Scenario: Test routes answer 404 without the test flag', async () => {
		await seed(post({ recipes: [{ title: 'Soup' }] }));
		setTestToday('2026-01-01');
		delete process.env.COOKING_HUB_TEST;

		const later = (call: () => unknown) => Promise.resolve().then(call);
		await expect(later(() => reset(post({})))).rejects.toMatchObject({ status: 404 });
		await expect(later(() => seed(post({ recipes: [{ title: 'Stew' }] })))).rejects.toMatchObject({ status: 404 });
		await expect(later(() => clock(post({ today: '2030-05-05' })))).rejects.toMatchObject({ status: 404 });

		expect(count('recipes')).toBe(1);
		process.env.COOKING_HUB_TEST = '1';
		expect(today()).toBe('2026-01-01');
	});

	it('reset empties every data table and restores exactly the starter tags', async () => {
		await seed(
			post({
				recipes: [
					{ title: 'Soup', tags: ['Soup', 'My Own'], image: true, ingredients: [{ title: null, lines: ['1 onion'] }] },
					{ title: 'Stew' }
				],
				entries: [{ date: '2026-10-19', slot: 'dinner', recipe: 0, servings: 3 }],
				items: [{ name: 'Milk' }],
				categoryMemory: [{ name: 'Milk', category: 'dairy-eggs' }]
			})
		);
		setTestToday('2026-01-01');

		const res = await reset(post({}));

		expect(res.status).toBe(204);
		for (const t of ['recipes', 'recipe_tags', 'ingredient_lines', 'step_lines', 'images', 'plan_entries', 'shopping_items', 'category_memory'])
			expect(count(t), t).toBe(0);
		const fresh = openDb(join(dir, 'fresh.db'));
		migrate(fresh);
		expect(getDb().prepare('SELECT id, name, name_key FROM tags ORDER BY id').all()).toEqual(
			fresh.prepare('SELECT id, name, name_key FROM tags ORDER BY id').all()
		);
		expect(count('tags')).toBe(8);
		expect(today()).not.toBe('2026-01-01');
		fresh.close();
	});

	it('seed inserts recipes, lines, tags, entries, items and memory and returns their ids', async () => {
		const res = await seed(
			post({
				recipes: [
					{
						title: 'Soup',
						servings: 4,
						tags: ['Soup', 'My Own'],
						image: true,
						favourite: true,
						createdAt: '2026-01-01T00:00:00.000Z',
						ingredients: [{ title: 'Base', lines: ['1 onion', '2 carrots'] }],
						steps: [{ title: null, lines: ['Chop', 'Simmer'] }]
					},
					{ title: 'Salad' }
				],
				entries: [
					{ date: '2026-10-19', slot: 'dinner', recipe: 0, servings: 2 },
					{ date: '2026-10-19', slot: 'dinner', text: 'Takeaway' }
				],
				items: [{ name: 'Milk', manualAmounts: [{ quantity: 1, unit: 'l' }], category: 'dairy-eggs' }],
				categoryMemory: [{ name: 'Milk', category: 'dairy-eggs' }]
			})
		);

		const ids = await res.json();
		const db = getDb();
		expect(ids.recipes).toHaveLength(2);
		expect(ids.entries).toHaveLength(2);
		expect(ids.items).toHaveLength(1);
		const soup = db.prepare('SELECT * FROM recipes WHERE id = ?').get(ids.recipes[0]);
		expect(soup).toMatchObject({
			title: 'Soup',
			servings: 4,
			favourite: 1,
			created_at: '2026-01-01T00:00:00.000Z'
		});
		expect(soup?.image_id).not.toBeNull();
		expect(soup?.favourited_at).not.toBeNull();
		expect(db.prepare('SELECT servings FROM recipes WHERE id = ?').get(ids.recipes[1])?.servings).toBe(2);
		expect(
			db
				.prepare('SELECT t.name FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id WHERE rt.recipe_id = ? ORDER BY t.name')
				.all(ids.recipes[0])
				.map((r) => r.name)
		).toEqual(['My Own', 'Soup']);
		expect(count('tags')).toBe(9);
		expect(
			db.prepare('SELECT section_title, position, text FROM ingredient_lines WHERE recipe_id = ? ORDER BY position').all(ids.recipes[0])
		).toEqual([
			{ section_title: 'Base', position: 0, text: '1 onion' },
			{ section_title: 'Base', position: 1, text: '2 carrots' }
		]);
		expect(db.prepare('SELECT count(*) AS n FROM step_lines WHERE recipe_id = ?').get(ids.recipes[0])?.n).toBe(2);
		expect(
			db.prepare('SELECT recipe_id, servings, text FROM plan_entries ORDER BY position').all()
		).toEqual([
			{ recipe_id: ids.recipes[0], servings: 2, text: null },
			{ recipe_id: null, servings: null, text: 'Takeaway' }
		]);
		expect(db.prepare('SELECT manual_amounts, category, origin FROM shopping_items WHERE id = ?').get(ids.items[0])).toEqual({
			manual_amounts: '[{"quantity":1,"unit":"l"}]',
			category: 'dairy-eggs',
			origin: 'manual'
		});
		expect(count('category_memory')).toBe(1);
		const image = db.prepare('SELECT mime, bytes FROM images WHERE id = ?').get(soup?.image_id as number);
		expect(image?.mime).toBe('image/png');
		expect((image?.bytes as Uint8Array).length).toBeGreaterThan(0);
	});

	it('seeding nothing returns empty lists', async () => {
		const res = await seed(post({}));

		expect(await res.json()).toEqual({ recipes: [], entries: [], items: [] });
	});

	it('the clock route sets and clears the server date', async () => {
		expect((await clock(post({ today: '2026-03-04' }))).status).toBe(204);
		expect(today()).toBe('2026-03-04');

		await clock(post({ today: null }));

		expect(today()).not.toBe('2026-03-04');
	});
});
