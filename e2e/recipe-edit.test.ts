import { DatabaseSync } from 'node:sqlite';
import { expect, test } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function rows<T>(sql: string): T[] {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const out = db.prepare(sql).all() as T[];
	db.close();
	return out;
}

test.beforeEach(async ({ request }) => {
	await reset(request);
});

async function seedPancakes(request: Parameters<typeof seed>[0]) {
	const { recipes } = await seed(request, {
		recipes: [
			{
				title: 'Pancakes',
				description: 'Fluffy ones',
				sourceUrl: 'https://example.com/pancakes',
				servings: 2,
				prepMinutes: 10,
				cookMinutes: 15,
				notes: '**Serve warm**',
				tags: ['Breakfast', 'Weeknight'],
				ingredients: [
					{ title: 'Batter', lines: ['200 g flour', '2 eggs'] },
					{ title: null, lines: ['butter'] }
				],
				steps: [{ title: null, lines: ['Mix.', 'Fry.'] }]
			}
		]
	});
	return recipes[0];
}

test('Scenario: Edit changes are saved', async ({ page, request }) => {
	const id = await seedPancakes(request);
	await open(page, `/recipes/${id}/edit`);

	await page.getByLabel('Title', { exact: true }).fill('Fluffy pancakes');
	await page.getByLabel('Servings', { exact: true }).fill('4');
	await page.getByLabel('Ingredient line').first().fill('250 g flour');
	await page.getByRole('button', { name: 'Save recipe' }).click();

	await expect(page).toHaveURL(new RegExp(`/recipes/${id}$`));
	await open(page, `/recipes/${id}/edit`);
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Fluffy pancakes');
	await expect(page.getByLabel('Servings', { exact: true })).toHaveValue('4');
	await expect(page.getByLabel('Ingredient line').first()).toHaveValue('250 g flour');
	expect(rows(`SELECT count(*) AS n FROM recipes`)).toEqual([{ n: 1 }]);
});

test('the edit page is prefilled with every field, section and tag', async ({ page, request }) => {
	const id = await seedPancakes(request);

	await open(page, `/recipes/${id}/edit`);

	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Pancakes');
	await expect(page.getByLabel(/^Description/)).toHaveValue('Fluffy ones');
	await expect(page.getByLabel(/^Source/)).toHaveValue('https://example.com/pancakes');
	await expect(page.getByLabel('Servings', { exact: true })).toHaveValue('2');
	await expect(page.getByLabel('Prep, min')).toHaveValue('10');
	await expect(page.getByLabel('Cook, min')).toHaveValue('15');
	await expect(page.getByLabel('Notes', { exact: true })).toHaveValue('**Serve warm**');
	const sections = page.getByRole('group', { name: /^Ingredient section/ });
	await expect(sections).toHaveCount(2);
	await expect(sections.nth(0).getByLabel('Section title')).toHaveValue('Batter');
	await expect(sections.nth(0).getByLabel('Ingredient line')).toHaveCount(2);
	await expect(sections.nth(0).getByLabel('Ingredient line').nth(1)).toHaveValue('2 eggs');
	await expect(sections.nth(1).getByLabel('Ingredient line')).toHaveValue('butter');
	await expect(page.getByLabel('Step 2')).toHaveValue('Fry.');
	const tags = page.getByRole('list', { name: 'Selected tags' });
	await expect(tags.getByText('Breakfast', { exact: true })).toBeVisible();
	await expect(tags.getByText('Weeknight', { exact: true })).toBeVisible();
});

test('saving an edit without touching the image keeps it and the favourite flag', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [{ title: 'Soup', image: true, favourite: true }] });
	const before = rows<{ image_id: number }>(`SELECT image_id FROM recipes WHERE id = ${recipes[0]}`)[0].image_id;
	await open(page, `/recipes/${recipes[0]}/edit`);
	await expect(page.locator('[data-image-frame] img:not([role])')).toHaveAttribute('src', `/images/${before}`);

	await page.getByLabel('Title', { exact: true }).fill('Soup of the day');
	await page.getByRole('button', { name: 'Save recipe' }).click();

	await expect(page).toHaveURL(new RegExp(`/recipes/${recipes[0]}$`));
	expect(rows(`SELECT title, image_id, favourite FROM recipes WHERE id = ${recipes[0]}`)).toEqual([
		{ title: 'Soup of the day', image_id: before, favourite: 1 }
	]);
});

test('an unknown recipe answers 404 on its edit page', async ({ request }) => {
	expect((await request.get('/recipes/99999/edit')).status()).toBe(404);
	expect((await request.get('/recipes/abc/edit')).status()).toBe(404);
});

test('Cancel leaves the edit form for the recipe', async ({ page, request }) => {
	const id = await seedPancakes(request);
	await open(page, `/recipes/${id}/edit`);

	await page.getByRole('link', { name: 'Cancel' }).first().click();

	await expect(page).toHaveURL(new RegExp(`/recipes/${id}$`));
});
