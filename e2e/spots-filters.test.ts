import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const cards = (page: Page) => page.getByRole('list', { name: 'Spots' }).getByRole('heading', { level: 3 });
const segment = (page: Page, name: string | RegExp) => page.getByRole('group', { name: 'Status' }).getByRole('button', { name });
const filters = (page: Page) => page.getByRole('group', { name: 'Filter spots' });
const search = (page: Page) => page.getByRole('searchbox', { name: 'Search spots' });
const params = (page: Page) => new URL(page.url()).searchParams;

test('Scenario: Stale filter values are ignored', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'Alpha', status: 'visited', scoreHundredths: 875, city: 'Berlin' },
			{ name: 'Beta', status: 'visited', scoreHundredths: 810 }
		]
	});
	const res = await page.goto('/eating-out?status=visited&tags=999999&city=Atlantis&price=9');
	expect(res?.status()).toBe(200);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

	await expect(cards(page)).toHaveText(['Alpha', 'Beta']);
	await expect(filters(page).getByRole('button', { pressed: true })).toHaveCount(0);
	await expect(page.getByLabel('City')).toHaveValue('');
});

test('Scenario: Filtering by city updates cards and counts', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'Alpha', status: 'visited', scoreHundredths: 900, city: 'Berlin' },
			{ name: 'Beta', status: 'visited', scoreHundredths: 800, city: 'Berlin' },
			{ name: 'Gamma', city: 'Berlin' },
			{ name: 'Delta', status: 'visited', scoreHundredths: 700, city: 'Hamburg' }
		]
	});
	await open(page, '/eating-out');
	await expect(segment(page, 'Visited 3')).toBeVisible();

	await page.getByLabel('City').selectOption({ label: 'Berlin' });

	await expect(cards(page)).toHaveText(['Alpha', 'Beta']);
	await expect(segment(page, 'Visited 2')).toHaveAttribute('aria-pressed', 'true');
	await expect(segment(page, 'Want to go 1')).toBeVisible();
	expect(params(page).get('city')).toBe('berlin');
});

test('Scenario: Search from Eating Out', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'Café Müller', status: 'visited', scoreHundredths: 800 },
			{ name: 'Alpha', status: 'visited', scoreHundredths: 900 }
		]
	});
	await open(page, '/eating-out');
	await expect(cards(page)).toHaveCount(2);

	await search(page).fill('müller');

	await expect(cards(page)).toHaveText(['Café Müller']);
	await expect.poll(() => params(page).get('q')).toBe('müller');
});

test('Scenario: No spot match offers to clear filters', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'Alpha', status: 'visited', scoreHundredths: 900, price: 2 },
			{ name: 'Beta', status: 'visited', scoreHundredths: 800 }
		]
	});
	await open(page, '/eating-out?status=visited&sort=name');

	await filters(page).getByRole('button', { name: '€€', exact: true }).click();
	await search(page).fill('zzz');
	await expect(page.getByText('No spots match')).toBeVisible();
	await expect(cards(page)).toHaveCount(0);

	await page.getByRole('button', { name: 'Clear filters' }).click();

	await expect(cards(page)).toHaveText(['Alpha', 'Beta']);
	await expect(page.getByText('No spots match')).toHaveCount(0);
	await expect(search(page)).toHaveValue('');
	expect(page.url().split('?')[1]).toBe('status=visited&sort=name');
});

test('Scenario: Eating Out view survives reload and back', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'Alpha', status: 'visited', scoreHundredths: 900 },
			{ name: 'Brunch Bar', tags: ['Brunch'] },
			{ name: 'Zeta Brunch', tags: ['Brunch'] },
			{ name: 'Mid Brunch', tags: ['Brunch'] },
			{ name: 'Other' }
		]
	});
	await open(page, '/eating-out');

	await segment(page, /^Want to go/).click();
	await expect(segment(page, /^Want to go/)).toHaveAttribute('aria-pressed', 'true');
	await filters(page).getByRole('button', { name: 'Brunch', exact: true }).click();
	await expect(cards(page)).toHaveCount(3);
	await page.getByLabel('Sort spots').selectOption({ label: 'Name A–Z' });
	await expect.poll(() => params(page).get('sort')).toBe('name');
	await expect(cards(page)).toHaveText(['Brunch Bar', 'Mid Brunch', 'Zeta Brunch']);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(segment(page, /^Want to go/)).toHaveAttribute('aria-pressed', 'true');
	await expect(filters(page).getByRole('button', { name: 'Brunch', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByLabel('Sort spots')).toHaveValue('name');

	await page.goBack();
	await expect(page.getByLabel('Sort spots')).toHaveValue('newest');
	await expect(segment(page, /^Want to go/)).toHaveAttribute('aria-pressed', 'true');
	await expect(filters(page).getByRole('button', { name: 'Brunch', exact: true })).toHaveAttribute('aria-pressed', 'true');
	expect(params(page).get('sort')).toBeNull();
});

test('Scenario: Search spots focuses the spot search', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { spots: [{ name: 'Alpha', status: 'visited', scoreHundredths: 900 }] });
	await open(page, '/eating-out#search');
	await expect(search(page)).toBeFocused();

	test.skip(info.project.name !== 'desktop');
	await open(page, '/eating-out');
	await expect.poll(() => page.evaluate(() => document.activeElement === document.body)).toBe(true);
	await page.getByRole('link', { name: 'Search spots' }).click();
	await expect(search(page)).toBeFocused();
});

test('Scenario: Want to go offers no score sort', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [{ name: 'Alpha', status: 'visited', scoreHundredths: 900 }, { name: 'Beta' }] });
	await open(page, '/eating-out');
	await expect(page.getByLabel('Sort spots').getByRole('option')).toHaveText(['Highest score', 'Newest first', 'Name A–Z']);

	await segment(page, /^Want to go/).click();

	await expect(page.getByLabel('Sort spots').getByRole('option')).toHaveText(['Newest first', 'Name A–Z']);
});
