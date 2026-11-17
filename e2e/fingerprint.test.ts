import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: App renders with the accent', async ({ page }) => {
	const tokens = readFileSync('src/lib/styles/fingerprint/tokens.css', 'utf8');
	const hex = /:root\[data-accent="rosemary"\]\s*\{\s*--accent:\s*#([0-9A-Fa-f]{6})/.exec(tokens)![1];
	const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
	for (const path of ['/', '/recipes', '/eating-out']) {
		await open(page, path);
		expect(await page.evaluate(() => document.documentElement.dataset.accent)).toBe('rosemary');
		const accent = await page.evaluate(() => {
			const probe = document.createElement('i');
			probe.style.color = 'var(--accent)';
			document.body.append(probe);
			const colour = getComputedStyle(probe).color;
			probe.remove();
			return colour;
		});
		expect(accent).toBe(`rgb(${rgb.join(', ')})`);
	}
});

test('Scenario: App pages load nothing from other origins', async ({ page, request, baseURL }) => {
	const { recipes, spots } = await seed(request, {
		recipes: [{ title: 'Lasagne', image: true, tags: ['pasta'], ingredients: [{ title: null, lines: ['200 g pasta'] }], steps: [{ title: null, lines: ['Boil'] }] }],
		spots: [{ name: 'Trattoria', status: 'want', image: true }]
	});
	const origins = new Set<string>();
	page.on('request', (r) => {
		if (!r.url().startsWith('data:') && !r.url().startsWith('blob:')) origins.add(new URL(r.url()).origin);
	});
	for (const path of [
		'/',
		'/recipes',
		'/recipes/new',
		'/recipes/new/form',
		'/recipes/tags',
		`/recipes/${recipes[0]}`,
		`/recipes/${recipes[0]}/edit`,
		'/plan',
		'/list',
		'/eating-out',
		'/eating-out/new',
		`/eating-out/${spots[0]}`,
		`/eating-out/${spots[0]}/edit`
	]) {
		await open(page, path);
		await page.waitForLoadState('networkidle');
	}
	expect([...origins]).toEqual([new URL(baseURL!).origin]);
});

test('Scenario: Display and text fonts load from the app', async ({ page }) => {
	await open(page, '/');
	const fonts = await page.evaluate(async () => {
		await document.fonts.ready;
		return {
			loaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')),
			files: performance
				.getEntriesByType('resource')
				.map((e) => new URL(e.name).pathname)
				.filter((p) => p.startsWith('/fonts/'))
		};
	});

	expect(fonts.loaded).toEqual(expect.arrayContaining(['Gilda Display', 'DM Sans']));
	expect(fonts.files.length).toBeGreaterThan(0);
	for (const file of fonts.files) expect(file).toMatch(/^\/fonts\/fingerprint\//);
});

test('display titles break anywhere but never hyphenate', async ({ page }) => {
	await open(page, '/recipes');
	const style = await page.locator('h1').first().evaluate((h) => ({ hyphens: getComputedStyle(h).hyphens, wrap: getComputedStyle(h).overflowWrap }));
	expect(style).toEqual({ hyphens: 'manual', wrap: 'anywhere' });
});
