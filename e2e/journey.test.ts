import { expect, test, type Page } from '@playwright/test';
import { startFixtureServer, type FixtureServer } from './fixture-server.ts';
import { open, reset, seed, setToday } from './helpers.ts';

let fixtures: FixtureServer;

test.beforeAll(async () => {
	fixtures = await startFixtureServer();
});

test.afterAll(async () => {
	await fixtures.close();
});

test.afterEach(async ({ request }) => {
	await setToday(request, null);
});

const nav = (page: Page, label: string) =>
	page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label, exact: true }).click();
const grid = (page: Page) => page.getByRole('list', { name: 'Recipes' });
const info = (page: Page) => page.locator('[data-recipe-info]');
const category = (page: Page, name: string) =>
	page.getByRole('region', { name: 'To buy' }).getByRole('list', { name, exact: true });
const item = (page: Page, list: string, name: string) =>
	category(page, list)
		.getByRole('listitem')
		.filter({ has: page.getByRole('checkbox', { name, exact: true }) });

test('Scenario: Imported recipe reaches the list scaled and grouped', async ({ page, request }) => {
	// about twenty page visits on one database
	test.setTimeout(90_000);
	await reset(request);
	await setToday(request, '2026-10-21');
	// the household has shopped before: the list remembers where the flour goes, nothing else
	await seed(request, {
		recipes: [{ title: 'Tomato soup', ingredients: [{ title: null, lines: ['1 kg tomatoes'] }] }],
		categoryMemory: [{ name: 'plain flour', category: 'pantry' }]
	});

	// import from a recipe page
	await open(page, '/recipes/new');
	await page.getByLabel('Paste a link to a recipe page').fill(`${fixtures.url}/pages/lemon-tart.html`);
	await page.getByRole('button', { name: 'Import', exact: true }).click();
	const preview = page.getByRole('region', { name: 'Recipe preview' });
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Lemon tart');
	await expect(page.getByLabel('Servings', { exact: true })).toHaveValue('6');
	await preview.getByRole('button', { name: 'Save recipe' }).first().click();
	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	await expect(info(page).getByRole('heading', { level: 1 })).toHaveText('Lemon tart');

	// edit it: a new title, two servings, one more lemon, and a tag
	await info(page).getByRole('link', { name: 'Edit' }).click();
	await expect(page).toHaveURL(`/recipes/${id}/edit`);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page.getByLabel('Title', { exact: true }).fill('Lemon curd tart');
	await page.getByLabel('Servings', { exact: true }).fill('2');
	await page.getByRole('button', { name: 'Add line' }).first().click();
	await page.getByLabel('Ingredient line').last().fill('1 lemon');
	await page.getByLabel('Add a tag').fill('Weeknight');
	await page.getByLabel('Add a tag').press('Enter');
	await expect(page.getByRole('list', { name: 'Selected tags' }).getByText('Weeknight', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Save recipe' }).click();
	await expect(page).toHaveURL(`/recipes/${id}`);
	await expect(info(page).getByRole('heading', { level: 1 })).toHaveText('Lemon curd tart');
	await expect(page.getByRole('region', { name: 'Ingredients' }).getByRole('listitem')).toHaveText([
		'200 g plain flour',
		'100 g cold butter, cubed',
		'4 lemons, juiced',
		'3 eggs',
		'1 lemon'
	]);

	// find it by tag
	await nav(page, 'Recipes');
	await expect(page).toHaveURL('/recipes');
	await expect(grid(page).getByRole('heading', { level: 3 })).toHaveCount(2);
	await page.getByRole('group', { name: 'Filter by tag' }).getByRole('button', { name: /^Weeknight\b/ }).click();
	await expect(grid(page).getByRole('heading', { level: 3 })).toHaveText(['Lemon curd tart']);
	await page.getByRole('button', { name: 'Clear filters' }).click();
	await expect(grid(page).getByRole('heading', { level: 3 })).toHaveCount(2);

	// and by an ingredient
	await page.getByRole('searchbox', { name: 'Search recipes' }).fill('flour');
	await expect(grid(page).getByRole('heading', { level: 3 })).toHaveText(['Lemon curd tart']);

	// plan it for today's dinner, four servings
	await grid(page).getByRole('link', { name: 'Lemon curd tart' }).click();
	await expect(page).toHaveURL(`/recipes/${id}`);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await info(page).getByRole('button', { name: 'Add to plan' }).click();
	const dialog = page.getByRole('dialog', { name: 'Add to plan' });
	await expect(dialog.getByRole('radio', { name: 'Wednesday 21 October' })).toBeChecked();
	await expect(dialog.getByRole('radio', { name: 'Dinner' })).toBeChecked();
	await expect(dialog.getByLabel('Servings', { exact: true })).toHaveValue('2');
	await dialog.getByRole('button', { name: 'More servings' }).click();
	await dialog.getByRole('button', { name: 'More servings' }).click();
	await expect(dialog.getByLabel('Servings', { exact: true })).toHaveValue('4');
	await dialog.getByRole('button', { name: 'Add to plan' }).click();
	await expect(dialog.getByRole('status')).toHaveText('Added to Wednesday · Dinner');
	await dialog.getByRole('button', { name: 'Done' }).click();
	await expect(dialog).toBeHidden();

	// Home shows it today
	await nav(page, 'Home');
	await expect(page).toHaveURL('/');
	await expect(page.locator('[data-tile="week"] [data-day="2026-10-21"] [data-entry]')).toHaveText('Lemon curd tart');

	// the plan has it with four servings
	await nav(page, 'Plan');
	const dinner = page.locator('[data-date="2026-10-21"][data-slot="dinner"]');
	await expect(dinner.getByText('Lemon curd tart', { exact: true })).toBeVisible();
	await expect(dinner.getByText('4 servings')).toBeAttached();

	// the list: scaled ×2, the two lemon lines merged, grouped by category
	await nav(page, 'List');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page.getByRole('button', { name: 'Add from plan' }).click();
	const add = page.getByRole('dialog', { name: 'Add from plan' });
	await expect(add.getByLabel('From', { exact: true })).toHaveValue('2026-10-19');
	await add.getByRole('button', { name: 'Add to list' }).click();
	await expect(add).toHaveCount(0);
	await expect(page.getByRole('status')).toContainText('Added 4 items from the plan');

	await expect(page.getByRole('region', { name: 'To buy' }).getByRole('heading', { level: 3 })).toHaveText([
		'Pantry',
		'Other'
	]);
	await expect(category(page, 'Pantry').getByRole('listitem')).toHaveCount(1);
	await expect(item(page, 'Pantry', 'plain flour')).toContainText('400 g');
	await expect(category(page, 'Other').getByRole('listitem')).toHaveCount(3);
	await expect(item(page, 'Other', 'lemons')).toContainText('10');
	await expect(item(page, 'Other', 'cold butter')).toContainText('200 g');
	await expect(item(page, 'Other', 'eggs')).toContainText('6');
	await expect(page.getByRole('checkbox', { name: 'tomatoes', exact: true })).toHaveCount(0);
});
