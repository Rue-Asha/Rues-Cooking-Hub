import { expect, test, type Page } from '@playwright/test';
import { calm, open } from './helpers.ts';

type Counted = { transitions: number };

async function countTransitions(page: Page) {
	await page.addInitScript(() => {
		const w = window as unknown as Counted;
		w.transitions = 0;
		const start = document.startViewTransition?.bind(document);
		if (!start) return;
		document.startViewTransition = ((...args: Parameters<typeof start>) => {
			w.transitions++;
			return start(...args);
		}) as typeof document.startViewTransition;
	});
}

const transitions = (page: Page) => page.evaluate(() => (window as unknown as Counted).transitions);

async function goVia(page: Page, label: string, path: string) {
	await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label }).click();
	await expect(page).toHaveURL(path);
	await expect(page.getByRole('navigation', { name: 'Main' }).locator('[aria-current="page"]')).toHaveText(label);
}

test('Scenario: Area change uses a view transition', async ({ page }) => {
	await countTransitions(page);
	await open(page, '/');
	await goVia(page, 'Recipes', '/recipes');
	expect(await transitions(page)).toBe(1);
});

test('Scenario: Browser without View Transitions navigates instantly', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	await page.addInitScript(() => {
		delete (Document.prototype as Partial<Document>).startViewTransition;
	});
	await open(page, '/');
	expect(await page.evaluate(() => document.startViewTransition)).toBeUndefined();
	await goVia(page, 'Plan', '/plan');
	expect(errors).toEqual([]);
});

test('Scenario: Reduced motion skips the page transition', async ({ page }) => {
	await calm(page);
	await countTransitions(page);
	await open(page, '/');
	await goVia(page, 'List', '/list');
	expect(await transitions(page)).toBe(0);
});

test('Navigation inside one area skips the page transition', async ({ page }) => {
	await countTransitions(page);
	await open(page, '/recipes');
	await page.evaluate(() => {
		const link = document.createElement('a');
		link.href = '/recipes?sort=title';
		link.textContent = 'Sort by title';
		document.querySelector('main')!.append(link);
	});
	await page.getByRole('link', { name: 'Sort by title' }).click();
	await expect(page).toHaveURL('/recipes?sort=title');
	expect(await transitions(page)).toBe(0);
});
