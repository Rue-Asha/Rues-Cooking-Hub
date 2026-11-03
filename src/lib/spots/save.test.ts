import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { COPY } from '#lib/copy.ts';
import { closeDb, getDb } from '#lib/server/db.ts';
import { getSpot } from '#lib/server/spots.ts';
import { formatScore } from './score.ts';
import { saveSpotFromForm, spotSavedLocation, visitFromForm, type SpotSaved } from './save.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-spot-save-')), 's.db');
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

const base: Field[] = [['name', 'Café Müller']];

const count = (table: string) => Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);

async function saved(...fields: Field[]): Promise<SpotSaved> {
	const result = await saveSpotFromForm(formOf(...fields));
	if ('errors' in result) throw new Error(JSON.stringify(result.errors));
	return result;
}

let jpeg: Uint8Array<ArrayBuffer>;

const photo = () => new File([jpeg], 'a.jpg', { type: 'image/jpeg' });

beforeAll(async () => {
	jpeg = new Uint8Array(
		await sharp({ create: { width: 300, height: 200, channels: 3, background: '#c05030' } }).jpeg().toBuffer()
	);
});

describe('saveSpotFromForm', () => {
	it('Scenario: Server rejects invalid spot input', async () => {
		const errors = async (...fields: Field[]) => {
			const r = await saveSpotFromForm(formOf(...fields));
			return 'errors' in r ? r.errors : null;
		};

		expect(await errors(['name', '   '])).toEqual({ name: COPY.nameRequired });
		expect(await errors(...base, ['status', 'visited'], ['score', ''])).toEqual({ score: COPY.scoreRequired });
		expect(await errors(...base, ['status', 'visited'], ['score', '10.01'])).toEqual({ score: COPY.scoreInvalid });
		expect(await errors(...base, ['website', 'example.com'])).toEqual({ website: COPY.invalidUrl });
		expect(await errors(...base, ['website', 'ftp://example.com'])).toEqual({ website: COPY.invalidUrl });
		expect(count('spots')).toBe(0);
	});

	it('Scenario: Score is stored without drift', async () => {
		const { id } = await saved(...base, ['status', 'visited'], ['score', '8,75']);

		const row = getDb().prepare('SELECT score_hundredths, typeof(score_hundredths) AS t FROM spots WHERE id = ?').get(id);
		expect(row).toEqual({ score_hundredths: 875, t: 'integer' });
		expect(formatScore(getSpot(id)!.scoreHundredths!)).toBe('8.75');
	});

	it('stores every field, trimmed, with repeated tag fields and a price', async () => {
		const { id, imageFailed } = await saved(
			['name', ' Café Müller '],
			['status', 'visited'],
			['score', '9'],
			['price', '2'],
			['city', 'Berlin'],
			['neighbourhood', ''],
			['address', 'Hauptstraße 5'],
			['website', 'https://example.com'],
			['notes', 'Nice'],
			['tag', 'Brunch'],
			['tag', 'Coffee'],
			['image', photo()]
		);

		const spot = getSpot(id)!;
		expect(imageFailed).toBe(false);
		expect(spot).toMatchObject({
			name: 'Café Müller',
			status: 'visited',
			scoreHundredths: 900,
			price: 2,
			city: 'Berlin',
			neighbourhood: null,
			address: 'Hauptstraße 5',
			website: 'https://example.com',
			notes: 'Nice'
		});
		expect(spot.imageId).not.toBeNull();
		expect(spot.tags.map((t) => t.name)).toEqual(['Brunch', 'Coffee']);
	});

	it('defaults to Want to go, ignores a score then and an unknown price', async () => {
		const { id } = await saved(...base, ['score', '8'], ['price', '9']);
		const { id: id2 } = await saved(...base, ['status', 'want'], ['score', 'abc'], ['price', '']);

		expect(getSpot(id)).toMatchObject({ status: 'want', scoreHundredths: null, price: null });
		expect(getSpot(id2)).toMatchObject({ status: 'want', scoreHundredths: null, price: null });
	});

	it('switching a Visited spot to Want to go clears the score, and to Visited needs one', async () => {
		const { id } = await saved(...base, ['status', 'visited'], ['score', '8.75']);

		await saveSpotFromForm(formOf(...base, ['status', 'want'], ['score', '8.75']), id);
		expect(getSpot(id)).toMatchObject({ status: 'want', scoreHundredths: null });

		const result = await saveSpotFromForm(formOf(...base, ['status', 'visited'], ['score', '']), id);
		expect(result).toEqual({ errors: { score: COPY.scoreRequired } });
		expect(getSpot(id)?.status).toBe('want');
	});

	it('a file that is not an image is an image error and stores nothing', async () => {
		const r = await saveSpotFromForm(formOf(...base, ['image', new File(['hello'], 'a.txt', { type: 'text/plain' })]));

		expect(r).toEqual({ errors: { image: COPY.notImage } });
		expect(count('spots')).toBe(0);
	});

	it('a photo link that cannot be downloaded saves the spot without photo', async () => {
		const r = await saveSpotFromForm(formOf(...base, ['imageUrl', 'http://127.0.0.1:1/photo.jpg']));

		expect(r).toMatchObject({ imageFailed: true, imageKept: false });
		expect(getSpot((r as SpotSaved).id)?.imageId).toBeNull();
	});

	it('Remove image deletes the stored photo and no field keeps it', async () => {
		const { id } = await saved(...base, ['image', photo()]);
		expect(count('images')).toBe(1);

		await saveSpotFromForm(formOf(...base), id);
		expect(getSpot(id)?.imageId).not.toBeNull();

		await saveSpotFromForm(formOf(...base, ['removeImage', '1']), id);

		expect(getSpot(id)?.imageId).toBeNull();
		expect(count('images')).toBe(0);
	});

	it('a failed link keeps the stored photo and says so', async () => {
		const { id } = await saved(...base, ['image', photo()]);

		const r = await saveSpotFromForm(formOf(...base, ['imageUrl', 'http://127.0.0.1:1/x.jpg']), id);

		expect(r).toEqual({ id, imageFailed: true, imageKept: true });
		expect(getSpot(id)?.imageId).not.toBeNull();
	});
});

describe('visitFromForm', () => {
	it('marks a Want to go spot visited with the posted score', async () => {
		const { id } = await saved(...base);

		expect(visitFromForm(formOf(['score', '8,5']), id)).toEqual({ ok: true });

		expect(getSpot(id)).toMatchObject({ status: 'visited', scoreHundredths: 850 });
	});

	it('answers a score error and changes nothing', async () => {
		const { id } = await saved(...base);

		expect(visitFromForm(formOf(['score', '']), id)).toEqual({ errors: { score: COPY.scoreRequired } });
		expect(visitFromForm(formOf(['score', '11']), id)).toEqual({ errors: { score: COPY.scoreInvalid } });
		expect(getSpot(id)?.status).toBe('want');
	});
});

describe('spotSavedLocation', () => {
	it('opens the page, or the edit form with the notice when the photo failed', () => {
		expect(spotSavedLocation({ id: 4, imageFailed: false, imageKept: false })).toBe('/eating-out/4');
		expect(spotSavedLocation({ id: 4, imageFailed: true, imageKept: false })).toBe('/eating-out/4/edit?imageFailed=1');
		expect(spotSavedLocation({ id: 4, imageFailed: true, imageKept: true })).toBe('/eating-out/4/edit?imageFailed=kept');
	});
});
