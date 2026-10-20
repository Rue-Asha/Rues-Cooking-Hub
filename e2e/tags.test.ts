import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const list = (page: Page) => page.getByRole('list', { name: 'Tags' });
const row = (page: Page, name: string) =>
	list(page)
		.getByRole('listitem')
		.filter({ has: page.getByText(name, { exact: true }) });

async function rename(page: Page, from: string, to: string) {
	await row(page, from).getByRole('button', { name: `Rename ${from}` }).click();
	const field = list(page).getByRole('textbox', { name: `New name for ${from}` });
	await expect(field).toHaveValue(from);
	await field.fill(to);
	await field.press('Enter');
}

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Rename a tag', async ({ page, request }) => {
	const { recipes } = await seed(request, {
		recipes: [
			{ title: 'Flapjacks', tags: ['Snack'] },
			{ title: 'Hummus', tags: ['Snack', 'Side'] }
		]
	});
	await open(page, '/recipes');
	await page.getByRole('link', { name: 'Manage tags' }).click();
	await expect(page).toHaveURL('/recipes/tags');
	await expect(row(page, 'Snack')).toContainText('2 recipes');

	await rename(page, 'Snack', 'Snacks');

	await expect(row(page, 'Snacks')).toContainText('2 recipes');
	await expect(list(page).getByText('Snack', { exact: true })).toHaveCount(0);
	for (const id of recipes) {
		await open(page, `/recipes/${id}`);
		await expect(page.getByText('Snacks', { exact: true })).toBeVisible();
		await expect(page.getByText('Snack', { exact: true })).toHaveCount(0);
	}
});

test('Scenario: Rename onto an existing tag merges them in the manager', async ({ page, request }) => {
	await seed(request, {
		recipes: [
			{ title: 'Roast carrots', tags: ['Side'] },
			{ title: 'Rice pudding', tags: ['Side', 'Dessert'] },
			{ title: 'Panna cotta', tags: ['Dessert'] }
		]
	});
	await open(page, '/recipes/tags');
	await expect(row(page, 'Dessert')).toContainText('2 recipes');

	await rename(page, 'Side', 'Dessert');

	await expect(list(page).getByText('Side', { exact: true })).toHaveCount(0);
	await expect(list(page).getByText('Dessert', { exact: true })).toHaveCount(1);
	await expect(row(page, 'Dessert')).toContainText('3 recipes');
	await expect(page.getByRole('status')).toContainText('Merged Side into Dessert');
});

test('Scenario: Deleting a tag in use names the count', async ({ page, request }) => {
	await seed(request, {
		recipes: ['Pea soup', 'Tomato soup', 'Miso soup', 'Leek soup'].map((title) => ({ title, tags: ['Soup'] }))
	});
	await open(page, '/recipes/tags');
	await expect(row(page, 'Soup')).toContainText('4 recipes');

	await row(page, 'Soup').getByRole('button', { name: 'Delete Soup' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading')).toHaveText('Delete tag “Soup”?');
	await expect(dialog.getByText("It's used by 4 recipes.", { exact: true })).toBeVisible();
	await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

	await expect(dialog).toBeHidden();
	await expect(list(page).getByText('Soup', { exact: true })).toHaveCount(0);
	await expect(row(page, 'Salad')).toBeVisible();
});

test('An unused tag is deleted after a plain confirm', async ({ page }) => {
	await open(page, '/recipes/tags');
	await expect(row(page, 'Baking')).toContainText('0 recipes');

	await row(page, 'Baking').getByRole('button', { name: 'Delete Baking' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading')).toHaveText('Delete tag “Baking”?');
	await expect(dialog.getByText(/used by/)).toHaveCount(0);
	await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

	await expect(list(page).getByText('Baking', { exact: true })).toHaveCount(0);
});

test('An empty name keeps the tag', async ({ page }) => {
	await open(page, '/recipes/tags');
	await rename(page, 'Soup', '   ');

	await expect(list(page).getByText('Enter a name', { exact: true })).toBeVisible();
	await open(page, '/recipes/tags');
	await expect(row(page, 'Soup')).toBeVisible();
});
