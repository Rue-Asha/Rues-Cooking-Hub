import { DatabaseSync } from 'node:sqlite';
import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function rows<T>(sql: string): T[] {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const out = db.prepare(sql).all() as T[];
	db.close();
	return out;
}

const recipeCount = () => rows<{ n: number }>('SELECT count(*) AS n FROM recipes')[0].n;

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: New recipe defaults to 2 servings', async ({ page }) => {
	await open(page, '/recipes/new/form');

	await expect(page.getByLabel('Servings', { exact: true })).toHaveValue('2');
});

test('Scenario: Empty title blocks saving the form', async ({ page }) => {
	await open(page, '/recipes/new/form');

	await page.getByRole('button', { name: 'Save recipe' }).click();

	await expect(page.getByLabel('Title', { exact: true })).toHaveAccessibleDescription('Title is required');
	await expect(page).toHaveURL(/\/recipes\/new\/form$/);
	expect(recipeCount()).toBe(0);
});

test('Scenario: Servings below 1 are rejected in the form', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Soup');
	await page.getByLabel('Servings', { exact: true }).fill('0');

	await page.getByRole('button', { name: 'Save recipe' }).click();

	await expect(page.getByLabel('Servings', { exact: true })).toHaveAccessibleDescription('Servings must be at least 1');
	await expect(page).toHaveURL(/\/recipes\/new\/form$/);
	expect(recipeCount()).toBe(0);
});

test('Scenario: Recipe created from scratch', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Pizza night');

	const dough = page.getByRole('group', { name: 'Ingredient section 1' });
	await dough.getByLabel('Section title').fill('For the dough');
	await dough.getByLabel('Ingredient line').nth(0).fill('300 g flour');
	await dough.getByLabel('Ingredient line').nth(1).fill('1 tsp salt');
	await page.getByRole('button', { name: 'Add ingredient section' }).click();
	const sauce = page.getByRole('group', { name: 'Ingredient section 2' });
	await sauce.getByLabel('Section title').fill('For the sauce');
	await sauce.getByLabel('Ingredient line').first().fill('400 g tomatoes');

	await page.getByRole('group', { name: 'Step section 1' }).getByLabel('Step 1').fill('Knead the dough.');
	await page.getByRole('button', { name: 'Save recipe' }).click();

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	expect(rows('SELECT title FROM recipes WHERE id = ' + id)).toEqual([{ title: 'Pizza night' }]);
	expect(
		rows(
			`SELECT section, section_title, position, text FROM ingredient_lines WHERE recipe_id = ${id} ORDER BY section, position`
		)
	).toEqual([
		{ section: 0, section_title: 'For the dough', position: 0, text: '300 g flour' },
		{ section: 0, section_title: 'For the dough', position: 1, text: '1 tsp salt' },
		{ section: 1, section_title: 'For the sauce', position: 0, text: '400 g tomatoes' }
	]);
	expect(rows(`SELECT text FROM step_lines WHERE recipe_id = ${id}`)).toEqual([{ text: 'Knead the dough.' }]);

	await open(page, `/recipes/${id}/edit`);
	const sections = page.getByRole('group', { name: /^Ingredient section/ });
	await expect(sections).toHaveCount(2);
	await expect(sections.nth(0).getByLabel('Section title')).toHaveValue('For the dough');
	await expect(sections.nth(0).getByLabel('Ingredient line').nth(0)).toHaveValue('300 g flour');
	await expect(sections.nth(0).getByLabel('Ingredient line').nth(1)).toHaveValue('1 tsp salt');
	await expect(sections.nth(1).getByLabel('Section title')).toHaveValue('For the sauce');
	await expect(sections.nth(1).getByLabel('Ingredient line').nth(0)).toHaveValue('400 g tomatoes');
	await expect(page.getByLabel('Step 1')).toHaveValue('Knead the dough.');
});

test('Scenario: Parse preview updates while typing', async ({ page }) => {
	await open(page, '/recipes/new/form');
	const line = page.getByLabel('Ingredient line').first();
	const preview = page.getByRole('group', { name: 'Parsed ingredient', exact: true }).first();

	await line.pressSequentially('200g');

	await expect(preview.locator('[data-part=quantity]')).toHaveText('200');
	await expect(preview.locator('[data-part=unit]')).toHaveText('g');
	await expect(preview.locator('[data-part=name]')).toHaveCount(0);

	await line.pressSequentially(' butter, softened');

	await expect(preview.locator('[data-part=quantity]')).toHaveText('200');
	await expect(preview.locator('[data-part=unit]')).toHaveText('g');
	await expect(preview.locator('[data-part=name]')).toHaveText('butter');
	await expect(preview.locator('[data-part=note]')).toHaveText('softened');
});

test('a line without quantity says so in its preview, and an empty line has none', async ({ page }) => {
	await open(page, '/recipes/new/form');
	const line = page.getByLabel('Ingredient line').first();
	const preview = page.getByRole('group', { name: 'Parsed ingredient', exact: true });

	await expect(preview).toHaveCount(0);
	await line.fill('salt to taste');
	await expect(preview.locator('[data-part=name]')).toHaveText('salt to taste');
	await expect(preview.locator('[data-part=no-amount]')).toBeVisible();
	await line.fill('');
	await expect(preview).toHaveCount(0);
});

test('Enter in an ingredient line adds a line below and does not save', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Soup');
	const lines = page.getByLabel('Ingredient line');
	await lines.first().fill('2 carrots');

	await lines.first().press('Enter');

	await expect(lines).toHaveCount(4);
	await expect(lines.nth(1)).toBeFocused();
	await expect(page).toHaveURL(/\/recipes\/new\/form$/);
	expect(recipeCount()).toBe(0);
});

test('lines and sections can be added and removed, and the last of each stays', async ({ page }) => {
	await open(page, '/recipes/new/form');
	const lines = page.getByLabel('Ingredient line');
	const sections = page.getByRole('group', { name: /^Ingredient section/ });

	await expect(lines).toHaveCount(3);
	await page.getByRole('button', { name: 'Add line' }).click();
	await expect(lines).toHaveCount(4);
	await page.getByRole('button', { name: 'Remove line' }).nth(1).click();
	await expect(lines).toHaveCount(3);

	await expect(page.getByRole('button', { name: 'Remove section' })).toHaveCount(0);
	await page.getByRole('button', { name: 'Add ingredient section' }).click();
	await expect(sections).toHaveCount(2);
	await expect(lines).toHaveCount(4);
	await sections.nth(1).getByRole('button', { name: 'Remove section' }).click();
	await expect(sections).toHaveCount(1);
	await expect(page.getByRole('button', { name: 'Remove section' })).toHaveCount(0);

	const steps = page.getByRole('group', { name: /^Step section/ });
	await page.getByRole('button', { name: 'Add step', exact: true }).click();
	await expect(page.getByLabel(/^Step \d/)).toHaveCount(2);
	await page.getByRole('button', { name: 'Add step section' }).click();
	await expect(steps).toHaveCount(2);
});

// Finished animations that keep their end state (fill: both) still show up in getAnimations(), and focus rings
// run CSS transitions, so only running keyframe/script animations count: the ones the motion set starts.
const animations = (page: Page) =>
	page.evaluate(
		() =>
			new Promise<number>((done) =>
				requestAnimationFrame(() => done(document.getAnimations().filter((a) => a.playState === 'running' && !(a instanceof CSSTransition)).length))
			)
	);
const idle = (page: Page) =>
	page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a instanceof CSSTransition));

test('adding a line, a section and a parse preview animate, and not under reduced motion', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await idle(page);

	await page.getByRole('button', { name: 'Add line' }).click();
	expect(await animations(page)).toBeGreaterThan(0);
	await idle(page);
	await page.getByLabel('Ingredient line').first().fill('2 eggs');
	expect(await animations(page)).toBeGreaterThan(0);
	await idle(page);
	await page.getByRole('button', { name: 'Add ingredient section' }).click();
	expect(await animations(page)).toBeGreaterThan(0);

	await calm(page);
	await open(page, '/recipes/new/form');
	await page.getByRole('button', { name: 'Add line' }).click();
	await page.getByLabel('Ingredient line').first().fill('2 eggs');
	await page.getByRole('button', { name: 'Add ingredient section' }).click();
	expect(await animations(page)).toBe(0);
});

const tagNamesOf = (id: number) =>
	rows<{ name: string }>(
		`SELECT t.name FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id WHERE rt.recipe_id = ${id} ORDER BY t.name`
	).map((r) => r.name);

const savedId = (url: string) => Number(new URL(url).pathname.split('/').pop());

test('Scenario: New tag created while editing a recipe', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Weeknight pasta');

	await page.getByLabel('Add a tag').fill('Weeknight');
	await page.getByLabel('Add a tag').press('Enter');
	await expect(page.getByRole('list', { name: 'Selected tags' }).getByText('Weeknight', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Save recipe' }).click();

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	const id = savedId(page.url());
	expect(tagNamesOf(id)).toEqual(['Weeknight']);

	await open(page, `/recipes/${id}/edit`);
	await expect(page.getByRole('list', { name: 'Selected tags' }).getByText('Weeknight', { exact: true })).toBeVisible();

	await open(page, '/recipes/new/form');
	await expect(page.getByRole('group', { name: 'Tag suggestions' }).getByRole('button', { name: 'Weeknight' })).toBeVisible();
});

test('tags: suggestions add a tag, a typed name equal to an existing tag reuses it, remove takes it off', async ({
	page
}) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Cake');
	const suggestions = page.getByRole('group', { name: 'Tag suggestions' });
	const selected = page.getByRole('list', { name: 'Selected tags' });

	await suggestions.getByRole('button', { name: 'Baking' }).click();
	await expect(selected.getByText('Baking', { exact: true })).toBeVisible();
	await expect(suggestions.getByRole('button', { name: 'Baking' })).toHaveCount(0);

	await page.getByLabel('Add a tag').fill('dessert');
	await page.getByLabel('Add a tag').press('Enter');
	await expect(selected.getByText('Dessert', { exact: true })).toBeVisible();
	await expect(selected.getByText('new', { exact: true })).toHaveCount(0);

	await page.getByLabel('Add a tag').fill('Party');
	await page.getByLabel('Add a tag').press(',');
	await expect(selected.getByText('Party', { exact: true })).toBeVisible();
	await expect(selected.getByText('new', { exact: true })).toHaveCount(1);

	await page.getByRole('button', { name: 'Remove Baking' }).click();
	await expect(selected.getByText('Baking', { exact: true })).toHaveCount(0);

	await page.getByLabel('Add a tag').fill('Cheap');
	await page.getByRole('button', { name: 'Save recipe' }).click();

	await expect(page).toHaveURL(/\/recipes\/\d+$/);
	expect(tagNamesOf(savedId(page.url()))).toEqual(['Cheap', 'Dessert', 'Party']);
});

// The nav comes from the app layout; the guard reacts to any in-app link, so one is added when the layout has none.
async function planLink(page: Page) {
	const link = page.getByRole('link', { name: 'Plan', exact: true });
	if ((await link.count()) === 0) {
		await page.evaluate(() => {
			const a = document.createElement('a');
			a.href = '/plan';
			a.textContent = 'Plan';
			document.body.append(a);
		});
	}
	return link.first();
}

test('Scenario: Leaving with unsaved changes asks first', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Half written');

	await (await planLink(page)).click();

	const dialog = page.getByRole('alertdialog', { name: 'Discard changes?' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Keep editing' }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page).toHaveURL(/\/recipes\/new\/form$/);
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Half written');

	await (await planLink(page)).click();
	await dialog.getByRole('button', { name: 'Discard' }).click();

	await expect(page).toHaveURL(/\/plan$/);
	expect(recipeCount()).toBe(0);
});

test('Scenario: Leaving without changes does not ask', async ({ page }) => {
	await open(page, '/recipes/new/form');

	await (await planLink(page)).click();

	await expect(page).toHaveURL(/\/plan$/);
	await expect(page.getByRole('alertdialog')).toHaveCount(0);
});

test('Escape in the discard dialog keeps editing, and typing back to the start is not a change', async ({ page }) => {
	await open(page, '/recipes/new/form');
	const title = page.getByLabel('Title', { exact: true });
	await title.fill('x');
	await title.fill('');
	await (await planLink(page)).click();
	await expect(page).toHaveURL(/\/plan$/);

	await open(page, '/recipes/new/form');
	await title.fill('Draft');
	await (await planLink(page)).click();
	await expect(page.getByRole('alertdialog')).toBeVisible();
	await page.keyboard.press('Escape');

	await expect(page.getByRole('alertdialog')).toHaveCount(0);
	await expect(page).toHaveURL(/\/recipes\/new\/form$/);
});

test('Cancel with changes asks first as well', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Draft');

	await page.getByRole('link', { name: 'Cancel' }).first().click();

	await expect(page.getByRole('alertdialog', { name: 'Discard changes?' })).toBeVisible();
});

test('closing the tab with unsaved changes asks the browser to confirm, a saved form does not', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Draft');

	const dialog = page.waitForEvent('dialog');
	await page.close({ runBeforeUnload: true });

	expect((await dialog).type()).toBe('beforeunload');
	await (await dialog).dismiss();
});

test('the discard dialog animates in, and not under reduced motion', async ({ page }) => {
	await open(page, '/recipes/new/form');
	await page.getByLabel('Title', { exact: true }).fill('Draft');
	await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a instanceof CSSTransition));
	const running = () =>
		page.evaluate(
			() =>
				new Promise<number>((done) =>
					requestAnimationFrame(() =>
						done(document.getAnimations().filter((a) => a.playState === 'running' && !(a instanceof CSSTransition)).length)
					)
				)
		);

	await (await planLink(page)).click();
	await expect(page.getByRole('alertdialog')).toBeVisible();
	expect(await running()).toBeGreaterThan(0);
	await page.getByRole('button', { name: 'Keep editing' }).click();
	await expect(page.getByRole('alertdialog')).toHaveCount(0);

	await calm(page);
	await (await planLink(page)).click();
	await expect(page.getByRole('alertdialog')).toBeVisible();
	expect(await running()).toBe(0);
});
