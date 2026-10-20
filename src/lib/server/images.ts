import sharp, { type OutputInfo } from 'sharp';
import { ImageError } from '../errors.ts';
import type { Id } from '../types.ts';
import { getDb } from './db.ts';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_LONG_SIDE = 1600;
export const TARGET_BYTES = 200 * 1024;
export const FETCH_TIMEOUT_MS = 10_000;
const MIN_LONG_SIDE = 64;
const QUALITIES = [80, 70, 60, 50, 40];
// svg and pdf would be rasterised from author-controlled markup, so only photo formats count
const FORMATS = new Set(['jpeg', 'png', 'webp', 'gif', 'avif', 'heif', 'tiff']);

async function downscale(bytes: Uint8Array): Promise<{ data: Buffer; width: number; height: number }> {
	const meta = await sharp(bytes).metadata();
	if (!meta.format || !FORMATS.has(meta.format)) throw new ImageError('not-image');
	for (let side = MAX_LONG_SIDE; ; side = Math.floor(side * 0.8)) {
		let out: { data: Buffer; info: OutputInfo } | null = null;
		for (const quality of QUALITIES) {
			out = await sharp(bytes)
				.rotate()
				.resize({ width: side, height: side, fit: 'inside', withoutEnlargement: true })
				.webp({ quality })
				.toBuffer({ resolveWithObject: true });
			if (out.data.length <= TARGET_BYTES) break;
		}
		if (out!.data.length <= TARGET_BYTES || side * 0.8 < MIN_LONG_SIDE) {
			return { data: out!.data, width: out!.info.width, height: out!.info.height };
		}
	}
}

// throws ImageError
export async function storeImage(bytes: Uint8Array): Promise<Id> {
	if (bytes.length > MAX_UPLOAD_BYTES) throw new ImageError('too-large');
	const image = await downscale(bytes).catch((e) => {
		throw e instanceof ImageError ? e : new ImageError('not-image');
	});
	const { lastInsertRowid } = getDb()
		.prepare('INSERT INTO images (mime, width, height, bytes, created_at) VALUES (?, ?, ?, ?, ?)')
		.run('image/webp', image.width, image.height, image.data, new Date().toISOString());
	return Number(lastInsertRowid);
}

async function readCapped(res: Response): Promise<Uint8Array> {
	const declared = Number(res.headers.get('content-length'));
	if (declared > MAX_UPLOAD_BYTES) throw new ImageError('too-large');
	const chunks: Uint8Array[] = [];
	let total = 0;
	for await (const chunk of res.body ?? []) {
		total += chunk.length;
		if (total > MAX_UPLOAD_BYTES) throw new ImageError('too-large');
		chunks.push(chunk);
	}
	return Buffer.concat(chunks);
}

// throws ImageError('download' | 'not-image' | 'too-large')
export async function storeImageFromUrl(url: string): Promise<Id> {
	let bytes: Uint8Array;
	try {
		const target = new URL(url);
		if (target.protocol !== 'http:' && target.protocol !== 'https:') throw new Error('scheme');
		const res = await fetch(target, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
		if (!res.ok) throw new Error(`status ${res.status}`);
		if (!res.headers.get('content-type')?.toLowerCase().startsWith('image/')) {
			await res.body?.cancel();
			throw new ImageError('not-image');
		}
		bytes = await readCapped(res);
	} catch (e) {
		throw e instanceof ImageError ? e : new ImageError('download');
	}
	return storeImage(bytes);
}

export function getImage(id: Id): { mime: string; bytes: Uint8Array } | null {
	const row = getDb().prepare('SELECT mime, bytes FROM images WHERE id = ?').get(id);
	return row ? { mime: String(row.mime), bytes: row.bytes as Uint8Array } : null;
}
