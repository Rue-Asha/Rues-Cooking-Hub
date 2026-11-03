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
	await expect(page.getByRole('img', { name: 'Your first spot goes here' })).toBeVisible();
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

	const add = page.locator('[data-column] header').getByRole('link', { name: 'Add spot' });
	await expect(add).toBeVisible();
	await expect(add).toHaveAttribute('href', '/eating-out/new');
});

test('Eating Out list screenshot', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		spots: [
			{ name: 'Brasserie Lumière', status: 'visited', scoreHundredths: 900, price: 3, neighbourhood: 'Mitte', city: 'Berlin', tags: ['Brasserie', 'Date night', 'Wine'], image: '/mockups/spot-interior.jpg' },
			{ name: 'Terraza Pujol', status: 'visited', scoreHundredths: 900, price: 2, neighbourhood: 'Malasaña', city: 'Madrid', tags: ['Tapas', 'Terrace'], image: '/mockups/spot-terrace.jpg' },
			{ name: 'Kuro Ramen', status: 'visited', scoreHundredths: 875, price: 2, neighbourhood: 'Kreuzberg', city: 'Berlin', tags: ['Ramen', 'Casual', 'Late'], image: '/mockups/spot-ramen.jpg' },
			{ name: 'Chalet Sauvage', status: 'visited', scoreHundredths: 810, price: 2, city: 'Villard-Reculas', tags: ['Pizza', 'Mountains'], image: '/mockups/spot-pizzeria.jpg' },
			{ name: 'Weinbar Kupfer', price: 3, neighbourhood: 'Sternschanze', city: 'Hamburg', tags: ['Wine', 'Date night'], image: '/mockups/spot-wine-bar.jpg', createdAt: '2026-10-03T10:00:00.000Z' },
			{ name: 'Morgenrot Café', price: 1, neighbourhood: 'Prenzlauer Berg', city: 'Berlin', tags: ['Brunch', 'Coffee'], image: '/mockups/yoghurt-bowl.jpg', createdAt: '2026-10-02T10:00:00.000Z' },
			{ name: 'Pasta Fresca', city: 'Berlin', createdAt: '2026-10-01T10:00:00.000Z' }
		]
	});

	const shoot = async (path: string, file: string) => {
		await open(page, path);
		await page.evaluate(async () => {
			for (const img of document.querySelectorAll('img')) img.loading = 'eager';
			await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
		});
		await page.waitForTimeout(900);
		await page.screenshot({ path: `test-results/shots/${file}-${info.project.name}.png`, fullPage: true });
	};
	await shoot('/eating-out', 'eating-out-list');
	await shoot('/eating-out?status=want', 'eating-out-list-want');
});
