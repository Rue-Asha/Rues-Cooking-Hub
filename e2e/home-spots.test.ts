import { expect, test } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const visited = (name: string, scoreHundredths: number, extra: object = {}) => ({ name, status: 'visited' as const, scoreHundredths, ...extra });

test('Scenario: Home shows Top spots after Recently added', async ({ page, request }) => {
	await reset(request);
	const { spots } = await seed(request, {
		recipes: [{ title: 'Lasagne' }, { title: 'Soup' }],
		spots: [visited('Fifth', 700), visited('First', 950), visited('Fourth', 810), visited('Second', 875), visited('Third', 850)]
	});
	await open(page, '/');

	const recent = page.getByRole('heading', { name: 'Recently added' });
	const top = page.getByRole('heading', { name: 'Top spots' });
	await expect(top).toBeVisible();
	const [a, b] = await Promise.all([recent.boundingBox(), top.boundingBox()]);
	expect(b!.y).toBeGreaterThan(a!.y);

	const section = page.locator('section', { has: top });
	const cards = section.getByRole('article');
	await expect(cards.getByRole('heading')).toHaveText(['First', 'Second', 'Third', 'Fourth']);
	await expect(cards.locator('.badge')).toHaveText(['9.50', '8.75', '8.50', '8.10']);
	await expect(cards.locator('.rank')).toHaveCount(0);
	await expect(section.getByRole('link', { name: /All spots/ })).toHaveAttribute('href', '/eating-out');
	await expect(cards.first().getByRole('link', { name: 'First' })).toHaveAttribute('href', `/eating-out/${spots[1]}`);
	await expect(page.locator('[data-tile]')).toHaveCount(4);
});

test('Scenario: Fewer than four visited spots shows what exists', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [visited('Alpha', 800), visited('Beta', 900), { name: 'Gamma' }] });
	await open(page, '/');

	const section = page.locator('section', { has: page.getByRole('heading', { name: 'Top spots' }) });
	await expect(section.getByRole('article').getByRole('heading')).toHaveText(['Beta', 'Alpha']);
});

test('Scenario: No visited spot hides Top spots', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [{ name: 'Gamma' }, { name: 'Delta' }] });
	await open(page, '/');

	await expect(page.getByRole('heading', { name: 'Top spots' })).toHaveCount(0);
	await expect(page.locator('a[href^="/eating-out/"]')).toHaveCount(0);
});

test('Scenario: Top spots row lays out like Recently added', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		recipes: [{ title: 'Lasagne' }],
		spots: [visited('One', 900), visited('Two', 880), visited('Three', 860), visited('Four', 840)]
	});
	await open(page, '/');

	const section = page.locator('section', { has: page.getByRole('heading', { name: 'Top spots' }) });
	const boxes = await section.getByRole('article').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => [Math.round(r.x), Math.round(r.y)]));
	const xs = new Set(boxes.map(([x]) => x));
	const ys = new Set(boxes.map(([, y]) => y));
	if (info.project.name === 'phone') {
		expect([xs.size, ys.size]).toEqual([2, 2]);
	} else {
		expect([xs.size, ys.size]).toEqual([4, 1]);
	}
	const column = await page.locator('[data-column]').boundingBox();
	const heading = await page.getByRole('heading', { name: 'Top spots' }).boundingBox();
	expect(Math.abs(heading!.x - column!.x)).toBeLessThanOrEqual(1);
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
	expect(overflow).toBe(false);
});

test('Home Top spots screenshot', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		recipes: [{ title: 'Lasagne', image: true }, { title: 'Soup' }],
		spots: [
			visited('Brasserie Lumière', 900, { price: 3, neighbourhood: 'Mitte', city: 'Berlin', tags: ['Brasserie', 'Wine'], image: '/mockups/spot-interior.jpg' }),
			visited('Terraza Pujol', 890, { price: 2, neighbourhood: 'Malasaña', city: 'Madrid', tags: ['Tapas', 'Terrace'], image: '/mockups/spot-terrace.jpg' }),
			visited('Kuro Ramen', 875, { price: 2, neighbourhood: 'Kreuzberg', city: 'Berlin', tags: ['Ramen', 'Late'], image: '/mockups/spot-ramen.jpg' }),
			visited('Chalet Sauvage', 810, { price: 2, city: 'Villard-Reculas', tags: ['Pizza'], image: '/mockups/spot-pizzeria.jpg' })
		]
	});
	await open(page, '/');
	await page.evaluate(async () => {
		for (const img of document.querySelectorAll('img')) img.loading = 'eager';
		await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
	});
	await page.waitForTimeout(900);
	await page.screenshot({ path: `test-results/shots/eating-out-home-${info.project.name}.png`, fullPage: true });
});
