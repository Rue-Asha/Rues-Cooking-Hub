import { expect, test } from '@playwright/test';
import { mapsUrl } from '../src/lib/spots/format.ts';
import { open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ request }) => {
	await reset(request);
});

const full = {
	name: 'Café Müller',
	status: 'visited' as const,
	scoreHundredths: 875,
	price: 3 as const,
	tags: ['Brunch', 'Coffee'],
	neighbourhood: 'Mitte',
	city: 'Berlin',
	address: 'Hauptstraße 5',
	website: 'https://example.com/mueller',
	notes: 'Try the **cinnamon** roll.',
	image: true
};

test('Scenario: Spot page shows hero, panel, rows and actions', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [full] });
	await open(page, `/eating-out/${spots[0]}`);

	await expect(page.locator('[data-hero] img')).toBeVisible();
	const panel = page.locator('[data-spot-info]');
	await expect(panel.getByRole('heading', { level: 1 })).toContainText('Café Müller');
	await expect(panel.getByText('8.75', { exact: true })).toBeVisible();
	await expect(panel.getByText('€€€', { exact: true })).toBeVisible();
	await expect(panel.getByText('Brunch', { exact: true })).toBeVisible();
	await expect(panel.getByText('Coffee', { exact: true })).toBeVisible();
	await expect(panel.getByText('Mitte, Berlin')).toBeVisible();
	await expect(page.getByText('Address', { exact: true })).toBeVisible();
	await expect(page.getByText('Hauptstraße 5')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Open in Maps' })).toBeVisible();
	await expect(page.getByText('Website', { exact: true })).toBeVisible();
	await expect(page.locator('[data-notes] strong')).toHaveText('cinnamon');
	await expect(page.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', `/eating-out/${spots[0]}/edit`);
	await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Mark visited' })).toHaveCount(0);
	await expect(page.getByText(/^#\d+$/)).toHaveCount(0);
});

test('Scenario: Spot page without photo shows the placeholder hero', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Bare', city: 'Köln' }] });
	await open(page, `/eating-out/${spots[0]}`);

	await expect(page.locator('[data-hero] img')).toHaveCount(0);
	await expect(page.locator('[data-hero]').getByRole('img', { name: 'No photo yet' })).toBeVisible();
});

test('Scenario: Missing address, website and notes hide their rows', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Bare', city: 'Köln' }] });
	await open(page, `/eating-out/${spots[0]}`);

	await expect(page.getByRole('heading', { name: 'Bare' })).toBeVisible();
	await expect(page.getByText('Address', { exact: true })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Open in Maps' })).toHaveCount(0);
	await expect(page.getByText('Website', { exact: true })).toHaveCount(0);
	await expect(page.locator('[data-notes]')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Mark visited' })).toBeVisible();
});

test('Scenario: External links open in a new tab', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [full] });
	await open(page, `/eating-out/${spots[0]}`);

	const maps = page.getByRole('link', { name: 'Open in Maps' });
	await expect(maps).toHaveAttribute('href', mapsUrl(full)!);
	await expect(maps).toHaveAttribute('target', '_blank');
	await expect(maps).toHaveAttribute('rel', /noopener/);
	const site = page.locator('a[href="https://example.com/mueller"]');
	await expect(site).toHaveAttribute('target', '_blank');
	await expect(site).toHaveAttribute('rel', /noopener/);
});

test('Scenario: Spot page makes no external requests', async ({ page, request, baseURL }) => {
	const { spots } = await seed(request, { spots: [full] });
	const origins = new Set<string>();
	page.on('request', (r) => origins.add(new URL(r.url()).origin));
	await open(page, `/eating-out/${spots[0]}`);
	await page.waitForLoadState('networkidle');

	expect([...origins]).toEqual([new URL(baseURL!).origin]);
});

test('Scenario: Unknown spot answers 404', async ({ request }) => {
	const res = await request.get('/eating-out/999999');
	expect(res.status()).toBe(404);
});

test('Spot page screenshot', async ({ page, request }, info) => {
	const { spots } = await seed(request, {
		spots: [
			{ ...full, image: '/mockups/spot-ramen.jpg', tags: ['Brunch', 'Coffee', 'Vegan'] },
			{ name: 'Ramen Ichi', neighbourhood: 'Altona', city: 'Hamburg', price: 2, image: '/mockups/spot-ramen.jpg' }
		]
	});
	await open(page, `/eating-out/${spots[0]}`);
	await expect(page.locator('[data-hero] img')).toBeVisible();
	await page.waitForTimeout(700);
	await page.screenshot({ path: `test-results/shots/eating-out-spot-${info.project.name}.png`, fullPage: true });

	await open(page, `/eating-out/${spots[1]}`);
	await page.getByRole('button', { name: 'Mark visited' }).click();
	await expect(page.getByRole('dialog', { name: 'Mark visited' })).toBeVisible();
	await page.waitForTimeout(500);
	await page.screenshot({ path: `test-results/shots/eating-out-spot-sheet-${info.project.name}.png` });
});
