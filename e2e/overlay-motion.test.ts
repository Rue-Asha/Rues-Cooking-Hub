import { expect, test, type Page } from '@playwright/test';
import { COPY } from '../src/lib/copy.ts';
import { calm, open, plus, reset, seed } from './helpers.ts';

type Played = { tag: string; cls: string; pseudo: string; text: string; ms: number };

// every animation that starts from now on, CSS keyframes and Svelte's transitions (Web Animations) alike, with its
// duration; polled each frame, since a Web Animation fires no animationstart
async function record(page: Page) {
	await page.evaluate(() => {
		const w = window as unknown as { __played: Played[] };
		const seen = new WeakSet<Animation>();
		w.__played = [];
		const poll = () => {
			for (const a of document.getAnimations()) {
				if (seen.has(a)) continue;
				seen.add(a);
				const effect = a.effect as KeyframeEffect;
				const el = effect.target as HTMLElement;
				w.__played.push({
					tag: el.tagName.toLowerCase(),
					cls: String(el.className),
					pseudo: effect.pseudoElement ?? '',
					text: el.textContent ?? '',
					ms: Number(effect.getTiming().duration)
				});
			}
			requestAnimationFrame(poll);
		};
		poll();
	});
}
const played = (page: Page) => page.evaluate(() => (window as unknown as { __played: Played[] }).__played);

async function seedRecipe(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, {
		recipes: [{ title: 'Red lentil soup', ingredients: [{ title: null, lines: ['300 g red lentils'] }], steps: [{ title: null, lines: ['Simmer.'] }] }],
		items: [{ name: 'lemons', manualAmounts: [{ quantity: 2, unit: null }], category: 'produce' }]
	});
}

async function menuAndDialog(page: Page, id: number, width: number) {
	await page.setViewportSize({ width, height: width < 768 ? 844 : 800 });
	await open(page, `/recipes/${id}`);
	await record(page);
	if (width >= 1024) {
		await page.getByRole('button', { name: 'More recipe actions' }).click();
		await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('menu', { name: 'More actions' })).toHaveCount(0);
	}
	const trigger = page.getByRole('button', { name: /Add to plan/ }).first();
	await trigger.click();
	await expect(page.locator('dialog[open]')).toBeVisible();
	await page.waitForTimeout(400);
	await page.keyboard.press('Escape');
	await expect(page.locator('dialog[open]')).toHaveCount(0);
	await expect(trigger).toBeFocused();
	return played(page);
}

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
});

test('Scenario: Menus and dialogs open softly', async ({ page, request }) => {
	const { recipes } = await seedRecipe(request);

	const wide = await menuAndDialog(page, recipes[0], 1280);
	const menu = wide.filter((a) => a.cls.includes('popover'));
	expect(menu.length, 'menu in and out').toBeGreaterThanOrEqual(2);
	for (const a of menu) expect(a.ms, 'menu').toBeGreaterThanOrEqual(100);
	for (const a of menu) expect(a.ms, 'menu').toBeLessThanOrEqual(200);
	const card = wide.filter((a) => a.tag === 'dialog' && !a.pseudo);
	expect(card.length, 'dialog in and out').toBeGreaterThanOrEqual(2);
	for (const a of card) expect(a.ms, 'card').toBeGreaterThanOrEqual(100);
	for (const a of card) expect(a.ms, 'card').toBeLessThanOrEqual(200);

	const phone = await menuAndDialog(page, recipes[0], 390);
	const sheet = phone.filter((a) => a.tag === 'dialog' && !a.pseudo);
	expect(sheet[0].ms, 'the sheet slides up').toBeGreaterThanOrEqual(200);
	expect(sheet[0].ms).toBeLessThanOrEqual(300);
	expect(sheet.at(-1)!.ms, 'and leaves faster').toBeLessThan(sheet[0].ms);
});

test('Scenario: Reduced motion opens menus and dialogs instantly', async ({ page, request }) => {
	const { recipes } = await seedRecipe(request);
	await calm(page);
	for (const width of [1280, 390]) {
		const all = await menuAndDialog(page, recipes[0], width);
		expect(all.filter((a) => a.cls.includes('popover') || a.tag === 'dialog'), `${width}`).toEqual([]);
	}
	for (const width of [390, 800]) {
		await page.setViewportSize({ width, height: width < 768 ? 844 : 800 });
		await open(page, '/');
		await record(page);
		await plus(page).click();
		const sheet = page.locator('dialog[data-sheet]').filter({ hasText: COPY.homeSheet.title });
		await expect(sheet).toBeVisible();
		await page.keyboard.press('Escape');
		// gone at once: no exit animation holds the dialog open
		expect(await sheet.evaluate((d: HTMLDialogElement) => d.open)).toBe(false);
		await expect(plus(page)).toBeFocused();
		expect((await played(page)).filter((a) => a.tag === 'dialog'), `Home sheet ${width}`).toEqual([]);
	}
});

test('Scenario: A new list item settles in', async ({ page, request }) => {
	await seedRecipe(request);
	for (const reduced of [false, true]) {
		if (reduced) await calm(page);
		await open(page, '/list');
		await record(page);
		const name = reduced ? 'pears' : 'figs';
		await page.locator('#add-item').fill(`3 ${name}`);
		await page.keyboard.press('Enter');
		await expect(page.getByRole('checkbox', { name })).toBeVisible();
		await page.waitForTimeout(400);
		const row = (await played(page)).filter((a) => a.tag === 'li' && a.text.includes(name));
		if (reduced) expect(row).toEqual([]);
		else {
			expect(row.length).toBeGreaterThan(0);
			expect(row[0].ms).toBeGreaterThanOrEqual(200);
			expect(row[0].ms).toBeLessThanOrEqual(300);
		}
	}
});
