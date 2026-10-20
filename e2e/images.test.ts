import { DatabaseSync } from 'node:sqlite';
import { expect, test } from '@playwright/test';
import { reset, seed } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

function imageIdOf(recipeId: number): number {
	const db = new DatabaseSync(`.e2e/${port}.db`, { readOnly: true });
	const row = db.prepare('SELECT image_id FROM recipes WHERE id = ?').get(recipeId);
	db.close();
	return Number(row?.image_id);
}

test('Scenario: Image is served with caching headers', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	await reset(request);
	const { recipes } = await seed(request, { recipes: [{ title: 'Soup', image: true }] });
	const id = imageIdOf(recipes[0]);

	const res = await request.get(`/images/${id}`);

	expect(res.status()).toBe(200);
	expect(res.headers()['content-type']).toMatch(/^image\//);
	expect(res.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
	expect((await res.body()).subarray(1, 4).toString()).toBe('PNG');

	const unknown = await request.get(`/images/${id + 1000}`);
	expect(unknown.status()).toBe(404);
	expect((await request.get('/images/not-a-number')).status()).toBe(404);
});
