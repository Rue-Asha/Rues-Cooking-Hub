import { expect, test } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

test('Scenario: Visited card shows photo, name, tags, location, price and score', async ({ page, request }) => {
	await reset(request);
	const { spots } = await seed(request, {
		spots: [
			{
				name: 'Kuro Ramen',
				status: 'visited',
				scoreHundredths: 875,
				price: 2,
				neighbourhood: 'Mitte',
				city: 'Berlin',
				tags: ['Brunch', 'Coffee', 'Vegan'],
				image: '/mockups/spot-ramen.jpg'
			}
		]
	});
	await open(page, '/eating-out');

	const card = page.getByRole('article');
	await expect(card.locator('img')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(card.getByRole('link', { name: 'Kuro Ramen' })).toHaveAttribute('href', `/eating-out/${spots[0]}`);
	await expect(card.locator('.chip')).toHaveText(['Brunch', 'Coffee']);
	await expect(card.getByText('Mitte, Berlin')).toBeVisible();
	await expect(card.getByText('€€', { exact: true })).toBeVisible();
	await expect(card.locator('.badge')).toHaveText('8.75');
});

test('Scenario: Sparse card shows no empty parts', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [{ name: 'Bare Bones' }] });
	await open(page, '/eating-out');

	const card = page.getByRole('article');
	await expect(card.getByRole('img', { name: 'No photo yet' })).toBeVisible();
	await expect(card.getByRole('heading', { name: 'Bare Bones' })).toBeVisible();
	await expect(card.locator('.subtitle, .price, .chip, .badge, .rank')).toHaveCount(0);
	expect(await card.innerText()).not.toContain(',');
});

test('Scenario: Long spot names are clamped', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [{ name: 'Gasthaus '.repeat(14).trim(), status: 'visited', scoreHundredths: 700 }] });
	await open(page, '/eating-out');

	const title = page.getByRole('article').getByRole('heading');
	const { height, line } = await title.evaluate((el) => ({
		height: el.getBoundingClientRect().height,
		line: parseFloat(getComputedStyle(el).lineHeight)
	}));
	expect(height).toBeLessThanOrEqual(line * 2 + 1);
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
	expect(overflow).toBe(false);
});

test('Scenario: Spot grid fits narrow phones', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone');
	await reset(request);
	const long = (n: string) => `${n} Gasthaus zur goldenen Gans am alten Marktplatz`;
	await seed(request, {
		spots: [
			{ name: long('Eins'), status: 'visited', scoreHundredths: 1000, price: 4, neighbourhood: 'Prenzlauer Berg', city: 'Berlin', tags: ['Brunch', 'Coffee'] },
			{ name: long('Zwei'), status: 'visited', scoreHundredths: 875, price: 3, neighbourhood: 'Charlottenburg', city: 'Berlin', tags: ['Wine', 'Late'] },
			{ name: long('Drei'), status: 'visited', scoreHundredths: 875, price: 2, neighbourhood: 'Mitte', city: 'Hamburg', tags: ['Ramen', 'Casual'] },
			{ name: long('Vier'), status: 'visited', scoreHundredths: 810, price: 1, city: 'Köln', tags: ['Bakery', 'Takeaway'] }
		]
	});

	for (const [width, height] of [
		[390, 844],
		[320, 640]
	]) {
		await page.setViewportSize({ width, height });
		await open(page, '/eating-out');

		const fits = await page.evaluate(() => {
			const grid = document.querySelector<HTMLElement>('ul[aria-label="Spots"]')!;
			const inside = (inner: Element, outer: Element) => {
				const a = inner.getBoundingClientRect();
				const b = outer.getBoundingClientRect();
				return a.left >= b.left && a.right <= b.right && a.top >= b.top && a.bottom <= b.bottom;
			};
			const corners = [...document.querySelectorAll('.card .corner')];
			return {
				page: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
				grid: grid.scrollWidth <= grid.clientWidth,
				badges: document.querySelectorAll('.card .badge').length,
				ranks: document.querySelectorAll('.card .rank').length,
				cornersInside: corners.every((c) => inside(c, c.closest('.card')!)),
				small: [...document.querySelectorAll<HTMLElement>('[data-column] a, [data-column] button')]
					.filter((el) => !el.closest('.card') && el.getClientRects().length > 0)
					.map((el) => el.getBoundingClientRect())
					.filter((r) => r.width < 44 || r.height < 44).length
			};
		});
		expect(fits).toEqual({ page: true, grid: true, badges: 4, ranks: 4, cornersInside: true, small: 0 });
	}
});
