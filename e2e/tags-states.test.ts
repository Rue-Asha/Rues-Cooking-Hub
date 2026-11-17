import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ request }) => {
	await reset(request);
});

const list = (page: Page) => page.getByRole('list', { name: 'Tags' });

test('Scenario: No tags shows the empty state', async ({ page, request }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await seed(request, { recipes: [{ title: 'Toast', tags: ['Snack'] }] });
	await open(page, '/recipes/tags');
	// a fresh database already carries starter tags: delete every one
	const remove = page.getByRole('button', { name: /^Delete / });
	for (let left = await remove.count(); left > 0; left--) {
		await remove.first().click();
		await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(remove).toHaveCount(left - 1);
	}

	await open(page, '/recipes/tags');

	await expect(page.getByRole('main').getByText('0 tags', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'No tags yet' })).toBeVisible();
	await expect(page.getByText('Tags are added while you edit a recipe.')).toBeVisible();
	await expect(page.getByRole('main').getByRole('link', { name: 'All recipes' })).toHaveAttribute('href', '/recipes');
	await expect(list(page)).toHaveCount(0);
});

test('Scenario: Long tag names wrap in the manager', async ({ page, request }) => {
	await page.setViewportSize({ width: 320, height: 640 });
	const name = 'Extraordinarily-long-tag-name-that-never-seems-to-end-ever-1234';
	expect(name).toHaveLength(63);
	const long = name.slice(0, 60);
	await seed(request, { recipes: [{ title: 'Toast', tags: [long, 'Snack'] }] });
	await open(page, '/recipes/tags');

	const fits = async () => {
		const { scroll, client } = await page.evaluate(() => ({
			scroll: document.documentElement.scrollWidth,
			client: document.documentElement.clientWidth
		}));
		expect(scroll).toBeLessThanOrEqual(client);
	};
	await expect(list(page).getByText(long, { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: `Delete ${long}` })).toBeVisible();
	await fits();

	await page.getByRole('button', { name: `Rename ${long}` }).click();

	await expect(list(page).getByRole('textbox', { name: `New name for ${long}` })).toHaveValue(long);
	await fits();
});

test('Scenario: Merge reports both names', async ({ page, request }) => {
	await seed(request, {
		recipes: [
			{ title: 'Cake', tags: ['Desserts'] },
			{ title: 'Tart', tags: ['Dessert'] }
		]
	});
	await open(page, '/recipes/tags');

	await page.getByRole('button', { name: 'Rename Desserts' }).click();
	const field = list(page).getByRole('textbox', { name: 'New name for Desserts' });
	await field.fill('dessert');
	await field.press('Enter');

	await expect(page.getByRole('status').filter({ hasText: 'Merged Desserts into Dessert' })).toBeVisible();
	const dessert = list(page).getByRole('listitem').filter({ hasText: /^Dessert\s/ });
	await expect(dessert).toHaveCount(1);
	await expect(dessert).toContainText('2 recipes');
	await expect(list(page).getByText('Desserts', { exact: true })).toHaveCount(0);
});
