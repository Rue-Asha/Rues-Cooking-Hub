import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, setToday } from './helpers.ts';

const slot = (page: Page, date: string, id: string) => page.locator(`[data-date="${date}"][data-slot="${id}"]`);

test.beforeEach(async ({ request }) => {
	await reset(request);
	await setToday(request, '2026-10-21');
});

test('Scenario: Add a recipe entry with the picker', async ({ page, request }) => {
	await seed(request, {
		recipes: [
			{ title: 'Pancakes', servings: 4 },
			{ title: 'Lasagne', servings: 2, tags: ['Main Course'] },
			{ title: 'Lasagne verde', servings: 6 }
		]
	});
	await open(page, '/plan');
	await page.getByRole('button', { name: 'Add to Tuesday Dinner' }).click();
	const picker = page.getByRole('dialog', { name: 'Add to Tuesday Dinner' });
	await expect(picker).toBeVisible();
	await picker.getByRole('searchbox', { name: 'Search recipes' }).fill('lasagne');
	await expect(picker.getByRole('button', { name: /Pancakes/ })).toHaveCount(0);
	await picker.getByRole('button', { name: /^Lasagne\b(?! verde)/ }).click();
	await expect(picker.getByLabel('Servings')).toHaveValue('2');
	await picker.getByLabel('Servings').fill('4');
	await picker.getByRole('button', { name: 'Add to plan' }).click();
	await expect(picker).toBeHidden();
	const dinner = slot(page, '2026-10-20', 'dinner');
	await expect(dinner.locator('[data-entry]')).toHaveCount(1);
	await expect(dinner.getByText('Lasagne', { exact: true })).toBeVisible();
	await expect(dinner.getByText('4 servings')).toBeAttached();
	await page.reload();
	await expect(slot(page, '2026-10-20', 'dinner').getByText('4 servings')).toBeAttached();
});

test('Scenario: Add a free-text entry', async ({ page }) => {
	await open(page, '/plan');
	await page.getByRole('button', { name: 'Add to Friday Dinner' }).click();
	const picker = page.getByRole('dialog', { name: 'Add to Friday Dinner' });
	await picker.getByRole('button', { name: 'Free text' }).click();
	await picker.getByLabel('Text').fill('Pizza night');
	await picker.getByRole('button', { name: 'Add to plan' }).click();
	await expect(picker).toBeHidden();
	await expect(slot(page, '2026-10-23', 'dinner').getByText('Pizza night')).toBeVisible();
	await expect(slot(page, '2026-10-23', 'dinner').locator('[data-entry]')).toHaveCount(1);
});

test('Scenario: Empty free text shows an error', async ({ page }) => {
	await open(page, '/plan');
	await page.getByRole('button', { name: 'Add to Friday Dinner' }).click();
	const picker = page.getByRole('dialog', { name: 'Add to Friday Dinner' });
	await picker.getByRole('button', { name: 'Free text' }).click();
	await picker.getByRole('button', { name: 'Add to plan' }).click();
	await expect(picker.getByText('Enter a recipe or some text')).toBeVisible();
	await expect(picker).toBeVisible();
	await expect(slot(page, '2026-10-23', 'dinner').locator('[data-entry]')).toHaveCount(0);
});

test('Scenario: Edit and delete an entry', async ({ page, request }) => {
	await seed(request, {
		recipes: [{ title: 'Lasagne', servings: 2 }],
		entries: [
			{ date: '2026-10-20', slot: 'dinner', recipe: 0, servings: 2 },
			{ date: '2026-10-20', slot: 'dinner', text: 'Leftover soup' },
			{ date: '2026-10-22', slot: 'lunch', text: 'Sandwiches' }
		]
	});
	await open(page, '/plan');
	const dinner = slot(page, '2026-10-20', 'dinner');
	await dinner.getByRole('button', { name: 'Options for Lasagne' }).click();
	await page.getByRole('menuitem', { name: 'Change servings' }).click();
	await page.getByLabel('Servings').fill('3');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(dinner.getByText('3 servings')).toBeAttached();
	await expect(page.getByRole('menu')).toHaveCount(0);

	await dinner.getByRole('button', { name: 'Options for Leftover soup' }).click();
	await page.getByRole('menuitem', { name: 'Edit text' }).click();
	await page.getByLabel('Text').fill('Soup and bread');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(dinner.getByText('Soup and bread')).toBeVisible();

	await slot(page, '2026-10-22', 'lunch').getByRole('button', { name: 'Options for Sandwiches' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await expect(page.getByText('Sandwiches')).toHaveCount(0);

	await page.reload();
	await expect(slot(page, '2026-10-20', 'dinner').getByText('3 servings')).toBeAttached();
	await expect(slot(page, '2026-10-20', 'dinner').getByText('Soup and bread')).toBeVisible();
	await expect(page.getByText('Sandwiches')).toHaveCount(0);
});

test('Entry menu rejects servings below 1 and works by keyboard', async ({ page, request }) => {
	await seed(request, { recipes: [{ title: 'Lasagne' }], entries: [{ date: '2026-10-20', slot: 'dinner', recipe: 0 }] });
	await open(page, '/plan');
	const trigger = page.getByRole('button', { name: 'Options for Lasagne' });
	await trigger.focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('menuitem', { name: 'Change servings' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('menu')).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await page.keyboard.press('Enter');
	await page.getByRole('menuitem', { name: 'Change servings' }).click();
	await page.getByLabel('Servings').fill('0');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByText('Servings must be at least 1')).toBeVisible();
});
