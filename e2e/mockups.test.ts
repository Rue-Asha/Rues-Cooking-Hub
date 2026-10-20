import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';

const screens = ['home', 'recipes', 'recipe', 'import', 'import-fallback', 'plan', 'list'];

for (const screen of screens) {
	test(`Scenario: Mockup screenshots are produced for both viewports (${screen})`, async ({ page }, info) => {
		await page.goto(`/__mockups/${screen}`);
		await expect(page.locator('html[data-hydrated]')).toBeAttached();
		await page.evaluate(async () => {
			for (const img of document.querySelectorAll('img')) img.loading = 'eager';
			await document.fonts.ready;
			await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
			await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined)));
		});
		// a full-page shot would leave the fixed phone tab bar half-way down the image; pin it to the page's end
		await page.addStyleTag({ content: 'body { position: relative } [data-shot-bottom] { position: absolute !important }' });

		const path = `test-results/shots/mockups/${info.project.name}-${screen}.png`;
		await page.screenshot({ path, fullPage: true, animations: 'disabled' });

		expect(existsSync(path)).toBe(true);
	});
}
