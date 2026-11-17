import { expect, test, type Page } from '@playwright/test';
import { entries, expectNoEntries, open, openNav, reset, seed, setToday, slot } from './helpers.ts';

const WEDNESDAY = '2026-10-21';
const FRIDAY = '2026-10-23';

test.beforeEach(async ({ request }) => {
	await reset(request);
	await setToday(request, WEDNESDAY);
});

const picker = (page: Page) => page.getByRole('complementary', { name: 'Recipes' });
const noScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe('at 1280 x 800', () => {
	test.use({ viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false });

	test('Scenario: Empty week offers an add control in every slot', async ({ page }) => {
		await open(page, '/plan?week=2026-12-07');
		const adds = page.getByRole('main').getByRole('button', { name: /^Add to (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) (Breakfast|Lunch|Dinner|Snacks)$/ });
		await expect(adds).toHaveCount(28);
		for (const add of await adds.all()) await expect(add).toBeVisible();
		await expect(picker(page)).toBeVisible();
	});

	test('Scenario: Picker shows the plate and No times for a bare recipe', async ({ page, request }) => {
		await seed(request, { recipes: [{ title: 'Weeknight dal' }, { title: 'Village salad', prepMinutes: 10 }] });
		await open(page, '/plan');
		const dal = picker(page).getByRole('listitem').filter({ hasText: 'Weeknight dal' });
		await expect(dal.locator(':scope > [aria-hidden="true"]')).toHaveText('W');
		await expect(dal).toContainText('No times');
		const salad = picker(page).getByRole('listitem').filter({ hasText: 'Village salad' });
		await expect(salad).toContainText('10 min');
		await expect(salad).not.toContainText('No times');
	});

	test('Empty week note stays out of a mouse desktop', async ({ page }) => {
		await open(page, '/plan?week=2026-12-07');
		await expect(page.getByText('Nothing planned yet — tap + to add a meal')).toBeHidden();
	});

	test('Scenario: Entry of a deleted recipe reads as text', async ({ page, request, baseURL }) => {
		const { recipes } = await seed(request, {
			recipes: [{ title: 'Lasagne' }],
			entries: [{ date: WEDNESDAY, slot: 'dinner', recipe: 0, servings: 2 }]
		});
		const gone = await request.post(`/recipes/${recipes[0]}?/delete`, { form: {}, headers: { origin: baseURL!, 'x-sveltekit-action': 'true' } });
		expect(gone.ok()).toBe(true);
		await open(page, '/plan');
		const entry = entries(page, WEDNESDAY, 'dinner');
		await expect(entry).toHaveCount(1);
		await expect(entry).toContainText('Lasagne');
		await expect(entry.getByText('servings')).toHaveCount(0);
		await entry.getByRole('button', { name: 'Options for Lasagne' }).click();
		await expect(page.getByRole('menuitem', { name: 'Edit text' })).toBeVisible();
	});

	test('Scenario: Every drag has a Move to alternative on the desktop', async ({ page, request }) => {
		await seed(request, { recipes: [{ title: 'Lasagne' }], entries: [{ date: WEDNESDAY, slot: 'dinner', recipe: 0, servings: 2 }] });
		await open(page, '/plan');
		await page.getByRole('button', { name: 'Options for Lasagne' }).focus();
		await page.keyboard.press('Enter');
		await page.getByRole('menuitem', { name: 'Move to…' }).press('Enter');
		const sheet = page.getByRole('dialog', { name: 'Move Lasagne' });
		await sheet.getByRole('radio', { name: 'Friday' }).check();
		await sheet.getByRole('radio', { name: 'Lunch' }).check();
		await sheet.getByRole('button', { name: 'Move here' }).click();
		await expect(sheet).toBeHidden();
		await page.reload();
		await expect(entries(page, FRIDAY, 'lunch')).toContainText('Lasagne');
		await expectNoEntries(page, WEDNESDAY, 'dinner');
	});
});

for (const viewport of [
	{ width: 1280, height: 800 },
	{ width: 1024, height: 768 }
]) {
	test.describe(`at ${viewport.width} x ${viewport.height}`, () => {
		test.use({ viewport, hasTouch: false, isMobile: false });

		test('Scenario: Slot with five entries stays readable', async ({ page, request }) => {
			const long = (n: number) => `Recipe ${n} ${'long title '.repeat(11)}`.slice(0, 120);
			await seed(request, {
				recipes: [1, 2, 3, 4, 5].map((n) => ({ title: long(n) })),
				entries: [
					...[0, 1, 2, 3, 4].map((recipe) => ({ date: WEDNESDAY, slot: 'dinner' as const, recipe })),
					{ date: WEDNESDAY, slot: 'dinner' as const, text: 'x'.repeat(200) }
				]
			});
			await open(page, '/plan');
			const day = page.getByRole('region', { name: 'Wednesday', exact: true });
			const rows = entries(page, WEDNESDAY, 'dinner');
			await expect(rows).toHaveCount(6);
			const dayBox = (await day.boundingBox())!;
			for (const row of await rows.all()) {
				await expect(row).toBeVisible();
				const box = (await row.boundingBox())!;
				expect(box.x).toBeGreaterThanOrEqual(dayBox.x - 1);
				expect(box.x + box.width).toBeLessThanOrEqual(dayBox.x + dayBox.width + 1);
				await expect(row.getByRole('button', { name: /^Options for / })).toBeVisible();
			}
			expect(await noScroll(page)).toBe(true);
			await expect(slot(page, WEDNESDAY, 'dinner')).toBeVisible();
		});
	});
}

test.describe('on touch at 1280 x 800', () => {
	test.use({ viewport: { width: 1280, height: 800 }, hasTouch: true, isMobile: true });

	test('Scenario: Picker is hidden on touch at desktop width', async ({ page }) => {
		await open(page, '/plan?week=2026-12-07');
		await expect(picker(page)).toBeHidden();
		const adds = page.getByRole('main').getByRole('button', { name: /^Add to (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) / });
		await expect(adds).toHaveCount(28);
		await expect(adds.first()).toBeVisible();
	});
});

test('Leaving the plan renders the next page', async ({ page, request }) => {
	await seed(request, { recipes: [{ title: 'Lasagne' }], entries: [{ date: WEDNESDAY, slot: 'dinner', recipe: 0 }] });
	await open(page, '/plan');
	await page.getByRole('button', { name: 'Add to Friday Dinner' }).click();
	await expect(page.getByRole('dialog', { name: 'Add to Friday Dinner' })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	for (const [name, heading] of [
		['Recipes', /^Recipes worth keeping$/],
		['Plan', /^This week$/],
		['List', /./],
		['Home', /./]
	] as const) {
		await openNav(page, name);
		await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(heading);
	}
	await expect(page.getByRole('main').getByRole('region', { name: 'Wednesday' })).toHaveCount(0);
});
