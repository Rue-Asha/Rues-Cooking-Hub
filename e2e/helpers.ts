import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { areas, POSTURE_SWITCH } from '../src/lib/nav.ts';
import { COPY } from '../src/lib/copy.ts';
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

// an empty slot only counts when the slot itself is there; a missing slot would also hold no entries
export async function expectNoEntries(page: Page, date: string, id: string): Promise<void> {
	await expect(slot(page, date, id)).toHaveCount(1);
	await expect(entries(page, date, id)).toHaveCount(0);
}

export const allEntries = (page: Page) => page.getByRole('button', { name: /^Options for / });

export const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main' });

// the view-transition name sits on the photo or on whatever frames it
export const carriedName = (photo: Locator) =>
	photo.evaluate((img) => {
		for (let el: Element | null = img; el && el !== document.documentElement; el = el.parentElement) {
			const name = getComputedStyle(el).viewTransitionName;
			if (name !== 'none') return name;
		}
		return 'none';
	});

export const posture = (page: Page): 'phone' | 'desktop' => (page.viewportSize()!.width >= POSTURE_SWITCH ? 'desktop' : 'phone');

// the phone pill is named by its phone label ("Spots"), the top-bar link by the area's own label
export async function openNav(page: Page, name: string): Promise<void> {
	const area = areas.find((a) => a.label === name || a.phoneLabel === name)!;
	await mainNav(page)
		.getByRole('link', { name: posture(page) === 'phone' ? area.phoneLabel : area.label, exact: true })
		.click();
}

// the round "+" of the phone bar: the one control in the Main navigation named by a COPY.contextAdd label (the top
// strip's "Add recipe" sits outside the navigation)
export const plus = (page: Page): Locator => {
	const name = new RegExp(`^(${Object.values(COPY.contextAdd).join('|')})$`);
	return mainNav(page).getByRole('link', { name }).or(mainNav(page).getByRole('button', { name }));
};

// the bars of the shell: the desktop top bar, the phone top strip and the phone bar (the Main navigation of the phone)
export const topBar = (page: Page): Locator => page.locator('header[data-bar="top"]');
export const phoneStrip = (page: Page): Locator => page.locator('header[data-bar="strip"]');
export const phoneBar = (page: Page): Locator => page.locator('nav[data-bar="phone"]');

// a block of known height at the end of the page, for the checks that need a long page
export async function makeLong(page: Page, height = 2400): Promise<void> {
	await page.getByRole('main').evaluate((main, height) => {
		const block = document.createElement('div');
		block.id = 'tall';
		block.style.blockSize = `${height}px`;
		main.append(block);
	}, height);
}

// the width an input's placeholder needs against the room inside its padding
export const placeholderRoom = (input: Locator) =>
	input.evaluate((input: HTMLInputElement) => {
		const probe = document.createElement('span');
		const cs = getComputedStyle(input);
		probe.style.font = cs.font;
		probe.style.letterSpacing = cs.letterSpacing;
		probe.style.whiteSpace = 'pre';
		probe.textContent = input.placeholder;
		document.body.append(probe);
		const text = probe.getBoundingClientRect().width;
		probe.remove();
		return { text, room: input.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) };
	});
