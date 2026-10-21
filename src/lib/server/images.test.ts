import { mkdtempSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ImageError } from '#lib/errors.ts';
import { closeDb, getDb } from './db.ts';
import { MAX_LONG_SIDE, MAX_UPLOAD_BYTES, TARGET_BYTES, getImage, storeImage, storeImageFromUrl } from './images.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-images-')), 'i.db');
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

function imageRows(): number {
	return Number(getDb().prepare('SELECT count(*) AS n FROM images').get()?.n);
}

// noise compresses badly, so this stays above 200 KB until it is downscaled; heavy noise made the
// downscale loop too slow for a one-core CI runner
function photo(width: number, height: number): Promise<Uint8Array> {
	return sharp({
		create: { width, height, channels: 3, background: '#808080', noise: { type: 'gaussian', mean: 128, sigma: 12 } }
	})
		.jpeg({ quality: 92 })
		.toBuffer();
}

async function rejection(p: Promise<unknown>): Promise<unknown> {
	return p.then(
		() => null,
		(e) => e
	);
}

describe('storeImage', () => {
	it('Scenario: Uploaded image is stored downscaled', async () => {
		const input = await photo(1800, 1200);
		expect(input.length).toBeGreaterThan(TARGET_BYTES);

		const id = await storeImage(input);

		const row = getDb().prepare('SELECT mime, width, height, bytes FROM images WHERE id = ?').get(id)!;
		const bytes = row.bytes as Uint8Array;
		const meta = await sharp(bytes).metadata();
		expect(row.mime).toBe('image/webp');
		expect(meta.format).toBe('webp');
		expect(Math.max(meta.width!, meta.height!)).toBeLessThanOrEqual(MAX_LONG_SIDE);
		expect(bytes.length).toBeLessThanOrEqual(TARGET_BYTES);
		expect(row.width).toBe(meta.width);
		expect(row.height).toBe(meta.height);
		expect(meta.width! / meta.height!).toBeCloseTo(1.5, 1);
	});

	it('does not upscale a small image', async () => {
		const input = await sharp({ create: { width: 120, height: 80, channels: 3, background: '#c05030' } })
			.png()
			.toBuffer();

		const id = await storeImage(input);

		const row = getDb().prepare('SELECT width, height FROM images WHERE id = ?').get(id)!;
		expect([row.width, row.height]).toEqual([120, 80]);
	});

	it('Scenario: Non-image file is rejected by the server', async () => {
		const err = await rejection(storeImage(new TextEncoder().encode('just some text, not an image')));

		expect(err).toBeInstanceOf(ImageError);
		expect((err as ImageError).reason).toBe('not-image');
		expect(imageRows()).toBe(0);
	});

	it('rejects an SVG as not-image', async () => {
		const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');

		const err = await rejection(storeImage(svg));

		expect((err as ImageError).reason).toBe('not-image');
		expect(imageRows()).toBe(0);
	});

	it('rejects more than 15 MB as too-large and writes no row', async () => {
		const err = await rejection(storeImage(new Uint8Array(MAX_UPLOAD_BYTES + 1)));

		expect(err).toBeInstanceOf(ImageError);
		expect((err as ImageError).reason).toBe('too-large');
		expect(imageRows()).toBe(0);
	});
});

describe('storeImageFromUrl', () => {
	let server: Server;
	let base: string;
	let jpeg: Uint8Array;

	beforeAll(async () => {
		jpeg = await photo(1800, 1200);
		server = createServer((req, res) => {
			if (req.url === '/photo.jpg') {
				res.writeHead(200, { 'content-type': 'image/jpeg' }).end(jpeg);
			} else if (req.url === '/redirect') {
				res.writeHead(302, { location: '/photo.jpg' }).end();
			} else if (req.url === '/page.html') {
				res.writeHead(200, { 'content-type': 'text/html' }).end('<html>no image here</html>');
			} else if (req.url === '/fake.jpg') {
				res.writeHead(200, { 'content-type': 'image/jpeg' }).end('this is text');
			} else if (req.url === '/huge.jpg') {
				res.writeHead(200, { 'content-type': 'image/jpeg' });
				const chunk = Buffer.alloc(1024 * 1024);
				for (let i = 0; i < MAX_UPLOAD_BYTES / chunk.length + 2 && !res.destroyed; i++) res.write(chunk);
				res.end();
			} else {
				res.writeHead(404).end('missing');
			}
		});
		await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
		base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
	});

	afterAll(() => {
		server.closeAllConnections();
		server.close();
	});

	it('Scenario: Image from a URL is stored', async () => {
		const id = await storeImageFromUrl(`${base}/photo.jpg`);

		const row = getDb().prepare('SELECT mime, bytes FROM images WHERE id = ?').get(id)!;
		const meta = await sharp(row.bytes as Uint8Array).metadata();
		expect(row.mime).toBe('image/webp');
		expect(Math.max(meta.width!, meta.height!)).toBeLessThanOrEqual(MAX_LONG_SIDE);
		expect((row.bytes as Uint8Array).length).toBeLessThanOrEqual(TARGET_BYTES);
		expect(imageRows()).toBe(1);
	});

	it('follows a redirect to the image', async () => {
		await storeImageFromUrl(`${base}/redirect`);

		expect(imageRows()).toBe(1);
	});

	it('maps a 404 to download', async () => {
		const err = await rejection(storeImageFromUrl(`${base}/missing.jpg`));

		expect(err).toBeInstanceOf(ImageError);
		expect((err as ImageError).reason).toBe('download');
		expect(imageRows()).toBe(0);
	});

	it('maps an unreachable host and an invalid url to download', async () => {
		const closed = createServer();
		await new Promise<void>((done) => closed.listen(0, '127.0.0.1', done));
		const port = (closed.address() as AddressInfo).port;
		await new Promise((done) => closed.close(done));

		for (const url of [`http://127.0.0.1:${port}/x.jpg`, 'not a url', 'file:///etc/passwd']) {
			const err = await rejection(storeImageFromUrl(url));
			expect((err as ImageError).reason, url).toBe('download');
		}
	});

	it('maps a non-image content type to not-image', async () => {
		const err = await rejection(storeImageFromUrl(`${base}/page.html`));

		expect((err as ImageError).reason).toBe('not-image');
		expect(imageRows()).toBe(0);
	});

	it('maps image bytes that do not decode to not-image', async () => {
		const err = await rejection(storeImageFromUrl(`${base}/fake.jpg`));

		expect((err as ImageError).reason).toBe('not-image');
		expect(imageRows()).toBe(0);
	});

	it('maps a body over 15 MB to too-large', async () => {
		const err = await rejection(storeImageFromUrl(`${base}/huge.jpg`));

		expect((err as ImageError).reason).toBe('too-large');
		expect(imageRows()).toBe(0);
	});
});

describe('getImage', () => {
	it('returns the stored mime and bytes, and null for an unknown id', async () => {
		const id = await storeImage(await photo(800, 600));

		const found = getImage(id)!;

		const stored = getDb().prepare('SELECT bytes FROM images WHERE id = ?').get(id)!.bytes as Uint8Array;
		expect(found.mime).toBe('image/webp');
		expect(Buffer.from(found.bytes).equals(Buffer.from(stored))).toBe(true);
		expect(getImage(id + 1)).toBeNull();
	});
});
