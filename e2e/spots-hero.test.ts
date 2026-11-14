import { expect, test, type Page } from '@playwright/test';
import { calm, carriedName, open, reset, seed } from './helpers.ts';

type Call = { named: number; inCard: number };
type Recorded = { calls: Call[]; hero: string };

async function recordTransitions(page: Page, name: string) {
	await page.addInitScript((hero) => {
		const w = window as unknown as Recorded;
		w.calls = [];
		w.hero = hero;
		const start = document.startViewTransition?.bind(document);
		if (!start) return;
		document.startViewTransition = ((...args: Parameters<typeof start>) => {
			const named = [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName === w.hero);
			w.calls.push({ named: named.length, inCard: named.filter((el) => el.closest('article')).length });
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

async function shared(page: Page, request: Parameters<typeof seed>[0], image: boolean) {
	const { spots } = await seed(request, {
		spots: [{ name: 'Other', status: 'visited', scoreHundredths: 700 }, { name: 'Target', status: 'visited', scoreHundredths: 900, image }]
	});
	const name = `spot-hero-${spots[1]}`;
	await recordTransitions(page, name);
	await open(page, '/eating-out');
	await page.getByRole('link', { name: /Target/ }).click();
	await expect(page).toHaveURL(`/eating-out/${spots[1]}`);
	return { id: spots[1], name };
}

test('Scenario: Card and spot page share the photo', async ({ page, request }) => {
	const { name } = await shared(page, request, true);

	expect(await calls(page)).toEqual([{ named: 1, inCard: 1 }]);
	await expect.poll(() => carriedName(page.getByRole('presentation'))).toBe(name);
	expect(await named(page, name)).toBe(1);
	await expect(page.getByRole('presentation')).toBeVisible();
});

test('Scenario: Spot without photo morphs its placeholder', async ({ page, request }) => {
	const { name } = await shared(page, request, false);

	expect(await calls(page)).toEqual([{ named: 1, inCard: 1 }]);
	await expect.poll(() => carriedName(page.getByRole('img', { name: 'No photo yet' }))).toBe(name);
	await expect(page.getByRole('presentation')).toHaveCount(0);
});

test('Scenario: Reduced motion skips the spot shared element', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Target', status: 'visited', scoreHundredths: 900, image: true }] });
	const name = `spot-hero-${spots[0]}`;
	await calm(page);
	await recordTransitions(page, name);
	await open(page, '/eating-out');
	await page.getByRole('link', { name: /Target/ }).click();
	await expect(page).toHaveURL(`/eating-out/${spots[0]}`);

	expect(await calls(page)).toEqual([]);
	expect(await named(page, name)).toBe(0);
	await expect(page.getByRole('heading', { name: 'Target' })).toBeVisible();
});
