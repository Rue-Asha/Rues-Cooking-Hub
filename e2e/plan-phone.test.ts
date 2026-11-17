import { expect, test, type Page } from '@playwright/test';
import { entries, expectNoEntries, open, phoneBar, reset, seed, setToday, slot } from './helpers.ts';

const THURSDAY = '2026-10-22';
const MONDAY = '2026-10-19';
const SUNDAY = '2026-10-25';
const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

test.beforeEach(async ({ request }) => {
	await reset(request);
	await setToday(request, THURSDAY);
});

const day = (page: Page, name: string) => page.getByRole('region', { name, exact: true });
const boxes = async (page: Page) => Promise.all(names.map(async (n) => (await day(page, n).boundingBox())!));

test.describe('at 390 x 844', () => {
	test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

	test('Scenario: Days are stacked on the phone', async ({ page }) => {
		await open(page, '/plan');
		const all = await boxes(page);
		for (const [i, box] of all.entries()) {
			expect(Math.abs(box.x - all[0].x), names[i]).toBeLessThanOrEqual(1);
			if (i > 0) expect(box.y, names[i]).toBeGreaterThanOrEqual(all[i - 1].y + all[i - 1].height - 1);
		}
	});

	test('Scenario: Today is marked and first in view', async ({ page }) => {
		await open(page, '/plan');
		await expect(day(page, 'Thursday')).toHaveAttribute('aria-current', 'date');
		await expect(day(page, 'Wednesday')).not.toHaveAttribute('aria-current', 'date');
		const heading = day(page, 'Thursday').getByRole('heading', { level: 2 });
		await expect.poll(async () => (await heading.boundingBox())!.y).toBeGreaterThanOrEqual(0);
		await expect.poll(async () => (await heading.boundingBox())!.y).toBeLessThan(844 / 3);
	});

	test('Scenario: Past week starts at Monday', async ({ page }) => {
		await open(page, '/plan?week=2026-09-21');
		await expect(page.locator('[aria-current="date"]').and(page.getByRole('region'))).toHaveCount(0);
		expect(await page.evaluate(() => window.scrollY)).toBe(0);
		// a late scroll to a day would land after the first frames
		await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 500)))));
		expect(await page.evaluate(() => window.scrollY)).toBe(0);
		await expect(day(page, 'Monday')).toBeVisible();
		const box = (await day(page, 'Monday').boundingBox())!;
		expect(box.y).toBeLessThan(844);
	});

	test('Adding to Sunday leaves the page at Sunday, it does not jump back to today', async ({ page, request }) => {
		await seed(request, { recipes: [{ title: 'Lasagne', servings: 2 }] });
		await open(page, '/plan');
		const add = page.getByRole('button', { name: 'Add to Sunday Dinner' });
		await add.scrollIntoViewIfNeeded();
		const before = await page.evaluate(() => window.scrollY);
		expect(before).toBeGreaterThan(0);
		// the lowest scroll position on the way: a jump to today shows here even when a focus return scrolls back
		await page.evaluate(() => {
			const w = window as unknown as { lowest: number };
			w.lowest = window.scrollY;
			addEventListener('scroll', () => (w.lowest = Math.min(w.lowest, window.scrollY)));
		});
		await add.click();
		const dialog = page.getByRole('dialog', { name: 'Add to Sunday Dinner' });
		await dialog.getByRole('button', { name: /^Lasagne/ }).click();
		await dialog.getByRole('button', { name: 'Add to plan' }).click();
		await expect(dialog).toBeHidden();
		await expect(entries(page, '2026-10-25', 'dinner')).toHaveCount(1);
		await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 300)))));

		// the jump went back to Thursday, well above where the page was
		expect(await page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(before - 40);
		expect(await page.evaluate(() => (window as unknown as { lowest: number }).lowest)).toBeGreaterThanOrEqual(before - 40);
	});

	test('Scenario: Empty days are compact', async ({ page, request }) => {
		await seed(request, { entries: [{ date: '2026-10-20', slot: 'dinner', text: 'Soup' }] });
		await open(page, '/plan');
		const monday = (await day(page, 'Monday').boundingBox())!;
		const tuesday = (await day(page, 'Tuesday').boundingBox())!;
		expect(monday.height).toBeLessThan(tuesday.height);
		for (const meal of ['Breakfast', 'Lunch', 'Dinner', 'Snacks'])
			await expect(day(page, 'Monday').getByRole('button', { name: `Add to Monday ${meal}` })).toBeVisible();
	});

	test('Empty week shows the one-line note', async ({ page }) => {
		await open(page, '/plan?week=2026-12-07');
		await expect(page.getByText('Nothing planned yet — tap + to add a meal')).toBeVisible();
	});

	test('Scenario: Phone plan works without drag', async ({ page, request }) => {
		await seed(request, { recipes: [{ title: 'Lasagne', servings: 2 }] });
		await open(page, '/plan');
		await page.getByRole('button', { name: 'Add to Tuesday Dinner' }).click();
		const dialog = page.getByRole('dialog', { name: 'Add to Tuesday Dinner' });
		await dialog.getByRole('button', { name: /^Lasagne/ }).click();
		await dialog.getByRole('button', { name: 'Add to plan' }).click();
		await expect(dialog).toBeHidden();
		const entry = entries(page, '2026-10-20', 'dinner');
		await expect(entry).toHaveCount(1);
		await expect(entry).not.toHaveAttribute('draggable', 'true');
		await page.reload();
		await expect(entries(page, '2026-10-20', 'dinner')).toContainText('Lasagne');

		await slot(page, '2026-10-20', 'dinner').getByRole('button', { name: 'Options for Lasagne' }).click();
		await page.getByRole('menuitem', { name: 'Change servings' }).click();
		await page.getByLabel('Servings').fill('5');
		await page.getByRole('button', { name: 'Save' }).click();
		await expect(slot(page, '2026-10-20', 'dinner').getByText('5 servings')).toBeAttached();
		await page.reload();
		await expect(slot(page, '2026-10-20', 'dinner').getByText('5 servings')).toBeAttached();

		await slot(page, '2026-10-20', 'dinner').getByRole('button', { name: 'Options for Lasagne' }).click();
		await page.getByRole('menuitem', { name: 'Move to…' }).click();
		const sheet = page.getByRole('dialog', { name: 'Move Lasagne' });
		await sheet.getByRole('radio', { name: 'Saturday' }).check();
		await sheet.getByRole('radio', { name: 'Dinner' }).check();
		await sheet.getByRole('button', { name: 'Move here' }).click();
		await expect(sheet).toBeHidden();
		await page.reload();
		await expect(entries(page, '2026-10-24', 'dinner')).toContainText('Lasagne');
		await expectNoEntries(page, '2026-10-20', 'dinner');

		await slot(page, '2026-10-24', 'dinner').getByRole('button', { name: 'Options for Lasagne' }).click();
		await page.getByRole('menuitem', { name: 'Delete' }).click();
		await page.reload();
		await expect(page.getByRole('button', { name: /^Options for / })).toHaveCount(0);
	});
});

for (const viewport of [
	{ width: 768, height: 1024 },
	{ width: 1023, height: 768 }
]) {
	test.describe(`at ${viewport.width} x ${viewport.height}`, () => {
		test.use({ viewport, hasTouch: false, isMobile: false });

		test('Scenario: Tablet width stacks the days in one column', async ({ page }) => {
			await open(page, '/plan');
			const all = await boxes(page);
			for (const [i, box] of all.entries()) {
				expect(Math.abs(box.x - all[0].x), names[i]).toBeLessThanOrEqual(1);
				if (i > 0) expect(box.y, names[i]).toBeGreaterThanOrEqual(all[i - 1].y + all[i - 1].height - 1);
			}
			await expect(page.getByRole('complementary', { name: 'Recipes' })).toBeHidden();
			await expect(slot(page, MONDAY, 'dinner')).toBeAttached();
		});
	});
}

for (const viewport of [
	{ width: 390, height: 844 },
	{ width: 768, height: 1024 }
]) {
	test.describe(`on touch at ${viewport.width} x ${viewport.height}`, () => {
		test.use({ viewport, hasTouch: true, isMobile: true });

		test('Scenario: Menus open clear of the phone bar', async ({ page, request }, info) => {
			test.skip(info.project.name !== 'phone', 'sets its own viewport');
			await seed(request, { recipes: [{ title: 'Lasagne' }], entries: [{ date: SUNDAY, slot: 'snacks', recipe: 0, servings: 2 }] });
			await open(page, '/plan');
			await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
			await page.getByRole('button', { name: 'Options for Lasagne' }).tap();
			const menu = page.getByRole('menu', { name: 'Options for Lasagne' });
			await expect(menu).toBeVisible();
			await menu.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
			const box = (await menu.boundingBox())!;
			const bar = (await phoneBar(page).boundingBox())!;
			expect(box.y + box.height, 'the menu ends 12 px above the phone bar').toBeLessThanOrEqual(bar.y - 12 + 0.5);
			await menu.getByRole('menuitem', { name: 'Delete' }).tap();
			await expect(page.getByRole('button', { name: 'Options for Lasagne' })).toHaveCount(0);
			await page.reload();
			await expect(entries(page, SUNDAY, 'snacks')).toHaveCount(0);
		});
	});
}

test('Scenario: A day turns compact once its last entry is gone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'sets its own viewport');
	await page.setViewportSize({ width: 375, height: 812 });
	for (const reduced of [false, true]) {
		await reset(request);
		await setToday(request, THURSDAY);
		await seed(request, { recipes: [{ title: 'Lasagne' }], entries: [{ date: SUNDAY, slot: 'dinner', recipe: 0, servings: 2 }] });
		await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
		await open(page, '/plan');
		const sunday = day(page, 'Sunday');
		await sunday.getByRole('button', { name: 'Options for Lasagne' }).click();
		await page.getByRole('menu', { name: 'Options for Lasagne' }).evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));

		// every frame from the delete on: overlaps between Sunday's add controls, and whether the day is compact
		// (Breakfast and Lunch on one row; their fade-up scale moves them by under a pixel) while the entry is still there or after it is gone
		await sunday.evaluate((el) => {
			const w = window as unknown as { __log: { overlaps: string[]; compactWithEntry: number; gone: boolean[] }; __stop: boolean };
			w.__log = { overlaps: [], compactWithEntry: 0, gone: [] };
			w.__stop = false;
			const hit = (a: DOMRect, b: DOMRect) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
			const frame = () => {
				const buttons = [...el.querySelectorAll<HTMLElement>('button[aria-label^="Add to"]')];
				const adds = buttons.map((b) => ({ name: b.getAttribute('aria-label')!, box: b.getBoundingClientRect() }));
				adds.forEach((a, i) => adds.slice(i + 1).forEach((b) => hit(a.box, b.box) && w.__log.overlaps.push(`${a.name} on ${b.name}`)));
				const compact = Math.abs(adds[0].box.top - adds[1].box.top) < 2;
				if (el.querySelector('[role="group"][aria-label="Lasagne"]')) w.__log.compactWithEntry += compact ? 1 : 0;
				else w.__log.gone.push(compact);
				if (!w.__stop) requestAnimationFrame(frame);
			};
			requestAnimationFrame(frame);
		});
		await page.getByRole('menuitem', { name: 'Delete' }).click();
		await expect(sunday.getByRole('group', { name: 'Lasagne' })).toHaveCount(0);
		await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));
		await page.evaluate(() => new Promise(requestAnimationFrame));
		const log = await page.evaluate(() => {
			const w = window as unknown as { __log: { overlaps: string[]; compactWithEntry: number; gone: boolean[] }; __stop: boolean };
			w.__stop = true;
			return w.__log;
		});
		const mode = reduced ? 'reduced' : 'motion';
		expect([...new Set(log.overlaps)], `${mode}: no add control overlaps another`).toEqual([]);
		expect(log.compactWithEntry, `${mode}: frames compact while the entry is still there`).toBe(0);
		expect(log.gone.length, `${mode}: frames after the entry is gone`).toBeGreaterThan(0);
		expect(log.gone.every(Boolean), `${mode}: compact from the first frame without the entry`).toBe(true);
		const adds = sunday.getByRole('button', { name: /^Add to Sunday / });
		await expect(adds).toHaveCount(4);
	}
});
