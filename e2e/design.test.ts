import { expect, test, type Page } from '@playwright/test';

const screens = ['home', 'recipes', 'recipe', 'import', 'import-fallback', 'plan', 'list', 'eating-out'];

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
			const controls = [...(await page.getByRole('button').all()), ...(await page.getByRole('navigation').getByRole('link').all())];
			const small: { control: string; width: number; height: number }[] = [];
			for (const control of controls) {
				const box = await control.boundingBox();
				if (!box || box.width === 0 || box.height === 0 || (await control.evaluate((el) => getComputedStyle(el).visibility)) === 'hidden') continue;
				if (box.width < 44 || box.height < 44) {
					small.push({ control: (await control.evaluate((el) => el.outerHTML)).slice(0, 120), width: Math.round(box.width), height: Math.round(box.height) });
				}
			}

			expect(small).toEqual([]);
		});

		test(`Scenario: Main screens share one alignment rule (${screen})`, async ({ page }) => {
			await open(page, screen);
			const viewport = await page.evaluate(() => document.documentElement.clientWidth);
			const boxes = async (selector: string) => {
				const found: { x: number; width: number }[] = [];
				for (const el of await page.locator(selector).all()) {
					const box = await el.boundingBox();
					if (box && box.width > 0) found.push(box);
				}
				return found;
			};
			const columns = await boxes('[data-column]');
			const header = await boxes('[data-page-header]');
			const sections = await boxes('[data-section-heading]');

			expect(columns.length).toBeGreaterThan(0);
			expect(header).toHaveLength(1);
			expect(sections.length).toBeGreaterThan(0);
			const [column] = columns;
			for (const c of columns) {
				expect(Math.abs(c.x - column.x)).toBeLessThanOrEqual(1);
				expect(Math.abs(c.x + c.width - (column.x + column.width))).toBeLessThanOrEqual(1);
			}
			expect(Math.abs(column.x + column.width / 2 - viewport / 2)).toBeLessThanOrEqual(1);
			expect(column.width).toBeLessThanOrEqual(1200);
			for (const h of [...header, ...sections]) expect(Math.abs(h.x - column.x)).toBeLessThanOrEqual(1);
		});
	});
}
