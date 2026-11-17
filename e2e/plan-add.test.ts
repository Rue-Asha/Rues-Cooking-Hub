import { expect, test } from '@playwright/test';
import { entries, open, plus, reset, seed, setToday } from './helpers.ts';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test.beforeEach(async ({ request }) => {
	await reset(request);
	await setToday(request, '2026-10-21');
});

test('Scenario: Plus on Plan opens the Add dialog for today', async ({ page }) => {
	await open(page, '/plan');
	await plus(page).click();
	const dialog = page.getByRole('dialog', { name: 'Add to Wednesday Dinner' });
	await expect(dialog).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Recipe' })).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Free text' })).toBeVisible();
});

test('Scenario: Plus on another week targets Monday Dinner', async ({ page }) => {
	await open(page, '/plan?week=2026-10-26');
	await plus(page).click();
	const dialog = page.getByRole('dialog', { name: 'Add to Monday Dinner' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Free text' }).click();
	await dialog.getByLabel('Text').fill('Pizza night');
	await dialog.getByRole('button', { name: 'Add to plan' }).click();
	await expect(dialog).toBeHidden();
	await expect(entries(page, '2026-10-26', 'dinner')).toContainText('Pizza night');
	await expect(page).toHaveURL(/week=2026-10-26/);
	await page.reload();
	await expect(entries(page, '2026-10-26', 'dinner')).toContainText('Pizza night');
});

test('Scenario: Plan entry from the Home sheet opens the Add dialog', async ({ page }) => {
	await open(page, '/');
	await plus(page).click();
	await page.getByRole('dialog', { name: 'Add to your kitchen' }).getByRole('link', { name: /^Plan entry/ }).click();
	const dialog = page.getByRole('dialog', { name: 'Add to Wednesday Dinner' });
	await expect(dialog).toBeVisible();
	await expect(page).not.toHaveURL(/add=/);
	await page.reload();
	await expect(page).toHaveURL(/\/plan$/);
	await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Closing the Add dialog opened from the Home sheet hands focus to that slot\'s add button', async ({ page }) => {
	await open(page, '/');
	await plus(page).click();
	await page.getByRole('dialog', { name: 'Add to your kitchen' }).getByRole('link', { name: /^Plan entry/ }).click();
	const dialog = page.getByRole('dialog', { name: 'Add to Wednesday Dinner' });
	await expect(dialog).toBeVisible();

	await page.keyboard.press('Escape');

	await expect(dialog).toBeHidden();
	await expect(page.getByRole('button', { name: 'Add to Wednesday Dinner' })).toBeFocused();
});

test('A change on another week keeps that week in view', async ({ page, request }) => {
	await seed(request, { entries: [{ date: '2026-10-27', slot: 'lunch', text: 'Soup' }] });
	await open(page, '/plan?week=2026-10-26');
	await page.getByRole('button', { name: 'Options for Soup' }).click();
	await page.getByRole('menuitem', { name: 'Edit text' }).click();
	await page.getByLabel('Text').fill('Broth');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(entries(page, '2026-10-27', 'lunch')).toContainText('Broth');
	await expect(page).toHaveURL(/week=2026-10-26/);
});
