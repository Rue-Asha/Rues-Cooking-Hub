import { expect, test, type Page } from '@playwright/test';
import { open, phoneBar, reset, seed } from './helpers.ts';
import type { Category } from '../src/lib/types.ts';

const toBuy = (page: Page) => page.getByRole('region', { name: 'To buy' });
const noOverflow = (page: Page) =>
	page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

const AISLES: Category[] = ['produce', 'dairy-eggs', 'meat-fish', 'bakery', 'pantry', 'frozen', 'drinks', 'household', 'other'];

test('Scenario: Empty list shows Nothing to buy', async ({ page, request }) => {
	await reset(request);
	await page.setViewportSize({ width: 390, height: 844 });
	await open(page, '/list');

	await expect(toBuy(page).getByRole('heading', { name: 'Nothing to buy' })).toBeVisible();
	await expect(toBuy(page).getByText('Type an item above')).toBeVisible();
	await expect(page.getByRole('region', { name: /^Checked/ }).getByText('Tick things off as you shop; they gather here.')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Clear checked' })).toBeDisabled();
	expect(await noOverflow(page)).toBe(true);
});

test('Scenario: Only checked items', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		items: [
			{ name: 'milk', category: 'dairy-eggs', checked: true },
			{ name: 'bread', category: 'bakery', checked: true },
			{ name: 'apples', category: 'produce', checked: true }
		]
	});
	await page.setViewportSize({ width: 390, height: 844 });
	await open(page, '/list');

	await expect(toBuy(page).getByRole('heading', { name: 'Nothing to buy' })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Checked 3', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Clear checked' })).toBeEnabled();
});

test('Scenario: Eighty items in nine aisles stay usable', async ({ page, request }) => {
	const items = Array.from({ length: 80 }, (_, i) => ({
		name: `item ${String(i + 1).padStart(2, '0')}`,
		category: AISLES[i % 9]
	}));

	for (const [width, height] of [
		[320, 640],
		[1280, 800]
	]) {
		await reset(request);
		await seed(request, { items });
		await page.setViewportSize({ width, height });
		await open(page, '/list');
		const groups = toBuy(page).getByRole('heading', { level: 3 });
		await expect(groups).toHaveCount(9);
		const counts = [9, 9, 9, 9, 9, 9, 9, 9, 8];
		const labels = ['Produce', 'Dairy & Eggs', 'Meat & Fish', 'Bakery', 'Pantry', 'Frozen', 'Drinks', 'Household', 'Other'];
		for (const [i, label] of labels.entries()) {
			await expect(groups.nth(i)).toHaveText(label);
			await expect(toBuy(page).getByRole('list', { name: label, exact: true }).getByRole('listitem')).toHaveCount(counts[i]);
			const aisle = toBuy(page).getByRole('article').filter({ has: page.getByRole('heading', { level: 3, name: label, exact: true }) });
			await expect(aisle.getByText(`${counts[i]} items`, { exact: true })).toBeVisible();
		}
		expect(await noOverflow(page)).toBe(true);

		// item 72 is the last row of the last aisle, Other
		const last = toBuy(page).getByRole('checkbox', { name: 'item 72', exact: true });
		await last.scrollIntoViewIfNeeded();
		const box = (await last.boundingBox())!;
		expect(box.y, `${width} last item in view`).toBeGreaterThanOrEqual(0);
		if (width < 1024) expect(box.y + box.height, `${width} last item above the phone bar`).toBeLessThanOrEqual((await phoneBar(page).boundingBox())!.y);
		else expect(box.y + box.height, `${width} last item in view`).toBeLessThanOrEqual(height);
		await last.click();
		await expect(page.getByRole('region', { name: /^Checked/ }).getByRole('checkbox', { name: 'item 72', exact: true })).toBeVisible();
		expect(await noOverflow(page)).toBe(true);

		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
		const clear = (await page.getByRole('button', { name: 'Clear checked' }).boundingBox())!;
		if (width < 1024) expect(clear.y + clear.height, `${width}`).toBeLessThanOrEqual((await phoneBar(page).boundingBox())!.y);
	}
});

test('Scenario: Long names and amounts wrap', async ({ page, request }) => {
	await reset(request);
	const name = `${Array(8).fill('organic tomato').join(' ')}s`;
	expect(name).toHaveLength(120);
	await seed(request, {
		items: [
			{
				name,
				category: 'produce',
				manualAmounts: [
					{ quantity: 1, unit: 'cup' },
					{ quantity: 200, unit: 'g' },
					{ quantity: 3, unit: 'tbsp' },
					{ quantity: 2, unit: 'pinches' }
				]
			}
		]
	});
	await page.setViewportSize({ width: 320, height: 640 });
	await open(page, '/list');

	const row = toBuy(page).getByRole('listitem').filter({ has: page.getByRole('checkbox', { name, exact: true }) });
	const nameEl = row.getByRole('button', { name: `Edit ${name}` });
	await expect(nameEl).toContainText(name);
	const box = (await row.boundingBox())!;
	for (const part of [nameEl, row.locator('.amount')]) {
		await expect(part).toBeVisible();
		const b = (await part.boundingBox())!;
		expect(b.x).toBeGreaterThanOrEqual(box.x - 1);
		expect(b.x + b.width).toBeLessThanOrEqual(box.x + box.width + 1);
	}
	await expect(row.locator('.amount')).toContainText('3 tbsp');
	expect(await noOverflow(page)).toBe(true);
});

test('Scenario: Item targets are thumb-sized on the phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'coarse pointer');
	await reset(request);
	await seed(request, {
		items: [
			{ name: 'milk', category: 'dairy-eggs' },
			{ name: 'bread', category: 'bakery' }
		]
	});
	await open(page, '/list');

	for (const name of ['milk', 'bread']) {
		for (const control of [
			page.getByRole('checkbox', { name, exact: true }),
			page.getByRole('button', { name: `Edit ${name}`, exact: true }),
			page.getByRole('button', { name: `Move ${name} to another category`, exact: true })
		]) {
			const b = (await control.boundingBox())!;
			expect(b.width, name).toBeGreaterThanOrEqual(44);
			expect(b.height, name).toBeGreaterThanOrEqual(44);
		}
	}
});
