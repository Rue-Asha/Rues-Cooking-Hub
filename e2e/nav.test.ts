import { expect, test, type Page } from '@playwright/test';
import { calm, open } from './helpers.ts';

const paths = ['/', '/recipes', '/plan', '/list'];
const labels = ['Home', 'Recipes', 'Plan', 'List'];

// the areas are still placeholders, so long-page checks bring their own content
async function makeLong(page: Page) {
	await page.evaluate(() => {
		const block = document.createElement('div');
		block.id = 'tall';
		block.style.blockSize = '2400px';
		block.style.background = 'var(--sand)';
		document.querySelector('main')!.append(block);
	});
}

const nav = (page: Page) => page.getByRole('navigation', { name: 'Main' });

test('Scenario: Desktop shows the top pill nav', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop layout');
	for (const path of paths) {
		await open(page, path);
		await expect(nav(page)).toHaveCount(1);
		await expect(nav(page).getByRole('link')).toHaveText(labels);
		const box = (await nav(page).boundingBox())!;
		expect(box.y, path).toBeLessThan(40);
		await expect(page.locator('[data-nav="bar"]')).toBeHidden();
		await expect(page.locator('[data-nav="top"]')).toBeVisible();
		const content = await page
			.locator('main')
			.first()
			.evaluate((m) => m.getBoundingClientRect().top + parseFloat(getComputedStyle(m).paddingTop));
		expect(content, `${path} content starts below the nav`).toBeGreaterThan(box.y + box.height);
	}
});

test('Scenario: Phone shows the bottom tab bar', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	const height = page.viewportSize()!.height;
	for (const path of paths) {
		await open(page, path);
		await expect(nav(page)).toHaveCount(1);
		await expect(nav(page).getByRole('link')).toHaveText(labels);
		const box = (await nav(page).boundingBox())!;
		expect(box.y + box.height, path).toBeGreaterThan(height - 40);
		expect(box.y + box.height, path).toBeLessThanOrEqual(height);
		await expect(page.locator('[data-nav="top"]')).toBeHidden();
		await expect(page.locator('[data-nav="bar"]')).toBeVisible();
	}
});

test('Scenario: Nav marks the open area', async ({ page }) => {
	await open(page, '/plan');
	const current = nav(page).locator('[aria-current="page"]');
	await expect(current).toHaveCount(1);
	await expect(current).toHaveText('Plan');
	await expect(page.locator('[aria-current]')).toHaveCount(2);
	await expect(page.locator('[aria-current]').filter({ hasNotText: 'Plan' })).toHaveCount(0);
});

for (const size of [
	{ width: 768, height: 1024 },
	{ width: 844, height: 390 }
]) {
	test(`Scenario: Tablet and phone landscape use one layout without overlap (${size.width}x${size.height})`, async ({
		page
	}, info) => {
		test.skip(info.project.name !== 'phone', 'sets its own viewport');
		await page.setViewportSize(size);
		await open(page, '/recipes');
		await makeLong(page);
		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
		await expect(nav(page)).toHaveCount(1);
		const visible = await page.locator('[data-nav]').evaluateAll((els) => els.filter((e) => e.checkVisibility()).length);
		expect(visible).toBe(1);
		await expect(page.locator('[data-nav="bar"]')).toBeVisible();
		await expect
			.poll(() => page.evaluate(() => window.scrollY + innerHeight >= document.documentElement.scrollHeight - 1))
			.toBe(true);
		const last = (await page.locator('#tall').boundingBox())!;
		const bar = (await nav(page).boundingBox())!;
		expect(last.y + last.height).toBeLessThanOrEqual(bar.y);
	});
}

test('Scenario: Nav shrinks on scroll', async ({ page }) => {
	await open(page, '/recipes');
	await makeLong(page);
	await expect(nav(page)).not.toHaveAttribute('data-compact');
	await page.evaluate(() => window.scrollTo(0, 200));
	await expect(nav(page)).toHaveAttribute('data-compact', '');
	await page.evaluate(() => window.scrollTo(0, 0));
	await expect(nav(page)).not.toHaveAttribute('data-compact');
});

// scrolls first when asked, then measures two frames later
const barState = (page: Page, scrollTo?: number) =>
	nav(page).evaluate(async (n, scrollTo) => {
		if (scrollTo !== undefined) {
			window.scrollTo(0, scrollTo);
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		}
		const links = [...n.querySelectorAll('a')];
		const pill = n.querySelector<HTMLElement>('.pill')!;
		const marked = n.querySelector('[aria-current="page"]')!.getBoundingClientRect();
		const covered = pill.getBoundingClientRect();
		return {
			width: n.getBoundingClientRect().width,
			pill: Number(getComputedStyle(pill).opacity) === 1 && Math.abs(covered.left - marked.left) < 1 && Math.abs(covered.width - marked.width) < 1,
			labels: links.map((a) => Number(getComputedStyle(a.querySelector('span')!).opacity)),
			offsets: links.map((a) => {
				const icon = a.querySelector('svg')!.getBoundingClientRect();
				const link = a.getBoundingClientRect();
				return Math.abs(icon.top + icon.height / 2 - (link.top + link.height / 2));
			})
		};
	}, scrollTo);

const settled = (page: Page) => page.waitForFunction(() => document.getAnimations().length === 0);

test('Scenario: Compact tab bar shows icons only', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'tab bar layout');
	await open(page, '/recipes');
	await makeLong(page);
	const full = await barState(page);
	expect(full.labels).toEqual([1, 1, 1, 1]);

	await page.evaluate(() => window.scrollTo(0, 200));
	await expect(nav(page)).toHaveAttribute('data-compact', '');
	await settled(page);
	const compact = await barState(page);
	expect(compact.width).toBeLessThan(full.width * 0.75);
	expect(compact.labels).toEqual([0, 0, 0, 0]);
	expect(compact.pill, 'the open area keeps its pill').toBe(true);
	for (const offset of compact.offsets) expect(offset).toBeLessThan(2);
	for (const label of labels) await expect(nav(page).getByRole('link', { name: label, exact: true })).toBeVisible();

	await page.evaluate(() => window.scrollTo(0, 0));
	await expect(nav(page)).not.toHaveAttribute('data-compact');
	await settled(page);
	const back = await barState(page);
	expect(back.labels).toEqual([1, 1, 1, 1]);
	expect(back.width).toBeCloseTo(full.width, 0);
});

test('Scenario: Reduced motion shrinks the tab bar instantly', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'tab bar layout');
	await calm(page);
	await open(page, '/recipes');
	await makeLong(page);
	const full = await barState(page);
	const compact = await barState(page, 200);
	expect(compact.width).toBeLessThan(full.width * 0.75);
	expect(compact.labels).toEqual([0, 0, 0, 0]);
});
