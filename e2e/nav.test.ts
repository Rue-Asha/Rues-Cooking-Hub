import { expect, test, type ElementHandle, type Page } from '@playwright/test';
import { calm, mainNav as nav, navPill, open } from './helpers.ts';

const paths = ['/', '/recipes', '/plan', '/list', '/eating-out'];
const labels = ['Home', 'Recipes', 'Plan', 'List', 'Eating Out'];

// the areas are still placeholders, so long-page checks bring their own content
async function makeLong(page: Page) {
	await page.getByRole('main').evaluate((main) => {
		const block = document.createElement('div');
		block.id = 'tall';
		block.style.blockSize = '2400px';
		block.style.background = 'var(--sand)';
		main.append(block);
	});
}

// both navs stay in the document, only the one for this width is shown
const bothNavs = (page: Page) => page.getByRole('navigation', { name: 'Main', includeHidden: true });

test('Scenario: Desktop shows the top pill nav', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop layout');
	for (const path of paths) {
		await open(page, path);
		await expect(nav(page)).toHaveCount(1);
		await expect(nav(page).getByRole('link')).toHaveText(labels);
		const box = (await nav(page).boundingBox())!;
		expect(box.y, path).toBeLessThan(40);
		await expect(bothNavs(page)).toHaveCount(2);
		const content = await page
			.getByRole('main')
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
		await expect(bothNavs(page)).toHaveCount(2);
	}
});

test('Scenario: Nav marks the open area', async ({ page }) => {
	await open(page, '/plan');
	const current = nav(page).locator('[aria-current="page"]');
	await expect(current).toHaveCount(1);
	await expect(current).toHaveText('Plan');
	await expect(page.locator('[aria-current="page"]')).toHaveCount(2);
	await expect(page.locator('[aria-current="page"]').filter({ hasNotText: 'Plan' })).toHaveCount(0);

	await open(page, '/eating-out');
	await expect(current).toHaveCount(1);
	await expect(current).toHaveText('Eating Out');
	await expect(page.locator('[aria-current="page"]')).toHaveCount(2);
	await expect(page.locator('[aria-current="page"]').filter({ hasNotText: 'Eating Out' })).toHaveCount(0);
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
		await expect(bothNavs(page)).toHaveCount(2);
		await expect(nav(page)).toBeVisible();
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
const barState = async (page: Page, scrollTo?: number) => {
	const links = nav(page).getByRole('link');
	const parts = {
		bar: await nav(page).elementHandle(),
		links: (await links.elementHandles()) as ElementHandle<HTMLElement>[],
		labels: await Promise.all(labels.map((label, i) => links.nth(i).getByText(label, { exact: true }).elementHandle())),
		icons: await Promise.all(labels.map((_, i) => links.nth(i).locator('svg').elementHandle())),
		pill: await navPill(nav(page)),
		marked: await nav(page).locator('[aria-current="page"]').elementHandle()
	};
	return page.evaluate(async ({ parts, scrollTo }) => {
		if (scrollTo !== undefined) {
			window.scrollTo(0, scrollTo);
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		}
		const marked = parts.marked!.getBoundingClientRect();
		const covered = parts.pill.getBoundingClientRect();
		return {
			width: parts.bar!.getBoundingClientRect().width,
			pill: Number(getComputedStyle(parts.pill).opacity) === 1 && Math.abs(covered.left - marked.left) < 1 && Math.abs(covered.width - marked.width) < 1,
			labels: parts.labels.map((l) => Number(getComputedStyle(l!).opacity)),
			offsets: parts.links.map((a, i) => {
				const icon = parts.icons[i]!.getBoundingClientRect();
				const link = a.getBoundingClientRect();
				return Math.abs(icon.top + icon.height / 2 - (link.top + link.height / 2));
			})
		};
	}, { parts, scrollTo });
};

const settled = (page: Page) => page.waitForFunction(() => document.getAnimations().length === 0);

for (const size of [
	{ width: 390, height: 844, narrower: true },
	{ width: 320, height: 640, narrower: false }
]) {
	test(`Scenario: Compact tab bar shows icons only (${size.width}px)`, async ({ page }, info) => {
		test.skip(info.project.name !== 'phone', 'tab bar layout, sets its own viewport');
		await page.setViewportSize(size);
		await open(page, '/recipes');
		await makeLong(page);
		const full = await barState(page);
		expect(full.labels).toEqual([1, 1, 1, 1, 1]);

		await page.evaluate(() => window.scrollTo(0, 200));
		await expect(nav(page)).toHaveAttribute('data-compact', '');
		await settled(page);
		const compact = await barState(page);
		if (size.narrower) expect(compact.width).toBeLessThan(full.width);
		else expect(compact.width).toBeLessThanOrEqual(full.width);
		expect(compact.labels).toEqual([0, 0, 0, 0, 0]);
		expect(compact.pill, 'the open area keeps its pill').toBe(true);
		for (const offset of compact.offsets) expect(offset).toBeLessThan(2);
		for (const label of labels) await expect(nav(page).getByRole('link', { name: label, exact: true })).toBeVisible();
		const fit = {
			list: await nav(page).getByRole('list').evaluate((l) => l.scrollWidth <= l.clientWidth),
			bar: await nav(page).evaluate((n) => n.scrollWidth <= n.clientWidth),
			small: await nav(page).getByRole('link').evaluateAll((as) => as.map((a) => a.getBoundingClientRect()).filter((r) => r.width < 44 || r.height < 44).length)
		};
		expect(fit).toEqual({ list: true, bar: true, small: 0 });

		await page.evaluate(() => window.scrollTo(0, 0));
		await expect(nav(page)).not.toHaveAttribute('data-compact');
		await settled(page);
		const back = await barState(page);
		expect(back.labels).toEqual([1, 1, 1, 1, 1]);
		expect(back.width).toBeCloseTo(full.width, 0);
	});
}

test('Scenario: Reduced motion shrinks the tab bar instantly', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'tab bar layout');
	await calm(page);
	await open(page, '/recipes');
	await makeLong(page);
	const full = await barState(page);
	const compact = await barState(page, 200);
	expect(compact.width).toBeLessThan(full.width);
	expect(compact.labels).toEqual([0, 0, 0, 0, 0]);
});
