import { DatabaseSync } from 'node:sqlite';
import { expect, test, type Page } from '@playwright/test';
import { open, reset } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function spotCount(): number {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const n = (db.prepare('SELECT count(*) AS n FROM spots').get() as { n: number }).n;
	db.close();
	return n;
}

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

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Leaving the spot form with unsaved changes asks first', async ({ page }) => {
	await open(page, '/eating-out/new');
	await page.getByLabel('Name', { exact: true }).fill('Half written');

	await (await planLink(page)).click();

	const dialog = page.getByRole('alertdialog', { name: 'Discard changes?' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Keep editing' }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page).toHaveURL(/\/eating-out\/new$/);
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Half written');

	await (await planLink(page)).click();
	await dialog.getByRole('button', { name: 'Discard' }).click();

	await expect(page).toHaveURL(/\/plan$/);
	expect(spotCount()).toBe(0);
});

test('Scenario: Leaving the untouched spot form does not ask', async ({ page }) => {
	await open(page, '/eating-out/new');

	await (await planLink(page)).click();

	await expect(page).toHaveURL(/\/plan$/);
	await expect(page.getByRole('alertdialog')).toHaveCount(0);
});
