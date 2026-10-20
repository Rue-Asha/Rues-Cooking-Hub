import { DatabaseSync } from 'node:sqlite';
import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';
import { startFixtureServer, type FixtureServer } from './fixture-server.ts';

const port = Number(process.env.PORT ?? 4173);

function rows<T = Record<string, unknown>>(sql: string): T[] {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const out = db.prepare(sql).all() as T[];
	db.close();
	return out;
}

let fixtures: FixtureServer;

test.beforeAll(async () => {
	fixtures = await startFixtureServer();
});

test.afterAll(async () => {
	await fixtures.close();
});

test.beforeEach(async ({ request }) => {
	await reset(request);
});

const field = (page: import('@playwright/test').Page) => page.getByLabel('Paste a link to a recipe page');
const importIt = (page: import('@playwright/test').Page, path: string) =>
	field(page)
		.fill(`${fixtures.url}${path}`)
		.then(() => page.getByRole('button', { name: 'Import', exact: true }).click());

test('The import page offers a link field, Import and starting from scratch', async ({ page }) => {
	await open(page, '/recipes/new');

	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(field(page)).toBeVisible();
	await expect(page.getByRole('button', { name: 'Import', exact: true })).toBeVisible();
	await page.getByRole('link', { name: 'Start from scratch' }).click();
	await expect(page).toHaveURL(/\/recipes\/new\/form$/);
});

test('Scenario: Invalid URL shows an inline error', async ({ page }) => {
	await open(page, '/recipes/new');

	await field(page).fill('recipe pie');
	await page.getByRole('button', { name: 'Import', exact: true }).click();

	await expect(page.getByText('Enter a valid web address (http or https)')).toBeVisible();
	await expect(field(page)).toHaveAttribute('aria-invalid', 'true');
	await expect(field(page)).toBeFocused();
	await expect(page.getByRole('region', { name: 'Recipe preview' })).toHaveCount(0);
	await expect(page.getByLabel('Title', { exact: true })).toHaveCount(0);

	await field(page).fill('recipe pie 2');
	await expect(page.getByText('Enter a valid web address (http or https)')).toBeHidden();
});

test('Scenario: Known URL offers the existing recipe', async ({ page, request }) => {
	const url = `${fixtures.url}/pages/lemon-tart.html`;
	const { recipes } = await seed(request, { recipes: [{ title: 'Lemon tart (old)', sourceUrl: url }] });
	await open(page, '/recipes/new');

	await importIt(page, '/pages/lemon-tart.html#top');

	const notice = page.getByRole('status').filter({ hasText: 'Already in your archive' });
	await expect(notice).toBeVisible();
	await expect(notice.getByRole('link', { name: 'Lemon tart (old)' })).toHaveAttribute('href', `/recipes/${recipes[0]}`);
	await expect(page.getByLabel('Title', { exact: true })).toHaveCount(0);

	await notice.getByRole('button', { name: 'Import anyway' }).click();

	await expect(page.getByRole('region', { name: 'Recipe preview' })).toBeVisible();
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Lemon tart');
	await expect(notice).toBeHidden();
});

test('Reading the page shows a progress state until the server answers', async ({ page }) => {
	await open(page, '/recipes/new');

	await importIt(page, '/pages/lemon-tart.html?delay=900');

	const reading = page.getByRole('status').filter({ hasText: 'Reading the page…' });
	await expect(reading).toBeVisible();
	await expect(page.getByRole('button', { name: /Import|Reading/ }).first()).toBeDisabled();
	await expect(reading).toBeHidden();
});

test('Reduced motion keeps the progress text without the sweep', async ({ page }) => {
	await calm(page);
	await open(page, '/recipes/new');

	await importIt(page, '/pages/lemon-tart.html?delay=900');

	await expect(page.getByRole('status').filter({ hasText: 'Reading the page…' })).toBeVisible();
	const sweep = page.locator('[data-reading-sweep]');
	expect(await sweep.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

const save = (page: import('@playwright/test').Page) =>
	page.getByRole('region', { name: 'Recipe preview' }).getByRole('button', { name: 'Save recipe' }).first().click();

test('Scenario: Import shows an editable preview', async ({ page }) => {
	await open(page, '/recipes/new');

	await importIt(page, '/pages/lemon-tart.html');

	const preview = page.getByRole('region', { name: 'Recipe preview' });
	await expect(preview).toBeVisible();
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Lemon tart');
	await expect(page.getByLabel('Servings', { exact: true })).toHaveValue('6');
	await expect(preview.getByLabel('Ingredient line')).toHaveCount(4);
	await expect(preview.getByLabel('Ingredient line').first()).toHaveValue('200 g plain flour');
	await expect(preview.getByText('Read from 127.0.0.1')).toBeVisible();

	await page.getByLabel('Title', { exact: true }).fill('Lemon tart, my way');
	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	const [saved] = rows<{ id: number; title: string; source_url: string; servings: number; prep_minutes: number; cook_minutes: number; image_id: number | null }>(
		'SELECT * FROM recipes'
	);
	expect(saved).toMatchObject({
		title: 'Lemon tart, my way',
		source_url: `${fixtures.url}/pages/lemon-tart.html`,
		servings: 6,
		prep_minutes: 30,
		cook_minutes: 35
	});
	expect(saved.image_id).not.toBeNull();
	expect(rows(`SELECT text FROM ingredient_lines WHERE recipe_id = ${saved.id} ORDER BY position`)).toEqual([
		{ text: '200 g plain flour' },
		{ text: '100 g cold butter, cubed' },
		{ text: '4 lemons, juiced' },
		{ text: '3 eggs' }
	]);
	expect(rows(`SELECT text FROM step_lines WHERE recipe_id = ${saved.id} ORDER BY position`)).toHaveLength(2);
});

test('Scenario: Imported tags reuse existing tags', async ({ page }) => {
	await open(page, '/recipes/new');

	await importIt(page, '/pages/dessert-tags.html');

	const tags = page.getByRole('list', { name: 'Selected tags' });
	await expect(tags.getByRole('button', { name: /^Remove / })).toHaveCount(2);
	await expect(tags).toContainText('Dessert');
	await expect(tags).toContainText('Weeknight');
	await expect(tags.getByText('dessert', { exact: true })).toHaveCount(0);
	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	const names = rows<{ name: string }>('SELECT name FROM tags ORDER BY name').map((t) => t.name);
	expect(names.filter((n) => n.toLowerCase() === 'dessert')).toEqual(['Dessert']);
	expect(names).toContain('Weeknight');
	expect(
		rows<{ name: string }>('SELECT t.name FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id ORDER BY t.name').map((t) => t.name)
	).toEqual(['Dessert', 'Weeknight']);
});

test('Scenario: Image download failure saves without image', async ({ page }) => {
	await open(page, '/recipes/new');

	await importIt(page, '/pages/broken-image.html');
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Tomato soup');
	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+\/edit\?imageFailed=1$/);
	await expect(page.getByText("Saved without image: the image couldn't be downloaded.")).toBeVisible();
	expect(rows('SELECT title, image_id FROM recipes')).toEqual([{ title: 'Tomato soup', image_id: null }]);
});

test('A save error keeps the preview and what was typed', async ({ page }) => {
	await open(page, '/recipes/new');
	await importIt(page, '/pages/lemon-tart.html');

	await page.getByLabel('Title', { exact: true }).fill('');
	await page.getByLabel('Description').fill('Kept while the error shows');
	await save(page);

	await expect(page.getByText('Title is required')).toBeVisible();
	await expect(page.getByLabel('Description')).toHaveValue('Kept while the error shows');
	await expect(page.getByLabel('Ingredient line').first()).toHaveValue('200 g plain flour');
	expect(rows('SELECT id FROM recipes')).toEqual([]);
});

test('Importing another link replaces the preview', async ({ page }) => {
	await open(page, '/recipes/new');
	await importIt(page, '/pages/lemon-tart.html');
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Lemon tart');

	await importIt(page, '/pages/dessert-tags.html');

	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Plum crumble');
	await expect(page.getByRole('region', { name: 'Recipe preview' })).toHaveCount(1);
});

test('The preview rises in, and stays still under reduced motion', async ({ page }) => {
	await open(page, '/recipes/new');
	await importIt(page, '/pages/lemon-tart.html');
	const preview = page.getByRole('region', { name: 'Recipe preview' });
	await expect(preview).toBeVisible();
	expect(await preview.evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');

	await calm(page);
	await importIt(page, '/pages/dessert-tags.html');
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Plum crumble');
	expect(await preview.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test('Scenario: Import failure opens the prefilled manual form', async ({ page }) => {
	await open(page, '/recipes/new');

	await importIt(page, '/pages/meta-only.html');

	const preview = page.getByRole('region', { name: 'Recipe preview' });
	await expect(preview.getByText("Couldn't read a recipe from this page")).toBeVisible();
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue("Grandma's Pie");
	await expect(page.getByLabel('Source')).toHaveValue(`${fixtures.url}/pages/meta-only.html`);
	await expect(page.getByLabel('Image link')).toHaveValue(`${fixtures.url}/img/pie.jpg`);
	await expect(preview.getByText(/^Read from/)).toHaveCount(0);

	await preview.getByLabel('Ingredient line').first().fill('1 apple');
	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	const [saved] = rows<{ title: string; source_url: string; image_id: number | null }>('SELECT * FROM recipes');
	expect(saved).toMatchObject({ title: "Grandma's Pie", source_url: `${fixtures.url}/pages/meta-only.html` });
	expect(saved.image_id).not.toBeNull();
});

test('A blocked page falls back to the form with only the link', async ({ page }) => {
	await open(page, '/recipes/new');

	await importIt(page, '/status/403');

	await expect(page.getByText("Couldn't read a recipe from this page")).toBeVisible();
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('');
	await expect(page.getByLabel('Source')).toHaveValue(`${fixtures.url}/status/403`);
});

test('The failure message rises in, and stays still under reduced motion', async ({ page }) => {
	await open(page, '/recipes/new');
	await importIt(page, '/pages/meta-only.html');
	const message = page.getByRole('alert').filter({ hasText: "Couldn't read a recipe from this page" });
	await expect(message).toBeVisible();
	expect(await message.evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');

	await calm(page);
	await importIt(page, '/status/404');
	await expect(page.getByLabel('Source')).toHaveValue(`${fixtures.url}/status/404`);
	expect(await message.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});
