import type { APIRequestContext, Page } from '@playwright/test';
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
