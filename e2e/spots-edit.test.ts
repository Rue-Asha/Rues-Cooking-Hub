import { DatabaseSync } from 'node:sqlite';
import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function rows<T>(sql: string): T[] {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const out = db.prepare(sql).all() as T[];
	db.close();
	return out;
}

const stored = (id: number) =>
	rows<{ name: string; status: string; score_hundredths: number | null; city: string | null; price: number | null }>(
		`SELECT name, status, score_hundredths, city, price FROM spots WHERE id = ${id}`
	)[0];

const status = (page: Page, name: 'Want to go' | 'Visited') =>
	page.getByRole('group', { name: 'Status' }).getByRole('button', { name, exact: true });
const price = (page: Page, label: string) =>
	page.getByRole('group', { name: 'Price' }).getByRole('button', { name: label, exact: true });
const score = (page: Page) => page.getByLabel('Score', { exact: true });
const save = (page: Page) => page.getByRole('button', { name: 'Save spot' }).last().click();

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Spot edit changes are saved', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Old name', city: 'Hamburg', price: 1 }] });
	const id = spots[0];
	await open(page, `/eating-out/${id}/edit`);
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Old name');
	await expect(price(page, '€')).toHaveAttribute('aria-pressed', 'true');

	await page.getByLabel('Name', { exact: true }).fill('New name');
	await page.getByLabel('City').fill('Berlin');
	await price(page, '€€€').click();
	await save(page);

	await expect(page).toHaveURL(new RegExp(`/eating-out/${id}$`));
	await open(page, `/eating-out/${id}/edit`);
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('New name');
	await expect(page.getByLabel('City')).toHaveValue('Berlin');
	await expect(price(page, '€€€')).toHaveAttribute('aria-pressed', 'true');
	await expect(price(page, '€')).toHaveAttribute('aria-pressed', 'false');
});

test('Scenario: Switching to Want to go clears the score', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Scored', status: 'visited', scoreHundredths: 875 }] });
	const id = spots[0];
	await open(page, `/eating-out/${id}/edit`);
	await expect(score(page)).toHaveValue('8.75');

	await status(page, 'Want to go').click();
	await expect(score(page)).toHaveCount(0);
	await save(page);

	await expect(page).toHaveURL(new RegExp(`/eating-out/${id}$`));
	expect(stored(id)).toMatchObject({ status: 'want', score_hundredths: null });
	await open(page, `/eating-out/${id}/edit`);
	await expect(status(page, 'Want to go')).toHaveAttribute('aria-pressed', 'true');
	await status(page, 'Visited').click();
	await expect(score(page)).toHaveValue('');
});

test('Scenario: Switching to Visited requires a score', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Wishlist' }] });
	const id = spots[0];
	await open(page, `/eating-out/${id}/edit`);

	await status(page, 'Visited').click();
	await save(page);

	await expect(score(page)).toHaveAccessibleDescription('Visited spots need a score');
	await expect(page).toHaveURL(new RegExp(`/eating-out/${id}/edit$`));
	expect(stored(id)).toMatchObject({ status: 'want', score_hundredths: null });
});

test('Scenario: Editing a deleted spot answers 404', async ({ page, request, baseURL }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Gone soon' }] });
	const id = spots[0];
	await reset(request);

	const load = await page.goto(`/eating-out/${id}/edit`);
	expect(load!.status()).toBe(404);

	const action = await request.post(`/eating-out/${id}/edit`, {
		form: { name: 'Zombie', status: 'want' },
		headers: { origin: baseURL! }
	});
	expect(action.status()).toBe(404);
	expect(rows('SELECT id FROM spots')).toEqual([]);
});
