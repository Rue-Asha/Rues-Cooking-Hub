import { expect, test, type Page } from '@playwright/test';
import { open, reset, seed, setToday, type SeedResult } from './helpers.ts';
import { TODAY, worstCase } from './worst-case.ts';

// the listed pages, opened with the worst-case seed; the spot page rides along because long names stress it most
const pages = (ids: SeedResult): [string, string][] => [
	['Home', '/'],
	['Recipes', '/recipes'],
	['Recipe', `/recipes/${ids.recipes[0]}`],
	['Recipe form', '/recipes/new/form'],
	['Tags', '/recipes/tags'],
	['Plan', '/plan'],
	['List', '/list'],
	['Eating Out', '/eating-out'],
	['Spot', `/eating-out/${ids.spots[0]}`]
];

let ids: SeedResult;

test.beforeEach(async ({ request }) => {
	await reset(request);
	ids = await seed(request, worstCase);
	await setToday(request, TODAY);
});

test('Scenario: No horizontal page scroll from 320 to 1920', async ({ page }) => {
	const bad: string[] = [];
	for (const width of [320, 375, 768, 1024, 1280, 1920]) {
		await page.setViewportSize({ width, height: 800 });
		for (const [name, path] of pages(ids)) {
			await open(page, path);
			const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
			if (scroll > client) bad.push(`${name} at ${width}: scrollWidth ${scroll} > clientWidth ${client}`);
			// the shell clips <main> sideways, so the document alone never reports content that is cut off: look for elements
			// sticking out of it, leaving the ones inside an own scroller or clip and the decorative pseudo-elements alone
			const cut = await page.evaluate(() => {
				const main = document.querySelector('main')!;
				const box = main.getBoundingClientRect();
				const out: string[] = [];
				for (const el of main.querySelectorAll('*')) {
					if (!el.checkVisibility({ checkVisibilityCSS: true })) continue;
					const r = el.getBoundingClientRect();
					if (r.width <= 1 || (r.right <= box.right + 1 && r.left >= box.left - 1)) continue;
					let held = false;
					for (let p = el.parentElement; p && p !== main; p = p.parentElement) if (getComputedStyle(p).overflowX !== 'visible') held = true;
					if (!held) out.push(`${el.tagName.toLowerCase()}.${String(el.className).trim().split(/\s+/).join('.')} ${Math.round(r.left)}..${Math.round(r.right)} of ${Math.round(box.left)}..${Math.round(box.right)}`);
				}
				return out.slice(0, 3);
			});
			for (const c of cut) bad.push(`${name} at ${width}: cut off ${c}`);
		}
	}
	expect(bad).toEqual([]);
});

// the size a control can be hit at: its box, or the larger invisible ::before / ::after that `.hit` and `.target` draw
const undersized = (page: Page, min: number, touch: boolean) =>
	page.evaluate(
		({ min, touch }) => {
			const controls = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="checkbox"], [role="tab"], [role="menuitem"]';
			const out: string[] = [];
			const size = (el: Element) => {
				const r = el.getBoundingClientRect();
				let w = r.width;
				let h = r.height;
				for (const p of ['::before', '::after']) {
					const cs = getComputedStyle(el, p);
					if (cs.content !== 'none' && cs.position === 'absolute') {
						w = Math.max(w, parseFloat(cs.width) || 0);
						h = Math.max(h, parseFloat(cs.height) || 0);
					}
				}
				return { w, h };
			};
			const label = (el: Element) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}"`;
			for (const el of document.querySelectorAll(controls)) {
				if (!el.checkVisibility({ checkVisibilityCSS: true }) || el.closest('[inert]')) continue;
				const r = el.getBoundingClientRect();
				if (r.width <= 1 && r.height <= 1) continue;
				// WCAG 2.5.8: a link inside a sentence is exempt
				if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue;
				const { w, h } = size(el);
				if (w < min - 0.5 || h < min - 0.5) out.push(`${label(el)} ${Math.round(w)}x${Math.round(h)}`);
			}
			if (touch) {
				const phone = [...document.querySelectorAll('nav[data-bar="phone"] a, nav[data-bar="phone"] .dock-add, header[data-bar="strip"] a.brand, [role="checkbox"]')];
				for (const el of phone) {
					if (!el.checkVisibility({ checkVisibilityCSS: true }) || el.closest('[inert]')) continue;
					const { w, h } = size(el);
					if (w < 43.5 || h < 43.5) out.push(`${label(el)} ${Math.round(w)}x${Math.round(h)} (needs 44)`);
				}
			}
			return out;
		},
		{ min, touch }
	);

test.describe('phone', () => {
	test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

	test('Scenario: Controls meet the target sizes (390x844)', async ({ page }) => {
		const bad: string[] = [];
		for (const [name, path] of pages(ids)) {
			await open(page, path);
			bad.push(...(await undersized(page, 24, true)).map((b) => `${name}: ${b}`));
		}
		expect(bad).toEqual([]);
	});

	test('Scenario: Focus is visible and not obscured (390x844)', async ({ page }) => {
		const bad: string[] = [];
		for (const [name, path] of pages(ids)) bad.push(...(await walk(page, name, path)));
		expect(bad).toEqual([]);
	});
});

test.describe('desktop', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('Scenario: Controls meet the target sizes (1280x800)', async ({ page }) => {
		const bad: string[] = [];
		for (const [name, path] of pages(ids)) {
			await open(page, path);
			bad.push(...(await undersized(page, 24, false)).map((b) => `${name}: ${b}`));
		}
		expect(bad).toEqual([]);
	});

	test('Scenario: Focus is visible and not obscured (1280x800)', async ({ page }) => {
		const bad: string[] = [];
		for (const [name, path] of pages(ids)) bad.push(...(await walk(page, name, path)));
		expect(bad).toEqual([]);
	});
});

// a walk that never reaches the end of the page fails: a page with more stops than this is a finding of its own
const STOPS = 400;

async function walk(page: Page, name: string, path: string): Promise<string[]> {
	await open(page, path);
	// measure the settled ring, not a transition on its way
	await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
	const bad: string[] = [];
	let ended = false;
	for (let i = 0; i < STOPS; i++) {
		await page.keyboard.press('Tab');
		const stop = await page.evaluate(() => {
			const el = document.activeElement;
			if (!el || el === document.body || el === document.documentElement) return null;
			const alpha = (c: string) => (c.startsWith('rgba') ? parseFloat(c.split(',')[3]) : c === 'transparent' ? 0 : 1);
			const own = getComputedStyle(el);
			// a stretched link draws its ring on a pseudo-element
			const ring = (s: CSSStyleDeclaration) => s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && alpha(s.outlineColor) > 0;
			const outline = ring(own) || ring(getComputedStyle(el, '::after')) || ring(getComputedStyle(el, '::before'));
			// a ring drawn on the control's own box or on a wrapper (:has / :focus-within) both count: the element or one of its
			// four nearest ancestors paints differently with focus than without
			const paint = () => {
				const out: string[] = [];
				for (let n: Element | null = el, i = 0; n && i < 5; n = n.parentElement, i++) {
					const s = getComputedStyle(n);
					out.push([s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.backgroundColor, s.borderTopColor, s.borderTopWidth].join('|'));
				}
				return out.join('\n');
			};
			const focused = paint();
			(el as HTMLElement).blur();
			const blurred = paint();
			(el as HTMLElement).focus();
			const shadow = focused !== blurred;
			// the first line box: a line-clamped link's bounding box reaches into text that is cut off
			const r = el.getClientRects()[0] ?? el.getBoundingClientRect();
			const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1);
			const y = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
			const hit = document.elementFromPoint(x, y);
			const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
			const covered = !inView || !hit || !(el.contains(hit) || hit.contains(el));
			const id = `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : ''} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}"`;
			return { id, indicator: outline || shadow, covered, by: hit ? `${hit.tagName.toLowerCase()}.${hit.className}` : 'nothing', top: Math.round(r.top), bottom: Math.round(r.bottom) };
		});
		if (!stop) {
			ended = true;
			break;
		}
		if (!stop.indicator) bad.push(`${name}: no focus indicator on ${stop.id}`);
		if (stop.covered) bad.push(`${name}: ${stop.id} obscured by ${stop.by} (y ${stop.top}-${stop.bottom})`);
	}
	if (!ended) bad.push(`${name}: Tab did not reach the end of the page within ${STOPS} stops`);
	return bad;
}

test.describe('reduced motion', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	// samples every element's transform on each frame from the first paint, and counts view transitions
	test.beforeEach(async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.addInitScript(() => {
			const w = window as unknown as { __moved: Set<string>; __vt: number };
			w.__moved = new Set();
			w.__vt = 0;
			const start = document.startViewTransition?.bind(document);
			if (start) document.startViewTransition = ((...args: Parameters<typeof start>) => ((w.__vt += 1), start(...args))) as typeof start;
			// transform and the individual translate, scale and rotate; and a box whose place or size changes on three frames
			// in a row (layout animation), in page coordinates so a scroll is no movement and a one-off reflow is none either
			const seen = new WeakMap<Element, string>();
			const boxes = new WeakMap<Element, { at: string; frame: number; run: number }>();
			let frame = 0;
			const tick = () => {
				frame += 1;
				for (const el of document.querySelectorAll('*')) {
					const s = getComputedStyle(el);
					const t = [s.transform, s.translate, s.scale, s.rotate].join(' ');
					const before = seen.get(el);
					const name = `${el.tagName.toLowerCase()}.${(el as HTMLElement).className}`;
					if (before !== undefined && before !== t) w.__moved.add(`${name} ${before} -> ${t}`);
					seen.set(el, t);
					const r = el.getBoundingClientRect();
					const at = [r.left + scrollX, r.top + scrollY, r.width, r.height].map(Math.round).join(',');
					const last = boxes.get(el);
					if (last && last.at !== at) {
						const run = last.frame === frame - 1 ? last.run + 1 : 1;
						if (run >= 3) w.__moved.add(`${name} box ${last.at} -> ${at}`);
						boxes.set(el, { at, frame, run });
					} else if (!last) boxes.set(el, { at, frame: 0, run: 0 });
				}
				requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		});
	});

	const moved = (page: Page) => page.evaluate(() => ({ moved: [...(window as unknown as { __moved: Set<string> }).__moved], vt: (window as unknown as { __vt: number }).__vt }));

	test('Scenario: Reduced motion removes movement', async ({ page }) => {
		await open(page, '/');
		await page.waitForTimeout(1500);
		let seen = await moved(page);
		expect(seen, 'Home').toEqual({ moved: [], vt: 0 });

		await page.getByRole('link', { name: 'Recipes', exact: true }).first().click();
		await page.getByRole('group', { name: 'Filter by tag' }).getByRole('button').first().waitFor();
		await page.getByRole('group', { name: 'Filter by tag' }).getByRole('button').nth(1).click();
		await page.waitForTimeout(1200);
		seen = await moved(page);
		expect(seen, 'archive filter').toEqual({ moved: [], vt: 0 });

		await page.getByRole('list', { name: 'Recipes' }).getByRole('link').first().click();
		await page.getByRole('heading', { level: 1 }).waitFor();
		await page.waitForTimeout(1200);
		seen = await moved(page);
		expect(seen, 'recipe page').toEqual({ moved: [], vt: 0 });

		await open(page, '/list');
		await page.getByRole('checkbox').first().click();
		await page.waitForTimeout(1200);
		seen = await moved(page);
		expect(seen, 'list check').toEqual({ moved: [], vt: 0 });
	});
});
