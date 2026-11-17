import { expect, test, type Locator, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const list = (page: Page) => page.getByRole('list', { name: 'Recipes' });
const row = (page: Page, title: string) =>
	list(page)
		.getByRole('listitem')
		.filter({ has: page.getByRole('link', { name: title, exact: true }) });

test('Scenario: Rows show photo, title, description, time and tags', async ({ page, request }, info) => {
	await reset(request);
	const { recipes } = await seed(request, {
		recipes: [
			{
				title: 'Lemon tart',
				description: 'Sharp, silky and set in crisp pastry.',
				image: true,
				prepMinutes: 10,
				cookMinutes: 20,
				tags: ['Dessert', 'Baking']
			}
		]
	});
	await open(page, '/recipes');

	const c = row(page, 'Lemon tart');
	const img = c.getByRole('presentation');
	await expect(img).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(img).toBeVisible();
	expect(await img.evaluate(async (el: HTMLImageElement) => (await el.decode(), el.naturalWidth))).toBeGreaterThan(0);
	await expect(c.getByRole('link', { name: 'Lemon tart', exact: true })).toHaveAttribute('href', `/recipes/${recipes[0]}`);
	await expect(c.getByText('Sharp, silky and set in crisp pastry.')).toBeVisible();
	await expect(c.getByText('30 min', { exact: true })).toBeVisible();
	await expect(c.getByText('Baking', { exact: true })).toBeVisible();
	// the chips share one line with the time: on a phone the row is narrow and the one that does not fit gives way to "+1"
	if (info.project.name === 'phone') {
		const more = c.getByText('+1', { exact: true });
		await expect(more).toBeVisible();
		await expect(c.getByText('Dessert', { exact: true })).toBeHidden();
		// one meta line: the time, the tag and "+1" overlap vertically
		const [time, tag, plus] = await Promise.all(
			[c.getByText('30 min', { exact: true }), c.getByText('Baking', { exact: true }), more].map(async (l) => (await l.boundingBox())!)
		);
		for (const box of [tag, plus]) {
			expect(box.y, 'on the time line').toBeLessThan(time.y + time.height);
			expect(box.y + box.height, 'on the time line').toBeGreaterThan(time.y);
		}
	} else await expect(c.getByText('Dessert', { exact: true })).toBeVisible();
});

test('Scenario: Empty archive invites the first recipe', async ({ page, request }) => {
	await reset(request);
	await open(page, '/recipes');

	await expect(page.getByRole('link', { name: 'Add your first recipe' })).toHaveAttribute('href', '/recipes/new');
	await expect(list(page)).toHaveCount(0);
	await expect(page.getByRole('group', { name: 'Filter by tag' })).toHaveCount(0);
	await expect(page.getByRole('searchbox')).toHaveCount(0);
	await expect(page.getByText('Featured', { exact: true })).toHaveCount(0);
});

test('Scenario: Row without description shows title and meta', async ({ page, request }) => {
	await reset(request);
	await seed(request, { recipes: [{ title: 'Plain rice', cookMinutes: 15, tags: ['Side'] }] });
	await open(page, '/recipes');

	const c = row(page, 'Plain rice');
	await expect(c.getByRole('link', { name: 'Plain rice', exact: true })).toBeVisible();
	await expect(c.getByText('15 min', { exact: true })).toBeVisible();
	await expect(c.getByText('Side', { exact: true })).toBeVisible();
	await expect(c.getByRole('paragraph')).toHaveCount(0);
});

test('Scenario: Long titles and descriptions are clamped', async ({ page, request }) => {
	const title = 'Slow-roasted tomato and white bean stew with crispy sage, garlic breadcrumbs and a spoon of very green olive oil'.padEnd(120, '!');
	const description = 'A long, patient stew. '.repeat(28).slice(0, 600);
	await reset(request);
	await seed(request, { recipes: [{ title, description }] });
	await open(page, '/recipes');

	const c = row(page, title);
	const box = (part: Locator) =>
		part.evaluate((el) => ({
			height: el.getBoundingClientRect().height,
			line: parseFloat(getComputedStyle(el).lineHeight),
			clipped: el.scrollHeight > el.clientHeight
		}));
	const heading = await box(c.getByRole('heading'));
	const desc = await box(c.getByRole('paragraph'));

	expect(heading.height).toBeLessThanOrEqual(2 * heading.line + 1);
	expect(heading.clipped).toBe(true);
	expect(desc.height).toBeLessThanOrEqual(2 * desc.line + 1);
	expect(desc.clipped).toBe(true);
});

test('Scenario: Row without image shows the plate', async ({ page, request }) => {
	await reset(request);
	await seed(request, { recipes: [{ title: 'Pea soup' }] });
	await open(page, '/recipes');

	const c = row(page, 'Pea soup');
	await expect(c.getByRole('img', { name: 'No photo yet' })).toBeVisible();
	await expect(c.getByRole('presentation')).toHaveCount(0);
});

test('Scenario: Recipe without times shows no time in its row', async ({ page, request }) => {
	await reset(request);
	await seed(request, { recipes: [{ title: 'Toast', tags: ['Breakfast'] }, { title: 'Porridge', cookMinutes: 5 }] });
	await open(page, '/recipes');

	await expect(row(page, 'Porridge').getByText('5 min', { exact: true })).toBeVisible();
	await expect(row(page, 'Toast').getByText(/\d+ min/)).toHaveCount(0);
});

test('Scenario: Favourite toggles on a card', async ({ page, request }) => {
	await reset(request);
	await seed(request, { recipes: [{ title: 'Lemon tart' }, { title: 'Pea soup' }] });
	await open(page, '/recipes');
	const heart = () => row(page, 'Lemon tart').getByRole('button', { name: /favourites/ });
	await expect(heart()).toHaveAttribute('aria-pressed', 'false');

	const saved = page.waitForResponse((r) => r.url().endsWith('/favourite') && r.request().method() === 'POST');
	await heart().click();
	await expect(heart()).toHaveAttribute('aria-pressed', 'true');
	expect((await saved).ok()).toBe(true);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(heart()).toHaveAttribute('aria-pressed', 'true');
	await expect(row(page, 'Pea soup').getByRole('button', { name: /favourites/ })).toHaveAttribute('aria-pressed', 'false');

	const cleared = page.waitForResponse((r) => r.url().endsWith('/favourite') && r.request().method() === 'POST');
	await heart().click();
	await expect(heart()).toHaveAttribute('aria-pressed', 'false');
	expect((await cleared).ok()).toBe(true);
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(heart()).toHaveAttribute('aria-pressed', 'false');
});
