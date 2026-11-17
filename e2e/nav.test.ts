import { expect, test, type Page } from '@playwright/test';
import { makeLong, mainNav as nav, open, phoneBar, reset, seed, topBar } from './helpers.ts';

const labels = ['Home', 'Recipes', 'Plan', 'List', 'Eating Out'];
const phoneLabels = ['Home', 'Recipes', 'Plan', 'List', 'Spots'];

const view = (page: Page, width: number, height: number) => page.setViewportSize({ width, height });

// the two navs stay in the document, only the one for this width is shown
const bothNavs = (page: Page) => page.getByRole('navigation', { name: 'Main', includeHidden: true });

test('Scenario: One Main navigation at every width', async ({ page }) => {
	for (const [width, height] of [
		[320, 640],
		[390, 844],
		[768, 1024],
		[844, 390],
		[1024, 768],
		[1280, 800]
	]) {
		await view(page, width, height);
		await open(page, '/plan');
		await expect(nav(page), `${width}`).toHaveCount(1);
		await expect(nav(page).locator('[aria-current="page"]'), `${width}`).toHaveCount(1);
		await expect(nav(page).locator('[aria-current="page"]')).toHaveAccessibleName('Plan');
		await expect(bothNavs(page)).toHaveCount(2);
		const desktop = width >= 1024;
		await expect(topBar(page), `${width} top bar`).toBeVisible({ visible: desktop });
		await expect(phoneBar(page), `${width} phone bar`).toBeVisible({ visible: !desktop });
	}
});

test('Scenario: Navigation reports the scrolled state', async ({ page }) => {
	for (const [width, height] of [
		[390, 844],
		[1280, 800]
	]) {
		await view(page, width, height);
		await open(page, '/recipes');
		await makeLong(page);
		await expect(nav(page)).not.toHaveAttribute('data-compact');
		await page.evaluate(() => window.scrollTo(0, 200));
		await expect(nav(page)).toHaveAttribute('data-compact', '');
		for (const label of width >= 1024 ? labels : phoneLabels)
			await expect(nav(page).getByRole('link', { name: label, exact: true })).toBeVisible();
		await page.evaluate(() => window.scrollTo(0, 0));
		await expect(nav(page)).not.toHaveAttribute('data-compact');
		await expect(nav(page).getByRole('link', { name: width >= 1024 ? 'Eating Out' : 'Spots', exact: true })).toBeVisible();
	}
});

const surface = (page: Page, token: string) =>
	page.evaluate((token) => {
		const probe = document.createElement('div');
		probe.style.background = `var(${token})`;
		document.body.append(probe);
		const colour = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return colour;
	}, token);

// the page's own load motion (the cards settling, the pill taking over the current item) ends before the scroll
const still = (page: Page) => page.waitForFunction(() => document.getAnimations().length === 0);

// everything still running in the document once a scroll has settled: two frames for the scroll and its state change
const settled = (page: Page) =>
	page.evaluate(async () => {
		for (let i = 0; i < 2; i++) await new Promise(requestAnimationFrame);
		return document
			.getAnimations()
			.map((a) => `${(a as CSSTransition).transitionProperty ?? (a as CSSAnimation).animationName} on ${(a.effect as KeyframeEffect).target?.tagName}`);
	});

// the moment the scrolled state lands (watched from before the scroll, every frame): a transition would start right then,
// before the two frames `settled` waits. getAnimations() brings the styles up to date first.
const atFlip = (page: Page, selector: string, attribute: string) =>
	page
		.waitForFunction(
			([selector, attribute]) => {
				const el = [...document.querySelectorAll(selector)].find((e) => e.getClientRects().length > 0);
				if (!el?.hasAttribute(attribute)) return false;
				return document
					.getAnimations()
					.map((a) => `${(a as CSSTransition).transitionProperty ?? (a as CSSAnimation).animationName} on ${(a.effect as KeyframeEffect).target?.tagName}`);
			},
			[selector, attribute] as const,
			{ polling: 'raf' }
		)
		.then((handle) => handle.jsonValue() as Promise<string[]>);

test('Scenario: Scrolled navigation keeps an opaque card', async ({ page }) => {
	for (const reduced of [false, true]) {
		await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });

		await view(page, 390, 844);
		await open(page, '/recipes');
		await makeLong(page);
		const phoneCard = await surface(page, '--surface-card');
		const tabs = phoneBar(page).locator('ul[data-pill-track]');
		const background = () => tabs.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(await background()).toBe(phoneCard);
		await still(page);
		let flip = atFlip(page, 'nav[aria-label="Main"]', 'data-compact');
		await page.evaluate(() => window.scrollTo(0, 200));
		await expect(nav(page)).toHaveAttribute('data-compact', '');
		const landed = await flip;
		if (reduced) expect(landed, 'nothing animates as the state lands').toEqual([]);
		if (reduced) expect(await settled(page), 'nothing animates after the scroll').toEqual([]);
		expect(await background()).toBe(phoneCard);

		await view(page, 1024, 768);
		await open(page, '/recipes');
		await makeLong(page);
		await still(page);
		flip = atFlip(page, 'nav[aria-label="Main"]', 'data-compact');
		await page.evaluate(() => window.scrollTo(0, 200));
		await expect(nav(page)).toHaveAttribute('data-compact', '');
		const landedTop = await flip;
		if (reduced) expect(landedTop, 'nothing animates as the state lands').toEqual([]);
		if (reduced) expect(await settled(page), 'nothing animates after the scroll').toEqual([]);
		const gone = (await topBar(page).boundingBox())!;
		expect(gone.y + gone.height, 'scrolled out of view').toBeLessThanOrEqual(0);

		await view(page, 1280, 800);
		await open(page, '/recipes');
		await makeLong(page);
		await still(page);
		flip = atFlip(page, 'header[data-bar="top"]', 'data-scrolled');
		await page.evaluate(() => window.scrollTo(0, 200));
		await expect(topBar(page)).toHaveAttribute('data-scrolled', '');
		const landedCapsule = await flip;
		if (reduced) expect(landedCapsule, 'nothing animates as the state lands').toEqual([]);
		const bar = (await topBar(page).boundingBox())!;
		expect(bar.y).toBeGreaterThanOrEqual(0);
		expect(bar.y + bar.height).toBeLessThan(120);
		// with reduced motion the page is sampled at once: nothing may be on its way
		if (reduced) expect(await settled(page), 'nothing animates after the scroll').toEqual([]);
		else await page.waitForFunction(() => document.getAnimations().length === 0);
		expect(await topBar(page).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(await surface(page, '--surface-raised'));
		for (const label of labels) await expect(nav(page).getByRole('link', { name: label, exact: true })).toBeVisible();
	}
});

test('Scenario: Content never sits under the navigation', async ({ page, request }) => {
	await reset(request);
	await seed(request, { recipes: Array.from({ length: 40 }, (_, i) => ({ title: `Recipe ${String(i).padStart(2, '0')}` })) });
	for (const [width, height] of [
		[390, 844],
		[768, 1024],
		[844, 390],
		[1280, 800]
	]) {
		await view(page, width, height);
		await open(page, '/recipes');
		// the page's last content: main is the head/body subgrid, so the end goes at the bottom of the body
		await page.getByRole('main').evaluate((main) => {
			const end = document.createElement('div');
			end.id = 'end';
			end.style.blockSize = '48px';
			(main.querySelector('.screen-body') ?? main).append(end);
		});
		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
		await expect
			.poll(() => page.evaluate(() => window.scrollY + innerHeight >= document.documentElement.scrollHeight - 1))
			.toBe(true);
		const last = (await page.locator('#end').boundingBox())!;
		if (width >= 1024) {
			const bar = (await topBar(page).boundingBox())!;
			expect(last.y, `${width}`).toBeGreaterThanOrEqual(bar.y + bar.height);
		} else {
			const bar = (await phoneBar(page).boundingBox())!;
			expect(last.y + last.height, `${width}`).toBeLessThanOrEqual(bar.y);
		}
	}
});

test('Scenario: Focused control is not hidden by the navigation', async ({ page }) => {
	for (const [width, height] of [
		[390, 844],
		[1280, 800]
	]) {
		await view(page, width, height);
		await open(page, '/recipes');
		await page.getByRole('main').evaluate((main) => {
			const list = document.createElement('div');
			for (let i = 0; i < 40; i++) {
				const b = document.createElement('button');
				b.textContent = `Probe ${i}`;
				b.dataset.probe = String(i);
				b.style.cssText = 'display:block;block-size:120px;inline-size:100%';
				list.append(b);
			}
			main.append(list);
		});
		await page.locator('[data-probe="20"]').focus();
		const covered = () =>
			page.evaluate(() => {
				const el = document.activeElement as HTMLElement;
				const bars = [...document.querySelectorAll<HTMLElement>('[data-bar]')].filter((b) => getComputedStyle(b).display !== 'none');
				if (bars.some((b) => b.contains(el))) return '';
				const r = el.getBoundingClientRect();
				const hit = bars.find((b) => {
					const n = b.getBoundingClientRect();
					return r.left < n.right && r.right > n.left && r.top < n.bottom && r.bottom > n.top;
				});
				return hit ? `${el.textContent} under ${hit.dataset.bar}` : '';
			});
		for (const key of ['Tab', 'Shift+Tab']) {
			for (let i = 0; i < 14; i++) {
				await page.keyboard.press(key);
				expect(await covered(), `${width} ${key} ${i}`).toBe('');
			}
			await page.locator('[data-probe="20"]').focus();
		}
	}
});

test('Scenario: Top bar shows brand, five areas and the recipe actions', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop layout');
	await open(page, '/list');
	const links = topBar(page).getByRole('link');
	await expect(topBar(page)).toBeVisible();
	await expect(links).toHaveCount(8);
	const names = ['Rues Cooking Hub', ...labels, 'Search recipes', 'Add recipe'];
	for (const [i, name] of names.entries()) await expect(links.nth(i)).toHaveAccessibleName(name);
	await expect(links.nth(0)).toHaveAttribute('href', '/');
	await expect(links.nth(6)).toHaveAttribute('href', '/recipes');
	await expect(links.nth(7)).toHaveAttribute('href', '/recipes/new');
	await expect(phoneBar(page)).toBeHidden();
});
