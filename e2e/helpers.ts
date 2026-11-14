import type { APIRequestContext, ElementHandle, Locator, Page } from '@playwright/test';
import type { SeedInput, SeedResult } from '../src/routes/__test/seed/+server.ts';
import type { IsoDate } from '../src/lib/types.ts';

export type { SeedInput, SeedResult };

// A POST without a content type counts as a form post, which SvelteKit's CSRF check rejects.
export async function reset(request: APIRequestContext): Promise<void> {
	const res = await request.post('/__test/reset', { data: {} });
	if (!res.ok()) throw new Error(`reset failed: ${res.status()}`);
}

export async function seed(request: APIRequestContext, input: SeedInput): Promise<SeedResult> {
	const res = await request.post('/__test/seed', { data: input });
	if (!res.ok()) throw new Error(`seed failed: ${res.status()}`);
	return (await res.json()) as SeedResult;
}

export async function setToday(request: APIRequestContext, date: IsoDate | null): Promise<void> {
	const res = await request.post('/__test/clock', { data: { today: date } });
	if (!res.ok()) throw new Error(`setToday failed: ${res.status()}`);
}

// Input that lands on the server-rendered page before hydration is silently lost.
export async function open(page: Page, path: string): Promise<void> {
	await page.goto(path);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
}

export const calm = (page: Page): Promise<void> => page.emulateMedia({ reducedMotion: 'reduce' });

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_LABELS: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };

// a plan slot is the group named "<weekday> <slot>", the same on the Plan page for any week
export const slot = (page: Page, date: string, id: string) =>
	page.getByRole('group', { name: `${WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()]} ${SLOT_LABELS[id]}`, exact: true });

export const entries = (page: Page, date: string, id: string) => slot(page, date, id).getByRole('group');

// the four Home tiles: the hero article and the week, shopping list and favourite links
export const homeTiles = (page: Page) => {
	const today = page.getByRole('region', { name: 'Today' });
	return today.getByRole('article').or(today.getByRole('link', { name: /^(This week|Shopping list|Favourite)/ }));
};

export const allEntries = (page: Page) => page.getByRole('button', { name: /^Options for / });

export const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main' });

// the divider is the nav's item between List and Eating Out; it is decorative and hidden from the role tree
export const navDivider = (nav: Locator) => nav.getByRole('listitem', { includeHidden: true }).nth(4);

// the pill behind the open area is decorative: the nav's one absolutely placed, aria-hidden element
export async function navPill(nav: Locator): Promise<ElementHandle<HTMLElement>> {
	const handle = await nav.evaluateHandle(
		(n) => [...n.querySelectorAll('[aria-hidden="true"]')].find((el) => getComputedStyle(el).position === 'absolute')!
	);
	return handle.asElement() as ElementHandle<HTMLElement>;
}

// the view-transition name sits on the photo or on whatever frames it
export const carriedName = (photo: Locator) =>
	photo.evaluate((img) => {
		for (let el: Element | null = img; el && el !== document.documentElement; el = el.parentElement) {
			const name = getComputedStyle(el).viewTransitionName;
			if (name !== 'none') return name;
		}
		return 'none';
	});
