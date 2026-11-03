import { expect, test, type Page } from '@playwright/test';
import { open } from './helpers.ts';

test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'desktop header'));

const actions = (page: Page) => page.locator('[data-nav="top"] .actions');

test('Scenario: Eating Out header shows spot actions', async ({ page }) => {
	await open(page, '/eating-out');
	await expect(actions(page).getByRole('link', { name: 'Search spots' })).toHaveAttribute('href', '/eating-out#search');
	await expect(actions(page).getByRole('link', { name: 'Add spot' })).toHaveAttribute('href', '/eating-out/new');
	await expect(actions(page).getByRole('link', { name: /recipe/i })).toHaveCount(0);

	await open(page, '/plan');
	await expect(actions(page).getByRole('link', { name: 'Search recipes' })).toHaveAttribute('href', '/recipes');
	await expect(actions(page).getByRole('link', { name: 'Add recipe' })).toHaveAttribute('href', '/recipes/new');
	await expect(actions(page).getByRole('link', { name: /spot/i })).toHaveCount(0);
});

test('Scenario: Header follows client-side navigation', async ({ page }) => {
	await open(page, '/recipes');
	await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
	await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Eating Out' }).click();
	await expect(page).toHaveURL('/eating-out');
	await expect(actions(page).getByRole('link', { name: 'Search spots' })).toBeVisible();
	await expect(actions(page).getByRole('link', { name: 'Add spot' })).toBeVisible();
	expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
});

test('Scenario: Desktop header fits at 1024 px', async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 768 });
	for (const path of ['/plan', '/eating-out']) {
		await open(page, path);
		const m = await page.evaluate(() => {
			const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
			const root = document.documentElement;
			return {
				brand: box('[data-nav="top"] .brand').right,
				pill: [box('[data-nav="top"] nav').left, box('[data-nav="top"] nav').right],
				actions: [box('[data-nav="top"] .actions').left, box('[data-nav="top"] .actions').right],
				divider: [box('[data-nav="top"] [data-divider]').left, box('[data-nav="top"] [data-divider]').right],
				scroll: [root.scrollWidth, root.clientWidth]
			};
		});
		console.log(path, JSON.stringify(m));
		expect(m.brand, path).toBeLessThanOrEqual(m.pill[0]);
		expect(m.pill[1], path).toBeLessThanOrEqual(m.actions[0]);
		expect(m.actions[1], `${path} actions inside the viewport`).toBeLessThanOrEqual(m.scroll[1]);
		expect(m.divider[0]).toBeGreaterThanOrEqual(m.pill[0]);
		expect(m.divider[1]).toBeLessThanOrEqual(m.pill[1]);
		expect(m.scroll[0]).toBeLessThanOrEqual(m.scroll[1]);
	}
});
