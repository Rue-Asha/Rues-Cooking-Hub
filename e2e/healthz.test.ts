import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { expect, test } from '@playwright/test';

const port = Number(process.env.PORT ?? 4173);

test('Scenario: Healthy server answers 200', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');

	const res = await request.get('/healthz');

	expect(res.status()).toBe(200);
	expect(await res.text()).toBe('ok');
});

test('the e2e server uses its own database for the port', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	await request.get('/healthz');
	const path = `.e2e/${port}.db`;

	expect(existsSync(path)).toBe(true);
	const db = new DatabaseSync(path, { readOnly: true });
	const names = db.prepare('SELECT name FROM schema_migrations').all().map((r) => r.name);
	db.close();
	expect(names).toContain('0001_tags.sql');
});
