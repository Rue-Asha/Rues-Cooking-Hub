import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const grid = (page: Page) => page.getByRole('list', { name: 'Recipes' });
const titles = (page: Page) => grid(page).getByRole('heading', { level: 3 });
const chip = (page: Page, name: string) =>
	page.getByRole('group', { name: 'Filter by tag' }).getByRole('button', { name: new RegExp(`^${name}\\b`) });

// the three newest-first cards: Tomato soup, Lemon tart, Panna cotta; Dessert drops the soup so Lemon tart moves up
const three = {
	recipes: [
		{ title: 'Panna cotta', tags: ['Dessert'], createdAt: '2026-10-01T10:00:00.000Z' },
		{ title: 'Lemon tart', tags: ['Dessert'], createdAt: '2026-10-02T10:00:00.000Z' },
		{ title: 'Tomato soup', tags: ['Soup'], createdAt: '2026-10-03T10:00:00.000Z' }
	]
};

const settle = (page: Page) =>
	page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));

// a card is gliding when its list item runs a transform animation
const gliding = (page: Page, title: string) =>
	grid(page)
		.getByRole('listitem')
		.filter({ hasText: title })
		.evaluate((li) =>
			li
				.getAnimations()
				.some(
					(a) =>
						a.playState === 'running' &&
						(a.effect as KeyframeEffect).getKeyframes().some((k) => typeof k.transform === 'string' && k.transform !== 'none')
				)
		);

test('Scenario: Filtered cards glide to new positions', async ({ page, request }) => {
	await reset(request);
	await seed(request, three);
	await open(page, '/recipes');
	await expect(titles(page)).toHaveText(['Tomato soup', 'Lemon tart', 'Panna cotta']);
	await settle(page);

	await chip(page, 'Dessert').click();

	await expect.poll(() => gliding(page, 'Lemon tart'), { intervals: [10], timeout: 3000 }).toBe(true);
	await expect(titles(page)).toHaveText(['Lemon tart', 'Panna cotta']);
});

test('Scenario: Reduced motion filters without gliding', async ({ page, request }) => {
	await reset(request);
	await seed(request, three);
	await calm(page);
	await open(page, '/recipes');
	await expect(titles(page)).toHaveText(['Tomato soup', 'Lemon tart', 'Panna cotta']);

	await chip(page, 'Dessert').click();
	await expect(page).toHaveURL(/tags=/);
	await expect(titles(page)).toHaveText(['Lemon tart', 'Panna cotta']);

	const running = await grid(page).evaluate(
		(ul) => ul.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length
	);
	expect(running).toBe(0);
});
