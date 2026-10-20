import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, setToday } from './helpers.ts';

const toBuy = (page: Page) => page.getByRole('region', { name: 'To buy' });
const rows = (page: Page) => toBuy(page).getByRole('listitem');
const row = (page: Page, name: string) =>
	rows(page).filter({ has: page.getByRole('checkbox', { name, exact: true }) });

test.afterEach(async ({ request }) => {
	await setToday(request, null);
});

test('Scenario: Add from plan for the shown week', async ({ page, request }) => {
	await reset(request);
	await setToday(request, '2026-10-21');
	await seed(request, {
		recipes: [
			{
				title: 'Lasagne',
				servings: 2,
				ingredients: [{ title: null, lines: ['200 g flour', '1 onion', 'salt'] }]
			}
		],
		entries: [{ date: '2026-10-22', slot: 'dinner', recipe: 0, servings: 4 }]
	});
	await open(page, '/list');

	await page.getByRole('button', { name: 'Add from plan' }).click();
	const dialog = page.getByRole('dialog', { name: 'Add from plan' });
	await expect(dialog.getByLabel('From', { exact: true })).toHaveValue('2026-10-19');
	await expect(dialog.getByLabel('To', { exact: true })).toHaveValue('2026-10-25');
	await dialog.getByRole('button', { name: 'Add to list' }).click();

	await expect(dialog).toHaveCount(0);
	await expect(page.getByRole('status')).toContainText('Added 3 items from the plan');
	await expect(row(page, 'flour')).toContainText('400 g');
	await expect(row(page, 'onion')).toContainText('2');
	await expect(row(page, 'salt')).toHaveCount(1);
});

test('Scenario: Empty range reports nothing planned', async ({ page, request }) => {
	await reset(request);
	await setToday(request, '2026-10-21');
	await seed(request, {
		recipes: [{ title: 'Lasagne', servings: 2, ingredients: [{ title: null, lines: ['200 g flour'] }] }],
		entries: [
			{ date: '2026-10-22', slot: 'dinner', recipe: 0, servings: 2 },
			{ date: '2026-10-28', slot: 'dinner', text: 'Pizza night' }
		],
		items: [
			{ name: 'bread', manualAmounts: [{ quantity: 1, unit: null }] },
			{ name: 'butter', planAmounts: [{ quantity: 60, unit: 'g' }], origin: 'plan' }
		]
	});
	await open(page, '/list');
	const before = await rows(page).allInnerTexts();

	await page.getByRole('button', { name: 'Add from plan' }).click();
	const dialog = page.getByRole('dialog', { name: 'Add from plan' });
	await dialog.getByRole('button', { name: 'Next week' }).click();
	await expect(dialog.getByLabel('From', { exact: true })).toHaveValue('2026-10-26');
	await expect(dialog.getByLabel('To', { exact: true })).toHaveValue('2026-11-01');
	await dialog.getByRole('button', { name: 'Add to list' }).click();

	await expect(dialog.getByText('Nothing planned in this range')).toBeVisible();
	await expect(rows(page)).toHaveText(before);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(rows(page)).toHaveText(before);
	await expect(row(page, 'flour')).toHaveCount(0);
});
