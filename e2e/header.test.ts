import { expect, test, type Locator, type Page } from '@playwright/test';
import { mainNav, navDivider, open } from './helpers.ts';

test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'desktop header'));

const header = (page: Page) => page.getByRole('banner');
const actions = header;

// brand, five nav links and the two actions: a third action would add a link or a button
const pinActions = async (page: Page) => {
	await expect(header(page).getByRole('link')).toHaveCount(8);
	await expect(header(page).getByRole('button')).toHaveCount(0);
};

test('Scenario: Eating Out header shows spot actions', async ({ page }) => {
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

test('Scenario: Header follows client-side navigation', async ({ page }) => {
	await open(page, '/recipes');
	await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
	await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Eating Out' }).click();
	await expect(page).toHaveURL('/eating-out');
	await expect(actions(page).getByRole('link', { name: 'Search spots' })).toBeVisible();
	await expect(actions(page).getByRole('link', { name: 'Add spot' })).toBeVisible();
	expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
});

test('Scenario: Desktop header fits at 1024 px', async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 768 });
	for (const path of ['/plan', '/eating-out']) {
		await open(page, path);
		const left = async (l: Locator) => (await l.boundingBox())!.x;
		const right = async (l: Locator) => {
			const b = (await l.boundingBox())!;
			return b.x + b.width;
		};
		const brand = header(page).getByRole('link', { name: 'Rues Cooking Hub' });
		const search = header(page).getByRole('link', { name: /^Search / });
		const add = header(page).getByRole('link', { name: /^Add / });
		const divider = navDivider(mainNav(page));
		const m = {
			brand: await right(brand),
			pill: [await left(mainNav(page)), await right(mainNav(page))],
			actions: [await left(search), await right(add)],
			divider: [await left(divider), await right(divider)],
			scroll: await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
		};
		console.log(path, JSON.stringify(m));
		expect(m.brand, path).toBeLessThanOrEqual(m.pill[0]);
		expect(m.pill[1], path).toBeLessThanOrEqual(m.actions[0]);
		expect(m.actions[1], `${path} actions inside the viewport`).toBeLessThanOrEqual(m.scroll[1]);
		expect(m.divider[0]).toBeGreaterThanOrEqual(m.pill[0]);
		expect(m.divider[1]).toBeLessThanOrEqual(m.pill[1]);
		expect(m.scroll[0]).toBeLessThanOrEqual(m.scroll[1]);
	}
});
