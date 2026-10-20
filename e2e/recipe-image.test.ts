import { DatabaseSync } from 'node:sqlite';
import { expect, test, type Page } from '@playwright/test';
import sharp from 'sharp';
import { calm, open, reset, seed } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function rows<T>(sql: string): T[] {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const out = db.prepare(sql).all() as T[];
	db.close();
	return out;
}

const recipes = () => rows<{ id: number; title: string; image_id: number | null }>('SELECT id, title, image_id FROM recipes');
const imageCount = () => rows<{ n: number }>('SELECT count(*) AS n FROM images')[0].n;
const savedId = (page: Page) => Number(new URL(page.url()).pathname.split('/')[2]);

const jpeg = (name = 'photo.jpg') =>
	sharp({ create: { width: 640, height: 400, channels: 3, background: '#c05030' } })
		.jpeg()
		.toBuffer()
		.then((buffer) => ({ name, mimeType: 'image/jpeg', buffer }));

async function newForm(page: Page, title = 'Photo test') {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill(title);
}

const save = (page: Page) => page.getByRole('button', { name: 'Save recipe' }).click();

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Image upload from the form', async ({ page, request }) => {
	await newForm(page);

	await page.locator('input[type=file]').setInputFiles(await jpeg());
	await expect(page.locator('[data-image-frame] img')).toBeVisible();
	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	const [recipe] = recipes();
	expect(recipe.image_id).not.toBeNull();
	const image = await request.get(`/images/${recipe.image_id}`);
	expect(image.status()).toBe(200);
	expect(image.headers()['content-type']).toBe('image/webp');

	await open(page, `/recipes/${recipe.id}/edit`);
	await expect(page.locator('[data-image-frame] img:not([role])')).toHaveAttribute('src', `/images/${recipe.image_id}`);
});

test('Scenario: Non-image file is rejected in the form', async ({ page }) => {
	await newForm(page);

	await page
		.locator('input[type=file]')
		.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not a picture') });
	await save(page);

	await expect(page.getByText("That file isn't an image")).toBeVisible();
	await expect(page).toHaveURL(/\/recipes\/new\/form$/);
	expect(recipes()).toEqual([]);
	expect(imageCount()).toBe(0);
});

test('Scenario: Oversize file is rejected in the form', async ({ page }) => {
	await newForm(page, 'Big photo');
	const posts: string[] = [];
	page.on('request', (r) => r.method() === 'POST' && posts.push(r.url()));

	await page.locator('input[type=file]').setInputFiles({
		name: 'huge.jpg',
		mimeType: 'image/jpeg',
		buffer: Buffer.alloc(16 * 1024 * 1024)
	});

	await expect(page.getByText('Images can be at most 15 MB')).toBeVisible();
	expect(posts).toEqual([]);

	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	expect(recipes()).toMatchObject([{ title: 'Big photo', image_id: null }]);
});

test('Scenario: Recipe saved without image when its image URL fails', async ({ page, baseURL }) => {
	await newForm(page, 'Linked photo');

	await page.getByLabel('Image link').fill(`${baseURL}/images/999999`);
	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+\/edit\?imageFailed=1$/);
	await expect(page.getByText("Saved without image: the image couldn't be downloaded.")).toBeVisible();
	expect(recipes()).toMatchObject([{ title: 'Linked photo', image_id: null }]);
	expect(imageCount()).toBe(0);
});

test('Scenario: Edit keeps the old image when a new image URL fails', async ({ page, request, baseURL }) => {
	const { recipes: seeded } = await seed(request, { recipes: [{ title: 'Soup', image: true }] });
	const id = seeded[0];
	const old = rows<{ image_id: number }>(`SELECT image_id FROM recipes WHERE id = ${id}`)[0].image_id;
	await open(page, `/recipes/${id}/edit`);

	await page.getByLabel('Image link').fill(`${baseURL}/images/999999`);
	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+\/edit\?imageFailed=kept$/);
	await expect(page.getByText("The new image couldn't be downloaded; the previous image was kept.")).toBeVisible();
	await expect(page.getByText("Saved without image")).toHaveCount(0);
	expect(recipes()).toMatchObject([{ title: 'Soup', image_id: old }]);
	expect(imageCount()).toBe(1);
});

test('an unknown imageFailed value shows no notice', async ({ page, request }) => {
	const { recipes: seeded } = await seed(request, { recipes: [{ title: 'Soup' }] });
	for (const value of ['constructor', '__proto__', 'toString']) {
		const response = await page.goto(`/recipes/${seeded[0]}/edit?imageFailed=${value}`);
		expect(response!.status(), value).toBe(200);
		await expect(page.getByText("Saved without image")).toHaveCount(0);
		await expect(page.getByText('the previous image was kept')).toHaveCount(0);
	}
});

test('an image link that works is downloaded and stored', async ({ page, request, baseURL }) => {
	const { recipes: seeded } = await seed(request, { recipes: [{ title: 'Source of the photo', image: true }] });
	const sourceImage = rows<{ image_id: number }>(`SELECT image_id FROM recipes WHERE id = ${seeded[0]}`)[0].image_id;
	await newForm(page, 'Copycat');

	await page.getByLabel('Image link').fill(`${baseURL}/images/${sourceImage}`);
	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	const copy = recipes().find((r) => r.title === 'Copycat')!;
	expect(copy.image_id).not.toBeNull();
	expect(copy.image_id).not.toBe(sourceImage);
	expect(imageCount()).toBe(2);
});

test('Remove image drops a chosen file and shows the placeholder again', async ({ page }) => {
	await newForm(page);
	const frame = page.locator('[data-image-frame]');

	await expect(frame.getByRole('img', { name: 'No photo yet' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Remove image' })).toHaveCount(0);
	await page.locator('input[type=file]').setInputFiles(await jpeg());
	await expect(frame.locator('img:not([role])')).toBeVisible();
	await page.getByRole('button', { name: 'Remove image' }).click();

	await expect(frame.getByRole('img', { name: 'No photo yet' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Remove image' })).toHaveCount(0);
	await save(page);

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	expect(recipes()[0].image_id).toBeNull();
	expect(imageCount()).toBe(0);
});

const running = (page: Page) =>
	page.evaluate(
		() =>
			new Promise<number>((done) =>
				requestAnimationFrame(() => done(document.getAnimations().filter((a) => a.playState === 'running' && !(a instanceof CSSTransition)).length))
			)
	);

test('swapping the image animates, and not under reduced motion', async ({ page }) => {
	await newForm(page);
	await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a instanceof CSSTransition));

	await page.locator('input[type=file]').setInputFiles(await jpeg());
	expect(await running(page)).toBeGreaterThan(0);

	await calm(page);
	await page.getByRole('button', { name: 'Remove image' }).click();
	await page.locator('input[type=file]').setInputFiles(await jpeg('again.jpg'));
	await expect(page.locator('[data-image-frame] img:not([role])')).toBeVisible();
	expect(await running(page)).toBe(0);
});

test('Scenario: Remove image shows the placeholder', async ({ page, request }) => {
	const { recipes: seeded } = await seed(request, { recipes: [{ title: 'Soup', image: true }] });
	const id = seeded[0];
	const old = rows<{ image_id: number }>(`SELECT image_id FROM recipes WHERE id = ${id}`)[0].image_id;
	await open(page, `/recipes/${id}/edit`);
	const frame = page.locator('[data-image-frame]');
	await expect(frame.locator('img:not([role])')).toBeVisible();

	await page.getByRole('button', { name: 'Remove image' }).click();
	await expect(frame.getByRole('img', { name: 'No photo yet' })).toBeVisible();
	await save(page);

	await expect(page).toHaveURL(new RegExp(`/recipes/${id}$`));
	await open(page, `/recipes/${id}/edit`);
	await expect(frame.getByRole('img', { name: 'No photo yet' })).toBeVisible();
	await expect(frame.locator('img:not([role])')).toHaveCount(0);
	expect((await request.get(`/images/${old}`)).status()).toBe(404);
	expect(imageCount()).toBe(0);
});

test('replacing the image of a recipe removes the old one', async ({ page, request }) => {
	const { recipes: seeded } = await seed(request, { recipes: [{ title: 'Soup', image: true }] });
	const id = seeded[0];
	const old = rows<{ image_id: number }>(`SELECT image_id FROM recipes WHERE id = ${id}`)[0].image_id;
	await open(page, `/recipes/${id}/edit`);

	await page.locator('input[type=file]').setInputFiles(await jpeg());
	await save(page);

	await expect(page).toHaveURL(new RegExp(`/recipes/${id}$`));
	const now = rows<{ image_id: number }>(`SELECT image_id FROM recipes WHERE id = ${id}`)[0].image_id;
	expect(now).not.toBe(old);
	expect((await request.get(`/images/${old}`)).status()).toBe(404);
	expect((await request.get(`/images/${now}`)).status()).toBe(200);
	expect(imageCount()).toBe(1);
});
