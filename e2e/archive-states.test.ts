import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, type SeedInput } from './helpers.ts';

const list = (page: Page) => page.getByRole('list', { name: 'Recipes' });
const rows = (page: Page) => list(page).getByRole('listitem');
const group = (page: Page) => page.getByRole('group', { name: 'Filter by tag' });
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

const numbered = (n: number, extra: (i: number) => object = () => ({})): NonNullable<SeedInput['recipes']> =>
	Array.from({ length: n }, (_, i) => ({
		title: `Recipe ${String(i + 1).padStart(3, '0')}`,
		createdAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
		...extra(i)
	}));

// 30-character names that sort in the order of their number
const tagNames = (n: number) => Array.from({ length: n }, (_, i) => `Tag ${String(i + 1).padStart(2, '0')} ${'x'.repeat(30 - 7)}`);

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: No recipes shows Start your archive', async ({ page }) => {
	for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
		await page.setViewportSize(size);
		await open(page, '/recipes');

		await expect(page.getByRole('heading', { name: 'Start your archive' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Add your first recipe' })).toHaveAttribute('href', '/recipes/new');
		await expect(page.getByRole('region', { name: 'Featured' })).toHaveCount(0);
		await expect(group(page)).toHaveCount(0);
		await expect(list(page)).toHaveCount(0);
		expect(await overflow(page)).toBeLessThanOrEqual(0);
	}
});

test('Scenario: Filters matching nothing offer Clear filters', async ({ page, request }) => {
	await seed(request, { recipes: [{ title: 'Lemon tart', tags: ['Dessert'] }, { title: 'Pea soup', tags: ['Soup'] }] });
	await open(page, '/recipes');

	await group(page).getByRole('button', { name: /^Dessert\b/ }).click();
	await page.getByRole('searchbox', { name: 'Search recipes' }).fill('lentil');

	await expect(page.getByText('No recipes match', { exact: true })).toBeVisible();
	await expect(page.getByText('Try fewer tags or a different word.')).toBeVisible();
	await page.getByRole('button', { name: 'Clear filters' }).click();

	await expect(rows(page)).toHaveCount(2);
	await expect(page).toHaveURL(/\/recipes$/);
	expect([...new URL(page.url()).searchParams.keys()]).toEqual([]);
});

test('Scenario: A hundred recipes stay usable', async ({ page, request }) => {
	await seed(request, { recipes: numbered(120) });
	for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
		await page.setViewportSize(size);
		await open(page, '/recipes');

		await expect(page.getByRole('region', { name: 'Featured' }).getByText(/^01\s*\/\s*07$/)).toBeVisible();
		await expect(page.getByRole('status')).toHaveText('120 recipes');
		await expect(rows(page)).toHaveCount(24);
		await expect(page.getByText('Showing 24 of 120', { exact: true })).toBeVisible();
		for (let shown = 24; shown < 120; shown += 24) {
			await page.getByRole('button', { name: 'Show 24 more' }).click();
			await expect(rows(page)).toHaveCount(shown + 24);
		}
		const last = list(page).getByRole('link', { name: 'Recipe 001', exact: true });
		await last.scrollIntoViewIfNeeded();
		await expect(last).toBeInViewport();
		expect(await overflow(page)).toBeLessThanOrEqual(0);
		await last.click();
		await expect(page).toHaveURL(/\/recipes\/\d+$/);
	}
});

test('Scenario: Long titles and many tags stay in the layout', async ({ page, request }) => {
	const title = (n: number) => `Recipe ${n} slow-roasted tomato and white bean stew with crispy sage and garlic breadcrumbs, olive oil`.padEnd(120, '!');
	await seed(request, {
		recipes: [1, 2, 3].map((n) => ({
			title: title(n),
			description: 'A long, patient stew. '.repeat(28).slice(0, 600),
			tags: n === 1 ? tagNames(40) : []
		}))
	});
	for (const size of [{ width: 320, height: 640 }, { width: 768, height: 1024 }, { width: 1280, height: 800 }]) {
		await page.setViewportSize(size);
		await open(page, '/recipes');

		await page.getByRole('button', { name: 'Show all 40 tags' }).click();
		await expect(group(page).getByRole('button', { name: /^Tag \d\d /, includeHidden: false })).toHaveCount(40);
		for (const name of tagNames(40)) {
			const chip = group(page).getByRole('button', { name: new RegExp(`^${name}`) });
			await chip.scrollIntoViewIfNeeded();
			await expect(chip).toBeVisible();
		}
		for (const n of [1, 2, 3]) await expect(list(page).getByRole('link', { name: title(n), exact: true })).toBeVisible();
		expect(await overflow(page)).toBeLessThanOrEqual(0);
	}
});

test('Scenario: Recipes head keeps Add recipe and Manage tags', async ({ page, request }) => {
	await seed(request, { recipes: numbered(2) });
	for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
		await page.setViewportSize(size);
		await open(page, '/recipes');

		const head = page.getByRole('main').locator('.screen-head');
		await expect(head.getByRole('link', { name: 'Add recipe' })).toHaveAttribute('href', '/recipes/new');
		await expect(head.getByRole('link', { name: 'Manage tags' })).toHaveAttribute('href', '/recipes/tags');
	}
});

test('Scenario: More than eight tags collapse behind Show all', async ({ page, request }) => {
	await seed(request, { recipes: numbered(2, (i) => (i === 0 ? { tags: tagNames(40) } : {})) });
	for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
		await page.setViewportSize(size);
		await open(page, '/recipes');
		const url = page.url();

		const toggle = group(page).getByRole('button', { name: 'Show all 40 tags' });
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(group(page).getByRole('button', { name: 'Favourites' })).toBeVisible();
		await expect(group(page).getByRole('button', { name: /^Tag \d\d /, includeHidden: false })).toHaveCount(8);

		await toggle.click();
		await expect(group(page).getByRole('button', { name: 'Show fewer tags' })).toHaveAttribute('aria-expanded', 'true');
		await expect(group(page).getByRole('button', { name: /^Tag \d\d /, includeHidden: false })).toHaveCount(40);
		expect(page.url()).toBe(url);
	}
});

test('Scenario: A selected tag outside the first eight stays visible', async ({ page, request }) => {
	await seed(request, { recipes: numbered(2, (i) => (i === 0 ? { tags: tagNames(40) } : {})) });
	await open(page, '/recipes');
	await page.getByRole('button', { name: 'Show all 40 tags' }).click();
	await group(page).getByRole('button', { name: /^Tag 20 / }).click();
	await expect(page).toHaveURL(/tags=\d+/);
	const selected = page.url();

	await page.goto(selected);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

	const names = group(page).getByRole('button', { name: /^Tag \d\d /, includeHidden: false });
	await expect(names).toHaveCount(9);
	const texts = await names.evaluateAll((els) => els.map((el) => el.textContent!.slice(0, 6)));
	expect(texts).toEqual(['Tag 01', 'Tag 02', 'Tag 03', 'Tag 04', 'Tag 05', 'Tag 06', 'Tag 07', 'Tag 08', 'Tag 20']);
	await expect(group(page).getByRole('button', { name: /^Tag 20 / })).toHaveAttribute('aria-pressed', 'true');
	await expect(group(page).getByRole('button', { name: 'Show all 40 tags' })).toBeVisible();
	await expect(group(page).getByRole('button', { name: /^Tag 09 / })).toHaveCount(0);
});

test('Scenario: Eight tags or fewer show no toggle', async ({ page, request }) => {
	await seed(request, { recipes: numbered(2, (i) => (i === 0 ? { tags: tagNames(8) } : {})) });
	await open(page, '/recipes');

	await expect(group(page).getByRole('button', { name: /^Tag \d\d /, includeHidden: false })).toHaveCount(8);
	await expect(page.getByRole('button', { name: /^Show all/ })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Show fewer tags' })).toHaveCount(0);
});

test('Scenario: List shows 24 and more on request', async ({ page, request }) => {
	await seed(request, { recipes: numbered(30) });
	for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
		await page.setViewportSize(size);
		await open(page, '/recipes');
		const url = page.url();

		await expect(rows(page)).toHaveCount(24);
		await expect(page.getByText('Showing 24 of 30', { exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'Show 6 more' }).click();

		await expect(rows(page)).toHaveCount(30);
		await expect(page.getByRole('button', { name: /^Show \d+ more$/ })).toHaveCount(0);
		expect(page.url()).toBe(url);
	}
});

test('Scenario: A filter change starts at 24 again', async ({ page, request }) => {
	await seed(request, { recipes: numbered(60) });
	await open(page, '/recipes');

	await page.getByRole('button', { name: 'Show 24 more' }).click();
	await expect(rows(page)).toHaveCount(48);
	await page.getByLabel('Sort recipes').selectOption({ label: 'Title A–Z' });

	await expect(rows(page)).toHaveCount(24);
	await expect(page.getByText('Showing 24 of 60', { exact: true })).toBeVisible();

	// back to the earlier sort is a change as well
	await page.getByRole('button', { name: 'Show 24 more' }).click();
	await expect(rows(page)).toHaveCount(48);
	await page.getByLabel('Sort recipes').selectOption({ label: 'Newest first' });
	await expect(rows(page)).toHaveCount(24);
	await expect(page.getByText('Showing 24 of 60', { exact: true })).toBeVisible();
});

test('Back from a recipe opened deep in the list shows as many rows as before, at the same place', async ({ page, request }) => {
	await seed(request, { recipes: numbered(120) });
	await open(page, '/recipes');
	for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /^Show \d+ more$/ }).click();
	await expect(rows(page)).toHaveCount(120);
	const last = rows(page).last().getByRole('link').first();
	await last.scrollIntoViewIfNeeded();
	const title = (await last.textContent())!.trim();
	await last.click();
	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	// the recipe page is on screen before Back: a Back while the page transition still runs is another case
	await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();

	await page.goBack();

	await expect(rows(page)).toHaveCount(120);
	await expect(rows(page).last()).toBeInViewport();
});
