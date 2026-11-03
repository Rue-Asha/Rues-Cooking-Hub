import { expect, test } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Delete a spot from its page', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Gone soon', city: 'Bonn' }, { name: 'Stays' }] });
	await open(page, `/eating-out/${spots[0]}`);

	await page.getByRole('button', { name: 'Delete' }).click();
	const dialog = page.getByRole('dialog', { name: 'Delete “Gone soon”?' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Delete' }).click();

	await expect(page).toHaveURL(/\/eating-out$/);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page.getByRole('button', { name: /Want to go/ }).click();
	await expect(page.getByText('Stays')).toBeVisible();
	await expect(page.getByText('Gone soon')).toHaveCount(0);
});
