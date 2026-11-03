import { DatabaseSync } from 'node:sqlite';
import { expect, test } from '@playwright/test';
import { calm, open, reset, seed, setToday } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function rows(sql: string, ...args: (string | number)[]) {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const out = db.prepare(sql).all(...args);
	db.close();
	return out;
}

test('Scenario: Reset leaves an empty archive with the starter tags', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	await reset(request);
	await seed(request, {
		recipes: [{ title: 'Soup', tags: ['Soup', 'Only Here'] }, { title: 'Stew' }],
		entries: [{ date: '2026-10-19', slot: 'dinner', recipe: 0 }],
		items: [{ name: 'Milk' }],
		categoryMemory: [{ name: 'Milk', category: 'dairy-eggs' }],
		spots: [{ name: 'Café', tags: ['Brunch'], image: true }, { name: 'Bar', status: 'visited', scoreHundredths: 800 }]
	});

	await reset(request);

	for (const table of [
		'recipes',
		'plan_entries',
		'shopping_items',
		'category_memory',
		'images',
		'spots',
		'spot_tags',
		'spot_tag_links'
	])
		expect(rows(`SELECT count(*) AS n FROM ${table}`)[0].n, table).toBe(0);
	expect(rows('SELECT name FROM tags ORDER BY id').map((r) => r.name)).toEqual([
		'Breakfast',
		'Main Course',
		'Side',
		'Dessert',
		'Snack',
		'Soup',
		'Salad',
		'Baking'
	]);
});

test('Scenario: Seed returns the ids of what it inserted', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	await reset(request);

	const ids = await seed(request, {
		recipes: [{ title: 'Soup' }, { title: 'Stew', image: true }],
		entries: [{ date: '2026-10-19', slot: 'lunch', recipe: 1, servings: 3 }],
		items: [{ name: 'Milk' }],
		spots: [{ name: 'Café', city: 'Berlin' }, { name: 'Bar', status: 'visited', scoreHundredths: 875 }]
	});

	expect(ids.recipes).toHaveLength(2);
	expect(ids.spots).toHaveLength(2);
	expect(rows('SELECT name, status, score_hundredths FROM spots ORDER BY id')).toEqual([
		{ name: 'Café', status: 'want', score_hundredths: null },
		{ name: 'Bar', status: 'visited', score_hundredths: 875 }
	]);
	expect(ids.entries).toHaveLength(1);
	expect(ids.items).toHaveLength(1);
	expect(rows('SELECT title FROM recipes ORDER BY id').map((r) => r.title)).toEqual(['Soup', 'Stew']);
	expect(rows('SELECT recipe_id, servings FROM plan_entries WHERE id = ?', ids.entries[0])).toEqual([
		{ recipe_id: ids.recipes[1], servings: 3 }
	]);
	expect(rows('SELECT name FROM shopping_items WHERE id = ?', ids.items[0])).toEqual([{ name: 'Milk' }]);
	expect(rows('SELECT image_id FROM recipes WHERE id = ?', ids.recipes[1])[0].image_id).not.toBeNull();
});

test('Scenario: Seeded spots carry their photos', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	await reset(request);

	const { spots } = await seed(request, {
		spots: [{ name: 'Synthetic', image: true }, { name: 'Fixture', image: '/mockups/sourdough.jpg' }]
	});

	for (const id of spots) {
		const imageId = rows('SELECT image_id FROM spots WHERE id = ?', id)[0].image_id as number;
		expect(imageId).not.toBeNull();
		expect((await request.get(`/images/${imageId}`)).status()).toBe(200);
	}
});

test('the clock route accepts a date and null', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');

	await setToday(request, '2026-03-04');
	await setToday(request, null);
});

test('Scenario: App is hydrated before tests interact', async ({ page }) => {
	await calm(page);

	await open(page, '/');

	expect(await page.locator('html[data-hydrated]').count()).toBe(1);
});
