import { COPY } from '../copy.ts';
import { ValidationError } from '../errors.ts';
import { fold } from '../text.ts';
import type {
	Id,
	Price,
	Spot,
	SpotCard,
	SpotCounts,
	SpotFacets,
	SpotInput,
	SpotQuery,
	SpotStatus,
	Tag
} from '../types.ts';
import { getDb } from './db.ts';
import { transaction } from './recipes.ts';
import { rankScores } from '../spots/query.ts';

function blankToNull(s: string | null): string | null {
	const t = s?.trim();
	return t ? t : null;
}

function tidy(name: string): string {
	return name.normalize('NFC').trim().replace(/\s+/g, ' ');
}

const validScore = (n: number): boolean => Number.isInteger(n) && n >= 100 && n <= 1000;

function isWebUrl(raw: string): boolean {
	try {
		const { protocol } = new URL(raw);
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
}

export function spotErrors(input: SpotInput): Record<string, string> {
	const errors: Record<string, string> = {};
	if (!input.name.trim()) errors.name = COPY.nameRequired;
	if (input.status === 'visited') {
		if (input.scoreHundredths === null) errors.score = COPY.scoreRequired;
		else if (!validScore(input.scoreHundredths)) errors.score = COPY.scoreInvalid;
	} else if (input.scoreHundredths !== null) errors.score = COPY.scoreInvalid;
	const website = blankToNull(input.website);
	if (website !== null && !isWebUrl(website)) errors.website = COPY.invalidUrl;
	return errors;
}

function validate(input: SpotInput): void {
	const errors = spotErrors(input);
	if (Object.keys(errors).length > 0) throw new ValidationError(errors);
}

export function ensureSpotTags(names: string[]): Tag[] {
	const db = getDb();
	const find = db.prepare('SELECT id, name FROM spot_tags WHERE name_key = ?');
	const insert = db.prepare('INSERT INTO spot_tags (name, name_key) VALUES (?, ?)');
	const seen = new Set<string>();
	const tags: Tag[] = [];
	transaction(() => {
		for (const raw of names) {
			const key = fold(raw);
			if (!key || seen.has(key)) continue;
			seen.add(key);
			const found = find.get(key);
			if (found) tags.push({ id: Number(found.id), name: String(found.name) });
			else {
				const name = tidy(raw);
				tags.push({ id: Number(insert.run(name, key).lastInsertRowid), name });
			}
		}
	});
	return tags;
}

const byName = (a: { name: string; id: Id }, b: { name: string; id: Id }): number =>
	a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || a.id - b.id;

// every spot tag is in use: unused ones are deleted after each write
export function spotTags(): Tag[] {
	return getDb()
		.prepare('SELECT id, name FROM spot_tags')
		.all()
		.map((t) => ({ id: Number(t.id), name: String(t.name) }))
		.sort(byName);
}

function dropUnusedTags(): void {
	getDb().exec('DELETE FROM spot_tags WHERE id NOT IN (SELECT tag_id FROM spot_tag_links)');
}

function tagsOf(id: Id): Tag[] {
	return getDb()
		.prepare(
			`SELECT t.id, t.name FROM spot_tag_links l JOIN spot_tags t ON t.id = l.tag_id WHERE l.spot_id = ?`
		)
		.all(id)
		.map((t) => ({ id: Number(t.id), name: String(t.name) }))
		.sort(byName);
}

function writeLinks(id: Id, input: SpotInput): void {
	const link = getDb().prepare('INSERT INTO spot_tag_links (spot_id, tag_id) VALUES (?, ?)');
	for (const tag of ensureSpotTags(input.tagNames)) link.run(id, tag.id);
	refreshSpotSearchText(id);
}

export function createSpot(input: SpotInput): Id {
	validate(input);
	return transaction(() => {
		const now = new Date().toISOString();
		const { lastInsertRowid } = getDb()
			.prepare(
				`INSERT INTO spots (name, status, score_hundredths, price, city, neighbourhood, address, website, notes,
				                    image_id, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				input.name.trim(),
				input.status,
				input.scoreHundredths,
				input.price,
				blankToNull(input.city),
				blankToNull(input.neighbourhood),
				blankToNull(input.address),
				blankToNull(input.website),
				blankToNull(input.notes),
				input.imageId,
				now,
				now
			);
		const id = Number(lastInsertRowid);
		writeLinks(id, input);
		return id;
	});
}

export function updateSpot(id: Id, input: SpotInput): void {
	validate(input);
	transaction(() => {
		const db = getDb();
		const old = db.prepare('SELECT image_id FROM spots WHERE id = ?').get(id);
		if (!old) return;
		db.prepare(
			`UPDATE spots SET name = ?, status = ?, score_hundredths = ?, price = ?, city = ?, neighbourhood = ?,
			   address = ?, website = ?, notes = ?, image_id = ?, updated_at = ? WHERE id = ?`
		).run(
			input.name.trim(),
			input.status,
			input.scoreHundredths,
			input.price,
			blankToNull(input.city),
			blankToNull(input.neighbourhood),
			blankToNull(input.address),
			blankToNull(input.website),
			blankToNull(input.notes),
			input.imageId,
			new Date().toISOString(),
			id
		);
		db.prepare('DELETE FROM spot_tag_links WHERE spot_id = ?').run(id);
		writeLinks(id, input);
		dropUnusedTags();
		if (old.image_id !== null && old.image_id !== input.imageId)
			db.prepare('DELETE FROM images WHERE id = ?').run(old.image_id);
	});
}

export function getSpot(id: Id): Spot | null {
	const r = getDb().prepare('SELECT * FROM spots WHERE id = ?').get(id);
	if (!r) return null;
	const str = (v: unknown) => (v === null ? null : String(v));
	const num = (v: unknown) => (v === null ? null : Number(v));
	return {
		id,
		name: String(r.name),
		status: String(r.status) as SpotStatus,
		scoreHundredths: num(r.score_hundredths),
		price: num(r.price) as Price | null,
		city: str(r.city),
		neighbourhood: str(r.neighbourhood),
		address: str(r.address),
		website: str(r.website),
		notes: str(r.notes),
		imageId: num(r.image_id),
		createdAt: String(r.created_at),
		updatedAt: String(r.updated_at),
		tags: tagsOf(id)
	};
}

export function deleteSpot(id: Id): void {
	transaction(() => {
		const db = getDb();
		const r = db.prepare('SELECT image_id FROM spots WHERE id = ?').get(id);
		if (!r) return;
		db.prepare('DELETE FROM spots WHERE id = ?').run(id);
		if (r.image_id !== null) db.prepare('DELETE FROM images WHERE id = ?').run(r.image_id);
		dropUnusedTags();
	});
}

export function markVisited(id: Id, scoreHundredths: number): void {
	if (!validScore(scoreHundredths)) throw new ValidationError({ score: COPY.scoreInvalid });
	getDb()
		.prepare("UPDATE spots SET status = 'visited', score_hundredths = ?, updated_at = ? WHERE id = ?")
		.run(scoreHundredths, new Date().toISOString(), id);
}

export function refreshSpotSearchText(id: Id): void {
	const r = getDb().prepare('SELECT name, neighbourhood, city, notes FROM spots WHERE id = ?').get(id);
	if (!r) return;
	const part = (v: unknown) => (v === null ? '' : String(v));
	// folded part by part and joined with a newline, which fold() would collapse: a query can't match across parts
	const parts = [part(r.name), part(r.neighbourhood), part(r.city), ...tagsOf(id).map((t) => t.name), part(r.notes)];
	getDb()
		.prepare('UPDATE spots SET search_text = ? WHERE id = ?')
		.run(parts.map(fold).filter(Boolean).join('\n'), id);
}

const CARD_COLUMNS =
	'id, name, status, score_hundredths, price, city, neighbourhood, image_id, created_at';

// the filters without the segment: listSpots keeps one status, spotCounts counts both
function matching(query: SpotQuery): Record<string, unknown>[] {
	const where: string[] = [];
	const params: (string | number)[] = [];
	const q = fold(query.q);
	if (q) {
		where.push('instr(search_text, ?) > 0');
		params.push(q);
	}
	const tagIds = [...new Set(query.tagIds)];
	if (tagIds.length > 0) {
		where.push(
			`id IN (SELECT spot_id FROM spot_tag_links WHERE tag_id IN (${tagIds.map(() => '?').join(',')})
			        GROUP BY spot_id HAVING count(DISTINCT tag_id) = ?)`
		);
		params.push(...tagIds, tagIds.length);
	}
	if (query.price !== null) {
		where.push('price = ?');
		params.push(query.price);
	}
	const rows = getDb()
		.prepare(`SELECT ${CARD_COLUMNS} FROM spots${where.length ? ` WHERE ${where.join(' AND ')}` : ''}`)
		.all(...params);
	// city is compared in JS: SQLite lower() folds ASCII only
	return query.city === null ? rows : rows.filter((r) => r.city !== null && fold(String(r.city)) === query.city);
}

function cards(rows: Record<string, unknown>[]): SpotCard[] {
	const tags = new Map<number, Tag[]>();
	for (const t of getDb()
		.prepare('SELECT l.spot_id, t.id, t.name FROM spot_tag_links l JOIN spot_tags t ON t.id = l.tag_id')
		.all()) {
		const list = tags.get(Number(t.spot_id)) ?? [];
		list.push({ id: Number(t.id), name: String(t.name) });
		tags.set(Number(t.spot_id), list);
	}
	const str = (v: unknown) => (v === null ? null : String(v));
	const num = (v: unknown) => (v === null ? null : Number(v));
	return rows.map((r) => ({
		id: Number(r.id),
		name: String(r.name),
		status: String(r.status) as SpotStatus,
		scoreHundredths: num(r.score_hundredths),
		price: num(r.price) as Price | null,
		city: str(r.city),
		neighbourhood: str(r.neighbourhood),
		imageId: num(r.image_id),
		tags: (tags.get(Number(r.id)) ?? []).sort(byName),
		createdAt: String(r.created_at),
		rank: null
	}));
}

const compareName = (a: SpotCard, b: SpotCard): number =>
	a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || a.id - b.id;

const compareScore = (a: SpotCard, b: SpotCard): number =>
	(b.scoreHundredths ?? 0) - (a.scoreHundredths ?? 0) || compareName(a, b);

export function listSpots(query: SpotQuery): SpotCard[] {
	const list = cards(matching(query).filter((r) => r.status === query.status));
	if (query.sort === 'name') list.sort(compareName);
	else if (query.sort === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
	else list.sort(compareScore);
	if (query.sort === 'score' && query.status === 'visited') {
		const ranks = rankScores(list.map((s) => s.scoreHundredths ?? 0));
		list.forEach((s, i) => (s.rank = ranks[i]));
	}
	return list;
}

export function spotCounts(query: SpotQuery): SpotCounts {
	const rows = matching(query);
	const visited = rows.filter((r) => r.status === 'visited').length;
	return { visited, want: rows.length - visited };
}

export function spotTotals(): SpotCounts {
	const n = (status: SpotStatus) =>
		Number(getDb().prepare('SELECT count(*) AS n FROM spots WHERE status = ?').get(status)?.n);
	return { visited: n('visited'), want: n('want') };
}

export function spotFacets(): SpotFacets {
	const cities = new Map<string, string>();
	// the oldest spot's spelling stands for each folded city
	for (const r of getDb()
		.prepare('SELECT city FROM spots WHERE city IS NOT NULL ORDER BY created_at, id')
		.all()) {
		const key = fold(String(r.city));
		if (!cities.has(key)) cities.set(key, String(r.city));
	}
	const inUse = new Set(
		getDb()
			.prepare('SELECT DISTINCT tag_id FROM spot_tag_links')
			.all()
			.map((r) => Number(r.tag_id))
	);
	return {
		tags: spotTags().filter((t) => inUse.has(t.id)),
		cities: [...cities]
			.map(([key, name]) => ({ key, name }))
			.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
	};
}

export function topSpots(limit: number): SpotCard[] {
	return cards(matching({ status: 'visited', q: '', tagIds: [], city: null, price: null, sort: 'score' }))
		.filter((s) => s.status === 'visited')
		.sort(compareScore)
		.slice(0, limit);
}
