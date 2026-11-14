import { expect, test, type Locator } from '@playwright/test';
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
	await expect(card.getByRole('presentation')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(card.getByRole('link', { name: 'Kuro Ramen' })).toHaveAttribute('href', `/eating-out/${spots[0]}`);
	await expect(card.getByText(/^(Brunch|Coffee|Vegan)$/)).toHaveText(['Brunch', 'Coffee']);
	await expect(card.getByText('Mitte, Berlin')).toBeVisible();
	await expect(card.getByText('€€', { exact: true })).toBeVisible();
	await expect(card.getByText(/^\d+\.\d\d$/)).toHaveText('8.75');
});

test('Scenario: Sparse card shows no empty parts', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [{ name: 'Bare Bones' }] });
	await open(page, '/eating-out');

	const card = page.getByRole('article');
	await expect(card.getByRole('img', { name: 'No photo yet' })).toBeVisible();
	await expect(card.getByRole('heading', { name: 'Bare Bones' })).toBeVisible();
	await expect(card).toHaveText(/^\s*No photo yet\s*Bare Bones\s*$/);
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

		const cards = page.getByRole('article');
		const corner = (scope: Locator) => scope.getByText(/^(#\d+|\d+\.\d\d)$/);
		const cornersInside: boolean[] = [];
		for (const card of await cards.all()) {
			const outer = (await card.boundingBox())!;
			for (const c of await corner(card).all()) {
				const a = (await c.boundingBox())!;
				cornersInside.push(a.x >= outer.x && a.x + a.width <= outer.x + outer.width && a.y >= outer.y && a.y + a.height <= outer.y + outer.height);
			}
		}
		const fits = {
			page: await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
			grid: await page.getByRole('list', { name: 'Spots' }).evaluate((grid) => grid.scrollWidth <= grid.clientWidth),
			badges: await cards.getByText(/^\d+\.\d\d$/).count(),
			ranks: await cards.getByText(/^#\d+$/).count(),
			cornersInside: cornersInside.every(Boolean),
			small: await page
				.getByRole('main')
				.getByRole('link')
				.or(page.getByRole('main').getByRole('button'))
				.evaluateAll(
					(els) =>
						els
							.filter((el) => !el.closest('article'))
							.map((el) => el.getBoundingClientRect())
							.filter((r) => r.width < 44 || r.height < 44).length
				)
		};
		expect(fits).toEqual({ page: true, grid: true, badges: 4, ranks: 4, cornersInside: true, small: 0 });
	}
});
