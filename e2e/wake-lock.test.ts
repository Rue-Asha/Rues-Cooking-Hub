import { expect, test, type Page } from '@playwright/test';
import { open, openNav, reset, seed } from './helpers.ts';

type Wake = { requests: string[]; releases: number; sentinels: EventTarget[] };
const wake = (page: Page) => page.evaluate(() => {
	const w = (window as unknown as { wake: Wake }).wake;
	return { requests: w.requests, releases: w.releases };
});

// the stub keeps its record on window.wake; 'denied' rejects the way a browser does without permission
async function stub(page: Page, mode: 'granted' | 'denied' | 'missing') {
	await page.addInitScript((m) => {
		const record: Wake = { requests: [], releases: 0, sentinels: [] };
		(window as unknown as { wake: Wake }).wake = record;
		if (m === 'missing') {
			Object.defineProperty(navigator, 'wakeLock', { value: undefined, configurable: true });
			return;
		}
		Object.defineProperty(navigator, 'wakeLock', {
			configurable: true,
			value: {
				request: async (type: string) => {
					record.requests.push(type);
					if (m === 'denied') throw new DOMException('not allowed', 'NotAllowedError');
					const sentinel = new EventTarget();
					Object.assign(sentinel, {
						released: false,
						release: async () => {
							record.releases++;
							sentinel.dispatchEvent(new Event('release'));
						}
					});
					record.sentinels.push(sentinel);
					return sentinel;
				}
			}
		});
	}, mode);
}

function errors(page: Page) {
	const seen: string[] = [];
	page.on('pageerror', (e) => seen.push(e.message));
	page.on('console', (m) => m.type() === 'error' && seen.push(m.text()));
	return seen;
}

const recipe = { title: 'Pumpkin soup', ingredients: [{ title: null, lines: ['1 pumpkin'] }] };

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Recipe page requests a wake lock', async ({ page, request }) => {
	await stub(page, 'granted');
	const { recipes } = await seed(request, { recipes: [recipe] });
	await open(page, `/recipes/${recipes[0]}`);

	await expect.poll(() => wake(page)).toMatchObject({ requests: ['screen'] });
	expect((await wake(page)).requests).toHaveLength(1);
});

test('Scenario: Leaving the recipe page releases the wake lock', async ({ page, request }) => {
	await stub(page, 'granted');
	const { recipes } = await seed(request, { recipes: [recipe] });
	await open(page, `/recipes/${recipes[0]}`);
	await expect.poll(() => wake(page)).toMatchObject({ requests: ['screen'] });

	await openNav(page, 'Recipes');
	await expect(page).toHaveURL('/recipes');

	await expect.poll(() => wake(page)).toEqual({ requests: ['screen'], releases: 1 });
	// and nothing asks again once the page is gone, also after things have settled
	await page.evaluate(() => {
		Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
		document.dispatchEvent(new Event('visibilitychange'));
		Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
		document.dispatchEvent(new Event('visibilitychange'));
	});
	await page.evaluate(() => new Promise((done) => setTimeout(done, 500)));
	expect(await wake(page)).toEqual({ requests: ['screen'], releases: 1 });
});

test('Scenario: Wake lock is requested again after the page was hidden', async ({ page, request }) => {
	await stub(page, 'granted');
	const { recipes } = await seed(request, { recipes: [recipe] });
	await open(page, `/recipes/${recipes[0]}`);
	await expect.poll(() => wake(page)).toMatchObject({ requests: ['screen'] });

	await page.evaluate(() => {
		const w = (window as unknown as { wake: Wake }).wake;
		const state = (value: string) => {
			Object.defineProperty(document, 'visibilityState', { value, configurable: true });
			document.dispatchEvent(new Event('visibilitychange'));
		};
		state('hidden');
		for (const sentinel of w.sentinels) sentinel.dispatchEvent(new Event('release'));
		state('visible');
	});

	await expect.poll(() => wake(page).then((w) => w.requests)).toEqual(['screen', 'screen']);
});

test('Scenario: Missing wake lock API changes nothing', async ({ page, request }) => {
	await stub(page, 'missing');
	const seen = errors(page);
	const { recipes } = await seed(request, { recipes: [recipe] });
	await open(page, `/recipes/${recipes[0]}`);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pumpkin soup');
	await expect(page.getByRole('region', { name: 'Ingredients' })).toContainText('1 pumpkin');
	expect(seen).toEqual([]);
});

test('Scenario: Denied wake lock shows no error', async ({ page, request }) => {
	await stub(page, 'denied');
	const seen = errors(page);
	const { recipes } = await seed(request, { recipes: [recipe] });
	await open(page, `/recipes/${recipes[0]}`);
	await expect.poll(() => wake(page)).toMatchObject({ requests: ['screen'] });

	expect(seen).toEqual([]);
	await expect(page.getByRole('alert')).toHaveCount(0);
	await expect(page.getByRole('status')).toHaveCount(0);
});
