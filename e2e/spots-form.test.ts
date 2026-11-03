import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { expect, test, type Page } from '@playwright/test';
import sharp from 'sharp';
import { open, reset, seed } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function rows<T>(sql: string): T[] {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const out = db.prepare(sql).all() as T[];
	db.close();
	return out;
}

const savedId = (page: Page) => Number(new URL(page.url()).pathname.split('/')[2]);

const jpeg = (name = 'photo.jpg') =>
	sharp({ create: { width: 640, height: 400, channels: 3, background: '#c05030' } })
		.jpeg()
		.toBuffer()
		.then((buffer) => ({ name, mimeType: 'image/jpeg', buffer }));

const status = (page: Page, name: 'Want to go' | 'Visited') =>
	page.getByRole('group', { name: 'Status' }).getByRole('button', { name, exact: true });
const price = (page: Page, label: string) =>
	page.getByRole('group', { name: 'Price' }).getByRole('button', { name: label, exact: true });
const score = (page: Page) => page.getByLabel('Score', { exact: true });

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Spot created with all fields', async ({ page }) => {
	await open(page, '/eating-out/new');
	await page.getByLabel('Name', { exact: true }).fill('Kuro Ramen');
	await status(page, 'Visited').click();
	await score(page).fill('9');
	await page.getByLabel('Add a tag').fill('Brunch');
	await page.getByLabel('Add a tag').press(',');
	await page.getByLabel('Add a tag').fill('Coffee');
	await page.getByLabel('Add a tag').press(',');
	await price(page, '€€').click();
	await page.getByLabel('City').fill('Berlin');
	await page.getByLabel('Neighbourhood').fill('Kreuzberg');
	await page.getByLabel('Address').fill('Oranienstraße 42, 10999 Berlin');
	await page.getByLabel('Website').fill('https://kuro-ramen.example');
	await page.getByLabel('Notes').fill('Spicy miso with the extra egg.');
	await page.locator('input[type=file]').setInputFiles(await jpeg());
	await page.getByRole('button', { name: 'Save spot' }).last().click();

	await expect(page).toHaveURL(/\/eating-out\/\d+$/);
	const id = savedId(page);
	const [stored] = rows<{ image_id: number }>(`SELECT image_id FROM spots WHERE id = ${id}`);
	expect(stored.image_id).not.toBeNull();

	await open(page, `/eating-out/${id}/edit`);
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Kuro Ramen');
	await expect(status(page, 'Visited')).toHaveAttribute('aria-pressed', 'true');
	await expect(score(page)).toHaveValue('9.00');
	const selected = page.getByRole('list', { name: 'Selected tags' });
	await expect(selected.getByText('Brunch', { exact: true })).toBeVisible();
	await expect(selected.getByText('Coffee', { exact: true })).toBeVisible();
	await expect(price(page, '€€')).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByLabel('City')).toHaveValue('Berlin');
	await expect(page.getByLabel('Neighbourhood')).toHaveValue('Kreuzberg');
	await expect(page.getByLabel('Address')).toHaveValue('Oranienstraße 42, 10999 Berlin');
	await expect(page.getByLabel('Website')).toHaveValue('https://kuro-ramen.example');
	await expect(page.getByLabel('Notes')).toHaveValue('Spicy miso with the extra egg.');
	await expect(page.locator('[data-image-frame] img:not([role])')).toHaveAttribute('src', `/images/${stored.image_id}`);
});

test('Scenario: New spot defaults to Want to go', async ({ page }) => {
	await open(page, '/eating-out/new');

	await expect(status(page, 'Want to go')).toHaveAttribute('aria-pressed', 'true');
	await expect(status(page, 'Visited')).toHaveAttribute('aria-pressed', 'false');
	await expect(score(page)).toHaveCount(0);
});

test('Scenario: Score field appears only for Visited', async ({ page }) => {
	await open(page, '/eating-out/new');

	await status(page, 'Visited').click();
	await expect(score(page)).toBeVisible();

	await status(page, 'Want to go').click();
	await expect(score(page)).toHaveCount(0);
});

test('Scenario: Score field uses the decimal keyboard', async ({ page }) => {
	await open(page, '/eating-out/new');

	await status(page, 'Visited').click();

	await expect(score(page)).toHaveAttribute('inputmode', 'decimal');
});

test('Scenario: Price level can be cleared', async ({ page }) => {
	await open(page, '/eating-out/new');
	await page.getByLabel('Name', { exact: true }).fill('Cheap eats');

	await price(page, '€€').click();
	await expect(price(page, '€€')).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('button', { name: 'Clear', exact: true }).click();
	await expect(price(page, '€€')).toHaveAttribute('aria-pressed', 'false');
	await page.getByRole('button', { name: 'Save spot' }).last().click();

	await expect(page).toHaveURL(/\/eating-out\/\d+$/);
	await open(page, `/eating-out/${savedId(page)}/edit`);
	for (const label of ['€', '€€', '€€€', '€€€€']) await expect(price(page, label)).toHaveAttribute('aria-pressed', 'false');
});

test('Scenario: Spot tag field suggests spot tags only', async ({ page, request }) => {
	await seed(request, { spots: [{ name: 'Brunch place', tags: ['Brunch'] }] });
	await open(page, '/eating-out/new');
	const suggestions = page.getByRole('group', { name: 'Tag suggestions' });

	await page.getByLabel('Add a tag').fill('s');
	for (const recipeTag of ['Soup', 'Salad', 'Side', 'Snack']) {
		await expect(suggestions.getByRole('button', { name: recipeTag, exact: true })).toHaveCount(0);
	}

	await page.getByLabel('Add a tag').fill('b');
	await expect(suggestions.getByRole('button', { name: 'Brunch', exact: true })).toBeVisible();
	await expect(suggestions.getByRole('button', { name: 'Breakfast', exact: true })).toHaveCount(0);
	await expect(suggestions.getByRole('button', { name: 'Baking', exact: true })).toHaveCount(0);
});

test('Scenario: Nav marks Eating Out on its sub-pages', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Sub page' }] });

	for (const path of ['/eating-out/new', `/eating-out/${spots[0]}/edit`]) {
		await open(page, path);
		await expect(page.locator('[aria-current]')).toHaveCount(2);
		await expect(page.locator('[aria-current="page"]').filter({ hasText: 'Eating Out' })).toHaveCount(2);
		await expect(page.locator('[aria-current]').filter({ hasNotText: 'Eating Out' })).toHaveCount(0);
	}
});

test('Spot form screenshot', async ({ page }, info) => {
	await open(page, '/eating-out/new');
	await page.getByLabel('Name', { exact: true }).fill('Kuro Ramen');
	await status(page, 'Visited').click();
	await score(page).fill('8,75');
	await price(page, '€€').click();
	await page.getByLabel('City').fill('Berlin');
	await page.getByLabel('Neighbourhood').fill('Kreuzberg');
	await page.locator('input[type=file]').setInputFiles(await jpeg());
	await expect(page.locator('[data-image-frame] img')).toBeVisible();
	await page.evaluate(async () => {
		await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
		await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined)));
		(document.activeElement as HTMLElement | null)?.blur();
		window.scrollTo(0, 0);
	});
	// a full-page shot would leave the fixed phone tab bar half-way down the image; hide it
	await page.addStyleTag({ content: '[data-nav="bar"] { display: none !important }' });

	const path = `test-results/shots/eating-out-form-${info.project.name}.png`;
	await page.screenshot({ path, fullPage: true, animations: 'disabled' });

	expect(existsSync(path)).toBe(true);
});
