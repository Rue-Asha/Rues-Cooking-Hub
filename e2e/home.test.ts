import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, setToday } from './helpers.ts';

const MONDAY = '2026-10-19';
const WEDNESDAY = '2026-10-21';
const THURSDAY = '2026-10-22';

test.beforeEach(async ({ request }) => {
	await reset(request);
	await setToday(request, WEDNESDAY);
});

const main = (page: Page) => page.getByRole('main');
const tile = (page: Page, name: 'hero' | 'week' | 'list' | 'favourite') =>
	name === 'hero'
		? main(page).getByRole('article', { name: /^(Today's recipe|Welcome)$/ })
		: name === 'week'
			? main(page).getByRole('region', { name: 'This week' })
			: main(page).getByRole('link', { name: name === 'list' ? /^Shopping list/ : /^Favourite/ });

test("Scenario: Hero shows today's planned recipe", async ({ page, request }) => {
	const { recipes } = await seed(request, {
		recipes: [{ title: 'Lasagne', image: true, cookMinutes: 50 }, { title: 'Soup' }],
		entries: [
			{ date: WEDNESDAY, slot: 'lunch', recipe: 1, servings: 2 },
			{ date: WEDNESDAY, slot: 'dinner', recipe: 0, servings: 4 }
		]
	});
	await open(page, '/');

	const hero = tile(page, 'hero');
	await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Lasagne');
	await expect(hero.getByRole('presentation')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(hero.getByText('Tonight · Dinner')).toBeVisible();
	await expect(hero.getByRole('link', { name: 'Lasagne' })).toHaveAttribute('href', `/recipes/${recipes[0]}`);

	await hero.getByRole('link', { name: 'Lasagne' }).click();
	await expect(page).toHaveURL(`/recipes/${recipes[0]}`);
	await expect(page.getByRole('heading', { level: 1, name: 'Lasagne' })).toBeVisible();
});

test('Scenario: Nothing planned today shows the newest recipe', async ({ page, request }) => {
	const { recipes } = await seed(request, {
		recipes: [
			{ title: 'Old stew', createdAt: '2026-01-01T10:00:00.000Z' },
			{ title: 'Fresh salad', createdAt: '2026-10-01T10:00:00.000Z' }
		],
		entries: [
			{ date: WEDNESDAY, slot: 'dinner', text: 'Eat out' },
			{ date: MONDAY, slot: 'dinner', recipe: 0, servings: 2 }
		]
	});
	await open(page, '/');

	const hero = tile(page, 'hero');
	await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Fresh salad');
	await expect(hero.getByRole('link', { name: 'Fresh salad' })).toHaveAttribute('href', `/recipes/${recipes[1]}`);
	await expect(hero.getByRole('link', { name: 'Plan your day' })).toHaveAttribute('href', '/plan');

	await hero.getByRole('link', { name: 'Plan your day' }).click();
	await expect(page).toHaveURL('/plan');
});

test('Scenario: Empty archive shows the welcome hero', async ({ page }) => {
	await open(page, '/');

	const hero = tile(page, 'hero');
	await expect(hero.getByRole('heading', { level: 2 })).toBeVisible();
	await expect(hero.getByRole('link', { name: 'Add your first recipe' })).toHaveAttribute('href', '/recipes/new');
	await expect(hero.getByRole('presentation')).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Recently added' })).toHaveCount(0);
});

test('Scenario: This week lists the seven days', async ({ page, request }) => {
	await seed(request, {
		recipes: [{ title: 'Pumpkin soup', image: true }],
		entries: [
			{ date: MONDAY, slot: 'dinner', recipe: 0, servings: 2 },
			{ date: THURSDAY, slot: 'lunch', text: 'Leftover curry' },
			{ date: '2026-10-26', slot: 'lunch', text: 'Next week' }
		]
	});
	await open(page, '/');

	const week = tile(page, 'week');
	await expect(week.getByRole('link')).toHaveAttribute('href', '/plan');
	await expect(week.getByRole('heading', { level: 2 })).toHaveText('This week');
	const days = week.getByRole('listitem');
	await expect(days).toHaveCount(7);
	await expect(days).toContainText(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
	const monday = days.filter({ hasText: 'Mon' });
	await expect(monday.getByText('Pumpkin soup', { exact: true })).toBeVisible();
	await expect(monday.getByRole('presentation')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(days.filter({ hasText: 'Thu' }).getByText('Leftover curry', { exact: true })).toBeVisible();
	await expect(days.filter({ hasText: 'Nothing planned' })).toHaveCount(5);
	await expect(days.filter({ hasText: 'Wed' })).toHaveAttribute('aria-current', 'date');
	await expect(week).not.toContainText('Next week');

	await week.getByRole('link').click();
	await expect(page).toHaveURL('/plan');
});

test('Scenario: Shopping list shows open count and first items', async ({ page, request }) => {
	await seed(request, {
		items: [
			{ name: 'apples', category: 'produce' },
			{ name: 'bananas', category: 'produce' },
			{ name: 'milk', category: 'dairy-eggs' },
			{ name: 'rice', category: 'pantry' },
			{ name: 'soap', category: 'household' },
			{ name: 'carrots', category: 'produce', checked: true }
		]
	});
	await open(page, '/');

	const list = tile(page, 'list');
	await expect(list).toHaveAttribute('href', '/list');
	await expect(list.getByText('5 open')).toBeVisible();
	await expect(list.getByRole('listitem', { includeHidden: true })).toHaveText(['apples', 'bananas', 'milk']);
	await expect(list).not.toContainText('carrots');

	await list.click();
	await expect(page).toHaveURL('/list');
});

test('Scenario: Empty list says List is empty', async ({ page, request }) => {
	await seed(request, { items: [{ name: 'carrots', checked: true }] });
	await open(page, '/');

	const list = tile(page, 'list');
	await expect(list.getByText('List is empty', { exact: true })).toBeVisible();
	await expect(list.getByRole('listitem')).toHaveCount(0);
	await expect(list).toHaveAttribute('href', '/list');
});

test('Scenario: Favourite shows the most recently favourited recipe', async ({ page, request }) => {
	const { recipes } = await seed(request, {
		recipes: [
			{ title: 'Lemon tart', favourite: true, favouritedAt: '2026-10-10T10:00:00.000Z' },
			{ title: 'Tomato soup', favourite: true, favouritedAt: '2026-10-02T10:00:00.000Z', image: true }
		]
	});
	await open(page, '/');

	const fav = tile(page, 'favourite');
	await expect(fav.getByText('Lemon tart', { exact: true })).toBeVisible();
	await expect(fav).not.toContainText('Tomato soup');
	await expect(fav).toHaveAttribute('href', `/recipes/${recipes[0]}`);

	await fav.click();
	await expect(page).toHaveURL(`/recipes/${recipes[0]}`);
});

test('Scenario: No favourites invites to favourite', async ({ page, request }) => {
	await seed(request, { recipes: [{ title: 'Lemon tart' }] });
	await open(page, '/');

	await expect(tile(page, 'favourite').getByText('Tap the heart on a recipe to keep it here')).toBeVisible();
});

const named = (page: Page, name: string) =>
	page.evaluate((n) => [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName === n).length, name);

test('Home carries each recipe hero name once, on the hero photo first', async ({ page, request }) => {
	const { recipes } = await seed(request, {
		recipes: [{ title: 'Lasagne', image: true, favourite: true, favouritedAt: '2026-10-10T10:00:00.000Z' }],
		entries: [{ date: WEDNESDAY, slot: 'dinner', recipe: 0, servings: 2 }]
	});
	await open(page, '/');

	expect(await named(page, `recipe-hero-${recipes[0]}`)).toBe(1);
	const inHero = await tile(page, 'hero').evaluate(
		(el, n) => [...el.querySelectorAll('*')].some((c) => getComputedStyle(c).viewTransitionName === n),
		`recipe-hero-${recipes[0]}`
	);
	expect(inHero).toBe(true);
	await expect(page.getByRole('heading', { name: 'Recently added' })).toBeVisible();
});
