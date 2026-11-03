import { expect, test } from '@playwright/test';

test('Scenario: Eating Out mockup loads only local resources', async ({ page, baseURL }) => {
	const urls: string[] = [];
	page.on('request', (request) => urls.push(request.url()));
	await page.goto('/__mockups/eating-out');
	await expect(page.locator('html[data-hydrated]')).toBeAttached();
	await page.evaluate(async () => {
		for (const img of document.querySelectorAll('img')) img.loading = 'eager';
		await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
	});
	await page.waitForLoadState('networkidle');

	const origin = new URL(baseURL!).origin;
	expect([...new Set(urls.map((u) => new URL(u).origin))]).toEqual([origin]);
	const images = await page.evaluate(() => [...document.images].map((img) => new URL(img.currentSrc).pathname));
	expect(images.length).toBeGreaterThanOrEqual(5);
	for (const path of images) expect(path).toMatch(/^\/mockups\/[a-z-]+\.jpg$/);
});
