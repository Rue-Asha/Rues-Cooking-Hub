import { expect, test, type Page } from '@playwright/test';
import { mainNav as nav, open, phoneBar, plus, seed, reset, topBar } from './helpers.ts';

test.beforeEach(({}, info) => test.skip(info.project.name !== 'phone', 'phone layout'));

const view = (page: Page, width: number, height: number) => page.setViewportSize({ width, height });
const labels = ['Home', 'Recipes', 'Plan', 'List', 'Spots'];

test('Scenario: Phone bar shows five pills and the round add button', async ({ page }) => {
	await open(page, '/recipes');
	await expect(phoneBar(page)).toBeVisible();
	await expect(topBar(page)).toBeHidden();
	const links = nav(page).getByRole('link');
	for (const [i, label] of labels.entries()) await expect(links.nth(i)).toHaveAccessibleName(label);
	await expect(nav(page).locator('ul[data-pill-track]').getByRole('link')).toHaveCount(5);
	const add = plus(page);
	await expect(add).toHaveCount(1);
	await expect(add).toHaveAccessibleName('Add recipe');
	const [button, group] = await Promise.all([add.boundingBox(), nav(page).locator('ul[data-pill-track]').boundingBox()]);
	expect(button!.x, 'outside the pill group').toBeGreaterThanOrEqual(group!.x + group!.width - 1);
	expect(Math.abs(button!.width - button!.height)).toBeLessThan(1);
});

test('Scenario: Current area pill is marked on the phone', async ({ page, request }) => {
	await reset(request);
	const { recipes } = await seed(request, { recipes: [{ title: 'Pancakes' }] });
	await open(page, `/recipes/${recipes[0]}`);
	const current = nav(page).locator('[aria-current="page"]');
	await expect(current).toHaveCount(1);
	await expect(current).toHaveAccessibleName('Recipes');
	await open(page, '/eating-out');
	await expect(current).toHaveCount(1);
	await expect(current).toHaveAccessibleName('Spots');
});

test('Scenario: Phone bar fits at 320 px', async ({ page }) => {
	await view(page, 320, 640);
	await open(page, '/list');
	const m = await page.evaluate(() => {
		const bar = document.querySelector<HTMLElement>('nav[data-bar="phone"]')!;
		const items = [...bar.querySelectorAll<HTMLElement>('ul[data-pill-track] a, .dock-add')].filter((el) => el.offsetParent);
		const rects = items.map((el) => el.getBoundingClientRect());
		return {
			names: items.map((el) => el.getAttribute('aria-label') ?? el.textContent!.trim()),
			labelShown: items.map((el) => [...el.querySelectorAll('span')].some((s) => s.getBoundingClientRect().width > 2)),
			rects: rects.map((r) => ({ l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height })),
			doc: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
			vw: innerWidth
		};
	});
	expect(m.rects).toHaveLength(6);
	expect(m.labelShown.slice(0, 5), 'icon only below 360').toEqual([false, false, false, false, false]);
	for (const [i, label] of labels.entries()) await expect(nav(page).getByRole('link').nth(i)).toHaveAccessibleName(label);
	for (const r of m.rects) {
		expect(r.w).toBeGreaterThanOrEqual(44);
		expect(r.h).toBeGreaterThanOrEqual(44);
		expect(r.l).toBeGreaterThanOrEqual(0);
		expect(r.r).toBeLessThanOrEqual(m.vw);
	}
	for (const [i, r] of m.rects.entries()) if (i > 0) expect(r.l).toBeGreaterThanOrEqual(m.rects[i - 1].r - 0.5);
	expect(m.doc[0]).toBeLessThanOrEqual(m.doc[1]);
});

test('Scenario: Phone bar hides while a text field has focus', async ({ page }) => {
	await open(page, '/list');
	await expect(phoneBar(page)).toBeVisible();
	const field = page.getByRole('textbox', { name: 'Add an item' });
	await field.focus();
	await expect(phoneBar(page)).toBeHidden();
	await expect(phoneBar(page)).toHaveAttribute('inert', '');
	await expect(nav(page).getByRole('link')).toHaveCount(0);
	await field.blur();
	await expect(phoneBar(page)).toBeVisible();
	await expect(phoneBar(page)).not.toHaveAttribute('inert');
	await expect(nav(page).getByRole('link')).toHaveCount(5);
});

test('The phone bar also hides while typing in the phone posture with a mouse', async ({ browser }, info) => {
	const context = await browser.newContext({ viewport: { width: 800, height: 1000 }, hasTouch: false, isMobile: false, baseURL: info.project.use.baseURL, extraHTTPHeaders: info.project.use.extraHTTPHeaders });
	const page = await context.newPage();
	expect(await page.evaluate(() => matchMedia('(pointer: fine)').matches)).toBe(true);
	await open(page, '/list');
	await expect(phoneBar(page)).toBeVisible();

	await page.getByRole('textbox', { name: 'Add an item' }).focus();

	await expect(phoneBar(page)).toBeHidden();
	await expect(phoneBar(page)).toHaveAttribute('inert', '');
	await context.close();
});

test('Scenario: Tablet width uses the phone posture', async ({ page }) => {
	for (const width of [768, 1023]) {
		await view(page, width, width === 768 ? 1024 : 768);
		await open(page, '/recipes');
		await expect(phoneBar(page), `${width}`).toBeVisible();
		await expect(page.locator('header[data-bar="strip"]'), `${width}`).toBeVisible();
		await expect(topBar(page), `${width}`).toBeHidden();
	}
	await view(page, 1024, 768);
	await open(page, '/recipes');
	await expect(topBar(page)).toBeVisible();
	await expect(phoneBar(page)).toBeHidden();
	await expect(page.locator('header[data-bar="strip"]')).toBeHidden();
});
