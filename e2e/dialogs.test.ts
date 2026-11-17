import { DatabaseSync } from 'node:sqlite';
import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { open, plus, reset, seed, setToday } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

// everything a dialog could save; equal before and after closing means nothing was saved
function stored(): string {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const tables = ['recipes', 'recipe_tags', 'tags', 'plan_entries', 'shopping_items', 'category_memory', 'spots', 'spot_tag_links'];
	const out = JSON.stringify(tables.map((t) => db.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all()));
	db.close();
	return out;
}

type Dialog = {
	name: string;
	// seeds, opens the page and returns the trigger that was used; the dialog is open afterwards
	show: (page: Page, request: APIRequestContext) => Promise<Locator>;
	// the dialog's own locator once it is open
	dialog: (page: Page) => Locator;
	// the page still shows what the dialog could have changed
	intact: (page: Page) => Promise<void>;
	modal?: 'alertdialog';
};

const TODAY = '2026-10-21';

const dialogs: Dialog[] = [
	{
		name: 'Add to plan',
		async show(page, request) {
			await setToday(request, TODAY);
			const { recipes } = await seed(request, { recipes: [{ title: 'Lasagne', servings: 2 }] });
			await open(page, `/recipes/${recipes[0]}`);
			const trigger = page.getByRole('button', { name: 'Add to plan' });
			await trigger.click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Add to plan' }),
		intact: (page) => expect(page.getByRole('button', { name: 'Add to plan' })).toBeVisible()
	},
	{
		name: 'plan Add dialog',
		async show(page, request) {
			await setToday(request, TODAY);
			await seed(request, { recipes: [{ title: 'Lasagne', servings: 2 }] });
			await open(page, '/plan');
			const trigger = page.getByRole('button', { name: 'Add to Tuesday Dinner' });
			await trigger.click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Add to Tuesday Dinner' }),
		intact: (page) => expect(page.getByRole('button', { name: /^Options for / })).toHaveCount(0)
	},
	{
		name: 'Move to…',
		async show(page, request) {
			await setToday(request, TODAY);
			await seed(request, {
				recipes: [{ title: 'Lasagne', servings: 2 }],
				entries: [{ date: '2026-10-19', slot: 'dinner', recipe: 0, servings: 2 }]
			});
			await open(page, '/plan');
			const trigger = page.getByRole('button', { name: 'Options for Lasagne' }).first();
			await trigger.click();
			await page.getByRole('menuitem', { name: 'Move to…' }).click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Move Lasagne' }),
		intact: (page) => expect(page.getByRole('button', { name: 'Options for Lasagne' }).first()).toBeVisible()
	},
	{
		name: 'Copy week',
		async show(page, request) {
			await setToday(request, TODAY);
			await seed(request, { entries: [{ date: '2026-10-12', slot: 'dinner', text: 'Pizza night' }] });
			await open(page, '/plan');
			const trigger = page.getByRole('button', { name: 'Copy week' });
			await trigger.click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Copy week' }),
		intact: (page) => expect(page.getByRole('button', { name: /^Options for / })).toHaveCount(0)
	},
	{
		name: 'Add from plan',
		async show(page, request) {
			await setToday(request, TODAY);
			await seed(request, {
				recipes: [{ title: 'Lasagne', servings: 2, ingredients: [{ title: null, lines: ['200 g flour'] }] }],
				entries: [{ date: '2026-10-22', slot: 'dinner', recipe: 0, servings: 2 }]
			});
			await open(page, '/list');
			const trigger = page.getByRole('button', { name: 'Add from plan' });
			await trigger.click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Add from plan' }),
		intact: (page) => expect(page.getByRole('checkbox', { name: 'flour', exact: true })).toHaveCount(0)
	},
	{
		name: 'Delete recipe',
		async show(page, request) {
			const { recipes } = await seed(request, { recipes: [{ title: 'Lasagne' }] });
			await open(page, `/recipes/${recipes[0]}`);
			const trigger = page.getByRole('button', { name: 'More recipe actions' });
			await trigger.click();
			await page.getByRole('menuitem', { name: 'Delete recipe' }).click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Delete “Lasagne”?' }),
		intact: (page) => expect(page.getByRole('heading', { name: 'Lasagne' })).toBeVisible()
	},
	{
		name: 'Delete tag',
		async show(page, request) {
			await seed(request, { recipes: [{ title: 'Pea soup', tags: ['Soup'] }] });
			await open(page, '/recipes/tags');
			const trigger = page.getByRole('button', { name: 'Delete Soup' });
			await trigger.click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Delete tag “Soup”?' }),
		intact: (page) => expect(page.getByRole('button', { name: 'Delete Soup' })).toBeVisible()
	},
	{
		name: 'Mark visited',
		async show(page, request) {
			const { spots } = await seed(request, { spots: [{ name: 'Later', city: 'Kiel' }] });
			await open(page, `/eating-out/${spots[0]}`);
			const trigger = page.getByRole('button', { name: 'Mark visited' });
			await trigger.click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Mark visited' }),
		intact: (page) => expect(page.getByRole('button', { name: 'Mark visited' })).toBeVisible()
	},
	{
		name: 'Delete spot',
		async show(page, request) {
			const { spots } = await seed(request, { spots: [{ name: 'Gone soon', city: 'Bonn' }] });
			await open(page, `/eating-out/${spots[0]}`);
			const trigger = page.getByRole('button', { name: 'More spot actions' });
			await trigger.click();
			await page.getByRole('menuitem', { name: 'Delete spot' }).click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Delete “Gone soon”?' }),
		intact: (page) => expect(page.getByRole('button', { name: 'More spot actions' })).toBeVisible()
	},
	{
		name: 'Discard changes?',
		modal: 'alertdialog',
		async show(page) {
			await open(page, '/recipes/new/form');
			await page.getByLabel('Title', { exact: true }).fill('Half written');
			await page.evaluate(() => {
				const a = document.createElement('a');
				a.href = '/plan';
				a.textContent = 'Leave to plan';
				document.body.append(a);
			});
			const trigger = page.getByRole('link', { name: 'Leave to plan' });
			await trigger.focus();
			await trigger.click();
			return trigger;
		},
		dialog: (page) => page.getByRole('alertdialog', { name: 'Discard changes?' }),
		intact: (page) => expect(page).toHaveURL(/\/recipes\/new\/form$/)
	},
	{
		name: 'Move to another category',
		async show(page, request) {
			await seed(request, { items: [{ name: 'milk' }] });
			await open(page, '/list');
			// the Close round seeds a second milk; the first one is the trigger
			const trigger = page.getByRole('button', { name: 'Move milk to another category' }).first();
			await trigger.click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Move milk to' }),
		intact: (page) => expect(page.getByRole('list', { name: 'Other', exact: true }).getByRole('checkbox', { name: 'milk', exact: true }).first()).toBeVisible()
	},
	{
		// the Home "+" lives in the phone posture; the page is fresh for every test, so this resize stays here
		name: 'Add to your kitchen',
		async show(page) {
			if (page.viewportSize()!.width >= 1024) await page.setViewportSize({ width: 390, height: 844 });
			await open(page, '/');
			const trigger = plus(page);
			await trigger.click();
			return trigger;
		},
		dialog: (page) => page.getByRole('dialog', { name: 'Add to your kitchen' }),
		intact: (page) => expect(page).toHaveURL(/\/$/)
	}
];

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test.afterEach(async ({ request }) => {
	await setToday(request, null);
});

const inside = (dialog: Locator) => dialog.evaluate((d) => d.contains(document.activeElement));

test('Scenario: Every dialog traps focus and returns it', async ({ page, request }) => {
	for (const entry of dialogs) {
		await reset(request);
		const trigger = await entry.show(page, request);
		const dialog = entry.dialog(page);
		await expect(dialog, entry.name).toBeVisible();
		expect(await inside(dialog), `${entry.name} takes focus in`).toBe(true);
		for (let i = 0; i < 12; i++) {
			await page.keyboard.press('Tab');
			expect(await inside(dialog), `${entry.name} keeps focus after Tab ${i + 1}`).toBe(true);
		}
		await page.keyboard.press('Escape');
		await expect(dialog, entry.name).toHaveCount(0);
		await expect(trigger, `${entry.name} returns focus`).toBeFocused();
	}
});

test('Scenario: Close control and outside click close every dialog', async ({ page, request }) => {
	// eleven dialogs opened twice, each on a fresh page load: about 20 s on a fast machine, past 30 s on the CI host
	test.setTimeout(90_000);
	for (const entry of dialogs.filter((d) => d.modal !== 'alertdialog')) {
		await reset(request);
		await entry.show(page, request);
		const dialog = entry.dialog(page);
		await expect(dialog, entry.name).toBeVisible();
		let before = stored();
		await dialog.getByRole('button', { name: 'Close', exact: true }).click();
		await expect(dialog, `${entry.name} closes with its control`).toHaveCount(0);
		await entry.intact(page);
		await page.evaluate(() => new Promise((done) => setTimeout(done, 300)));
		expect(stored(), `${entry.name} saved nothing on Close`).toBe(before);

		await entry.show(page, request);
		await expect(dialog, entry.name).toBeVisible();
		before = stored();
		await page.mouse.click(4, 4);
		await expect(dialog, `${entry.name} closes on an outside click`).toHaveCount(0);
		await entry.intact(page);
		await page.evaluate(() => new Promise((done) => setTimeout(done, 300)));
		expect(stored(), `${entry.name} saved nothing on an outside click`).toBe(before);
	}
});

test('Scenario: Dialogs are bottom sheets on the phone and cards from 768 px', async ({ page, request }) => {
	const view = page.viewportSize()!;
	for (const entry of dialogs.filter((d) => ['Delete recipe', 'plan Add dialog'].includes(d.name))) {
		await reset(request);
		await entry.show(page, request);
		const dialog = entry.dialog(page);
		await expect(dialog, entry.name).toBeVisible();
		// the entry animation settles before the box is measured
		await page.waitForTimeout(600);
		const box = (await dialog.boundingBox())!;
		if (view.width < 768) {
			expect(box.y + box.height, `${entry.name} sits on the bottom edge`).toBeCloseTo(view.height, 0);
			expect(box.width, `${entry.name} spans the width`).toBeCloseTo(view.width, 0);
		} else {
			expect(box.x + box.width / 2, `${entry.name} is centred`).toBeCloseTo(view.width / 2, 0);
			expect(box.width, `${entry.name} is narrower than the viewport`).toBeLessThan(view.width - 100);
		}
	}
});

test('Scenario: Status notices are announced without taking focus', async ({ page, request }) => {
	await setToday(request, TODAY);
	await seed(request, {
		recipes: [
			{ title: 'Lasagne', servings: 2, ingredients: [{ title: null, lines: ['200 g flour', '1 onion', 'salt'] }] },
			{ title: 'Roast carrots', tags: ['Side'] },
			{ title: 'Rice pudding', tags: ['Dessert'] }
		],
		entries: [{ date: '2026-10-22', slot: 'dinner', recipe: 0, servings: 4 }]
	});
	// any focus that lands in a notice is recorded, however briefly
	const watchFocus = () =>
		page.evaluate(() => {
			(window as unknown as { tookFocus: boolean }).tookFocus = false;
			document.addEventListener('focusin', (e) => {
				if ((e.target as Element).closest('[role="status"], [role="alert"]')) (window as unknown as { tookFocus: boolean }).tookFocus = true;
			});
		});
	const tookFocus = () => page.evaluate(() => (window as unknown as { tookFocus: boolean }).tookFocus);
	const focused = () =>
		page.evaluate(() => {
			const el = document.activeElement;
			return el ? `${el.tagName}#${el.id}[${el.getAttribute('aria-label') ?? el.getAttribute('name') ?? ''}]` : '';
		});

	await open(page, '/list');
	await watchFocus();
	const opener = page.getByRole('button', { name: 'Add from plan' });
	await opener.click();
	await page.getByRole('dialog', { name: 'Add from plan' }).getByRole('button', { name: 'Add to list' }).click();
	const added = page.getByRole('status').filter({ hasText: 'Added 3 items from the plan' });
	await expect(added).toBeVisible();
	await expect(added.locator(':focus')).toHaveCount(0);
	await expect(added).not.toBeFocused();
	// the dialog hands focus back to where it was before, the notice does not take it
	await expect(opener).toBeFocused();
	expect(await tookFocus()).toBe(false);
	await page.evaluate(() => new Promise((done) => setTimeout(done, 300)));
	await expect(opener).toBeFocused();

	await open(page, '/recipes/tags');
	await watchFocus();
	const list = page.getByRole('list', { name: 'Tags' });
	await list.getByRole('button', { name: 'Rename Side' }).click();
	const field = list.getByRole('textbox', { name: 'New name for Side' });
	await field.fill('Dessert');
	await field.press('Enter');
	const merged = page.getByRole('status').filter({ hasText: 'Merged Side into Dessert' });
	await expect(merged).toBeVisible();
	const after = await focused();
	await expect(merged.locator(':focus')).toHaveCount(0);
	await expect(merged).not.toBeFocused();
	expect(await tookFocus()).toBe(false);
	await page.evaluate(() => new Promise((done) => setTimeout(done, 300)));
	expect(await focused()).toBe(after);
});
