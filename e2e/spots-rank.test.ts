import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const cards = (page: Page) => page.getByRole('article');
const ranks = (page: Page) => page.getByText(/^#\d+$/);

test('Scenario: Ranks show while sorted by score', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'C', status: 'visited', scoreHundredths: 810 },
			{ name: 'B', status: 'visited', scoreHundredths: 875 },
			{ name: 'A', status: 'visited', scoreHundredths: 875 }
		]
	});
	await open(page, '/eating-out');

	await expect(cards(page).getByRole('heading')).toHaveText(['A', 'B', 'C']);
	await expect(ranks(page)).toHaveText(['#1', '#1', '#3']);
});

test('Scenario: Ranks recount within the filters', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'Berlin best', status: 'visited', scoreHundredths: 950, city: 'Berlin' },
			{ name: 'Hamburg best', status: 'visited', scoreHundredths: 800, city: 'Hamburg' }
		]
	});
	await open(page, '/eating-out');
	await expect(ranks(page)).toHaveText(['#1', '#2']);

	await page.getByLabel('City').selectOption({ label: 'Hamburg' });

	await expect(cards(page)).toHaveCount(1);
	await expect(ranks(page).first()).toHaveText('#1');
});

test('Scenario: Other sorts show no rank', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'A', status: 'visited', scoreHundredths: 900 },
			{ name: 'B', status: 'visited', scoreHundredths: 800 },
			{ name: 'W' }
		]
	});
	await open(page, '/eating-out');
	await expect(ranks(page)).toHaveCount(2);

	await page.getByLabel('Sort spots').selectOption({ label: 'Name A–Z' });
	await expect(page).toHaveURL(/sort=name/);
	await expect(cards(page)).toHaveCount(2);
	await expect(ranks(page)).toHaveCount(0);

	await page.getByRole('group', { name: 'Status' }).getByRole('button', { name: /^Want to go/ }).click();
	await expect(page.getByRole('article').getByRole('heading')).toHaveText(['W']);
	await expect(ranks(page)).toHaveCount(0);
});
