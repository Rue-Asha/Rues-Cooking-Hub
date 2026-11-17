import { expect, test } from '@playwright/test';
import { mainNav as nav, open, reset, seed } from './helpers.ts';

const dialog = (page: import('@playwright/test').Page) => page.getByRole('alertdialog', { name: 'Discard changes?' });

test('Scenario: Phone pill on an edited form asks first', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	await reset(request);
	const { recipes } = await seed(request, { recipes: [{ title: 'Pancakes' }] });
	await open(page, `/recipes/${recipes[0]}/edit`);
	const title = page.getByLabel('Title', { exact: true });
	await title.fill('Fluffy pancakes');
	await title.blur();
	await nav(page).getByRole('link', { name: 'Plan', exact: true }).click();
	await expect(dialog(page)).toBeVisible();
	await dialog(page).getByRole('button', { name: 'Keep editing' }).click();
	await expect(page).toHaveURL(`/recipes/${recipes[0]}/edit`);
	await expect(title).toHaveValue('Fluffy pancakes');
	await nav(page).getByRole('link', { name: 'Plan', exact: true }).click();
	await dialog(page).getByRole('button', { name: 'Discard' }).click();
	await expect(page).toHaveURL('/plan');
});

test('Keep editing after a phone pill tap leaves the bar marking the page you stayed on', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	await reset(request);
	const { recipes } = await seed(request, { recipes: [{ title: 'Pancakes' }] });
	await open(page, `/recipes/${recipes[0]}/edit`);
	const title = page.getByLabel('Title', { exact: true });
	await title.fill('Fluffy pancakes');
	await title.blur();
	const plan = nav(page).getByRole('link', { name: 'Plan', exact: true });
	const recipesLink = nav(page).getByRole('link', { name: 'Recipes', exact: true });
	await expect(recipesLink).toHaveAttribute('aria-current', 'page');

	await plan.click();
	await expect(dialog(page)).toBeVisible();
	await expect(plan).not.toHaveAttribute('aria-current');
	await dialog(page).getByRole('button', { name: 'Keep editing' }).click();

	await expect(plan).not.toHaveAttribute('aria-current');
	await expect(recipesLink).toHaveAttribute('aria-current', 'page');
	// the pill sits on the marked link
	const pillOn = await page.evaluate(() => {
		const ghost = document.querySelector<HTMLElement>('[data-bar="phone"] [data-pill-ghost]')!;
		const marked = document.querySelector<HTMLElement>('[data-bar="phone"] [aria-current="page"]')!;
		return { clip: ghost.style.getPropertyValue('--pill-clip'), left: marked.offsetLeft };
	});
	expect(pillOn.clip).toContain(`${pillOn.left}px round`);

	await plan.click();
	await dialog(page).getByRole('button', { name: 'Discard' }).click();
	await expect(page).toHaveURL('/plan');
	await expect(plan).toHaveAttribute('aria-current', 'page');
});

test('Scenario: Top bar actions on an edited form ask first', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop layout');
	await open(page, '/recipes/new/form');
	const title = page.getByLabel('Title', { exact: true });
	await title.fill('Soup');
	const bar = page.locator('header[data-bar="top"]');
	for (const name of ['Rues Cooking Hub', 'Search recipes', 'Add recipe']) {
		await bar.getByRole('link', { name }).click();
		await expect(dialog(page), name).toBeVisible();
		await dialog(page).getByRole('button', { name: 'Keep editing' }).click();
		await expect(title).toHaveValue('Soup');
		await expect(dialog(page)).toBeHidden();
	}
});

test('Scenario: Unedited form leaves without asking', async ({ page, request }) => {
	await reset(request);
	const { recipes } = await seed(request, { recipes: [{ title: 'Pancakes' }] });
	await open(page, `/recipes/${recipes[0]}/edit`);
	await nav(page).getByRole('link', { name: 'List', exact: true }).click();
	await expect(page).toHaveURL('/list');
	await expect(dialog(page)).toHaveCount(0);
});
