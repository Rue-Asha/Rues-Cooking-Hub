import { resetDb } from '#lib/server/db.ts';
import { setTestToday } from '#lib/server/clock.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = () => {
	requireTestFlag();
	resetDb();
	setTestToday(null);
	return new Response(null, { status: 204 });
};
