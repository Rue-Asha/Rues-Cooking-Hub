import { expect, test } from '@playwright/test';
import { open } from './helpers.ts';

test('Scenario: Icon files are served', async ({ page, request }) => {
	await open(page, '/');
	const hrefs = await page.locator('head link[rel~="icon"], head link[rel="apple-touch-icon"]').evaluateAll((links) => links.map((l) => l.getAttribute('href')!));
	const manifestHref = await page.locator('head link[rel="manifest"]').getAttribute('href');
	const manifest = await (await request.get(manifestHref!)).json();
	const paths = [...hrefs, ...manifest.icons.map((i: { src: string }) => i.src)];
	expect(paths.length).toBeGreaterThanOrEqual(5);
	for (const path of paths) {
		const res = await request.get(path);
		expect(res.status(), path).toBe(200);
		expect(res.headers()['content-type'], path).toMatch(/^image\//);
	}
});

test('Scenario: Head carries the icon links', async ({ page }) => {
	await open(page, '/');
	await expect(page.locator('head link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', /\/favicon\.svg$/);
	await expect(page.locator('head link[rel="icon"][sizes="32x32"]')).toHaveAttribute('href', /\/favicon\.ico$/);
	await expect(page.locator('head link[rel="apple-touch-icon"]')).toHaveAttribute('href', /\/apple-touch-icon\.png$/);
	await expect(page.locator('head link[rel="manifest"]')).toHaveAttribute('href', /\/manifest\.webmanifest$/);
	await expect(page.locator('head meta[name="theme-color"]')).toHaveAttribute('content', /^#[0-9a-fA-F]{6}$/);
});

test('The manifest names the app as people read it', async ({ request }) => {
	const manifest = await (await request.get('/manifest.webmanifest')).json();
	expect(manifest).toMatchObject({ name: "Rue's Cooking Hub", short_name: 'Cooking Hub', display: 'browser' });
});
