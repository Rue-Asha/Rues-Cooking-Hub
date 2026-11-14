import { DatabaseSync } from 'node:sqlite';
import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function stored(id: number) {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const row = db.prepare('SELECT status, score_hundredths AS score FROM spots WHERE id = ?').get(id) as {
		status: string;
		score: number | null;
	};
	db.close();
	return row;
}

const sheet = (page: Page) => page.getByRole('dialog', { name: 'Mark visited' });

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Mark visited from the spot page', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Later', city: 'Kiel' }] });
	await open(page, `/eating-out/${spots[0]}`);

	await page.getByRole('button', { name: 'Mark visited' }).click();
	await sheet(page).getByLabel('Score').fill('8,75');
	await sheet(page).getByRole('button', { name: 'Save' }).click();

	await expect(page.getByRole('main').getByText('8.75', { exact: true })).toBeVisible();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Mark visited' })).toHaveCount(0);
	expect(stored(spots[0])).toEqual({ status: 'visited', score: 875 });

	await open(page, '/eating-out?status=visited');
	await expect(page.getByRole('link', { name: /Later/ })).toBeVisible();
});

test('Scenario: Invalid score keeps the sheet open', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Later' }] });
	await open(page, `/eating-out/${spots[0]}`);

	await page.getByRole('button', { name: 'Mark visited' }).click();
	await sheet(page).getByLabel('Score').fill('abc');
	await sheet(page).getByRole('button', { name: 'Save' }).click();

	await expect(sheet(page).getByRole('alert')).toHaveText('Enter a score from 1.00 to 10.00, at most two decimals');
	await expect(sheet(page)).toBeVisible();
	expect(stored(spots[0])).toEqual({ status: 'want', score: null });
});

test('Scenario: Cancel leaves the spot unchanged', async ({ page, request }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Later' }] });
	await open(page, `/eating-out/${spots[0]}`);

	await page.getByRole('button', { name: 'Mark visited' }).click();
	await sheet(page).getByLabel('Score').fill('9');
	await sheet(page).getByRole('button', { name: 'Cancel' }).click();

	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Mark visited' })).toBeVisible();
	await page.reload();
	await expect(page.getByRole('button', { name: 'Mark visited' })).toBeVisible();
	expect(stored(spots[0])).toEqual({ status: 'want', score: null });
});

test('Scenario: Mark visited is refused for a spot that is already visited', async ({ request, baseURL }) => {
	const { spots } = await seed(request, { spots: [{ name: 'Done', status: 'visited', scoreHundredths: 875 }] });

	const action = await request.post(`/eating-out/${spots[0]}?/visit`, {
		form: { score: '5' },
		headers: { origin: baseURL! }
	});

	expect(action.status()).toBe(404);
	expect(stored(spots[0])).toEqual({ status: 'visited', score: 875 });
});
