import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';


const header = (page: Page) => page.getByRole('banner');
const actions = header;

// brand, five nav links and the two actions: a third action would add a link or a button
const pinActions = async (page: Page) => {
	await expect(header(page).getByRole('link')).toHaveCount(8);
	await expect(header(page).getByRole('button')).toHaveCount(0);
};

test('Scenario: Eating Out header shows spot actions', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop header');
	await open(page, '/eating-out');
	await expect(actions(page).getByRole('link', { name: 'Search spots' })).toHaveAttribute('href', '/eating-out#search');
	await expect(actions(page).getByRole('link', { name: 'Add spot' })).toHaveAttribute('href', '/eating-out/new');
	await expect(actions(page).getByRole('link', { name: /^(Search|Add) .*recipe/i })).toHaveCount(0);
	await pinActions(page);

	await open(page, '/plan');
	await expect(actions(page).getByRole('link', { name: 'Search recipes' })).toHaveAttribute('href', '/recipes');
	await expect(actions(page).getByRole('link', { name: 'Add recipe' })).toHaveAttribute('href', '/recipes/new');
	await expect(actions(page).getByRole('link', { name: /^(Search|Add) .*spot/i })).toHaveCount(0);
	await pinActions(page);
});

test('Scenario: Header follows client-side navigation', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop header');
	await open(page, '/recipes');
	await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
	await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Eating Out' }).click();
	await expect(page).toHaveURL('/eating-out');
	await expect(actions(page).getByRole('link', { name: 'Search spots' })).toBeVisible();
	await expect(actions(page).getByRole('link', { name: 'Add spot' })).toBeVisible();
	expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
});

test.describe('phone', () => {
	test.beforeEach(({}, info) => test.skip(info.project.name !== 'phone', 'phone layout'));

	const strip = (page: Page) => page.getByRole('banner');

	test('Scenario: Recipe actions are reachable on every recipe-side screen on the phone', async ({ page, request }) => {
		await reset(request);
		const { recipes } = await seed(request, { recipes: [{ title: 'Pancakes' }] });
		for (const path of ['/', '/recipes', `/recipes/${recipes[0]}`, '/recipes/tags', '/recipes/new/form', '/plan', '/list']) {
			await open(page, path);
			await expect(strip(page), path).toHaveCount(1);
			await expect(strip(page).getByRole('link', { name: 'Rues Cooking Hub' }), path).toBeVisible();
			await expect(strip(page).getByRole('link', { name: 'Rues Cooking Hub' })).toHaveAttribute('href', '/');
			await expect(strip(page).getByRole('link', { name: 'Search recipes' }), path).toBeVisible();
			const add = strip(page).getByRole('link', { name: 'Add recipe' });
			await expect(add, path).toBeVisible();
			await expect(add).toHaveAttribute('href', '/recipes/new');
		}
	});

	test('Scenario: Search recipes on the phone focuses the field', async ({ page }) => {
		const field = page.getByRole('searchbox', { name: 'Search recipes' });
		await open(page, '/');
		await strip(page).getByRole('link', { name: 'Search recipes' }).click();
		await expect(page).toHaveURL('/recipes');
		await expect(field).toBeFocused();

		await page.getByRole('main').click({ position: { x: 4, y: 4 } });
		await field.blur();
		await expect(field).not.toBeFocused();
		await strip(page).getByRole('link', { name: 'Search recipes' }).click();
		await expect(page).toHaveURL('/recipes');
		await expect(field).toBeFocused();
	});

	test('Scenario: Phone offers the spot actions on Eating Out', async ({ page }) => {
		await open(page, '/eating-out');
		await expect(strip(page).getByRole('link', { name: 'Rues Cooking Hub' })).toHaveAttribute('href', '/');
		await expect(strip(page).getByRole('link', { name: 'Search spots' })).toBeVisible();
		await expect(strip(page).getByRole('link', { name: 'Add spot' })).toBeVisible();
		await expect(strip(page).getByRole('link', { name: /recipe/i }).filter({ hasNotText: 'Rues' })).toHaveCount(0);
		await expect(page.getByRole('link', { name: /^(Search|Add) recipes?$/ })).toHaveCount(0);
	});
});
