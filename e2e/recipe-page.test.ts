import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, setToday } from './helpers.ts';

const hero = (page: Page) => page.locator('[data-hero]');
const info = (page: Page) => page.locator('[data-recipe-info]');

const full = {
	title: 'Pumpkin soup',
	description: 'Roasted until sticky.',
	sourceUrl: 'https://www.example.com/pumpkin-soup',
	servings: 4,
	prepMinutes: 10,
	cookMinutes: 20,
	tags: ['Soup', 'Autumn'],
	image: true,
	ingredients: [
		{ title: 'For the soup', lines: ['1 pumpkin', '800 ml vegetable stock'] },
		{ title: 'For the butter', lines: ['60 g butter', '1 bunch sage'] }
	],
	steps: [{ title: null, lines: ['Roast the pumpkin.', 'Blend with the *stock*.'] }],
	notes: 'Freeze half **before** the cream.'
};

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Recipe page shows hero, info panel, sections and notes', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [full] });
	await open(page, `/recipes/${recipes[0]}`);

	await expect(hero(page).locator('img')).toBeVisible();
	await expect(hero(page).locator('img')).toHaveJSProperty('complete', true);
	expect(await hero(page).locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

	await expect(info(page).getByRole('heading', { level: 1 })).toHaveText('Pumpkin soup');
	await expect(info(page).getByText('Prep 10 min · Cook 20 min · 30 min total')).toBeVisible();
	await expect(info(page).getByText('4 servings', { exact: true })).toBeVisible();
	await expect(info(page).getByText('Soup', { exact: true })).toBeVisible();
	await expect(info(page).getByText('Autumn', { exact: true })).toBeVisible();
	await expect(info(page).getByRole('button', { name: 'Add Pumpkin soup to favourites' })).toHaveAttribute('aria-pressed', 'false');
	await expect(info(page).getByRole('link', { name: /Source/ })).toHaveAttribute('href', full.sourceUrl);

	const ingredients = page.getByRole('region', { name: 'Ingredients' });
	await expect(ingredients.getByRole('heading', { name: 'For the soup' })).toBeVisible();
	await expect(ingredients.getByRole('heading', { name: 'For the butter' })).toBeVisible();
	await expect(ingredients.getByRole('listitem')).toHaveText(['1 pumpkin', '800 ml vegetable stock', '60 g butter', '1 bunch sage']);

	const method = page.getByRole('region', { name: 'Method' });
	await expect(method.getByRole('listitem')).toHaveText([/Roast the pumpkin\./, /Blend with the stock\./]);
	await expect(method.locator('em')).toHaveText('stock');

	const notes = page.getByRole('region', { name: 'Notes' });
	await expect(notes).toContainText('Freeze half before the cream.');
	await expect(notes.locator('strong')).toHaveText('before');

	for (const name of ['Add to plan', 'Delete recipe']) await expect(info(page).getByRole('button', { name })).toBeVisible();
	await expect(info(page).getByRole('link', { name: 'Edit' })).toHaveAttribute('href', `/recipes/${recipes[0]}/edit`);
});

test('Scenario: Recipe page without image shows the placeholder hero', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [{ title: 'Plain rice' }] });
	await open(page, `/recipes/${recipes[0]}`);

	await expect(hero(page).getByRole('img', { name: 'No photo yet' })).toBeVisible();
	await expect(hero(page).locator('img')).toHaveCount(0);
});

test('Scenario: Recipe page without source URL shows no source link', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [{ ...full, sourceUrl: undefined }] });
	await open(page, `/recipes/${recipes[0]}`);

	await expect(info(page).getByRole('heading', { level: 1 })).toHaveText('Pumpkin soup');
	await expect(info(page).getByRole('link', { name: /Source/ })).toHaveCount(0);
});

test('Scenario: Recipe without times shows no times on its page', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [{ ...full, prepMinutes: undefined, cookMinutes: undefined }] });
	await open(page, `/recipes/${recipes[0]}`);

	await expect(info(page).getByText('4 servings', { exact: true })).toBeVisible();
	await expect(info(page).getByText(/\bmin\b/)).toHaveCount(0);
	await expect(info(page).locator('[data-times]')).toHaveCount(0);
});

test('Scenario: Unknown recipe answers 404', async ({ page }) => {
	const res = await page.goto('/recipes/999999');
	expect(res?.status()).toBe(404);
});

test('Scenario: Script in notes is not executed', async ({ page, request }) => {
	const notes = '<script>window.__pwned=1</script><img src=x onerror="window.__pwned=2">';
	const { recipes } = await seed(request, { recipes: [{ title: 'Risky', notes }] });
	await open(page, `/recipes/${recipes[0]}`);

	const section = page.getByRole('region', { name: 'Notes' });
	await expect(section).toContainText(notes);
	await expect(section.locator('script, img')).toHaveCount(0);
	expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
});

test('Scenario: Favourite toggles on the recipe page', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [{ title: 'Lasagne' }, { title: 'Porridge' }] });
	await open(page, `/recipes/${recipes[0]}`);

	await info(page).getByRole('button', { name: 'Add Lasagne to favourites' }).click();
	await expect(info(page).getByRole('button', { name: 'Remove Lasagne from favourites' })).toHaveAttribute('aria-pressed', 'true');
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(info(page).getByRole('button', { name: 'Remove Lasagne from favourites' })).toHaveAttribute('aria-pressed', 'true');

	await open(page, '/recipes?fav=1');
	const grid = page.getByRole('list', { name: 'Recipes' });
	await expect(grid.getByRole('heading', { level: 3 })).toHaveText(['Lasagne']);
});

test('Scenario: Delete names the plan entries that use the recipe', async ({ page, request }) => {
	const { recipes } = await seed(request, {
		recipes: [{ title: 'Lasagne' }, { title: 'Porridge' }],
		entries: [
			{ date: '2026-10-20', slot: 'dinner', recipe: 0, servings: 2 },
			{ date: '2026-10-22', slot: 'lunch', recipe: 0, servings: 4 }
		]
	});
	await open(page, `/recipes/${recipes[0]}`);

	await info(page).getByRole('button', { name: 'Delete recipe' }).click();
	const dialog = page.getByRole('dialog', { name: 'Delete “Lasagne”?' });
	await expect(dialog.getByRole('heading')).toHaveText('Delete “Lasagne”?');
	await expect(dialog.getByText("It's used in 2 plan entries; they'll stay in the plan as text.")).toBeVisible();

	await dialog.getByRole('button', { name: 'Delete' }).click();
	await expect(page).toHaveURL('/recipes');
	const grid = page.getByRole('list', { name: 'Recipes' });
	await expect(grid.getByRole('heading', { level: 3 })).toHaveText(['Porridge']);
	expect((await page.request.get(`/recipes/${recipes[0]}`)).status()).toBe(404);
});

test('Scenario: Recipe in no plan entry gets a plain confirm', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [{ title: 'Porridge' }] });
	await open(page, `/recipes/${recipes[0]}`);

	await info(page).getByRole('button', { name: 'Delete recipe' }).click();
	const dialog = page.getByRole('dialog', { name: 'Delete “Porridge”?' });
	await expect(dialog.getByRole('heading')).toHaveText('Delete “Porridge”?');
	await expect(dialog.getByText(/plan/)).toHaveCount(0);

	await dialog.getByRole('button', { name: 'Cancel' }).click();
	await expect(dialog).toBeHidden();
	await expect(page).toHaveURL(`/recipes/${recipes[0]}`);
});

test('Scenario: Add to plan from the recipe', async ({ page, request }) => {
	await setToday(request, '2026-10-19');
	const { recipes } = await seed(request, {
		recipes: [{ title: 'Lasagne', servings: 2 }],
		entries: [{ date: '2026-10-21', slot: 'dinner', text: 'Soup first' }]
	});
	await open(page, `/recipes/${recipes[0]}`);

	await info(page).getByRole('button', { name: 'Add to plan' }).click();
	const dialog = page.getByRole('dialog', { name: 'Add to plan' });
	await expect(dialog.getByRole('radio', { name: 'Monday 19 October' })).toBeChecked();
	await expect(dialog.getByRole('radio', { name: 'Dinner' })).toBeChecked();
	await expect(dialog.getByLabel('Servings', { exact: true })).toHaveValue('2');

	await dialog.getByText('Wed', { exact: true }).click();
	await expect(dialog.getByRole('radio', { name: 'Wednesday 21 October' })).toBeChecked();
	await dialog.getByRole('button', { name: 'More servings' }).click();
	await dialog.getByRole('button', { name: 'More servings' }).click();
	await expect(dialog.getByLabel('Servings', { exact: true })).toHaveValue('4');
	await dialog.getByRole('button', { name: 'Add to plan' }).click();

	await expect(dialog.getByRole('status')).toHaveText('Added to Wednesday · Dinner');
	await dialog.getByRole('link', { name: 'Open the week' }).click();
	await expect(page).toHaveURL('/plan?week=2026-10-19');
	const dinner = page.locator('[data-date="2026-10-21"][data-slot="dinner"]');
	await expect(dinner.locator('[data-entry]')).toHaveCount(2);
	await expect(dinner.locator('[data-entry]').nth(1).getByText('Lasagne', { exact: true })).toBeVisible();
	await expect(dinner.locator('[data-entry]').nth(1).getByText('4 servings')).toBeAttached();
});

test('Scenario: Servings below 1 are rejected when adding from the recipe', async ({ page, request }) => {
	await setToday(request, '2026-10-19');
	const { recipes } = await seed(request, { recipes: [{ title: 'Lasagne', servings: 2 }] });
	await open(page, `/recipes/${recipes[0]}`);

	await info(page).getByRole('button', { name: 'Add to plan' }).click();
	const dialog = page.getByRole('dialog', { name: 'Add to plan' });
	await dialog.getByLabel('Servings', { exact: true }).fill('0');
	await dialog.getByRole('button', { name: 'Add to plan' }).click();

	await expect(dialog.getByRole('alert')).toHaveText('Servings must be at least 1');
	await open(page, '/plan?week=2026-10-19');
	await expect(page.locator('[data-entry]')).toHaveCount(0);
});
