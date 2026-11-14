import { expect, test, type Page } from '@playwright/test';
import { open, reset, setToday } from './helpers.ts';

const WEDNESDAY = '2026-10-21';
const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const slots = [
	{ id: 'breakfast', label: 'Breakfast' },
	{ id: 'lunch', label: 'Lunch' },
	{ id: 'dinner', label: 'Dinner' },
	{ id: 'snacks', label: 'Snacks' }
];

test.beforeEach(async ({ request }) => {
	await reset(request);
	await setToday(request, WEDNESDAY);
});

const dayRegions = (page: Page) => page.getByRole('region', { name: new RegExp(`^(${names.join('|')})$`) });

test('Scenario: Week shows Monday to Sunday with four slots', async ({ page }) => {
	await open(page, '/plan');
	await expect(dayRegions(page)).toHaveCount(7);
	for (const [i, name] of names.entries()) {
		const day = dayRegions(page).nth(i);
		await expect(day.getByRole('heading', { level: 2, name })).toBeVisible();
		await expect(day.getByRole('group', { name: new RegExp(`^${name} (${slots.map((s) => s.label).join('|')})$`) })).toHaveCount(slots.length);
		for (const [n, slot] of slots.entries()) {
			await expect(day.getByRole('group', { name: `${name} ${slot.label}`, exact: true })).toBeVisible();
			await expect(day.getByRole('group', { name: new RegExp(`^${name} (${slots.map((s) => s.label).join('|')})$`) }).nth(n)).toHaveAccessibleName(`${name} ${slot.label}`);
		}
	}
	await expect(page.getByText('19 – 25 October')).toBeVisible();
});

test('Scenario: Today is highlighted', async ({ page }) => {
	await open(page, '/plan');
	const today = page.getByRole('region').and(page.locator('[aria-current="date"]'));
	await expect(today).toHaveCount(1);
	await expect(today).toHaveAccessibleName('Wednesday');
	await open(page, '/plan?week=2026-10-26');
	await expect(dayRegions(page)).toHaveCount(7);
	await expect(today).toHaveCount(0);
});

test('the today ring wraps the slots card on phone and is not drawn on desktop', async ({ page }, info) => {
	await open(page, '/plan');
	const today = page.getByRole('region', { name: 'Wednesday' });
	const ring = await today.getByRole('group', { name: 'Wednesday meals' }).evaluate((el) => getComputedStyle(el, '::after').content);
	expect(ring).toBe(info.project.name === 'phone' ? '""' : 'none');
});

test('Scenario: Previous, next and This week', async ({ page }) => {
	await open(page, '/plan');
	const week = async (monday: string, range: string) => {
		await expect(page).toHaveURL(new RegExp(`[?&]week=${monday}$`));
		await expect(page.getByText(range)).toBeVisible();
		await expect(dayRegions(page).first()).toHaveAccessibleName('Monday');
		await expect(dayRegions(page).last()).toHaveAccessibleName('Sunday');
	};
	await page.getByRole('link', { name: 'Next week' }).click();
	await week('2026-10-26', '26 October – 1 November');
	await page.getByRole('link', { name: 'Previous week' }).click();
	await week('2026-10-19', '19 – 25 October');
	await page.getByRole('link', { name: 'Previous week' }).click();
	await week('2026-10-12', '12 – 18 October');
	await page.getByRole('link', { name: 'This week' }).click();
	await week('2026-10-19', '19 – 25 October');
});

test('Scenario: Empty week shows add affordances', async ({ page }) => {
	await open(page, '/plan?week=2026-12-07');
	const adds = page.getByRole('button', { name: /^Add to / });
	await expect(adds).toHaveCount(28);
	for (const add of await adds.all()) await expect(add).toBeVisible();
	await expect(page.getByRole('button', { name: 'Add to Thursday Dinner' })).toBeVisible();
});

test('Scenario: Phone stacks the days and desktop shows the grid', async ({ page }, info) => {
	await open(page, '/plan');
	const boxes = [];
	for (const name of names) boxes.push((await page.getByRole('region', { name, exact: true }).boundingBox())!);
	const width = page.viewportSize()!.width;
	if (info.project.name === 'phone') {
		for (const [i, box] of boxes.entries()) {
			expect(box.x + box.width, names[i]).toBeLessThanOrEqual(width);
			if (i > 0) expect(box.y, names[i]).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height - 1);
		}
	} else {
		const rail = (await page.getByRole('complementary', { name: 'Recipes' }).boundingBox())!;
		for (const [i, box] of boxes.entries()) {
			expect(Math.abs(box.y - boxes[0].y), names[i]).toBeLessThanOrEqual(1);
			expect(box.x + box.width, names[i]).toBeLessThanOrEqual(width);
			expect(box.x, names[i]).toBeGreaterThanOrEqual(rail.x + rail.width);
			if (i > 0) expect(box.x, names[i]).toBeGreaterThan(boxes[i - 1].x);
		}
		expect(boxes[0].y).toBeLessThan(page.viewportSize()!.height);
	}
});
