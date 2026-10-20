import { crc32, deflateSync } from 'node:zlib';
import { json } from '@sveltejs/kit';
import { parseIngredient } from '#lib/ingredients/parse.ts';
import { nameKey } from '#lib/shopping/aggregate.ts';
import { getDb } from '#lib/server/db.ts';
import { refreshSearchText } from '#lib/server/recipes.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import { fold } from '#lib/text.ts';
import type { Amount, Category, Id, IsoDate, Section, Slot } from '#lib/types.ts';
import type { RequestHandler } from './$types';

// `entries[].recipe` is an index into this request's `recipes`, because the ids only exist once the rows are inserted.
export interface SeedInput {
	recipes?: {
		title: string;
		description?: string;
		sourceUrl?: string;
		servings?: number;
		prepMinutes?: number;
		cookMinutes?: number;
		notes?: string;
		favourite?: boolean;
		favouritedAt?: string;
		createdAt?: string;
		tags?: string[];
		image?: boolean;
		ingredients?: Section<string>[];
		steps?: Section<string>[];
	}[];
	entries?: { date: IsoDate; slot: Slot; recipe?: number; servings?: number; text?: string }[];
	items?: {
		name: string;
		manualAmounts?: Amount[];
		planAmounts?: Amount[];
		category?: Category;
		checked?: boolean;
		origin?: 'manual' | 'plan';
	}[];
	categoryMemory?: { name: string; category: Category }[];
}

export interface SeedResult {
	recipes: Id[];
	entries: Id[];
	items: Id[];
}

function png(width: number, height: number): Uint8Array {
	const chunk = (type: string, data: Buffer) => {
		const body = Buffer.concat([Buffer.from(type), data]);
		const out = Buffer.alloc(body.length + 8);
		out.writeUInt32BE(data.length, 0);
		body.copy(out, 4);
		out.writeUInt32BE(crc32(body), body.length + 4);
		return out;
	};
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width, 0);
	header.writeUInt32BE(height, 4);
	header.set([8, 2, 0, 0, 0], 8);
	const raw = Buffer.alloc((width * 3 + 1) * height);
	for (let y = 0; y < height; y++) {
		const row = y * (width * 3 + 1);
		for (let x = 0; x < width; x++)
			raw.set([200 - y, 150 + ((x * 40) % 60), 110 + x], row + 1 + x * 3);
	}
	return new Uint8Array(
		Buffer.concat([
			Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
			chunk('IHDR', header),
			chunk('IDAT', deflateSync(raw)),
			chunk('IEND', Buffer.alloc(0))
		])
	);
}

const IMAGE = { width: 64, height: 48, bytes: png(64, 48) };

export const POST: RequestHandler = async ({ request }) => {
	requireTestFlag();
	const input = (await request.json()) as SeedInput;
	const db = getDb();
	const now = new Date().toISOString();
	const result: SeedResult = { recipes: [], entries: [], items: [] };
	const servingsOf: number[] = [];

	const insertImage = db.prepare(
		"INSERT INTO images (mime, width, height, bytes, created_at) VALUES ('image/png', ?, ?, ?, ?)"
	);
	const insertRecipe = db.prepare(
		`INSERT INTO recipes (title, description, source_url, servings, prep_minutes, cook_minutes, notes, favourite,
		                      favourited_at, image_id, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	);
	const findTag = db.prepare('SELECT id FROM tags WHERE name_key = ?');
	const insertTag = db.prepare('INSERT INTO tags (name, name_key) VALUES (?, ?)');
	const linkTag = db.prepare('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)');
	const insertIngredient = db.prepare(
		`INSERT INTO ingredient_lines (recipe_id, section, section_title, position, text, quantity, unit, name, note)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	);
	const insertStep = db.prepare(
		'INSERT INTO step_lines (recipe_id, section, section_title, position, text) VALUES (?, ?, ?, ?, ?)'
	);
	for (const r of input.recipes ?? []) {
		const servings = r.servings ?? 2;
		const imageId = r.image
			? Number(insertImage.run(IMAGE.width, IMAGE.height, IMAGE.bytes, now).lastInsertRowid)
			: null;
		const createdAt = r.createdAt ?? now;
		const id = Number(
			insertRecipe.run(
				r.title,
				r.description ?? null,
				r.sourceUrl ?? null,
				servings,
				r.prepMinutes ?? null,
				r.cookMinutes ?? null,
				r.notes ?? null,
				r.favourite ? 1 : 0,
				r.favouritedAt ?? (r.favourite ? now : null),
				imageId,
				createdAt,
				createdAt
			).lastInsertRowid
		);
		for (const name of r.tags ?? []) {
			const key = fold(name);
			const tagId =
				(findTag.get(key)?.id as number | undefined) ??
				Number(insertTag.run(name.trim(), key).lastInsertRowid);
			linkTag.run(id, tagId);
		}
		(r.ingredients ?? [])
			.filter((s) => s.lines.length > 0)
			.forEach((s, section) =>
				s.lines.forEach((text, position) => {
					const p = parseIngredient(text);
					insertIngredient.run(id, section, s.title, position, p.text, p.quantity, p.unit, p.name, p.note);
				})
			);
		(r.steps ?? [])
			.filter((s) => s.lines.length > 0)
			.forEach((s, section) =>
				s.lines.forEach((text, position) => insertStep.run(id, section, s.title, position, text))
			);
		refreshSearchText(id);
		result.recipes.push(id);
		servingsOf.push(servings);
	}

	const insertEntry = db.prepare(
		`INSERT INTO plan_entries (date, slot, position, recipe_id, servings, text)
		 VALUES (?, ?, (SELECT coalesce(max(position) + 1, 0) FROM plan_entries WHERE date = ? AND slot = ?), ?, ?, ?)`
	);
	for (const e of input.entries ?? []) {
		const recipeId = e.recipe === undefined ? null : result.recipes[e.recipe];
		const servings = recipeId === null ? null : (e.servings ?? servingsOf[e.recipe!]);
		const { lastInsertRowid } = insertEntry.run(e.date, e.slot, e.date, e.slot, recipeId, servings, e.text ?? null);
		result.entries.push(Number(lastInsertRowid));
	}

	const insertItem = db.prepare(
		`INSERT INTO shopping_items (name, name_key, manual_amounts, plan_amounts, category, checked, checked_at, origin,
		                             position, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, (SELECT coalesce(max(position) + 1, 0) FROM shopping_items), ?)`
	);
	for (const i of input.items ?? []) {
		const { lastInsertRowid } = insertItem.run(
			i.name,
			nameKey(i.name),
			JSON.stringify(i.manualAmounts ?? []),
			JSON.stringify(i.planAmounts ?? []),
			i.category ?? 'other',
			i.checked ? 1 : 0,
			i.checked ? now : null,
			i.origin ?? 'manual',
			now
		);
		result.items.push(Number(lastInsertRowid));
	}

	const remember = db.prepare('INSERT OR REPLACE INTO category_memory (name_key, category) VALUES (?, ?)');
	for (const m of input.categoryMemory ?? []) remember.run(nameKey(m.name), m.category);

	return json(result);
};
