import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, type SeedInput } from './helpers.ts';

type Recorded = { calls: { named: number; inCard: number; inStack: number }[]; hero: string };

const stack = (page: Page) => page.getByRole('region', { name: 'Featured' });
const front = (page: Page) => stack(page).locator('[data-front]');
const counter = (page: Page) => front(page).locator('.counter');
const stage = (page: Page) => stack(page).locator('[data-stage]');
const grid = (page: Page) => page.getByRole('list', { name: 'Recipes' });

// Recipe 1 is the oldest; createdAt follows the number
const recipes = (n: number, extra: (i: number) => object = () => ({})): SeedInput['recipes'] =>
	Array.from({ length: n }, (_, i) => ({
		title: `Recipe ${i + 1}`,
		image: true,
		createdAt: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00.000Z`,
		...extra(i)
	}));

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Featured stack shows the seven newest', async ({ page, request }) => {
	await seed(request, { recipes: recipes(9) });
	await open(page, '/recipes');

	await expect(counter(page)).toHaveText('01/07');
	await expect(front(page)).toContainText('Recipe 9');
	await expect(stack(page).locator('[data-card]')).toHaveCount(7);
	await expect(stack(page).getByText('Recipe 2', { exact: true })).toHaveCount(0);
});

test('Scenario: Featured with fewer than seven counts what exists', async ({ page, request }) => {
	await seed(request, { recipes: recipes(3) });
	await open(page, '/recipes');

	await expect(counter(page)).toHaveText('01/03');
	await expect(front(page)).toContainText('Recipe 3');
});

test('Scenario: Single featured recipe has no arrows', async ({ page, request }) => {
	await seed(request, { recipes: recipes(1) });
	await open(page, '/recipes');

	await expect(counter(page)).toHaveText('01/01');
	await expect(stack(page).getByRole('button', { name: 'Next recipe' })).toHaveCount(0);
	await expect(stack(page).getByRole('button', { name: 'Previous recipe' })).toHaveCount(0);
});

test('An empty archive has no featured stack', async ({ page }) => {
	await open(page, '/recipes');
	await expect(page.getByRole('heading', { name: 'Start your archive' })).toBeVisible();
	await expect(stack(page)).toHaveCount(0);
});

test('Scenario: Arrows and keyboard step through the stack', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'keyboard arrows are the desktop path');
	await seed(request, { recipes: recipes(7) });
	await open(page, '/recipes');
	await expect(front(page)).toContainText('Recipe 7');

	await stack(page).getByRole('button', { name: 'Next recipe' }).click();
	await expect(counter(page)).toHaveText('02/07');
	await expect(front(page)).toContainText('Recipe 6');

	await stage(page).focus();
	await page.keyboard.press('ArrowRight');
	await expect(counter(page)).toHaveText('03/07');
	await expect(front(page)).toContainText('Recipe 5');

	await page.keyboard.press('ArrowLeft');
	await expect(counter(page)).toHaveText('02/07');
	await expect(front(page)).toContainText('Recipe 6');
});

test('Scenario: Swipe steps through the stack on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'swipe is the touch path');
	await seed(request, { recipes: recipes(7) });
	await open(page, '/recipes');
	await expect(counter(page)).toHaveText('01/07');

	const box = (await stage(page).boundingBox())!;
	const y = box.y + box.height / 2;
	const from = box.x + box.width * 0.75;
	const cdp = await page.context().newCDPSession(page);
	const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number) =>
		cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
	await touch('touchStart', from);
	for (let i = 1; i <= 8; i++) await touch('touchMove', from - i * 20);
	await touch('touchEnd', from - 160);

	await expect(counter(page)).toHaveText('02/07');
	await expect(front(page)).toContainText('Recipe 6');
	await expect(page).toHaveURL('/recipes');
});

test('Scenario: Featured stack ignores the filters', async ({ page, request }) => {
	await seed(request, { recipes: recipes(9, (i) => (i === 0 ? { tags: ['Soup'] } : {})) });
	await open(page, '/recipes');

	await page.getByRole('group', { name: 'Filter by tag' }).getByRole('button', { name: /^Soup\b/ }).click();
	await expect(page).toHaveURL(/tags=/);
	await expect(grid(page).getByRole('heading', { level: 3 })).toHaveText(['Recipe 1']);

	await expect(counter(page)).toHaveText('01/07');
	await expect(front(page)).toContainText('Recipe 9');
	await expect(stack(page).locator('[data-card]')).toHaveCount(7);
});

test('A featured card carries its photo into the recipe page', async ({ page, request }) => {
	const { recipes: ids } = await seed(request, { recipes: recipes(3) });
	const name = `recipe-hero-${ids[2]}`;
	await page.addInitScript((hero) => {
		const w = window as unknown as Recorded;
		w.calls = [];
		w.hero = hero;
		const start = document.startViewTransition?.bind(document);
		if (!start) return;
		document.startViewTransition = ((...args: Parameters<typeof start>) => {
			const named = [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName === w.hero);
			w.calls.push({
				named: named.length,
				inCard: named.filter((el) => el.closest('.card')).length,
				inStack: named.filter((el) => el.closest('[data-stage]')).length
			});
			return start(...args);
		}) as typeof document.startViewTransition;
	}, name);
	await open(page, '/recipes');

	await stack(page).getByRole('link', { name: /Recipe 3/ }).click();
	await expect(page).toHaveURL(`/recipes/${ids[2]}`);

	expect(await page.evaluate(() => (window as unknown as Recorded).calls)).toEqual([{ named: 1, inCard: 0, inStack: 1 }]);
});
