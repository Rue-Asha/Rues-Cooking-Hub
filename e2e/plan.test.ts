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
	await expect(page.getByRole('main').getByText('19 – 25 October').first()).toBeVisible();
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

test('the today row is the charcoal one', async ({ page }) => {
	await open(page, '/plan');
	await expect(page.getByRole('region', { name: 'Wednesday' })).toHaveAttribute('data-surface', 'inverse');
	await expect(page.getByRole('region', { name: 'Tuesday' })).not.toHaveAttribute('data-surface', 'inverse');
});

test('Scenario: Previous, next and This week', async ({ page }) => {
	await open(page, '/plan');
	const week = async (monday: string, range: string) => {
		await expect(page).toHaveURL(new RegExp(`[?&]week=${monday}$`));
		await expect(page.getByRole('main').getByText(range).first()).toBeVisible();
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
	const adds = page.getByRole('main').getByRole('button', { name: /^Add to / });
	await expect(adds).toHaveCount(28);
	for (const add of await adds.all()) await expect(add).toBeVisible();
	await expect(page.getByRole('button', { name: 'Add to Thursday Dinner' })).toBeVisible();
});

test('Scenario: Phone stacks the days and desktop shows the grid', async ({ page }, info) => {
	await open(page, '/plan');
	const boxes = await page.evaluate((labels) => labels.map((label) => {
		const day = [...document.querySelectorAll('section[aria-labelledby]')].find((el) => document.getElementById(el.getAttribute('aria-labelledby')!)?.querySelector('.sr-only')?.textContent?.trim() === label)!;
		const r = day.getBoundingClientRect();
		return { x: r.x, y: r.y, width: r.width, height: r.height };
	}), names);
	const width = page.viewportSize()!.width;
	for (const [i, box] of boxes.entries()) {
		expect(Math.abs(box.x - boxes[0].x), names[i]).toBeLessThanOrEqual(1);
		expect(box.x + box.width, names[i]).toBeLessThanOrEqual(width);
		if (i > 0) expect(box.y, names[i]).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height - 1);
	}
	if (info.project.name === 'desktop') {
		const rail = (await page.getByRole('complementary', { name: 'Recipes' }).boundingBox())!;
		for (const [i, box] of boxes.entries()) expect(box.x + box.width, names[i]).toBeLessThanOrEqual(rail.x + 1);
		expect(boxes[0].y, 'the first day starts inside the viewport').toBeGreaterThanOrEqual(0);
		expect(boxes[0].y, 'the first day starts inside the viewport').toBeLessThan(page.viewportSize()!.height);
		const slots = await page.getByRole('region', { name: 'Monday', exact: true }).getByRole('group', { name: /^Monday (Breakfast|Lunch|Dinner|Snacks)$/ }).all();
		const cells = await Promise.all(slots.map((s) => s.boundingBox()));
		for (const [i, cell] of cells.entries()) {
			expect(Math.abs(cell!.y - cells[0]!.y), `slot ${i}`).toBeLessThanOrEqual(1);
			if (i > 0) expect(cell!.x).toBeGreaterThan(cells[i - 1]!.x);
		}
	}
});
