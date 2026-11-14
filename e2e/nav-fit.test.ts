import { expect, test, type ElementHandle, type Page } from '@playwright/test';
import { mainNav as nav, navDivider, navPill, open } from './helpers.ts';

const labels = ['Home', 'Recipes', 'Plan', 'List', 'Eating Out'];
const dividerOf = (page: Page) => navDivider(nav(page));

test('Scenario: Divider sits between List and Eating Out', async ({ page }) => {
	await open(page, '/plan');
	const links = nav(page).getByRole('link');
	await expect(links).toHaveCount(5);
	const divider = dividerOf(page);
	await expect(nav(page).getByRole('listitem', { includeHidden: true })).toHaveCount(6);
	await expect(divider).toHaveAttribute('aria-hidden', 'true');
	await expect(divider.getByRole('link', { includeHidden: true })).toHaveCount(0);
	await expect(divider.getByRole('button', { includeHidden: true })).toHaveCount(0);
	await expect(divider).not.toHaveAttribute('tabindex');
	await expect(divider).toBeEmpty();
	const [list, mid, out] = await Promise.all([
		links.nth(3).boundingBox(),
		divider.boundingBox(),
		links.nth(4).boundingBox()
	]);
	expect(mid!.x, 'after List').toBeGreaterThanOrEqual(list!.x + list!.width - 1);
	expect(mid!.x + mid!.width, 'before Eating Out').toBeLessThanOrEqual(out!.x + 1);
	await links.nth(3).focus();
	await page.keyboard.press('Tab');
	await expect(links.nth(4)).toBeFocused();
});

test('Scenario: Active pill lands on Eating Out', async ({ page }) => {
	await open(page, '/eating-out');
	const pillMatches = async () => {
		const pill = (await (await navPill(nav(page))).boundingBox())!;
		const marked = nav(page).locator('[aria-current="page"]');
		const link = (await marked.boundingBox())!;
		return { left: Math.abs(pill.x - link.x), width: Math.abs(pill.width - link.width), text: await marked.textContent() };
	};
	await expect.poll(async () => (await pillMatches()).left).toBeLessThan(1);
	const state = await pillMatches();
	expect(state.width).toBeLessThan(1);
	expect(state.text).toContain('Eating Out');
});

test('Scenario: Active pill lands on Eating Out, scrolled', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'tab bar layout');
	await open(page, '/eating-out');
	await page.getByRole('main').evaluate((main) => {
		const block = document.createElement('div');
		block.style.blockSize = '2400px';
		main.append(block);
		window.scrollTo(0, 200);
	});
	await expect(nav(page)).toHaveAttribute('data-compact', '');
	await page.waitForFunction(() => document.getAnimations().length === 0);
	const pill = (await (await navPill(nav(page))).boundingBox())!;
	const link = (await nav(page).locator('[aria-current="page"]').boundingBox())!;
	const d = [Math.abs(pill.x - link.x), Math.abs(pill.width - link.width)];
	expect(d[0]).toBeLessThan(1);
	expect(d[1]).toBeLessThan(1);
});

for (const size of [
	{ width: 390, height: 844 },
	{ width: 320, height: 640 }
]) {
	test(`Scenario: Five labels fit the phone tab bar (${size.width}px)`, async ({ page }, info) => {
		test.skip(info.project.name !== 'phone', 'tab bar layout, sets its own viewport');
		await page.setViewportSize(size);
		await open(page, '/eating-out');
		const links = nav(page).getByRole('link');
		const m = await page.evaluate(
			({ list, links, spans }) => {
				const rects = links.map((a) => a.getBoundingClientRect());
				return {
					list: [list!.scrollWidth, list!.clientWidth],
					doc: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
					labels: links.map((a, i) => [spans[i]!.scrollWidth, a.clientWidth, spans[i]!.textContent]),
					overlap: rects.some((r, i) => i > 0 && r.left < rects[i - 1].right - 0.5),
					small: rects.filter((r) => r.width < 44 || r.height < 44).length,
					widths: rects.map((r) => Math.round(r.width * 10) / 10)
				};
			},
			{
				list: await nav(page).getByRole('list').elementHandle(),
				links: (await links.elementHandles()) as ElementHandle<HTMLElement>[],
				spans: await Promise.all(labels.map((label, i) => links.nth(i).getByText(label, { exact: true }).elementHandle()))
			}
		);
		console.log(JSON.stringify(m));
		expect(m.list[0]).toBeLessThanOrEqual(m.list[1]);
		expect(m.doc[0]).toBeLessThanOrEqual(m.doc[1]);
		for (const [label, link, text] of m.labels) expect(label, String(text)).toBeLessThanOrEqual(link as number);
		expect(m.overlap).toBe(false);
		expect(m.small).toBe(0);
	});
}

test('mockup nav shows Eating Out after the divider', async ({ page }) => {
	await open(page, '/__mockups/home');
	await expect(nav(page).getByRole('link')).toHaveText(labels);
	await expect(nav(page).getByRole('listitem', { includeHidden: true })).toHaveCount(6);
	const links = nav(page).getByRole('link');
	const divider = dividerOf(page);
	const [list, mid, out] = await Promise.all([links.nth(3).boundingBox(), divider.boundingBox(), links.nth(4).boundingBox()]);
	expect(mid!.x).toBeGreaterThanOrEqual(list!.x + list!.width - 1);
	expect(mid!.x + mid!.width).toBeLessThanOrEqual(out!.x + 1);
});
