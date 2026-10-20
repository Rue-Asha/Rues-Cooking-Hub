import { COPY } from '../copy.ts';
import { ValidationError } from '../errors.ts';
import { parseIngredient } from '../ingredients/parse.ts';
import { fold } from '../text.ts';
import type {
	ArchiveQuery,
	Id,
	ParsedLine,
	Recipe,
	RecipeCard,
	RecipeInput,
	Section,
	Tag
} from '../types.ts';
import { getDb } from './db.ts';
import { normaliseUrl } from './import.ts';
import { ensureTags } from './tags.ts';

// reentrant: a function called inside another's transaction joins it
export function transaction<T>(fn: () => T): T {
	const db = getDb();
	if (db.isTransaction) return fn();
	db.exec('BEGIN');
	try {
		const result = fn();
		db.exec('COMMIT');
		return result;
	} catch (e) {
		db.exec('ROLLBACK');
		throw e;
	}
}

function blankToNull(s: string | null): string | null {
	const t = s?.trim();
	return t ? t : null;
}

// stored in the form findBySourceUrl is asked for, so an import of the same page finds it however the source was typed
function sourceOf(input: RecipeInput): string | null {
	const url = blankToNull(input.sourceUrl);
	return url === null ? null : (normaliseUrl(url) ?? url);
}

const wholeMinutes = (n: number | null): boolean => n === null || (Number.isInteger(n) && n >= 0);

function validate(input: RecipeInput): void {
	const errors: Record<string, string> = {};
	if (!input.title.trim()) errors.title = COPY.titleRequired;
	if (!Number.isInteger(input.servings) || input.servings < 1) errors.servings = COPY.servingsMin;
	if (!wholeMinutes(input.prepMinutes)) errors.prepMinutes = COPY.minutesInvalid;
	if (!wholeMinutes(input.cookMinutes)) errors.cookMinutes = COPY.minutesInvalid;
	if (Object.keys(errors).length > 0) throw new ValidationError(errors);
}

function cleanSections(sections: Section<string>[]): Section<string>[] {
	return sections
		.map((s) => ({
			title: blankToNull(s.title),
			lines: s.lines.map((l) => l.trim()).filter(Boolean)
		}))
		.filter((s) => s.lines.length > 0);
}

function writeBody(id: Id, input: RecipeInput): void {
	const db = getDb();
	const insertIngredient = db.prepare(
		`INSERT INTO ingredient_lines (recipe_id, section, section_title, position, text, quantity, unit, name, note)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	);
	cleanSections(input.ingredients).forEach((s, section) =>
		s.lines.forEach((text, position) => {
			const p = parseIngredient(text);
			insertIngredient.run(id, section, s.title, position, text, p.quantity, p.unit, p.name, p.note);
		})
	);
	const insertStep = db.prepare(
		'INSERT INTO step_lines (recipe_id, section, section_title, position, text) VALUES (?, ?, ?, ?, ?)'
	);
	cleanSections(input.steps).forEach((s, section) =>
		s.lines.forEach((text, position) => insertStep.run(id, section, s.title, position, text))
	);
	const link = db.prepare('INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)');
	for (const tag of ensureTags(input.tagNames)) link.run(id, tag.id);
	refreshSearchText(id);
}

export function createRecipe(input: RecipeInput): Id {
	validate(input);
	return transaction(() => {
		const now = new Date().toISOString();
		const { lastInsertRowid } = getDb()
			.prepare(
				`INSERT INTO recipes (title, description, source_url, servings, prep_minutes, cook_minutes, notes,
				                      favourite, favourited_at, image_id, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				input.title.trim(),
				blankToNull(input.description),
				sourceOf(input),
				input.servings,
				input.prepMinutes,
				input.cookMinutes,
				blankToNull(input.notes),
				input.favourite ? 1 : 0,
				input.favourite ? now : null,
				input.imageId,
				now,
				now
			);
		const id = Number(lastInsertRowid);
		writeBody(id, input);
		return id;
	});
}

export function updateRecipe(id: Id, input: RecipeInput): void {
	validate(input);
	transaction(() => {
		const db = getDb();
		const now = new Date().toISOString();
		const old = db.prepare('SELECT image_id FROM recipes WHERE id = ?').get(id)?.image_id ?? null;
		db.prepare(
			`UPDATE recipes SET title = ?, description = ?, source_url = ?, servings = ?, prep_minutes = ?,
			   cook_minutes = ?, notes = ?, favourite = ?,
			   favourited_at = CASE WHEN ? THEN coalesce(favourited_at, ?) ELSE NULL END,
			   image_id = ?, updated_at = ? WHERE id = ?`
		).run(
			input.title.trim(),
			blankToNull(input.description),
			sourceOf(input),
			input.servings,
			input.prepMinutes,
			input.cookMinutes,
			blankToNull(input.notes),
			input.favourite ? 1 : 0,
			input.favourite ? 1 : 0,
			now,
			input.imageId,
			now,
			id
		);
		db.prepare('DELETE FROM ingredient_lines WHERE recipe_id = ?').run(id);
		db.prepare('DELETE FROM step_lines WHERE recipe_id = ?').run(id);
		db.prepare('DELETE FROM recipe_tags WHERE recipe_id = ?').run(id);
		writeBody(id, input);
		if (old !== null && old !== input.imageId) db.prepare('DELETE FROM images WHERE id = ?').run(old);
	});
}

function sections<T>(
	rows: { section: unknown; section_title: unknown; line: T }[]
): Section<T>[] {
	const out: Section<T>[] = [];
	let last: unknown = undefined;
	for (const r of rows) {
		if (r.section !== last) {
			out.push({ title: r.section_title === null ? null : String(r.section_title), lines: [] });
			last = r.section;
		}
		out[out.length - 1].lines.push(r.line);
	}
	return out;
}

function tagsOf(id: Id): Tag[] {
	return getDb()
		.prepare(
			`SELECT t.id, t.name FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id
			 WHERE rt.recipe_id = ? ORDER BY t.name`
		)
		.all(id)
		.map((t) => ({ id: Number(t.id), name: String(t.name) }));
}

export function getRecipe(id: Id): Recipe | null {
	const db = getDb();
	const r = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
	if (!r) return null;
	const str = (v: unknown) => (v === null ? null : String(v));
	const num = (v: unknown) => (v === null ? null : Number(v));
	const prep = num(r.prep_minutes);
	const cook = num(r.cook_minutes);
	const ingredients = db
		.prepare('SELECT * FROM ingredient_lines WHERE recipe_id = ? ORDER BY section, position')
		.all(id)
		.map((l) => ({
			section: l.section,
			section_title: l.section_title,
			line: {
				text: String(l.text),
				quantity: num(l.quantity),
				unit: str(l.unit),
				name: String(l.name),
				note: str(l.note)
			} satisfies ParsedLine
		}));
	const steps = db
		.prepare('SELECT * FROM step_lines WHERE recipe_id = ? ORDER BY section, position')
		.all(id)
		.map((l) => ({ section: l.section, section_title: l.section_title, line: String(l.text) }));
	return {
		id,
		title: String(r.title),
		description: str(r.description),
		sourceUrl: str(r.source_url),
		servings: Number(r.servings),
		prepMinutes: prep,
		cookMinutes: cook,
		totalMinutes: prep === null && cook === null ? null : (prep ?? 0) + (cook ?? 0),
		notes: str(r.notes),
		favourite: r.favourite === 1,
		favouritedAt: str(r.favourited_at),
		imageId: num(r.image_id),
		createdAt: String(r.created_at),
		updatedAt: String(r.updated_at),
		tags: tagsOf(id),
		ingredients: sections(ingredients),
		steps: sections(steps)
	};
}

function cards(rows: Record<string, unknown>[]): RecipeCard[] {
	const tags = new Map<number, Tag[]>();
	for (const t of getDb()
		.prepare(
			`SELECT rt.recipe_id, t.id, t.name FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id ORDER BY t.name`
		)
		.all()) {
		const list = tags.get(Number(t.recipe_id)) ?? [];
		list.push({ id: Number(t.id), name: String(t.name) });
		tags.set(Number(t.recipe_id), list);
	}
	return rows.map((r) => {
		const prep = r.prep_minutes === null ? null : Number(r.prep_minutes);
		const cook = r.cook_minutes === null ? null : Number(r.cook_minutes);
		return {
			id: Number(r.id),
			title: String(r.title),
			description: r.description === null ? null : String(r.description),
			imageId: r.image_id === null ? null : Number(r.image_id),
			totalMinutes: prep === null && cook === null ? null : (prep ?? 0) + (cook ?? 0),
			servings: Number(r.servings),
			tags: tags.get(Number(r.id)) ?? [],
			favourite: r.favourite === 1,
			createdAt: String(r.created_at)
		};
	});
}

const CARD_COLUMNS =
	'id, title, description, image_id, prep_minutes, cook_minutes, servings, favourite, created_at';

export function listRecipes(query: ArchiveQuery): RecipeCard[] {
	const where: string[] = [];
	const params: (string | number)[] = [];
	const q = fold(query.q ?? '');
	if (q) {
		where.push('instr(search_text, ?) > 0');
		params.push(q);
	}
	const tagIds = [...new Set(query.tagIds ?? [])];
	if (tagIds.length > 0) {
		where.push(
			`id IN (SELECT recipe_id FROM recipe_tags WHERE tag_id IN (${tagIds.map(() => '?').join(',')})
			        GROUP BY recipe_id HAVING count(DISTINCT tag_id) = ?)`
		);
		params.push(...tagIds, tagIds.length);
	}
	if (query.favouritesOnly) where.push('favourite = 1');
	const rows = getDb()
		.prepare(
			`SELECT ${CARD_COLUMNS} FROM recipes${where.length ? ` WHERE ${where.join(' AND ')}` : ''}
			 ORDER BY created_at DESC, id DESC`
		)
		.all(...params);
	const list = cards(rows);
	// sort() is stable, so ties keep the newest-first order
	if (query.sort === 'title')
		list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
	else if (query.sort === 'time')
		list.sort((a, b) => {
			if (a.totalMinutes === null || b.totalMinutes === null)
				return (a.totalMinutes === null ? 1 : 0) - (b.totalMinutes === null ? 1 : 0);
			return a.totalMinutes - b.totalMinutes;
		});
	return list;
}

// 7 newest, createdAt desc, id desc
export function featuredRecipes(): RecipeCard[] {
	return cards(
		getDb()
			.prepare(`SELECT ${CARD_COLUMNS} FROM recipes ORDER BY created_at DESC, id DESC LIMIT 7`)
			.all()
	);
}

// a stored URL may carry a #fragment that the caller's normalised URL does not
export function findBySourceUrl(url: string): { id: Id; title: string } | null {
	const r = getDb()
		.prepare(
			`SELECT id, title FROM recipes WHERE substr(source_url, 1, instr(source_url || '#', '#') - 1) = ?
			 ORDER BY id LIMIT 1`
		)
		.get(url.split('#')[0]);
	return r ? { id: Number(r.id), title: String(r.title) } : null;
}

export function planUsage(id: Id): number {
	return Number(
		getDb().prepare('SELECT count(*) AS n FROM plan_entries WHERE recipe_id = ?').get(id)?.n
	);
}

export function deleteRecipe(id: Id): { convertedEntries: number } {
	return transaction(() => {
		const db = getDb();
		const r = db.prepare('SELECT title, image_id FROM recipes WHERE id = ?').get(id);
		if (!r) return { convertedEntries: 0 };
		const { changes } = db
			.prepare(
				'UPDATE plan_entries SET recipe_id = NULL, servings = NULL, text = ? WHERE recipe_id = ?'
			)
			.run(String(r.title), id);
		db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
		if (r.image_id !== null) db.prepare('DELETE FROM images WHERE id = ?').run(r.image_id);
		return { convertedEntries: Number(changes) };
	});
}

// sets/clears favouritedAt
export function setFavourite(id: Id, favourite: boolean): void {
	getDb()
		.prepare(
			`UPDATE recipes SET favourite = ?, favourited_at = CASE WHEN ? THEN coalesce(favourited_at, ?) ELSE NULL END
			 WHERE id = ?`
		)
		.run(favourite ? 1 : 0, favourite ? 1 : 0, new Date().toISOString(), id);
}

export function refreshSearchText(id: Id): void {
	const db = getDb();
	const r = db.prepare('SELECT title, description FROM recipes WHERE id = ?').get(id);
	if (!r) return;
	const names = db
		.prepare('SELECT name FROM ingredient_lines WHERE recipe_id = ? ORDER BY section, position')
		.all(id)
		.map((l) => String(l.name));
	// folded part by part and joined with a newline, which fold() would collapse: a query can't match across parts
	const parts = [String(r.title), r.description === null ? '' : String(r.description), ...names, ...tagsOf(id).map((t) => t.name)];
	db.prepare('UPDATE recipes SET search_text = ? WHERE id = ?').run(
		parts.map(fold).filter(Boolean).join('\n'),
		id
	);
}
