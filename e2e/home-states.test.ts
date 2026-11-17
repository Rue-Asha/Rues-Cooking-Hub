import { expect, test, type Page } from '@playwright/test';
import { open, openNav, reset, seed, setToday } from './helpers.ts';

const WEDNESDAY = '2026-10-21';

test.beforeEach(async ({ request }) => {
	await reset(request);
	await setToday(request, WEDNESDAY);
});

test.afterEach(async ({ request }) => {
	await setToday(request, null);
});

const main = (page: Page) => page.getByRole('main');
const noScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const long = (word: string) => `${word} ${'long title '.repeat(11)}`.slice(0, 120);

test('Scenario: Home shows the today dashboard', async ({ page, request }) => {
	const { recipes } = await seed(request, {
		recipes: [
			{ title: 'Lasagne', image: true, favourite: true, favouritedAt: '2026-10-10T10:00:00.000Z', createdAt: '2026-10-06T10:00:00.000Z' },
			{ title: 'Soup', createdAt: '2026-10-05T10:00:00.000Z' },
			{ title: 'Tart', createdAt: '2026-10-04T10:00:00.000Z' },
			{ title: 'Curry', createdAt: '2026-10-03T10:00:00.000Z' },
			{ title: 'Salad', createdAt: '2026-10-02T10:00:00.000Z' },
			{ title: 'Pie', createdAt: '2026-10-01T10:00:00.000Z' }
		],
		entries: [{ date: WEDNESDAY, slot: 'dinner', recipe: 5, servings: 4 }],
		items: ['apples', 'bananas', 'milk', 'rice', 'soap'].map((name) => ({ name }))
	});
	for (const size of [
		{ width: 390, height: 844 },
		{ width: 1280, height: 800 }
	]) {
		await page.setViewportSize(size);
		await open(page, '/');

		await expect(main(page).getByRole('heading', { level: 1 })).toHaveText("What's cooking, Rue?");
		await expect(main(page).getByText('1 meal planned this week, 5 things to buy.')).toBeVisible();

		const hero = main(page).getByRole('article', { name: "Today's recipe" });
		await expect(hero.getByText('Tonight · Dinner')).toBeVisible();
		await expect(hero.getByRole('link', { name: 'Pie' })).toHaveAttribute('href', `/recipes/${recipes[5]}`);

		await expect(main(page).getByRole('region', { name: 'This week' }).getByRole('listitem')).toHaveCount(7);
		await expect(main(page).getByRole('link', { name: /^Shopping list/ }).getByRole('listitem')).toHaveText(['apples', 'bananas', 'milk']);
		await expect(main(page).getByRole('link', { name: /^Favourite/ })).toContainText('Lasagne');
		await expect(main(page).getByRole('region', { name: 'Recently added' }).getByRole('article')).toHaveCount(4);

		await expect(main(page).getByRole('heading', { level: 2 })).toHaveText(['Pie', 'This week', 'Shopping list', 'Favourite', 'Recently added']);
		expect(await noScroll(page)).toBe(true);
	}
});

test('Scenario: Nothing planned this week', async ({ page, request }) => {
	await seed(request, {
		recipes: [
			{ title: 'Old stew', createdAt: '2026-01-01T10:00:00.000Z' },
			{ title: 'Fresh salad', createdAt: '2026-10-01T10:00:00.000Z' }
		],
		items: [{ name: 'apples' }, { name: 'milk' }]
	});
	await open(page, '/');

	const hero = main(page).getByRole('article', { name: "Today's recipe" });
	await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Fresh salad');
	await expect(hero.getByRole('link', { name: 'Plan your day' })).toHaveAttribute('href', '/plan');
	const days = main(page).getByRole('region', { name: 'This week' }).getByRole('listitem');
	await expect(days).toHaveCount(7);
	await expect(days.filter({ hasText: 'Nothing planned' })).toHaveCount(7);
	await expect(main(page).getByText('0 meals planned this week, 2 things to buy.')).toBeVisible();
	expect(await noScroll(page)).toBe(true);
});

test('Scenario: Empty list and no favourite on Home', async ({ page, request }) => {
	await seed(request, { recipes: [{ title: 'Lemon tart' }] });
	await open(page, '/');

	const list = main(page).getByRole('link', { name: /^Shopping list/ });
	await expect(list.getByText('List is empty', { exact: true })).toBeVisible();
	await expect(list).toHaveAttribute('href', '/list');
	const fav = main(page).getByRole('link', { name: /^Favourite/ });
	await expect(fav.getByText('Tap the heart on a recipe to keep it here')).toBeVisible();
	await expect(fav).toHaveAttribute('href', '/recipes');
	expect(await noScroll(page)).toBe(true);
});

test('Scenario: No recipes shows the welcome state', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await open(page, '/');

	const welcome = main(page).getByRole('article', { name: 'Welcome' });
	await expect(welcome.getByRole('heading', { level: 2 })).toHaveText('Every recipe worth keeping, in one place');
	await expect(welcome.getByRole('link', { name: 'Add your first recipe' })).toHaveAttribute('href', '/recipes/new');
	await expect(page.getByRole('heading', { name: 'Recently added' })).toHaveCount(0);
	await expect(main(page).getByRole('link', { name: /^Favourite/ })).toContainText('Tap the heart on a recipe to keep it here');
	expect(await noScroll(page)).toBe(true);
});

test('Scenario: Long titles stay inside the dashboard', async ({ page, request }) => {
	const description = 'A very long description. '.repeat(24).slice(0, 600);
	const titles = ['Hero', 'Fav', 'One', 'Two', 'Three', 'Four'].map(long);
	await seed(request, {
		recipes: titles.map((title, i) => ({
			title,
			description,
			favourite: i === 1,
			favouritedAt: i === 1 ? '2026-10-10T10:00:00.000Z' : undefined,
			createdAt: `2026-10-0${6 - i}T10:00:00.000Z`
		})),
		entries: [{ date: WEDNESDAY, slot: 'dinner', recipe: 0, servings: 4 }]
	});
	for (const size of [
		{ width: 320, height: 640 },
		{ width: 768, height: 1024 },
		{ width: 1280, height: 800 }
	]) {
		await page.setViewportSize(size);
		await open(page, '/');

		const hero = main(page).getByRole('article', { name: "Today's recipe" });
		await expect(hero.getByRole('heading', { level: 2 })).toBeVisible();
		const favourite = main(page).getByRole('link', { name: /^Favourite/ });
		await expect(favourite).toContainText('Fav long title');
		// the hero's and the favourite's titles sit inside their own sections
		for (const [title, section] of [
			[hero.getByRole('heading', { level: 2 }), hero],
			[favourite.getByText(/Fav long title/), favourite]
		] as const) {
			const [t, b] = await Promise.all([title.boundingBox(), section.boundingBox()]);
			expect(t!.x, `${size.width}`).toBeGreaterThanOrEqual(b!.x - 1);
			expect(t!.x + t!.width, `${size.width}`).toBeLessThanOrEqual(b!.x + b!.width + 1);
			expect(t!.y, `${size.width}`).toBeGreaterThanOrEqual(b!.y - 1);
			expect(t!.y + t!.height, `${size.width}`).toBeLessThanOrEqual(b!.y + b!.height + 1);
		}
		const recent = main(page).getByRole('region', { name: 'Recently added' }).getByRole('article');
		await expect(recent).toHaveCount(4);
		for (const card of await recent.all()) {
			await expect(card.getByRole('heading', { level: 3 })).toBeVisible();
			const inside = await card.evaluate((el) => el.scrollWidth <= el.clientWidth);
			expect(inside).toBe(true);
		}
		expect(await noScroll(page)).toBe(true);
	}
});

test('Scenario: Top spots stay on the dashboard', async ({ page, request }) => {
	const { spots } = await seed(request, {
		recipes: [{ title: 'Lasagne' }, { title: 'Soup' }],
		spots: [
			{ name: 'Second', status: 'visited', scoreHundredths: 875 },
			{ name: 'First', status: 'visited', scoreHundredths: 950 },
			{ name: 'Third', status: 'visited', scoreHundredths: 850 }
		]
	});
	for (const size of [
		{ width: 390, height: 844 },
		{ width: 1280, height: 800 }
	]) {
		await page.setViewportSize(size);
		await open(page, '/');

		const section = main(page).getByRole('region', { name: 'Top spots' });
		const recent = await main(page).getByRole('region', { name: 'Recently added' }).boundingBox();
		const top = await section.boundingBox();
		expect(top!.y).toBeGreaterThan(recent!.y);
		const cards = section.getByRole('article');
		await expect(cards.getByRole('heading')).toHaveText(['First', 'Second', 'Third']);
		await expect(cards.first().getByRole('link', { name: 'First' })).toHaveAttribute('href', `/eating-out/${spots[1]}`);
		await expect(section.getByRole('link', { name: /All spots/ })).toHaveAttribute('href', '/eating-out');
	}
});

test('Leaving Home renders the next page', async ({ page, request }) => {
	await seed(request, { recipes: [{ title: 'Lasagne', image: true }], entries: [{ date: WEDNESDAY, slot: 'dinner', recipe: 0 }] });
	await open(page, '/');
	await expect(main(page).getByRole('article', { name: "Today's recipe" })).toBeVisible();
	for (const [name, heading] of [
		['Recipes', /^Recipes worth keeping$/],
		['Plan', /^This week$/],
		['List', /./],
		['Home', /^What's cooking, Rue\?$/]
	] as const) {
		await openNav(page, name);
		await expect(main(page).getByRole('heading', { level: 1 })).toHaveText(heading);
	}
	await expect(main(page).getByRole('article', { name: "Today's recipe" })).toBeVisible();
});
