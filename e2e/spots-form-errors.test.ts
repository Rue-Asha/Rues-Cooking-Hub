import { DatabaseSync } from 'node:sqlite';
import { expect, test, type Page } from '@playwright/test';
import { open, reset } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function rows<T>(sql: string): T[] {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const out = db.prepare(sql).all() as T[];
	db.close();
	return out;
}

const spots = () => rows<{ id: number; name: string; image_id: number | null }>('SELECT id, name, image_id FROM spots');
const spotCount = () => spots().length;

const visited = (page: Page) =>
	page.getByRole('group', { name: 'Status' }).getByRole('button', { name: 'Visited', exact: true }).click();
const name = (page: Page) => page.getByLabel('Name', { exact: true });
const score = (page: Page) => page.getByLabel('Score', { exact: true });
const save = (page: Page) => page.getByRole('button', { name: 'Save spot' }).last().click();

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Empty name blocks saving a spot', async ({ page }) => {
	await open(page, '/eating-out/new');

	await save(page);

	await expect(name(page)).toHaveAccessibleDescription('Name is required');
	await expect(name(page)).toHaveAttribute('aria-invalid', 'true');
	await expect(page).toHaveURL(/\/eating-out\/new$/);
	expect(spotCount()).toBe(0);
});

test('Scenario: Visited without score is rejected in the form', async ({ page }) => {
	await open(page, '/eating-out/new');
	await name(page).fill('Kuro Ramen');
	await visited(page);

	await save(page);

	await expect(score(page)).toHaveAccessibleDescription('Visited spots need a score');
	await expect(page).toHaveURL(/\/eating-out\/new$/);
	expect(spotCount()).toBe(0);
});

test('Scenario: Website must be http or https', async ({ page }) => {
	await open(page, '/eating-out/new');
	await name(page).fill('Kuro Ramen');
	await page.getByLabel('Website').fill('example.com');

	await save(page);

	await expect(page.getByLabel('Website')).toHaveAccessibleDescription('Enter a valid web address (http or https)');
	await expect(page).toHaveURL(/\/eating-out\/new$/);
	expect(spotCount()).toBe(0);
});

test('Scenario: Invalid score keeps the other values', async ({ page }) => {
	await open(page, '/eating-out/new');
	await name(page).fill('Café Müller');
	await page.getByLabel('City').fill('Berlin');
	await visited(page);
	await score(page).fill('10.01');

	await save(page);

	await expect(score(page)).toHaveAccessibleDescription('Enter a score from 1.00 to 10.00, at most two decimals');
	await expect(name(page)).toHaveValue('Café Müller');
	await expect(page.getByLabel('City')).toHaveValue('Berlin');
	await expect(score(page)).toHaveValue('10.01');
	await expect(page.getByRole('group', { name: 'Status' }).getByRole('button', { name: 'Visited' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	expect(spotCount()).toBe(0);
});

test('Score edges: bad values are refused, comma and dot are accepted, "10" becomes 10.00', async ({ page }) => {
	const message = 'Enter a score from 1.00 to 10.00, at most two decimals';
	for (const bad of ['0.99', '10.01', '8.755', 'abc']) {
		await open(page, '/eating-out/new');
		await name(page).fill('Edge');
		await visited(page);
		await score(page).fill(bad);
		await save(page);
		await expect(score(page), bad).toHaveAccessibleDescription(message);
		await expect(name(page)).toHaveValue('Edge');
		await expect(score(page)).toHaveValue(bad);
	}
	expect(spotCount()).toBe(0);

	const good: [string, string][] = [
		['8,75', '8.75'],
		['8.75', '8.75'],
		['10', '10.00']
	];
	for (const [typed, shown] of good) {
		await open(page, '/eating-out/new');
		await name(page).fill(`Spot ${typed}`);
		await visited(page);
		await score(page).fill(typed);
		await save(page);
		await expect(page).toHaveURL(/\/eating-out\/\d+$/);
		const id = Number(new URL(page.url()).pathname.split('/')[2]);
		await open(page, `/eating-out/${id}/edit`);
		await expect(score(page), typed).toHaveValue(shown);
	}
});

test('Scenario: Spot photo errors match the recipe form', async ({ page, baseURL }) => {
	await open(page, '/eating-out/new');
	await name(page).fill('Photo spot');
	const posts: string[] = [];

	await page
		.locator('input[type=file]')
		.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not a picture') });
	await save(page);
	await expect(page.getByText("That file isn't an image")).toBeVisible();
	await expect(page).toHaveURL(/\/eating-out\/new$/);
	expect(spotCount()).toBe(0);

	page.on('request', (r) => r.method() === 'POST' && posts.push(r.url()));
	await page.locator('input[type=file]').setInputFiles({
		name: 'huge.jpg',
		mimeType: 'image/jpeg',
		buffer: Buffer.alloc(16 * 1024 * 1024)
	});
	await expect(page.getByText('Images can be at most 15 MB')).toBeVisible();
	expect(posts).toEqual([]);

	await page.getByLabel('Image link').fill(`${baseURL}/images/999999`);
	await save(page);

	await expect(page).toHaveURL(/\/eating-out\/\d+\/edit\?imageFailed=1$/);
	await expect(page.getByText("Saved without image: the image couldn't be downloaded.")).toBeVisible();
	expect(spots()).toMatchObject([{ name: 'Photo spot', image_id: null }]);
});
