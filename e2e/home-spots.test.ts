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

	const recent = page.getByRole('region', { name: 'Recently added' });
	const top = page.getByRole('region', { name: 'Top spots' });
	await expect(top).toBeVisible();
	const [a, b] = await Promise.all([recent.boundingBox(), top.boundingBox()]);
	// follows: Top spots starts below the bottom edge of Recently added
	expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height - 1);

	const section = page.getByRole('region', { name: 'Top spots' });
	const cards = section.getByRole('article');
	await expect(cards.getByRole('heading')).toHaveText(['First', 'Second', 'Third']);
	await expect(cards.getByText(/^\d+\.\d\d$/)).toHaveText(['9.50', '8.75', '8.50']);
	await expect(cards.getByText(/^#\d+$/)).toHaveCount(0);
	await expect(section.getByRole('link', { name: /All spots/ })).toHaveAttribute('href', '/eating-out');
	for (const [i, [name, id]] of ([['First', spots[1]], ['Second', spots[3]], ['Third', spots[4]]] as const).entries())
		await expect(cards.nth(i).getByRole('link', { name })).toHaveAttribute('href', `/eating-out/${id}`);
});

test('Scenario: Fewer than three visited spots shows what exists', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [visited('Alpha', 800), visited('Beta', 900), { name: 'Gamma' }] });
	await open(page, '/');

	const section = page.getByRole('region', { name: 'Top spots' });
	await expect(section.getByRole('article').getByRole('heading')).toHaveText(['Beta', 'Alpha']);
});

test('Scenario: No visited spot hides Top spots', async ({ page, request }) => {
	await reset(request);
	await seed(request, { spots: [{ name: 'Gamma' }, { name: 'Delta' }] });
	await open(page, '/');

	await expect(page.getByRole('heading', { name: 'Top spots' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: /Gamma|Delta/ })).toHaveCount(0);
});

test('Scenario: Top spots lay out in two columns on phone and three on desktop', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		recipes: [{ title: 'Lasagne' }],
		spots: [visited('One', 900), visited('Two', 880), visited('Three', 860)]
	});
	await open(page, '/');

	const section = page.getByRole('region', { name: 'Top spots' });
	const boxes = await section.getByRole('article').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => [Math.round(r.x), Math.round(r.y)]));
	const xs = new Set(boxes.map(([x]) => x));
	const ys = new Set(boxes.map(([, y]) => y));
	if (info.project.name === 'phone') {
		expect([xs.size, ys.size]).toEqual([2, 2]);
	} else {
		expect([xs.size, ys.size]).toEqual([3, 1]);
	}
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
	expect(overflow).toBe(false);
});
