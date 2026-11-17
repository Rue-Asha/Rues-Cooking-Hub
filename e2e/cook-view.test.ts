import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const stagePhoto = (page: Page) => page.locator('img.stage-photo');
const actions = (page: Page) => page.getByRole('button', { name: 'More recipe actions' });
const ingredients = (page: Page) => page.getByRole('region', { name: 'Ingredients' });
const method = (page: Page) => page.getByRole('region', { name: 'Method' });
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

const full = {
	title: 'Pumpkin soup',
	description: 'Roasted until sticky.',
	sourceUrl: 'https://www.example.com/pumpkin-soup',
	servings: 4,
	prepMinutes: 10,
	cookMinutes: 20,
	tags: ['Soup', 'Autumn'],
	image: true,
	ingredients: [
		{ title: 'For the soup', lines: ['1 pumpkin', '800 ml vegetable stock'] },
		{ title: 'For the butter', lines: ['60 g butter', '1 bunch sage'] }
	],
	steps: [{ title: null, lines: ['Roast the pumpkin.', 'Blend with the *stock*.', 'Serve hot.'] }],
	notes: 'Freeze half **before** the cream.'
};

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Cook view shows every part on the phone', async ({ page, request }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const { recipes } = await seed(request, { recipes: [full] });
	await open(page, `/recipes/${recipes[0]}`);

	await expect(stagePhoto(page)).toBeVisible();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pumpkin soup');
	await expect(page.getByText('Soup', { exact: true })).toBeVisible();
	await expect(page.getByText('Autumn', { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Add Pumpkin soup to favourites' })).toBeVisible();
	await expect(page.getByText('Prep 10 min · Cook 20 min · 30 min total')).toBeVisible();
	await expect(page.getByRole('group', { name: 'Scale recipe' }).getByLabel('Scale to servings')).toHaveValue('4');
	await expect(ingredients(page).getByRole('listitem')).toHaveCount(4);
	await expect(method(page).getByRole('listitem')).toHaveCount(3);
	await expect(page.getByRole('region', { name: 'Notes' })).toContainText('Freeze half before the cream.');
	await expect(page.getByRole('link', { name: /Source/ })).toHaveAttribute('href', full.sourceUrl);
	await expect(page.getByRole('main').getByRole('button', { name: 'Add to plan' })).toBeVisible();
	await actions(page).click();
	await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
	await expect(page.getByRole('menuitem', { name: 'Delete recipe' })).toBeVisible();

	const before = await page.evaluate(() => {
		const scale = document.querySelector('[role="group"][aria-label="Scale recipe"]')!;
		const steps = document.querySelector('section[aria-labelledby$="-met"]')!;
		return Boolean(scale.compareDocumentPosition(steps) & Node.DOCUMENT_POSITION_FOLLOWING);
	});
	expect(before).toBe(true);
	expect(await noOverflow(page)).toBe(true);
});

test('Scenario: Long ingredient lines wrap in the cook view', async ({ page, request }) => {
	await page.setViewportSize({ width: 320, height: 640 });
	const line = `${'3 spoons of the good flaky sea salt, coarsely crushed, '.repeat(4)}`.slice(0, 200);
	const word = `1 jar ${'x'.repeat(60)}`;
	const { recipes } = await seed(request, { recipes: [{ title: 'Salty', ingredients: [{ title: null, lines: [line, word, line] }] }] });
	await open(page, `/recipes/${recipes[0]}`);

	const box = (await ingredients(page).boundingBox())!;
	const items = ingredients(page).getByRole('listitem');
	await expect(items).toHaveCount(3);
	for (let i = 0; i < 3; i++) {
		const item = items.nth(i);
		const b = (await item.boundingBox())!;
		expect(b.x).toBeGreaterThanOrEqual(box.x - 1);
		expect(b.x + b.width).toBeLessThanOrEqual(box.x + box.width + 1);
		expect(await item.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	}
	expect(await noOverflow(page)).toBe(true);
});

test('Scenario: Scaled fractions and ranges read in the cook view', async ({ page, request }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const { recipes } = await seed(request, {
		recipes: [{ title: 'Garlic salt', servings: 2, ingredients: [{ title: null, lines: ['1/2 tsp salt', '2–3 cloves garlic'] }] }]
	});
	await open(page, `/recipes/${recipes[0]}`);

	await page.getByRole('button', { name: 'Scale up' }).click();

	await expect(ingredients(page).getByRole('listitem')).toHaveText(['0.75 tsp salt', '3–4.5 cloves garlic']);
	await expect(ingredients(page).getByText('for 3')).toBeVisible();
});

test('Scenario: Recipe without image and times in the cook view', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [{ title: 'Plain rice', ingredients: [{ title: null, lines: ['1 cup rice'] }] }] });
	for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
		await page.setViewportSize(size);
		await open(page, `/recipes/${recipes[0]}`);

		await expect(page.getByRole('img', { name: 'No photo yet' })).toBeVisible();
		await expect(page.getByText(/\b(Prep|Cook|total)\b/)).toHaveCount(0);
		await expect(page.getByRole('group', { name: 'Scale recipe' })).toBeVisible();
		await expect(ingredients(page).getByRole('listitem')).toHaveText(['1 cup rice']);
		expect(await noOverflow(page)).toBe(true);
	}
});

test('Scenario: Ingredients and method side by side from 768 px', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [full] });
	await calm(page);
	const tops = async () => ({ ing: (await ingredients(page).boundingBox())!, met: (await method(page).boundingBox())! });

	for (const width of [768, 1280]) {
		await page.setViewportSize({ width, height: width === 768 ? 1024 : 800 });
		await open(page, `/recipes/${recipes[0]}`);
		const { ing, met } = await tops();
		expect(Math.abs(ing.y - met.y)).toBeLessThanOrEqual(8);
		expect(ing.x + ing.width <= met.x + 1 || met.x + met.width <= ing.x + 1).toBe(true);
	}

	await page.setViewportSize({ width: 390, height: 844 });
	await open(page, `/recipes/${recipes[0]}`);
	const { ing, met } = await tops();
	expect(met.y).toBeGreaterThanOrEqual(ing.y + ing.height - 1);
});

test('Scenario: Unknown recipe shows Recipe not found', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const res = await page.goto('/recipes/999999');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

	expect(res?.status()).toBe(404);
	await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
	await expect(page.getByText('Recipe not found').first()).toBeVisible();
	await expect(page.getByText("This recipe doesn't exist, or it was deleted.")).toBeVisible();
	await expect(page.getByRole('link', { name: 'Back to recipes' })).toHaveAttribute('href', '/recipes');
});
