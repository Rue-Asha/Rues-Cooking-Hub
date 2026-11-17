import { expect, test } from '@playwright/test';
import { open, topBar } from './helpers.ts';

test('Scenario: Top bar fits from 1024 to 1280 px', async ({ page }) => {
	for (const width of [1024, 1152, 1280]) {
		await page.setViewportSize({ width, height: 768 });
		for (const path of ['/plan', '/eating-out']) {
			await open(page, path);
			const boxes = await topBar(page)
				.getByRole('link')
				.evaluateAll((links) =>
					links.map((a) => {
						const r = a.getBoundingClientRect();
						return { name: a.getAttribute('aria-label') ?? a.textContent, left: r.left, right: r.right, middle: r.top + r.height / 2 };
					})
				);
			expect(boxes, `${width} ${path}`).toHaveLength(8);
			const middles = boxes.map((b) => b.middle);
			expect(Math.max(...middles) - Math.min(...middles), `${width} ${path} one row`).toBeLessThanOrEqual(4);
			for (const [i, b] of boxes.entries())
				if (i > 0) expect(b.left, `${width} ${path} ${b.name} clear of the one before`).toBeGreaterThanOrEqual(boxes[i - 1].right - 0.5);
			const scroll = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
			expect(scroll[0], `${width} ${path} no sideways scroll`).toBeLessThanOrEqual(scroll[1]);
		}
	}
});
