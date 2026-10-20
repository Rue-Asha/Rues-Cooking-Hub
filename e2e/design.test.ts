import { expect, test, type Page } from '@playwright/test';

// Unit 4 runs before e2e/helpers.ts exists on its branch, so it opens pages itself.
const screens = ['home', 'recipes', 'recipe', 'import', 'import-fallback', 'plan', 'list'];

async function open(page: Page, screen: string) {
	await page.goto(`/__mockups/${screen}`);
	await expect(page.locator('html[data-hydrated]')).toBeAttached();
	await page.evaluate(() => document.fonts.ready);
}

for (const screen of screens) {
	test.describe(`mockup ${screen}`, () => {
		test(`Scenario: Pages load no external resources (${screen})`, async ({ page, baseURL }) => {
			const origins = new Set<string>();
			page.on('request', (request) => {
				origins.add(new URL(request.url()).origin);
			});
			await open(page, screen);
			await page.waitForLoadState('networkidle');

			expect([...origins]).toEqual([new URL(baseURL!).origin]);
		});

		test(`Scenario: Display and text fonts load from the app (${screen})`, async ({ page }) => {
			await open(page, screen);
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

			expect(fonts.loaded).toEqual(expect.arrayContaining(['Fraunces', 'DM Sans']));
			expect(fonts.files).toEqual(
				expect.arrayContaining(['/fonts/fraunces-latin-opsz-normal.woff2', '/fonts/dm-sans-latin-opsz-normal.woff2'])
			);
		});

		test(`Scenario: Dark colour scheme preference changes nothing (${screen})`, async ({ page }) => {
			await open(page, screen);
			const colours = async (colorScheme: 'light' | 'dark') => {
				await page.emulateMedia({ colorScheme });
				return page.evaluate(() => {
					const body = getComputedStyle(document.body);
					return { background: body.backgroundColor, text: body.color, scheme: getComputedStyle(document.documentElement).colorScheme };
				});
			};

			const light = await colours('light');
			expect(await colours('dark')).toEqual(light);
			expect(light.scheme).toBe('light');
		});

		test(`Scenario: Controls are at least 44px on phone (${screen})`, async ({ page }, info) => {
			test.skip(info.project.name !== 'phone', 'the 44px rule is for phone');
			await open(page, screen);
			const small = await page.evaluate(() =>
				[...document.querySelectorAll('button, nav a')]
					.filter((el) => {
						const r = el.getBoundingClientRect();
						return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
					})
					.map((el) => {
						const r = el.getBoundingClientRect();
						return { control: el.outerHTML.slice(0, 120), width: Math.round(r.width), height: Math.round(r.height) };
					})
					.filter((c) => c.width < 44 || c.height < 44)
			);

			expect(small).toEqual([]);
		});

		test(`Scenario: Main screens share one alignment rule (${screen})`, async ({ page }) => {
			await open(page, screen);
			const m = await page.evaluate(() => {
				const left = (el: Element) => el.getBoundingClientRect().left;
				const visible = (el: Element) => el.getBoundingClientRect().width > 0;
				const columns = [...document.querySelectorAll('[data-column]')].filter(visible).map((el) => el.getBoundingClientRect());
				return {
					viewport: document.documentElement.clientWidth,
					columns: columns.map((c) => ({ left: c.left, right: c.right })),
					header: [...document.querySelectorAll('[data-page-header]')].filter(visible).map(left),
					sections: [...document.querySelectorAll('[data-section-heading]')].filter(visible).map(left)
				};
			});

			expect(m.columns.length).toBeGreaterThan(0);
			expect(m.header).toHaveLength(1);
			expect(m.sections.length).toBeGreaterThan(0);
			const [column] = m.columns;
			for (const c of m.columns) {
				expect(Math.abs(c.left - column.left)).toBeLessThanOrEqual(1);
				expect(Math.abs(c.right - column.right)).toBeLessThanOrEqual(1);
			}
			expect(Math.abs((column.left + column.right) / 2 - m.viewport / 2)).toBeLessThanOrEqual(1);
			expect(column.right - column.left).toBeLessThanOrEqual(1200);
			for (const x of [...m.header, ...m.sections]) expect(Math.abs(x - column.left)).toBeLessThanOrEqual(1);
		});
	});
}
