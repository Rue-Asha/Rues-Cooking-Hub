import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';
import { startFixtureServer, type FixtureServer } from './fixture-server.ts';

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

const field = (page: Page) => page.getByLabel('Paste a link to a recipe page');
const importIt = async (page: Page, path: string) => {
	await field(page).fill(path.startsWith('http') ? path : `${fixtures.url}${path}`);
	await page.getByRole('button', { name: 'Import', exact: true }).click();
};
const fits = async (page: Page) => {
	const { scroll, client } = await page.evaluate(() => ({
		scroll: document.documentElement.scrollWidth,
		client: document.documentElement.clientWidth
	}));
	expect(scroll).toBeLessThanOrEqual(client);
};

test('Scenario: Import states render at three widths', async ({ page, request }) => {
	await seed(request, { recipes: [{ title: 'Lemon tart (old)', sourceUrl: `${fixtures.url}/pages/lemon-tart.html` }] });
	const sizes = [
		{ width: 390, height: 844 },
		{ width: 768, height: 1024 },
		{ width: 1280, height: 800 }
	];
	for (const size of sizes) {
		await page.setViewportSize(size);

		await open(page, '/recipes/new');
		await importIt(page, '/pages/lemon-tart.html?delay=900');
		await expect(page.getByRole('status').filter({ hasText: 'Reading the page…' })).toBeVisible();
		await fits(page);

		await open(page, '/recipes/new');
		await importIt(page, '/pages/dessert-tags.html');
		await expect(page.getByText(/^Read from 127\.0\.0\.1/)).toBeVisible();
		await fits(page);

		await open(page, '/recipes/new');
		await importIt(page, '/pages/meta-only.html');
		await expect(page.getByRole('alert').filter({ hasText: "Couldn't read a recipe from this page" })).toBeVisible();
		await fits(page);

		await open(page, '/recipes/new');
		await importIt(page, '/pages/lemon-tart.html');
		await expect(page.getByRole('status').filter({ hasText: 'Already in your archive' })).toBeVisible();
		await fits(page);

		await open(page, '/recipes/new');
		await field(page).fill('recipe pie');
		await page.getByRole('button', { name: 'Import', exact: true }).click();
		await expect(page.getByText('Enter a valid web address (http or https)')).toBeVisible();
		await fits(page);
	}
});

test('Scenario: Long link and title stay usable in the import', async ({ page, request }) => {
	await page.setViewportSize({ width: 320, height: 640 });
	const base = `${fixtures.url}/pages/long-title.html?q=`;
	const long = `${base}${'a'.repeat(400 - base.length)}`;
	expect(long.length).toBeGreaterThanOrEqual(400);

	await open(page, '/recipes/new');
	await importIt(page, long);
	await expect(page.getByText(/^Read from 127\.0\.0\.1/)).toBeVisible();
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue(/^Slow-braised.{100,}$/);
	await field(page).scrollIntoViewIfNeeded();
	await expect(field(page)).toHaveValue(long);
	await fits(page);

	await seed(request, { recipes: [{ title: 'Known', sourceUrl: long }] });
	await open(page, '/recipes/new');
	await importIt(page, long);
	await expect(page.getByRole('status').filter({ hasText: 'Already in your archive' })).toBeVisible();
	await fits(page);
});

test('A failed import scrolls its alert into view below the sticky bar', async ({ page }) => {
	for (const [width, height] of [
		[390, 844],
		[1280, 800]
	]) {
		await page.setViewportSize({ width, height });
		await open(page, '/recipes/new');
		await importIt(page, '/pages/meta-only.html');
		const alert = page.getByRole('alert').filter({ hasText: "Couldn't read a recipe from this page" });
		await expect(alert).toBeVisible();
		await page.evaluate(() => new Promise((done) => setTimeout(done, 900)));
		const box = (await alert.boundingBox())!;
		const bars = await page.evaluate(() =>
			[...document.querySelectorAll<HTMLElement>('[data-bar]')]
				.map((b) => b.getBoundingClientRect())
				.filter((r) => r.height > 0 && r.top < innerHeight / 2 && r.bottom > 0)
				.map((r) => r.bottom)
		);
		const below = Math.max(0, ...bars);
		expect(box.y, `${width}: alert below the bar`).toBeGreaterThanOrEqual(below);
		expect(box.y + box.height, `${width}: alert in view`).toBeLessThanOrEqual(height);
	}
});
