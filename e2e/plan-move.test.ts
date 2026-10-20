import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, setToday } from './helpers.ts';

const MONDAY = '2026-10-19';
const THURSDAY = '2026-10-22';
const FRIDAY = '2026-10-23';

const slot = (page: Page, date: string, id: string) => page.locator(`[data-date="${date}"][data-slot="${id}"]`);
// an entry that is gliding out is hidden from the role tree, so its title is only counted while it is visible
const titles = (page: Page, date: string, id: string) => slot(page, date, id).locator('[data-entry]:not([aria-hidden] *)');

test.beforeEach(async ({ request }) => {
	await reset(request);
	await setToday(request, '2026-10-21');
});

test('Scenario: Move to moves an entry on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the phone path');
	await seed(request, {
		recipes: [{ title: 'Lasagne', servings: 2 }],
		entries: [
			{ date: MONDAY, slot: 'dinner', recipe: 0, servings: 2 },
			{ date: THURSDAY, slot: 'breakfast', text: 'Porridge' }
		]
	});
	await open(page, '/plan');
	const entry = slot(page, MONDAY, 'dinner').locator('[data-entry]');
	await expect(entry).not.toHaveAttribute('draggable', 'true');
	await slot(page, MONDAY, 'dinner').getByRole('button', { name: 'Options for Lasagne' }).click();
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	const sheet = page.getByRole('dialog', { name: 'Move Lasagne' });
	await expect(sheet).toBeVisible();
	await expect(sheet.getByRole('radio', { name: 'Monday' })).toBeChecked();
	await expect(sheet.getByRole('radio', { name: 'Dinner' })).toBeChecked();
	await sheet.getByRole('radio', { name: 'Thursday' }).check();
	await sheet.getByRole('radio', { name: 'Breakfast' }).check();
	await sheet.getByRole('button', { name: 'Move here' }).click();
	await expect(sheet).toBeHidden();
	await expect(titles(page, THURSDAY, 'breakfast')).toHaveCount(2);
	await expect(titles(page, THURSDAY, 'breakfast')).toContainText(['Porridge', 'Lasagne']);
	await expect(titles(page, MONDAY, 'dinner')).toHaveCount(0);

	await page.reload();
	await expect(slot(page, THURSDAY, 'breakfast').locator('[data-entry]')).toContainText(['Porridge', 'Lasagne']);
	await expect(slot(page, MONDAY, 'dinner').locator('[data-entry]')).toHaveCount(0);
});

test('Scenario: Move to is the keyboard alternative on desktop', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'the keyboard path on desktop');
	await seed(request, {
		recipes: [{ title: 'Lasagne', servings: 2 }],
		entries: [{ date: MONDAY, slot: 'dinner', recipe: 0, servings: 2 }]
	});
	await open(page, '/plan');
	await page.getByRole('button', { name: 'Options for Lasagne' }).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('menuitem', { name: 'Change servings' })).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: 'Move to…' })).toBeFocused();
	await page.keyboard.press('Enter');

	const sheet = page.getByRole('dialog', { name: 'Move Lasagne' });
	await expect(sheet.getByRole('radio', { name: 'Monday' })).toBeFocused();
	for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
	await expect(sheet.getByRole('radio', { name: 'Friday' })).toBeChecked();
	await page.keyboard.press('Tab');
	await expect(sheet.getByRole('radio', { name: 'Dinner' })).toBeFocused();
	await page.keyboard.press('ArrowRight');
	await expect(sheet.getByRole('radio', { name: 'Snacks' })).toBeChecked();
	await page.keyboard.press('Enter');

	await expect(sheet).toBeHidden();
	await expect(titles(page, FRIDAY, 'snacks')).toContainText(['Lasagne']);
	await expect(titles(page, MONDAY, 'dinner')).toHaveCount(0);
	await expect(slot(page, FRIDAY, 'snacks').getByRole('button', { name: 'Options for Lasagne' })).toBeFocused();
	await page.reload();
	await expect(slot(page, FRIDAY, 'snacks').locator('[data-entry]')).toContainText(['Lasagne']);
});

test.describe('drag & drop', () => {
	const SATURDAY = '2026-10-24';
	const SUNDAY = '2026-10-25';

	test.beforeEach(({}, info) => {
		test.skip(info.project.name !== 'desktop', 'drag & drop is desktop-only');
	});

	test('Scenario: Drag a recipe from the rail onto a slot', async ({ page, request }) => {
		await seed(request, { recipes: [{ title: 'Pancakes', servings: 4 }, { title: 'Lasagne', servings: 6 }] });
		await open(page, '/plan');
		await page.locator('[data-recipe]', { hasText: 'Lasagne' }).dragTo(slot(page, THURSDAY, 'lunch'));
		await expect(titles(page, THURSDAY, 'lunch')).toContainText(['Lasagne']);
		await expect(slot(page, THURSDAY, 'lunch').getByText('6 servings')).toBeAttached();
		await expect(page.locator('[data-drop-target]')).toHaveCount(0);
		await page.reload();
		await expect(slot(page, THURSDAY, 'lunch').locator('[data-entry]')).toContainText(['Lasagne']);
		await expect(slot(page, THURSDAY, 'lunch').getByText('6 servings')).toBeAttached();
	});

	test('A rail recipe dropped on an entry lands before it', async ({ page, request }) => {
		await seed(request, {
			recipes: [{ title: 'Lasagne', servings: 6 }],
			entries: [{ date: THURSDAY, slot: 'lunch', text: 'Soup' }]
		});
		await open(page, '/plan');
		await page.locator('[data-recipe]', { hasText: 'Lasagne' }).dragTo(titles(page, THURSDAY, 'lunch').first());
		await expect(titles(page, THURSDAY, 'lunch')).toHaveCount(2);
		await expect(titles(page, THURSDAY, 'lunch')).toContainText(['Lasagne', 'Soup']);
		await page.reload();
		await expect(slot(page, THURSDAY, 'lunch').locator('[data-entry]')).toContainText(['Lasagne', 'Soup']);
	});

	test('Scenario: Drag an entry to another day', async ({ page, request }) => {
		await seed(request, {
			recipes: [{ title: 'Lasagne', servings: 2 }],
			entries: [{ date: MONDAY, slot: 'dinner', recipe: 0, servings: 2 }]
		});
		await open(page, '/plan');
		await titles(page, MONDAY, 'dinner').first().dragTo(slot(page, SATURDAY, 'lunch'));
		await expect(titles(page, SATURDAY, 'lunch')).toContainText(['Lasagne']);
		await expect(titles(page, MONDAY, 'dinner')).toHaveCount(0);
		await page.reload();
		await expect(slot(page, SATURDAY, 'lunch').locator('[data-entry]')).toContainText(['Lasagne']);
		await expect(slot(page, MONDAY, 'dinner').locator('[data-entry]')).toHaveCount(0);
	});

	test('Scenario: Reorder entries within a slot', async ({ page, request }) => {
		await seed(request, {
			recipes: [{ title: 'Lasagne', servings: 2 }],
			entries: [
				{ date: MONDAY, slot: 'dinner', recipe: 0, servings: 2 },
				{ date: MONDAY, slot: 'dinner', text: 'Salad' }
			]
		});
		await open(page, '/plan');
		const dinner = titles(page, MONDAY, 'dinner');
		await dinner.nth(1).dragTo(dinner.nth(0));
		await expect(dinner).toContainText(['Salad', 'Lasagne']);
		await page.reload();
		await expect(slot(page, MONDAY, 'dinner').locator('[data-entry]')).toContainText(['Salad', 'Lasagne']);
	});

	test('Scenario: Drop target is highlighted', async ({ page, request }) => {
		await seed(request, { entries: [{ date: MONDAY, slot: 'dinner', text: 'Salad' }] });
		await open(page, '/plan');
		const from = (await titles(page, MONDAY, 'dinner').first().boundingBox())!;
		const to = (await slot(page, SUNDAY, 'breakfast').boundingBox())!;
		await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
		await page.mouse.down();
		await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 10 });
		// Playwright's intercepted drag reports each dragover on the next move, so the pointer hovers a little
		await page.mouse.move(to.x + to.width / 2 + 2, to.y + to.height / 2 + 2);
		await expect(page.locator('[data-drop-target]')).toHaveCount(1);
		await expect(slot(page, SUNDAY, 'breakfast')).toHaveAttribute('data-drop-target');
		await page.mouse.up();
		await expect(page.locator('[data-drop-target]')).toHaveCount(0);
	});

	test('Scenario: Drop outside a slot changes nothing', async ({ page, request }) => {
		await seed(request, {
			entries: [
				{ date: MONDAY, slot: 'dinner', text: 'Soup' },
				{ date: MONDAY, slot: 'dinner', text: 'Salad' }
			]
		});
		await open(page, '/plan');
		await titles(page, MONDAY, 'dinner').first().dragTo(page.locator('[data-page-header]'));
		await expect(page.locator('[data-drop-target]')).toHaveCount(0);
		await expect(page.locator('[data-dragging]')).toHaveCount(0);
		await expect(titles(page, MONDAY, 'dinner')).toContainText(['Soup', 'Salad']);
		await page.reload();
		await expect(page.locator('[data-entry]')).toHaveCount(2);
		await expect(slot(page, MONDAY, 'dinner').locator('[data-entry]')).toContainText(['Soup', 'Salad']);
	});
});
