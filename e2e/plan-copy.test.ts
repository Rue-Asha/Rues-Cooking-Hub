import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, setToday } from './helpers.ts';

const slot = (page: Page, date: string, id: string) => page.locator(`[data-date="${date}"][data-slot="${id}"]`);
const entries = (page: Page, date: string, id: string) => slot(page, date, id).locator('[data-entry]');

test.beforeEach(async ({ request }) => {
	await reset(request);
	await setToday(request, '2026-10-21');
});

async function openCopy(page: Page) {
	await open(page, '/plan');
	await page.getByRole('button', { name: 'Copy week' }).click();
	const dialog = page.getByRole('dialog', { name: 'Copy week' });
	await expect(dialog).toBeVisible();
	return dialog;
}

test('Scenario: Copy the previous week', async ({ page, request }) => {
	await seed(request, {
		recipes: [{ title: 'Lasagne', servings: 2 }],
		entries: [
			{ date: '2026-10-12', slot: 'dinner', text: 'Pizza night' },
			{ date: '2026-10-14', slot: 'lunch', recipe: 0, servings: 4 }
		]
	});
	const dialog = await openCopy(page);
	await expect(dialog.getByText('12 – 18 October')).toBeVisible();
	await dialog.getByRole('button', { name: 'Copy 2 entries' }).click();
	await expect(dialog).toBeHidden();
	await expect(entries(page, '2026-10-19', 'dinner')).toHaveCount(1);
	await expect(slot(page, '2026-10-19', 'dinner').getByText('Pizza night')).toBeVisible();
	await expect(entries(page, '2026-10-21', 'lunch')).toHaveCount(1);
	await expect(slot(page, '2026-10-21', 'lunch').getByText('4 servings')).toBeAttached();
	await page.reload();
	await expect(page.locator('[data-entry]')).toHaveCount(2);
});

test('Scenario: Copy into a week with entries asks first', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ date: '2026-10-12', slot: 'dinner', text: 'From last week' },
			{ date: '2026-10-19', slot: 'dinner', text: 'Already here' }
		]
	});
	const dialog = await openCopy(page);
	await dialog.getByRole('button', { name: 'Copy 1 entry' }).click();
	await expect(dialog.getByText('This week already has 1 entry')).toBeVisible();
	await expect(entries(page, '2026-10-19', 'dinner')).toHaveCount(1);
	await dialog.getByRole('button', { name: 'Add anyway' }).click();
	await expect(dialog).toBeHidden();
	await expect(entries(page, '2026-10-19', 'dinner')).toHaveText([/Already here/, /From last week/]);
});

test('Scenario: Nothing to copy', async ({ page, request }) => {
	await seed(request, { entries: [{ date: '2026-10-19', slot: 'dinner', text: 'Already here' }] });
	const dialog = await openCopy(page);
	await dialog.getByRole('button', { name: 'Copy', exact: true }).click();
	await expect(dialog.getByText('Nothing to copy')).toBeVisible();
	await expect(page.locator('[data-entry]')).toHaveCount(1);
	await page.reload();
	await expect(page.locator('[data-entry]')).toHaveCount(1);
});

test('Copy week can pick an earlier source week', async ({ page, request }) => {
	await seed(request, { entries: [{ date: '2026-10-07', slot: 'snacks', text: 'Two weeks ago' }] });
	const dialog = await openCopy(page);
	await expect(dialog.getByText('No entries in this week')).toBeVisible();
	await dialog.getByRole('button', { name: 'Earlier week' }).click();
	await expect(dialog.getByText('5 – 11 October')).toBeVisible();
	await dialog.getByRole('button', { name: 'Copy 1 entry' }).click();
	await expect(dialog).toBeHidden();
	await expect(entries(page, '2026-10-21', 'snacks')).toHaveCount(1);
});
