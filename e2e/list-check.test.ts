import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const toBuy = (page: Page) => page.getByRole('region', { name: 'To buy' });
const checkedSection = (page: Page) => page.getByRole('region', { name: /^Checked/ });
const box = (scope: Locator, name: string) => scope.getByRole('checkbox', { name, exact: true });
const rowIn = (scope: Locator, name: string) =>
	scope.getByRole('listitem').filter({ has: scope.page().getByRole('checkbox', { name, exact: true }) });

const settle = (page: Page) =>
	page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));

// a struck name is drawn with a line through it
const struck = (row: Locator, name: string) =>
	row.getByText(name, { exact: true }).evaluate((text) => getComputedStyle(text).textDecorationLine.includes('line-through'));

const items = {
	items: [
		{ name: 'milk', category: 'dairy-eggs' as const },
		{ name: 'bread', category: 'bakery' as const }
	]
};

test('Scenario: Check off moves the item to Checked', async ({ page, request }) => {
	await reset(request);
	await seed(request, items);
	await open(page, '/list');

	await box(toBuy(page), 'milk').click();

	await expect(box(checkedSection(page), 'milk')).toHaveAttribute('aria-checked', 'true');
	await expect(box(toBuy(page), 'milk')).toHaveCount(0);
	await expect(page.getByRole('region').last()).toHaveAccessibleName(/^Checked/);
	await settle(page);
	expect(await struck(rowIn(checkedSection(page), 'milk'), 'milk')).toBe(true);
	expect(await struck(rowIn(toBuy(page), 'bread'), 'bread')).toBe(false);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(box(checkedSection(page), 'milk')).toHaveAttribute('aria-checked', 'true');
});

test('Scenario: Uncheck restores the item', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		items: [
			{ name: 'milk', category: 'dairy-eggs', checked: true },
			{ name: 'bread', category: 'bakery' }
		]
	});
	await open(page, '/list');
	await expect(box(checkedSection(page), 'milk')).toHaveAttribute('aria-checked', 'true');

	await box(checkedSection(page), 'milk').click();

	const dairy = toBuy(page).getByRole('list', { name: 'Dairy & Eggs', exact: true });
	await expect(box(dairy, 'milk')).toHaveAttribute('aria-checked', 'false');
	await expect(box(checkedSection(page), 'milk')).toHaveCount(0);
	await settle(page);
	expect(await struck(rowIn(dairy, 'milk'), 'milk')).toBe(false);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(box(dairy, 'milk')).toHaveAttribute('aria-checked', 'false');
});

test('Scenario: Clear checked is disabled with nothing checked', async ({ page, request }) => {
	await reset(request);
	await seed(request, items);
	await open(page, '/list');

	const clear = page.getByRole('button', { name: 'Clear checked' });
	await expect(clear).toBeDisabled();

	await box(toBuy(page), 'milk').click();
	await expect(box(checkedSection(page), 'milk')).toBeVisible();
	await expect(clear).toBeEnabled();
	await clear.click();

	await expect(page.getByRole('checkbox', { name: 'milk', exact: true })).toHaveCount(0);
	await expect(box(toBuy(page), 'bread')).toHaveAttribute('aria-checked', 'false');
	await expect(clear).toBeDisabled();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(page.getByRole('checkbox')).toHaveCount(1);
	await expect(box(toBuy(page), 'bread')).toBeVisible();
});

test('Scenario: Reduced motion checks off without sliding', async ({ page, request }) => {
	await reset(request);
	await seed(request, items);
	await calm(page);
	await open(page, '/list');

	await box(toBuy(page), 'milk').click();

	const row = rowIn(checkedSection(page), 'milk');
	await expect(row).toBeVisible();
	const running = await row.evaluate(
		(li) => li.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length
	);
	expect(running).toBe(0);
	await expect(box(toBuy(page), 'milk')).toHaveCount(0);
});

test('Check-off slides the item into Checked', async ({ page, request }) => {
	await reset(request);
	await seed(request, items);
	await open(page, '/list');
	await settle(page);

	await box(toBuy(page), 'milk').click();

	const flying = () =>
		rowIn(checkedSection(page), 'milk').evaluate((li) =>
			li
				.getAnimations()
				.some(
					(a) =>
						a.playState === 'running' &&
						(a.effect as KeyframeEffect)
							.getKeyframes()
							.some((k) => typeof k.transform === 'string' && k.transform.includes('translate'))
				)
		);
	await expect.poll(flying, { intervals: [10], timeout: 3000 }).toBe(true);
	// the whole flight is one glide, however far the row travels
	const flight = await rowIn(checkedSection(page), 'milk').evaluate((li) => li.getAnimations().map((a) => Number(a.effect!.getTiming().duration)));
	for (const ms of flight) expect(ms).toBeLessThanOrEqual(260);
	await settle(page);
	expect(await struck(rowIn(checkedSection(page), 'milk'), 'milk')).toBe(true);
});

test('Keyboard focus stays in place: Enter keeps the add field, Space follows the row, Escape and Save return to the row', async ({ page, request }) => {
	await reset(request);
	await seed(request, items);
	await open(page, '/list');
	const field = page.getByRole('textbox', { name: 'Add an item' });

	await field.focus();
	await page.keyboard.type('eggs');
	await page.keyboard.press('Enter');
	await expect(toBuy(page).getByRole('checkbox', { name: 'eggs', exact: true })).toHaveCount(1);
	await expect(field).toBeFocused();
	await expect(field).toHaveValue('');

	await box(toBuy(page), 'milk').focus();
	await page.keyboard.press('Space');
	await expect(box(checkedSection(page), 'milk')).toHaveAttribute('aria-checked', 'true');
	await expect(box(checkedSection(page), 'milk')).toBeFocused();

	const edit = toBuy(page).getByRole('button', { name: 'Edit bread' });
	await edit.focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('textbox', { name: 'Name' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('form', { name: 'Edit bread' })).toHaveCount(0);
	await expect(edit).toBeFocused();

	await page.keyboard.press('Enter');
	await page.getByRole('textbox', { name: 'Name' }).fill('rye bread');
	await page.keyboard.press('Enter');
	const renamed = toBuy(page).getByRole('button', { name: 'Edit rye bread' });
	await expect(renamed).toBeVisible();
	await expect(renamed).toBeFocused();
});

test('Scenario: Clearing checked items at the page end moves no row to buy', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'sets its own viewport');
	await page.setViewportSize({ width: 375, height: 812 });
	await reset(request);
	const shopping = [
		...['onions', 'tomatoes', 'lemons', 'carrots'].map((name) => ({ name, category: 'produce' as const })),
		...['butter', 'ricotta', 'eggs'].map((name) => ({ name, category: 'dairy-eggs' as const })),
		...['spaghetti', 'coconut milk', 'rice'].map((name) => ({ name, category: 'pantry' as const }))
	];
	const done = ['red lentils', 'flour', 'sugar', 'salt', 'pepper', 'oats', 'honey', 'jam'].map((name) => ({ name, category: 'pantry' as const, checked: true }));
	await seed(request, { items: [...shopping, ...done] });
	await open(page, '/list');
	await settle(page);
	await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
	await page.waitForFunction(() => document.getAnimations().length === 0);

	// every frame from the press on: where each row and aisle under To buy sits on the page, and whether it animates
	await toBuy(page).evaluate((region) => {
		const w = window as unknown as { __moves: string[]; __stop: boolean; __clamped: boolean };
		w.__moves = [];
		w.__stop = false;
		w.__clamped = false;
		const watched = [...region.querySelectorAll<HTMLElement>('article, li')];
		const start = watched.map((el) => el.getBoundingClientRect().top + scrollY);
		const y0 = scrollY;
		const frame = () => {
			if (scrollY < y0 - 1) w.__clamped = true;
			watched.forEach((el, i) => {
				const top = el.getBoundingClientRect().top + scrollY;
				const name = `${el.tagName.toLowerCase()} ${el.textContent?.trim().slice(0, 20)}`;
				if (Math.abs(top - start[i]) > 1) w.__moves.push(`${name} at ${Math.round(top - start[i])} px`);
				if (el.getAnimations().length) w.__moves.push(`${name} animates`);
			});
			if (!w.__stop) requestAnimationFrame(frame);
		};
		requestAnimationFrame(frame);
	});
	await page.getByRole('button', { name: 'Clear checked' }).click();
	await expect(checkedSection(page).getByRole('checkbox')).toHaveCount(0);
	await settle(page);
	await page.evaluate(() => new Promise(requestAnimationFrame));
	const { moves, clamped } = await page.evaluate(() => {
		const w = window as unknown as { __moves: string[]; __stop: boolean; __clamped: boolean };
		w.__stop = true;
		return { moves: [...new Set(w.__moves)], clamped: w.__clamped };
	});
	expect(clamped, 'the shorter page clamps the scroll').toBe(true);
	expect(moves).toEqual([]);
});
