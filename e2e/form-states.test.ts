import { DatabaseSync } from 'node:sqlite';
import { expect, test, type Page } from '@playwright/test';
import { calm, open, phoneBar, reset, seed } from './helpers.ts';
import { startFixtureServer, type FixtureServer } from './fixture-server.ts';

const port = Number(process.env.PORT ?? 4173);

function rows<T>(sql: string): T[] {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const out = db.prepare(sql).all() as T[];
	db.close();
	return out;
}

let fixtures: FixtureServer;

test.beforeAll(async () => {
	fixtures = await startFixtureServer();
});

test.afterAll(async () => {
	await fixtures.close();
});

test.beforeEach(async ({ request }) => {
	await reset(request);
});

const sizes = [
	{ width: 390, height: 844 },
	{ width: 1280, height: 800 }
];

async function oneSave(page: Page) {
	await expect(page.getByRole('button', { name: 'Save recipe' })).toHaveCount(1);
	await expect(page.getByRole('link', { name: 'Cancel', exact: true })).toHaveCount(1);
}

test('Scenario: Recipe form has one Save recipe', async ({ page, request }) => {
	const { recipes } = await seed(request, { recipes: [{ title: 'Soup' }] });
	for (const size of sizes) {
		await page.setViewportSize(size);

		await open(page, '/recipes/new/form');
		await oneSave(page);

		await open(page, `/recipes/${recipes[0]}/edit`);
		await oneSave(page);

		await open(page, '/recipes/new');
		await page.getByLabel('Paste a link to a recipe page').fill(`${fixtures.url}/pages/lemon-tart.html`);
		await page.getByRole('button', { name: 'Import', exact: true }).click();
		await expect(page.getByRole('region', { name: 'Recipe preview' })).toBeVisible();
		await oneSave(page);
	}
});

test('Scenario: Save stays reachable in a long form', async ({ page, request }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const { recipes } = await seed(request, {
		recipes: [
			{
				title: 'Long one',
				ingredients: [{ title: null, lines: Array.from({ length: 50 }, (_, i) => `${i + 1} g ingredient ${i + 1}`) }],
				steps: [{ title: null, lines: Array.from({ length: 20 }, (_, i) => `Step number ${i + 1}`) }]
			}
		]
	});
	await open(page, `/recipes/${recipes[0]}/edit`);
	await page.getByLabel('Ingredient line').nth(25).scrollIntoViewIfNeeded();
	await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

	const save = page.getByRole('button', { name: 'Save recipe' });
	await expect(save).toBeInViewport({ ratio: 1 });
	const bar = await phoneBar(page).boundingBox();
	const box = await save.boundingBox();
	expect(bar).not.toBeNull();
	expect(box!.y + box!.height).toBeLessThanOrEqual(bar!.y);

	await save.click({ trial: false });
	await expect(page).toHaveURL(new RegExp(`/recipes/${recipes[0]}$`));
});
test('Scenario: HEIC photo the server cannot read is rejected', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Heic test');
	await page.getByLabel('Description').fill('Kept');
	await page
		.getByLabel('Photo file')
		.setInputFiles({ name: 'photo.heic', mimeType: 'image/heic', buffer: Buffer.from('not really a heic file at all') });

	await page.getByRole('button', { name: 'Save recipe' }).click();

	await expect(page.getByText("That file isn't an image")).toBeVisible();
	await expect(page.getByLabel('Image link')).toHaveAccessibleDescription("That file isn't an image");
	await expect(page).toHaveURL(/\/recipes\/new\/form$/);
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Heic test');
	await expect(page.getByLabel('Description')).toHaveValue('Kept');
	expect(rows('SELECT id FROM recipes')).toEqual([]);
});

test('Scenario: Fifty ingredient lines stay usable', async ({ page }) => {
	// a hundred form steps, each with an animated row: still short of a minute, but not of the default 30 s
	test.setTimeout(90_000);
	await calm(page);
	await page.setViewportSize({ width: 320, height: 640 });
	await open(page, '/recipes/new/form');
	const add = page.getByRole('button', { name: 'Add line' });
	const lines = page.getByLabel('Ingredient line');
	while ((await lines.count()) < 50) await add.click();
	const text = (n: number) => `${n} tbsp ${'finely chopped flat leaf parsley '.repeat(4)}`.slice(0, 120);
	for (let n = 0; n < 50; n++) await lines.nth(n).fill(text(n + 1));

	await expect(lines).toHaveCount(50);
	await expect(page.getByRole('group', { name: 'Parsed ingredient', exact: true })).toHaveCount(50);
	await lines.nth(49).scrollIntoViewIfNeeded();
	await expect(lines.nth(49)).toHaveValue(text(50));
	await expect(add).toBeVisible();
	const { scroll, client } = await page.evaluate(() => ({
		scroll: document.documentElement.scrollWidth,
		client: document.documentElement.clientWidth
	}));
	expect(scroll).toBeLessThanOrEqual(client);
});

test('Scenario: Restored draft offers Discard draft on the new form', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Half a pie');

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

	await expect(page.getByText('Restored your unsaved draft')).toBeVisible();
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Half a pie');

	await page.getByRole('button', { name: 'Discard draft' }).click();

	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('');
	await expect(page.getByText('Restored your unsaved draft')).toHaveCount(0);
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(page.getByText('Restored your unsaved draft')).toHaveCount(0);
});
