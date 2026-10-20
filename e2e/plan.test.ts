import { expect, test, type Page } from '@playwright/test';
import { open, reset, setToday } from './helpers.ts';

const WEDNESDAY = '2026-10-21';
const days = ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25'];
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

const shownDays = (page: Page) => page.locator('[data-day]').evaluateAll((els) => els.map((e) => e.getAttribute('data-day')));

test('Scenario: Week shows Monday to Sunday with four slots', async ({ page }) => {
	await open(page, '/plan');
	expect(await shownDays(page)).toEqual(days);
	for (const [i, date] of days.entries()) {
		const day = page.locator(`[data-day="${date}"]`);
		await expect(day.getByRole('heading', { level: 2, name: names[i] })).toBeVisible();
		expect(await day.locator('[data-slot]').evaluateAll((els) => els.map((e) => e.getAttribute('data-slot')))).toEqual(
			slots.map((s) => s.id)
		);
		for (const slot of slots) await expect(day.getByRole('group', { name: `${names[i]} ${slot.label}` })).toBeVisible();
	}
	await expect(page.getByText('19 – 25 October')).toBeVisible();
});

test('Scenario: Today is highlighted', async ({ page }) => {
	await open(page, '/plan');
	await expect(page.locator('[data-today]')).toHaveCount(1);
	await expect(page.locator('[data-today]')).toHaveAttribute('data-day', WEDNESDAY);
	await open(page, '/plan?week=2026-10-26');
	await expect(page.locator('[data-day]')).toHaveCount(7);
	await expect(page.locator('[data-today]')).toHaveCount(0);
});

test('the today ring wraps the slots card on phone and is not drawn on desktop', async ({ page }, info) => {
	await open(page, '/plan');
	const ring = await page.locator('[data-today] .slots').evaluate((el) => getComputedStyle(el, '::after').content);
	expect(ring).toBe(info.project.name === 'phone' ? '""' : 'none');
});

test('Scenario: Previous, next and This week', async ({ page }) => {
	await open(page, '/plan');
	const week = async (monday: string) => {
		await expect(page).toHaveURL(new RegExp(`[?&]week=${monday}$`));
		await expect(page.locator('[data-day]').first()).toHaveAttribute('data-day', monday);
		await expect(page.locator('[data-day]').last()).toHaveAttribute('data-day', new Date(Date.parse(monday) + 6 * 864e5).toISOString().slice(0, 10));
	};
	await page.getByRole('link', { name: 'Next week' }).click();
	await week('2026-10-26');
	await page.getByRole('link', { name: 'Previous week' }).click();
	await week('2026-10-19');
	await page.getByRole('link', { name: 'Previous week' }).click();
	await week('2026-10-12');
	await page.getByRole('link', { name: 'This week' }).click();
	await week('2026-10-19');
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
	for (const date of days) boxes.push((await page.locator(`[data-day="${date}"]`).boundingBox())!);
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
