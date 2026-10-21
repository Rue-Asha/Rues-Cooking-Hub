import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const grid = (page: Page) => page.getByRole('list', { name: 'Recipes' });
const titles = (page: Page) => grid(page).getByRole('heading', { level: 3 });
const chip = (page: Page, name: string) =>
	page.getByRole('group', { name: 'Filter by tag' }).getByRole('button', { name: new RegExp(`^${name}\\b`) });
const params = (page: Page) => new URL(page.url()).searchParams;

test('Scenario: Several tags show recipes having all of them', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		recipes: [
			{ title: 'Lemon tart', tags: ['Dessert', 'Baking'] },
			{ title: 'Panna cotta', tags: ['Dessert'] },
			{ title: 'Sourdough', tags: ['Baking'] }
		]
	});
	await open(page, '/recipes');
	await expect(titles(page)).toHaveCount(3);

	await chip(page, 'Dessert').click();
	await expect(chip(page, 'Dessert')).toHaveAttribute('aria-pressed', 'true');
	await chip(page, 'Baking').click();

	await expect(chip(page, 'Baking')).toHaveAttribute('aria-pressed', 'true');
	await expect(titles(page)).toHaveText(['Lemon tart']);
	await expect(page.getByRole('status')).toHaveText('1 recipe');
	expect(params(page).get('tags')?.split(',')).toHaveLength(2);
});

test('Scenario: Favourites-only toggle', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		recipes: [
			{ title: 'Apple pie', favourite: true },
			{ title: 'Banana bread' },
			{ title: 'Cherry clafoutis', favourite: true },
			{ title: 'Date squares' },
			{ title: 'Eton mess' }
		]
	});
	await open(page, '/recipes');
	await expect(page.getByRole('status')).toHaveText('5 recipes');

	await chip(page, 'Favourites').click();

	await expect(chip(page, 'Favourites')).toHaveAttribute('aria-pressed', 'true');
	await expect(titles(page)).toHaveText(['Cherry clafoutis', 'Apple pie']);
	await expect(page.getByRole('status')).toHaveText('2 recipes');
	expect(params(page).get('fav')).toBe('1');
});

test('Scenario: No match offers to clear filters', async ({ page, request }) => {
	await reset(request);
	await seed(request, { recipes: [{ title: 'Lemon tart', tags: ['Dessert'] }, { title: 'Pea soup', tags: ['Soup'] }] });
	await open(page, '/recipes');

	await chip(page, 'Dessert').click();
	await expect(titles(page)).toHaveText(['Lemon tart']);
	await chip(page, 'Soup').click();
	await expect(page.getByText('No recipes match', { exact: true })).toBeVisible();
	await expect(titles(page)).toHaveCount(0);

	await page.getByRole('button', { name: 'Clear filters' }).click();

	await expect(titles(page)).toHaveText(['Pea soup', 'Lemon tart']);
	await expect(page.getByText('No recipes match', { exact: true })).toHaveCount(0);
	await expect(page).toHaveURL(/\/recipes$/);
	expect([...params(page).keys()]).toEqual([]);
});

test('Scenario: Filter state survives reload and back', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		recipes: [
			{ title: 'Lemon tart', tags: ['Dessert'], favourite: true },
			{ title: 'Panna cotta', tags: ['Dessert'] },
			{ title: 'Pea soup', tags: ['Soup'], favourite: true }
		]
	});
	await open(page, '/recipes');

	await chip(page, 'Dessert').click();
	await expect(titles(page)).toHaveText(['Panna cotta', 'Lemon tart']);
	await chip(page, 'Favourites').click();
	await expect(titles(page)).toHaveText(['Lemon tart']);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(chip(page, 'Dessert')).toHaveAttribute('aria-pressed', 'true');
	await expect(chip(page, 'Favourites')).toHaveAttribute('aria-pressed', 'true');
	await expect(titles(page)).toHaveText(['Lemon tart']);

	await page.goBack();
	await expect(chip(page, 'Favourites')).toHaveAttribute('aria-pressed', 'false');
	await expect(chip(page, 'Dessert')).toHaveAttribute('aria-pressed', 'true');
	await expect(titles(page)).toHaveText(['Panna cotta', 'Lemon tart']);
	expect(params(page).get('fav')).toBeNull();
});

test('Scenario: Search from the archive', async ({ page, request }) => {
	await reset(request);
	await seed(request, { recipes: [{ title: 'Käse-Spätzle' }, { title: 'Lemon tart' }, { title: 'Spinach pie' }] });
	await open(page, '/recipes');
	const before = await page.evaluate(() => history.length);

	await page.getByRole('searchbox', { name: 'Search recipes' }).fill('spätzle');

	await expect(titles(page)).toHaveText(['Käse-Spätzle']);
	await expect(page.getByRole('status')).toHaveText('1 recipe');
	await expect.poll(() => params(page).get('q')).toBe('spätzle');
	await expect(page.getByRole('searchbox', { name: 'Search recipes' })).toBeFocused();
	expect(await page.evaluate(() => history.length)).toBe(before);
});

test('Scenario: Search without match shows the empty state', async ({ page, request }) => {
	await reset(request);
	await seed(request, { recipes: [{ title: 'Lemon tart' }, { title: 'Pea soup' }] });
	await open(page, '/recipes');

	await page.getByRole('searchbox', { name: 'Search recipes' }).fill('xylophone');

	await expect(page.getByText('No recipes match', { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
	await expect(titles(page)).toHaveCount(0);
});

test('Scenario: Sort choice in the archive', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		recipes: [
			{ title: 'Banana bread', createdAt: '2026-10-01T10:00:00.000Z' },
			{ title: 'Cherry clafoutis', createdAt: '2026-10-02T10:00:00.000Z' },
			{ title: 'apple pie', createdAt: '2026-10-03T10:00:00.000Z' },
			{ title: 'Äpfel im Schlafrock', createdAt: '2026-09-30T10:00:00.000Z' }
		]
	});
	await open(page, '/recipes');
	await expect(titles(page)).toHaveText(['apple pie', 'Cherry clafoutis', 'Banana bread', 'Äpfel im Schlafrock']);

	await page.getByLabel('Sort recipes').selectOption({ label: 'Title A–Z' });

	await expect(titles(page)).toHaveText(['Äpfel im Schlafrock', 'apple pie', 'Banana bread', 'Cherry clafoutis']);
	expect(params(page).get('sort')).toBe('title');
});
