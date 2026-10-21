import { mkdtempSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { COPY } from '#lib/copy.ts';
import { closeDb, getDb } from '#lib/server/db.ts';
import { findBySourceUrl, getRecipe } from '#lib/server/recipes.ts';
import { normaliseUrl } from '#lib/server/import.ts';
import { savedLocation, saveFromForm, type Saved } from './save.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-save-')), 's.db');
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

type Field = [string, string | Blob];

function formOf(...fields: Field[]): FormData {
	const form = new FormData();
	for (const [k, v] of fields) form.append(k, v);
	return form;
}

const base: Field[] = [
	['title', 'Pancakes'],
	['servings', '2']
];

function recipeRows(): number {
	return Number(getDb().prepare('SELECT count(*) AS n FROM recipes').get()?.n);
}

describe('saveFromForm: fields and sections', () => {
	it('stores every field and keeps the section and line order of the form', async () => {
		const result = await saveFromForm(
			formOf(
				['title', '  Käse-Spätzle '],
				['description', 'Cheesy noodles'],
				['sourceUrl', 'https://example.com/spaetzle'],
				['servings', '4'],
				['prepMinutes', '15'],
				['cookMinutes', ''],
				['notes', '**Crispy** onions'],
				['ingredientSection', 'For the dough'],
				['ingredientLine', '300 g flour'],
				['ingredientLine', '3 eggs'],
				['ingredientSection', 'For the sauce'],
				['ingredientLine', '200 g cheese'],
				['stepSection', ''],
				['stepLine', 'Mix.'],
				['stepLine', 'Boil.']
			)
		);

		expect(result).toEqual({ id: expect.any(Number), imageFailed: false, imageKept: false });
		const r = getRecipe((result as { id: number }).id)!;
		expect(r).toMatchObject({
			title: 'Käse-Spätzle',
			description: 'Cheesy noodles',
			sourceUrl: 'https://example.com/spaetzle',
			servings: 4,
			prepMinutes: 15,
			cookMinutes: null,
			notes: '**Crispy** onions',
			favourite: false,
			imageId: null
		});
		expect(r.ingredients.map((s) => [s.title, s.lines.map((l) => l.text)])).toEqual([
			['For the dough', ['300 g flour', '3 eggs']],
			['For the sauce', ['200 g cheese']]
		]);
		expect(r.ingredients[0].lines[0]).toMatchObject({ quantity: 300, unit: 'g', name: 'flour' });
		expect(r.steps).toEqual([{ title: null, lines: ['Mix.', 'Boil.'] }]);
	});

	it('drops blank lines and the sections left empty by that', async () => {
		const result = await saveFromForm(
			formOf(
				...base,
				['ingredientSection', 'Empty one'],
				['ingredientLine', ''],
				['ingredientLine', '   '],
				['ingredientSection', ''],
				['ingredientLine', '2 eggs'],
				['ingredientLine', '']
			)
		);

		const r = getRecipe((result as { id: number }).id)!;
		expect(r.ingredients).toHaveLength(1);
		expect(r.ingredients[0].lines.map((l) => l.text)).toEqual(['2 eggs']);
	});

	it('reports a blank title and servings below 1 as field messages and stores nothing', async () => {
		const blank = await saveFromForm(formOf(['title', '   '], ['servings', '2']));
		const zero = await saveFromForm(formOf(['title', 'Soup'], ['servings', '0']));
		const both = await saveFromForm(formOf(['title', ''], ['servings', 'abc']));

		expect(blank).toEqual({ errors: { title: COPY.titleRequired } });
		expect(zero).toEqual({ errors: { servings: COPY.servingsMin } });
		expect(both).toEqual({ errors: { title: COPY.titleRequired, servings: COPY.servingsMin } });
		expect(recipeRows()).toBe(0);
	});
});

describe('saveFromForm: minutes', () => {
	it('treats empty minutes as no time and keeps whole numbers', async () => {
		const result = await saveFromForm(formOf(...base, ['prepMinutes', ' 0 '], ['cookMinutes', '']));

		const r = getRecipe((result as { id: number }).id)!;
		expect([r.prepMinutes, r.cookMinutes, r.totalMinutes]).toEqual([0, null, 0]);
	});

	it('rejects minutes that are not whole numbers and stores nothing', async () => {
		const result = await saveFromForm(formOf(...base, ['prepMinutes', '-5'], ['cookMinutes', '1.5']));

		expect(result).toEqual({
			errors: { prepMinutes: COPY.minutesInvalid, cookMinutes: COPY.minutesInvalid }
		});
		expect(recipeRows()).toBe(0);
	});
});

describe('saveFromForm: source URL', () => {
	it('Scenario: Known URL matches however the source was saved', async () => {
		for (const typed of [
			'https://example.com/rezepte/käsespätzle',
			'http://example.com',
			'  https://Example.com/pie/#steps  '
		]) {
			const result = await saveFromForm(formOf(...base, ['sourceUrl', typed]));

			const imported = normaliseUrl(typed)!;
			expect(getRecipe((result as { id: number }).id)!.sourceUrl).toBe(imported);
			expect(findBySourceUrl(imported)).toEqual({ id: (result as { id: number }).id, title: 'Pancakes' });
		}
	});

	it('keeps a source that is not a web address as typed', async () => {
		const result = await saveFromForm(formOf(...base, ['sourceUrl', "Grandma's notebook"]));

		expect(getRecipe((result as { id: number }).id)!.sourceUrl).toBe("Grandma's notebook");
	});
});

describe('saveFromForm: tags', () => {
	it('creates new tags, reuses existing ones ignoring case and skips blanks and repeats', async () => {
		const before = getDb().prepare('SELECT count(*) AS n FROM tags').get()?.n;

		const result = await saveFromForm(
			formOf(...base, ['tag', 'dessert'], ['tag', 'Weeknight'], ['tag', '  '], ['tag', 'WEEKNIGHT'], ['tag', ''])
		);

		const r = getRecipe((result as { id: number }).id)!;
		expect(r.tags.map((t) => t.name).sort()).toEqual(['Dessert', 'Weeknight']);
		expect(Number(getDb().prepare('SELECT count(*) AS n FROM tags').get()?.n)).toBe(Number(before) + 1);
	});
});

describe('saveFromForm: image', () => {
	let server: Server;
	let origin: string;
	let jpeg: Uint8Array;

	beforeAll(async () => {
		jpeg = await sharp({ create: { width: 300, height: 200, channels: 3, background: '#c05030' } })
			.jpeg()
			.toBuffer();
		server = createServer((req, res) => {
			if (req.url === '/photo.jpg') res.writeHead(200, { 'content-type': 'image/jpeg' }).end(jpeg);
			else res.writeHead(404).end('missing');
		});
		await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
		origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
	});

	afterAll(() => {
		server.closeAllConnections();
		server.close();
	});

	const imageRows = () => Number(getDb().prepare('SELECT count(*) AS n FROM images').get()?.n);
	const file = (bytes: Uint8Array, name = 'photo.jpg') => new File([bytes as Uint8Array<ArrayBuffer>], name);

	it('stores an uploaded file as the recipe image', async () => {
		const result = await saveFromForm(formOf(...base, ['image', file(jpeg)]));

		const r = getRecipe((result as { id: number }).id)!;
		expect(r.imageId).not.toBeNull();
		expect(imageRows()).toBe(1);
		expect(result).toMatchObject({ imageFailed: false });
	});

	it('an empty file input (nothing chosen) means no image', async () => {
		const result = await saveFromForm(formOf(...base, ['image', file(new Uint8Array(), '')]));

		expect(getRecipe((result as { id: number }).id)!.imageId).toBeNull();
		expect(imageRows()).toBe(0);
	});

	it('maps a non-image file to the notImage message and saves nothing', async () => {
		const result = await saveFromForm(formOf(...base, ['image', file(new TextEncoder().encode('just text'), 'a.txt')]));

		expect(result).toEqual({ errors: { image: COPY.notImage } });
		expect(recipeRows()).toBe(0);
		expect(imageRows()).toBe(0);
	});

	it('maps a file over 15 MB to the tooLarge message and saves nothing', async () => {
		const result = await saveFromForm(formOf(...base, ['image', file(new Uint8Array(15 * 1024 * 1024 + 1))]));

		expect(result).toEqual({ errors: { image: COPY.tooLarge } });
		expect(recipeRows()).toBe(0);
		expect(imageRows()).toBe(0);
	});

	it('stores no image when the form is rejected for another field', async () => {
		const result = await saveFromForm(formOf(['title', ''], ['servings', '2'], ['image', file(jpeg)]));

		expect(result).toEqual({ errors: { title: COPY.titleRequired } });
		expect(imageRows()).toBe(0);
	});

	it('downloads an image link and stores it', async () => {
		const result = await saveFromForm(formOf(...base, ['imageUrl', `${origin}/photo.jpg`]));

		expect(getRecipe((result as { id: number }).id)!.imageId).not.toBeNull();
		expect(result).toMatchObject({ imageFailed: false });
		expect(imageRows()).toBe(1);
	});

	it('an uploaded file wins over an image link', async () => {
		await saveFromForm(formOf(...base, ['image', file(jpeg)], ['imageUrl', `${origin}/missing.jpg`]));

		expect(imageRows()).toBe(1);
	});

	it('saves the recipe without image and flags it when the image link cannot be downloaded', async () => {
		const result = await saveFromForm(formOf(...base, ['imageUrl', `${origin}/missing.jpg`]));

		expect(result).toEqual({ id: expect.any(Number), imageFailed: true, imageKept: false });
		expect(getRecipe((result as { id: number }).id)!.imageId).toBeNull();
		expect(recipeRows()).toBe(1);
	});
});

describe('saveFromForm: updating', () => {
	let server: Server;
	let origin: string;
	let jpeg: Uint8Array;

	beforeAll(async () => {
		jpeg = await sharp({ create: { width: 300, height: 200, channels: 3, background: '#2060c0' } })
			.jpeg()
			.toBuffer();
		server = createServer((_req, res) => res.writeHead(404).end('missing'));
		await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
		origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
	});

	afterAll(() => {
		server.closeAllConnections();
		server.close();
	});

	const imageIds = () => getDb().prepare('SELECT id FROM images ORDER BY id').all().map((r) => Number(r.id));
	const photo = () => new File([jpeg as Uint8Array<ArrayBuffer>], 'photo.jpg');

	async function existing(...more: Field[]): Promise<number> {
		const result = await saveFromForm(formOf(...base, ...more));
		return (result as { id: number }).id;
	}

	it('replaces the fields and the sections of the recipe and keeps its favourite flag', async () => {
		const id = await existing(['ingredientSection', 'Old'], ['ingredientLine', '1 egg'], ['stepLine', 'Old step']);
		getDb().prepare('UPDATE recipes SET favourite = 1 WHERE id = ?').run(id);

		const result = await saveFromForm(
			formOf(
				['title', 'Better pancakes'],
				['servings', '6'],
				['ingredientSection', ''],
				['ingredientLine', '3 eggs'],
				['ingredientLine', '200 g flour'],
				['stepLine', 'New step']
			),
			id
		);

		expect(result).toEqual({ id, imageFailed: false, imageKept: false });
		const r = getRecipe(id)!;
		expect(r).toMatchObject({ title: 'Better pancakes', servings: 6, favourite: true });
		expect(r.ingredients.map((s) => s.lines.map((l) => l.text))).toEqual([['3 eggs', '200 g flour']]);
		expect(r.steps).toEqual([{ title: null, lines: ['New step'] }]);
		expect(recipeRows()).toBe(1);
	});

	it('reports field errors on an edit and leaves the recipe as it was', async () => {
		const id = await existing();

		const result = await saveFromForm(formOf(['title', ''], ['servings', '2']), id);

		expect(result).toEqual({ errors: { title: COPY.titleRequired } });
		expect(getRecipe(id)!.title).toBe('Pancakes');
	});

	it('keeps the stored image when the form sends no image', async () => {
		const id = await existing(['image', photo()]);
		const [old] = imageIds();

		await saveFromForm(formOf(...base, ['removeImage', '']), id);

		expect(getRecipe(id)!.imageId).toBe(old);
		expect(imageIds()).toEqual([old]);
	});

	it('replacing the image through the form removes the old blob', async () => {
		const id = await existing(['image', photo()]);
		const [old] = imageIds();

		await saveFromForm(formOf(...base, ['image', photo()]), id);

		const now = getRecipe(id)!.imageId;
		expect(now).not.toBeNull();
		expect(now).not.toBe(old);
		expect(imageIds()).toEqual([now]);
	});

	it('removing the image through the form deletes its blob', async () => {
		const id = await existing(['image', photo()]);

		await saveFromForm(formOf(...base, ['removeImage', '1']), id);

		expect(getRecipe(id)!.imageId).toBeNull();
		expect(imageIds()).toEqual([]);
	});

	it('keeps the stored image and flags it when a new image link cannot be downloaded', async () => {
		const id = await existing(['image', photo()]);
		const [old] = imageIds();

		const result = await saveFromForm(formOf(...base, ['imageUrl', `${origin}/gone.jpg`]), id);

		expect(result).toEqual({ id, imageFailed: true, imageKept: true });
		expect(getRecipe(id)!.imageId).toBe(old);
		expect(imageIds()).toEqual([old]);
		expect(savedLocation(result as Saved)).toBe(`/recipes/${id}/edit?imageFailed=kept`);
	});
});
