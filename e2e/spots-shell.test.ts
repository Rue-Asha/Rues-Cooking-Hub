import { expect, test, type Page } from '@playwright/test';
import { mainNav, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ request }) => {
	await reset(request);
});

const widths = [
	{ width: 390, height: 844 },
	{ width: 1280, height: 800 }
];

const overflows = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
const fontOf = (page: Page, selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontFamily);

test('Scenario: Spot pages render on the fingerprint', async ({ page, request }) => {
	const { spots } = await seed(request, {
		spots: [{ name: 'Ramen Bar', status: 'visited', scoreHundredths: 850, price: 2, city: 'Berlin', tags: ['Ramen'], image: true }, { name: 'Pasta Fresca' }]
	});
	const pages = [
		{ path: '/eating-out', heading: 'Eating Out' },
		{ path: '/eating-out/new', heading: 'A new spot' },
		{ path: `/eating-out/${spots[0]}`, heading: 'Ramen Bar' },
		{ path: `/eating-out/${spots[0]}/edit`, heading: 'Edit spot' }
	];

	for (const size of widths) {
		await page.setViewportSize(size);
		for (const { path, heading } of pages) {
			await open(page, path);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
			await expect(mainNav(page).locator('[aria-current="page"]')).toHaveText(size.width < 1024 ? 'Spots' : 'Eating Out');
			await expect(page.locator('main .screen-head ul.kicker')).toBeVisible();
			await expect(page.locator('main .screen-head h1 em.accent-word')).toHaveCount(1);
			await expect(page.locator('html')).toHaveAttribute('data-accent', 'rosemary');
			expect(await fontOf(page, 'h1'), path).toContain('Gilda Display');
			expect(await fontOf(page, 'main p, main label'), path).toContain('DM Sans');
			expect(await overflows(page), `${path} at ${size.width}`).toBe(false);
		}
	}
});

test('Scenario: Spot pages keep their behaviour', async ({ page }) => {
	await page.setViewportSize(widths[0]);
	await open(page, '/eating-out/new');
	await page.getByLabel('Name', { exact: true }).fill('Ramen Bar');
	await page.getByRole('button', { name: 'Save spot' }).click();
	await expect(page).toHaveURL(/\/eating-out\/\d+$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ramen Bar');

	await page.getByRole('link', { name: 'Back to Eating Out' }).click();
	await expect(page).toHaveURL('/eating-out');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page.getByRole('link', { name: 'Search spots' }).click();
	const search = page.getByRole('searchbox', { name: 'Search spots' });
	await expect(search).toBeFocused();
	await search.fill('Ramen');
	await expect(page.getByRole('list', { name: 'Spots' }).getByRole('heading', { level: 3 })).toHaveText(['Ramen Bar']);

	await page.getByRole('link', { name: 'Ramen Bar' }).click();
	await page.getByRole('button', { name: 'Mark visited' }).click();
	const sheet = page.getByRole('dialog', { name: 'Mark visited' });
	await sheet.getByLabel('Score').fill('8.5');
	await sheet.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('dialog')).toHaveCount(0);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page.getByRole('link', { name: 'Back to Eating Out' }).click();
	await page.getByRole('link', { name: 'Ramen Bar' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ramen Bar');
	await expect(page.getByRole('main').getByText('Visited', { exact: true })).toBeVisible();
	await expect(page.getByRole('main').getByText('8.50', { exact: true })).toBeVisible();
});
