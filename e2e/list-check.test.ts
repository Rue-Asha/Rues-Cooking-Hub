import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const toBuy = (page: Page) => page.getByRole('region', { name: 'To buy' });
const checkedSection = (page: Page) => page.getByRole('region', { name: /^Checked/ });
const box = (scope: Locator, name: string) => scope.getByRole('checkbox', { name, exact: true });
const rowIn = (scope: Locator, name: string) =>
	scope.getByRole('listitem').filter({ has: scope.page().getByRole('checkbox', { name, exact: true }) });

const settle = (page: Page) =>
	page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));

// the strike line is drawn across the name, so a struck name has a line as wide as itself
const struck = (row: Locator) =>
	row.locator('[data-strike]').evaluate((line) => {
		const text = line.parentElement!.getBoundingClientRect();
		return line.getBoundingClientRect().width >= text.width * 0.95 && getComputedStyle(line).opacity !== '0';
	});

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
	expect(await struck(rowIn(checkedSection(page), 'milk'))).toBe(true);
	expect(await struck(rowIn(toBuy(page), 'bread'))).toBe(false);

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
	expect(await struck(rowIn(dairy, 'milk'))).toBe(false);

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
	await settle(page);
	expect(await struck(rowIn(checkedSection(page), 'milk'))).toBe(true);
});
