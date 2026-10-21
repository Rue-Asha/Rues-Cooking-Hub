import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, setToday } from './helpers.ts';

const toBuy = (page: Page) => page.getByRole('region', { name: 'To buy' });
const category = (page: Page, name: string) => toBuy(page).getByRole('list', { name, exact: true });
const row = (page: Page, name: string) =>
	toBuy(page)
		.getByRole('listitem')
		.filter({ has: page.getByRole('checkbox', { name, exact: true }) });

test.afterEach(async ({ request }) => {
	await setToday(request, null);
});

test('Scenario: Add a manual item', async ({ page, request }) => {
	await reset(request);
	await open(page, '/list');

	const field = page.getByRole('textbox', { name: 'Add an item' });
	await field.fill('2 l milk');
	await field.press('Enter');

	const milk = category(page, 'Other').getByRole('listitem').filter({ hasText: 'milk' });
	await expect(milk).toHaveCount(1);
	await expect(milk.getByRole('checkbox', { name: 'milk', exact: true })).toBeVisible();
	await expect(milk).toContainText('2 l');
	await expect(field).toHaveValue('');
});

test("Scenario: Edit an item's name and amount", async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		items: [
			{ name: 'milk', manualAmounts: [{ quantity: 1, unit: 'l' }] },
			{ name: 'bread', manualAmounts: [{ quantity: 1, unit: null }] }
		]
	});
	await open(page, '/list');

	await page.getByRole('button', { name: 'Edit milk' }).click();
	const editor = page.getByRole('form', { name: 'Edit milk' });
	await editor.getByRole('textbox', { name: 'Name' }).fill('oat milk');
	await editor.getByRole('textbox', { name: 'Amount' }).fill('1 l + 500 ml');
	await editor.getByRole('button', { name: 'Save' }).click();
	await expect(editor).toHaveCount(0);
	await expect(row(page, 'oat milk')).toContainText('1.5 l');

	await page.getByRole('button', { name: 'Edit bread' }).click();
	const bread = page.getByRole('form', { name: 'Edit bread' });
	await bread.getByRole('textbox', { name: 'Amount' }).fill('lots');
	await bread.getByRole('button', { name: 'Save' }).click();
	await expect(bread.getByText('Enter an amount like 200 g')).toBeVisible();
	await expect(bread.getByRole('textbox', { name: 'Amount' })).toHaveAttribute('aria-invalid', 'true');

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(row(page, 'bread')).toContainText('1');
	await expect(row(page, 'bread')).not.toContainText('lots');
	await expect(row(page, 'oat milk')).toContainText('1.5 l');
});

test('Scenario: Delete an item', async ({ page, request }) => {
	await reset(request);
	await seed(request, { items: [{ name: 'milk' }, { name: 'bread' }] });
	await open(page, '/list');

	await page.getByRole('button', { name: 'Edit milk' }).click();
	await page.getByRole('form', { name: 'Edit milk' }).getByRole('button', { name: 'Delete' }).click();
	await expect(row(page, 'milk')).toHaveCount(0);
	await expect(row(page, 'bread')).toHaveCount(1);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(row(page, 'bread')).toHaveCount(1);
	await expect(row(page, 'milk')).toHaveCount(0);
});

test('Scenario: List grouped by category with empty ones hidden', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		items: [
			{ name: 'baking paper', category: 'other' },
			{ name: 'apples', category: 'produce' },
			{ name: 'lemons', category: 'produce' }
		]
	});
	await open(page, '/list');

	await expect(toBuy(page).getByRole('heading', { level: 3 })).toHaveText(['Produce', 'Other']);
	await expect(category(page, 'Produce').getByRole('listitem')).toHaveCount(2);
	await expect(category(page, 'Other').getByRole('listitem')).toHaveCount(1);
});

test('Scenario: Merged item shows its manual and plan parts', async ({ page, request }) => {
	await reset(request);
	await setToday(request, '2026-10-21');
	await seed(request, {
		recipes: [{ title: 'Pancakes', servings: 2, ingredients: [{ title: null, lines: ['500 ml milk'] }] }],
		entries: [{ date: '2026-10-21', slot: 'breakfast', recipe: 0, servings: 2 }],
		items: [{ name: 'milk', manualAmounts: [{ quantity: 1, unit: 'l' }] }]
	});
	await open(page, '/list');

	// fill from the plan through the page's own action, as the "Add from plan" dialog does
	const status = await page.evaluate(async () => {
		const body = new FormData();
		body.set('from', '2026-10-19');
		body.set('to', '2026-10-25');
		const res = await fetch('/list?/plan', { method: 'POST', body, headers: { 'x-sveltekit-action': 'true' } });
		return res.status;
	});
	expect(status).toBe(200);
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

	await expect(toBuy(page).getByRole('checkbox', { name: 'milk', exact: true })).toHaveCount(1);
	await expect(row(page, 'milk')).toContainText('1.5 l');

	await page.getByRole('button', { name: 'Edit milk' }).click();
	const editor = page.getByRole('form', { name: 'Edit milk' });
	await expect(editor.getByRole('textbox', { name: 'Amount' })).toHaveValue('1 l');
	await expect(editor.getByText('From plan: 500 ml')).toBeVisible();
});

test('Scenario: Moving an item to a category remembers it', async ({ page, request }) => {
	await reset(request);
	await seed(request, { items: [{ name: 'milk' }, { name: 'bread' }] });
	await open(page, '/list');

	await page.getByRole('button', { name: 'Move milk to another category' }).click();
	const menu = page.getByRole('menu', { name: 'Move milk to' });
	await expect(menu.getByRole('menuitemradio', { name: 'Other' })).toHaveAttribute('aria-checked', 'true');
	await menu.getByRole('menuitemradio', { name: 'Dairy & Eggs' }).click();
	await expect(menu).toHaveCount(0);
	await expect(category(page, 'Dairy & Eggs').getByRole('checkbox', { name: 'milk', exact: true })).toBeVisible();
	await expect(category(page, 'Other').getByRole('checkbox', { name: 'milk', exact: true })).toHaveCount(0);

	await page.getByRole('button', { name: 'Edit milk' }).click();
	await page.getByRole('form', { name: 'Edit milk' }).getByRole('button', { name: 'Delete' }).click();
	await expect(row(page, 'milk')).toHaveCount(0);

	const field = page.getByRole('textbox', { name: 'Add an item' });
	await field.fill('milk');
	await field.press('Enter');
	await expect(category(page, 'Dairy & Eggs').getByRole('checkbox', { name: 'milk', exact: true })).toBeVisible();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(category(page, 'Dairy & Eggs').getByRole('checkbox', { name: 'milk', exact: true })).toBeVisible();
	await expect(toBuy(page).getByRole('heading', { level: 3 })).toHaveText(['Dairy & Eggs', 'Other']);
});

test('Category menu works from the keyboard', async ({ page, request }) => {
	await reset(request);
	await seed(request, { items: [{ name: 'milk' }, { name: 'bread' }] });
	await open(page, '/list');

	const trigger = page.getByRole('button', { name: 'Move milk to another category' });
	await trigger.click();
	const menu = page.getByRole('menu', { name: 'Move milk to' });
	await expect(menu.getByRole('menuitemradio', { name: 'Other' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(menu).toHaveCount(0);
	await expect(trigger).toBeFocused();

	await trigger.click();
	await expect(menu.getByRole('menuitemradio', { name: 'Other' })).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(menu.getByRole('menuitemradio', { name: 'Produce' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(category(page, 'Produce').getByRole('checkbox', { name: 'milk', exact: true })).toBeVisible();
});
