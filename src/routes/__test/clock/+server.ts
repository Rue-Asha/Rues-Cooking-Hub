import { setTestToday } from '#lib/server/clock.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { IsoDate } from '#lib/types.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	requireTestFlag();
	const { today } = (await request.json()) as { today: IsoDate | null };
	setTestToday(today);
	return new Response(null, { status: 204 });
};
