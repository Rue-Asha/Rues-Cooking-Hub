import { expect, test, type Locator, type Page } from '@playwright/test';
import { mainNav, open, reset, seed } from './helpers.ts';

const cursor = (locator: Locator) => locator.first().evaluate((el) => getComputedStyle(el).cursor);
const select = (locator: Locator) => locator.first().evaluate((el) => getComputedStyle(el).userSelect);
const chrome = ['default', 'pointer'];

async function seedKitchen(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, {
		recipes: [
			{
				title: 'Red lentil soup',
				tags: ['Soup'],
				cookMinutes: 30,
				ingredients: [{ title: null, lines: ['300 g red lentils', '1 onion'] }],
				steps: [{ title: null, lines: ['Simmer the lentils until soft.'] }],
				notes: 'Freezes well.'
			}
		],
		items: [{ name: 'lemons', manualAmounts: [{ quantity: 2, unit: null }], category: 'produce' }]
	});
}

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'cursors are a pointer-device concern');
});

test('Scenario: Chrome and reading text show the default cursor', async ({ page, request }) => {
	const { recipes } = await seedKitchen(request);

	await open(page, '/');
	const main = page.getByRole('main');
	for (const [name, el] of [
		['kicker', main.locator('ul.kicker li')],
		['heading', main.getByRole('heading', { level: 1 })],
		['card heading', main.getByRole('heading', { level: 2 })],
		['nav link', mainNav(page).getByRole('link', { name: 'Recipes', exact: true })]
	] as const) {
		expect(chrome, `home ${name}`).toContain(await cursor(el));
	}

	await open(page, `/recipes/${recipes[0]}`);
	expect(chrome, 'ingredient').toContain(await cursor(page.getByText('300 g red lentils')));
	expect(chrome, 'method step').toContain(await cursor(page.getByText('Simmer the lentils until soft.')));
	expect(chrome, 'servings label').toContain(await cursor(page.getByRole('group', { name: 'Scale recipe' })));
	await page.getByRole('button', { name: 'More recipe actions' }).click();
	expect(await cursor(page.getByRole('menuitem', { name: 'Edit' }))).toBe('pointer');
});

test('Scenario: Fields keep the text cursor', async ({ page, request }) => {
	await seedKitchen(request);

	await open(page, '/list');
	expect(await cursor(page.locator('#add-item'))).toBe('text');
	await open(page, '/recipes/new/form');
	expect(await cursor(page.getByRole('textbox', { name: /Title/ }))).toBe('text');
	expect(await cursor(page.locator('textarea').first())).toBe('text');
});

const selected = (page: Page) => page.evaluate(() => getSelection()?.toString() ?? '');

test('Scenario: Only fields and the user\'s own writing are selectable', async ({ page, request }) => {
	const { recipes } = await seedKitchen(request);

	await open(page, `/recipes/${recipes[0]}`);
	const main = page.getByRole('main');
	for (const [name, el] of [
		['menu button', page.getByRole('button', { name: 'More recipe actions' })],
		['nav link', mainNav(page).getByRole('link', { name: 'Plan', exact: true })],
		['heading', main.getByRole('heading', { level: 1 })],
		['card heading', main.getByRole('heading', { name: 'Ingredients' })],
		['servings label', main.getByText('Scale to servings')],
		['facts card', main.getByRole('complementary', { name: 'At a glance' })]
	] as const) {
		expect(await select(el), name).toBe('none');
	}
	for (const [name, el] of [
		['ingredient', page.getByText('300 g red lentils')],
		['method step', page.getByText('Simmer the lentils until soft.')],
		['notes', page.getByText('Freezes well.')]
	] as const) {
		expect(await select(el), name).not.toBe('none');
	}

	// on the first word: the step's box runs past the end of its text
	await main.getByRole('heading', { level: 1 }).dblclick({ position: { x: 12, y: 12 } });
	expect(await selected(page), 'heading').toBe('');
	await page.getByText('Simmer the lentils until soft.').dblclick({ position: { x: 12, y: 8 } });
	expect((await selected(page)).trim()).toBe('Simmer');

	await page.getByRole('button', { name: 'More recipe actions' }).click();
	expect(await select(page.getByRole('menuitem', { name: 'Edit' }))).toBe('none');

	await open(page, '/');
	expect(await select(page.getByRole('main').getByText('30 min', { exact: true })), 'card time').toBe('none');
	expect(await select(page.getByRole('link', { name: /^All 1 recipe/ })), 'All recipes link').toBe('none');

	await open(page, '/list');
	expect(await select(page.locator('#add-item'))).not.toBe('none');
});
