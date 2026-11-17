import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const segment = (page: Page) => page.getByRole('group', { name: 'Status' });
const cards = (page: Page) => page.getByRole('list', { name: 'Spots' }).getByRole('heading', { level: 3 });
const listing = (page: Page) => page.getByRole('region', { name: 'Eating Out list' });

test('Scenario: Visited is the default segment', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'Alpha', status: 'visited', scoreHundredths: 875 },
			{ name: 'Beta', status: 'visited', scoreHundredths: 810 },
			{ name: 'Gamma' }
		]
	});
	await open(page, '/eating-out');

	await expect(segment(page).getByRole('button', { name: 'Visited 2' })).toHaveAttribute('aria-pressed', 'true');
	await expect(segment(page).getByRole('button', { name: 'Want to go 1' })).toHaveAttribute('aria-pressed', 'false');
	await expect(cards(page)).toHaveText(['Alpha', 'Beta']);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Eating Out');
});

test('Scenario: Want to go opens when nothing is visited', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [{ name: 'Delta' }, { name: 'Epsilon' }] });
	await open(page, '/eating-out');

	await expect(segment(page).getByRole('button', { name: 'Want to go 2' })).toHaveAttribute('aria-pressed', 'true');
	await expect(cards(page)).toHaveCount(2);
});

test('Scenario: Empty Eating Out invites the first spot', async ({ page, request }) => {
	await reset(request);
	await open(page, '/eating-out');

	await expect(page.getByRole('heading', { name: 'Start your list' })).toBeVisible();
	await expect(page.getByText('Keep the places you loved, and the ones you still want to try.')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Add spot' }).first()).toHaveAttribute('href', '/eating-out/new');
	await expect(segment(page)).toHaveCount(0);
	await expect(page.getByRole('searchbox')).toHaveCount(0);
	await expect(page.getByRole('list', { name: 'Spots' })).toHaveCount(0);
});

test('Scenario: Empty side shows a short line', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [{ name: 'Delta' }] });
	await open(page, '/eating-out?status=visited');

	await expect(page.getByText('No visited spots yet.')).toBeVisible();
	await expect(listing(page).getByRole('link', { name: 'Add spot' })).toHaveAttribute('href', '/eating-out/new');
	await expect(page.getByRole('list', { name: 'Spots' })).toHaveCount(0);
});

test('Scenario: Phone page carries Add spot', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone');
	await reset(request);
	await seed(request, { spots: [{ name: 'Delta' }] });
	await open(page, '/eating-out');

	const add = page.getByRole('main').getByRole('link', { name: 'Add spot' });
	await expect(add).toBeVisible();
	await expect(add).toHaveAttribute('href', '/eating-out/new');
});
