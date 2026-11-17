import { expect, test } from '@playwright/test';
import { open, plus, reset, seed } from './helpers.ts';

test.beforeEach(({}, info) => test.skip(info.project.name !== 'phone', 'phone layout'));

test('Scenario: Plus on Recipes pages opens Add recipe', async ({ page, request }) => {
	await reset(request);
	const { recipes } = await seed(request, { recipes: [{ title: 'Pancakes' }] });
	for (const path of ['/recipes', `/recipes/${recipes[0]}`, '/recipes/tags']) {
		await open(page, path);
		await expect(plus(page)).toHaveAccessibleName('Add recipe');
		await plus(page).click();
		await expect(page).toHaveURL('/recipes/new');
	}
});

test('Scenario: Plus on Eating Out pages opens Add spot', async ({ page, request }) => {
	await reset(request);
	const { spots } = await seed(request, { spots: [{ name: 'Trattoria' }] });
	for (const path of ['/eating-out', `/eating-out/${spots[0]}`]) {
		await open(page, path);
		await expect(plus(page)).toHaveAccessibleName('Add spot');
		await plus(page).click();
		await expect(page).toHaveURL('/eating-out/new');
	}
});

const sheet = (page: import('@playwright/test').Page) => page.getByRole('dialog', { name: 'Add to your kitchen' });

test('Scenario: Plus on Home opens the choice sheet', async ({ page }) => {
	await open(page, '/');
	await plus(page).click();
	await expect(sheet(page)).toBeVisible();
	await expect(sheet(page).getByRole('link', { name: /^Recipe/ })).toHaveAttribute('href', '/recipes/new');
	await expect(sheet(page).getByRole('link', { name: /^Plan entry/ })).toHaveAttribute('href', '/plan?add=1');
	await expect(sheet(page).getByRole('link', { name: /^List item/ })).toHaveAttribute('href', '/list?add=1');
	expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
	// modal: the page behind is out of reach while the sheet is open
	expect(await sheet(page).evaluate((el) => el.matches(':modal'))).toBe(true);
});

test('Choosing in the choice sheet replaces it in history, so Back lands on Home with the sheet closed', async ({ page }) => {
	await open(page, '/');
	for (const [name, url] of [
		[/^List item/, /\/list$/],
		[/^Plan entry/, /\/plan$/]
	] as const) {
		await plus(page).click();
		await sheet(page).getByRole('link', { name }).click();
		await expect(page).toHaveURL(url);
		await page.goBack();
		await expect(page).toHaveURL('/');
		await expect(sheet(page)).toBeHidden();
	}
});

test('Escape twice in the choice sheet closes it once and stays on Home', async ({ page }) => {
	await open(page, '/recipes');
	await open(page, '/');
	await plus(page).click();
	await expect(sheet(page)).toBeVisible();

	await page.keyboard.press('Escape');
	await page.keyboard.press('Escape');

	await expect(sheet(page)).toBeHidden();
	await page.evaluate(() => new Promise((done) => setTimeout(done, 300)));
	await expect(page).toHaveURL('/');
});

test('Scenario: Choice sheet closes on Escape, outside tap and back', async ({ page }) => {
	await open(page, '/');
	for (const close of [
		() => page.keyboard.press('Escape'),
		() => page.mouse.click(195, 40),
		() => page.goBack()
	]) {
		await plus(page).click();
		await expect(sheet(page)).toBeVisible();
		await close();
		await expect(sheet(page)).toBeHidden();
		await expect(page).toHaveURL('/');
		await expect(plus(page)).toBeFocused();
	}
});

test('Scenario: Plus is hidden on the recipe form', async ({ page, request }) => {
	await reset(request);
	const { recipes } = await seed(request, { recipes: [{ title: 'Pancakes' }] });
	for (const path of ['/recipes/new', '/recipes/new/form', `/recipes/${recipes[0]}/edit`]) {
		await open(page, path);
		await expect(plus(page), path).toHaveCount(0);
		await expect(page.locator('.dock-add'), path).toBeHidden();
		await expect(page.locator('.dock-add'), path).toHaveAttribute('inert', '');
		await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveCount(5);
	}
});
