import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

type Call = { named: number; inCard: number };
type Recorded = { calls: Call[]; hero: string };

const media = (page: Page) => page.locator('[data-hero] .media');
const transform = (page: Page) => media(page).evaluate((el) => getComputedStyle(el).transform);

const long = {
	title: 'Pumpkin soup',
	image: true,
	steps: [{ title: null, lines: Array.from({ length: 14 }, (_, i) => `Step ${i + 1}: stir, taste and wait a little longer.`) }]
};

// records, at the moment a view transition starts, which elements carry the hero name
async function recordTransitions(page: Page, name: string) {
	await page.addInitScript((hero) => {
		const w = window as unknown as Recorded;
		w.calls = [];
		w.hero = hero;
		const start = document.startViewTransition?.bind(document);
		if (!start) return;
		document.startViewTransition = ((...args: Parameters<typeof start>) => {
			const named = [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName === w.hero);
			w.calls.push({ named: named.length, inCard: named.filter((el) => el.closest('.card')).length });
			return start(...args);
		}) as typeof document.startViewTransition;
	}, name);
}

const calls = (page: Page) => page.evaluate(() => (window as unknown as Recorded).calls);
const named = (page: Page, name: string) =>
	page.evaluate((n) => [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName === n).length, name);

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Hero moves on scroll', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [long] });
	await open(page, `/recipes/${recipes[0]}`);
	const before = await transform(page);

	await page.evaluate(() => window.scrollTo(0, 200));

	await expect.poll(() => transform(page)).not.toBe(before);
	expect(await transform(page)).not.toBe('none');
});

test('Scenario: Reduced motion keeps the hero still', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [long] });
	await calm(page);
	await open(page, `/recipes/${recipes[0]}`);

	await page.evaluate(() => window.scrollTo(0, 200));
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(200);
	await page.evaluate(() => new Promise(requestAnimationFrame));

	expect(await transform(page)).toBe('none');
});

test('Scenario: Card and recipe page share the hero image', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [{ title: 'Porridge', image: true }, long] });
	const name = `recipe-hero-${recipes[1]}`;
	await recordTransitions(page, name);
	await open(page, '/recipes');

	await page.getByRole('list', { name: 'Recipes' }).getByRole('link', { name: 'Pumpkin soup' }).click();
	await expect(page).toHaveURL(`/recipes/${recipes[1]}`);

	expect(await calls(page)).toEqual([{ named: 1, inCard: 1 }]);
	await expect.poll(() => page.locator('[data-hero]').evaluate((el) => getComputedStyle(el).viewTransitionName)).toBe(name);
	expect(await named(page, name)).toBe(1);

	await page.goBack();
	// a back navigation changes the URL before the app navigates
	await expect(page).toHaveURL('/recipes');
	await expect.poll(() => calls(page)).toEqual([
		{ named: 1, inCard: 1 },
		{ named: 1, inCard: 0 }
	]);
	await expect.poll(() => named(page, name)).toBe(1);
});

test('Scenario: Reduced motion skips the shared element', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [long] });
	const name = `recipe-hero-${recipes[0]}`;
	await calm(page);
	await recordTransitions(page, name);
	await open(page, '/recipes');
	expect(await named(page, name)).toBe(0);

	await page.getByRole('list', { name: 'Recipes' }).getByRole('link', { name: 'Pumpkin soup' }).click();
	await expect(page).toHaveURL(`/recipes/${recipes[0]}`);
	await expect(page.locator('[data-hero]')).toBeVisible();

	expect(await calls(page)).toEqual([]);
	expect(await named(page, name)).toBe(0);
	expect(await page.locator('[data-hero]').evaluate((el) => getComputedStyle(el).viewTransitionName)).toBe('none');
});
