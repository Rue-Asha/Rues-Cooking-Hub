import { COPY } from '../copy.ts';
import { ValidationError } from '../errors.ts';
import type { Id, IsoDate, PlanEntry, PlanEntryInput, Slot } from '../types.ts';
import { addDays } from '../dates.ts';
import { getDb } from './db.ts';
import { transaction } from './recipes.ts';

const validServings = (n: number) => Number.isInteger(n) && n >= 1;

export function weekEntries(monday: IsoDate): PlanEntry[] {
	return entriesInRange(monday, addDays(monday, 6));
}

export function entriesInRange(from: IsoDate, to: IsoDate): PlanEntry[] {
	return getDb()
		.prepare(
			`SELECT e.id, e.date, e.slot, e.position, e.servings, e.text,
			        r.id AS recipe_id, r.title AS recipe_title, r.image_id AS recipe_image, r.servings AS recipe_servings
			 FROM plan_entries e LEFT JOIN recipes r ON r.id = e.recipe_id
			 WHERE e.date >= ? AND e.date <= ?
			 ORDER BY e.date,
			   CASE e.slot WHEN 'breakfast' THEN 0 WHEN 'lunch' THEN 1 WHEN 'dinner' THEN 2 ELSE 3 END,
			   e.position, e.id`
		)
		.all(from, to)
		.map((r) => ({
			id: Number(r.id),
			date: String(r.date),
			slot: String(r.slot) as Slot,
			position: Number(r.position),
			recipe:
				r.recipe_id === null
					? null
					: {
							id: Number(r.recipe_id),
							title: String(r.recipe_title),
							imageId: r.recipe_image === null ? null : Number(r.recipe_image),
							servings: Number(r.recipe_servings)
						},
			servings: r.servings === null ? null : Number(r.servings),
			text: r.text === null ? null : String(r.text)
		}));
}

function endOfSlot(date: IsoDate, slot: Slot): number {
	const r = getDb()
		.prepare('SELECT max(position) AS p FROM plan_entries WHERE date = ? AND slot = ?')
		.get(date, slot);
	return r?.p === null || r?.p === undefined ? 0 : Number(r.p) + 1;
}

// appended; throws ValidationError
export function addEntry(input: PlanEntryInput): Id {
	const db = getDb();
	if ('recipeId' in input) {
		if (!validServings(input.servings)) throw new ValidationError({ servings: COPY.servingsMin });
		if (!db.prepare('SELECT 1 FROM recipes WHERE id = ?').get(input.recipeId))
			throw new ValidationError({ recipeId: COPY.entryEmpty });
	} else if (!input.text.trim()) {
		throw new ValidationError({ text: COPY.entryEmpty });
	}
	return transaction(() => {
		const position = endOfSlot(input.date, input.slot);
		const { lastInsertRowid } =
			'recipeId' in input
				? db
						.prepare(
							'INSERT INTO plan_entries (date, slot, position, recipe_id, servings) VALUES (?, ?, ?, ?, ?)'
						)
						.run(input.date, input.slot, position, input.recipeId, input.servings)
				: db
						.prepare('INSERT INTO plan_entries (date, slot, position, text) VALUES (?, ?, ?, ?)')
						.run(input.date, input.slot, position, input.text.trim());
		return Number(lastInsertRowid);
	});
}

// servings applies to recipe entries and text to free-text entries; the other kind is left alone
export function updateEntry(id: Id, patch: { servings?: number; text?: string }): void {
	const errors: Record<string, string> = {};
	if (patch.servings !== undefined && !validServings(patch.servings)) errors.servings = COPY.servingsMin;
	if (patch.text !== undefined && !patch.text.trim()) errors.text = COPY.entryEmpty;
	if (Object.keys(errors).length > 0) throw new ValidationError(errors);
	const db = getDb();
	transaction(() => {
		if (patch.servings !== undefined)
			db.prepare('UPDATE plan_entries SET servings = ? WHERE id = ? AND recipe_id IS NOT NULL').run(
				patch.servings,
				id
			);
		if (patch.text !== undefined)
			db.prepare('UPDATE plan_entries SET text = ? WHERE id = ? AND recipe_id IS NULL').run(
				patch.text.trim(),
				id
			);
	});
}

function renumber(date: IsoDate, slot: Slot): void {
	const db = getDb();
	const update = db.prepare('UPDATE plan_entries SET position = ? WHERE id = ?');
	db.prepare('SELECT id FROM plan_entries WHERE date = ? AND slot = ? ORDER BY position, id')
		.all(date, slot)
		.forEach((r, i) => update.run(i, Number(r.id)));
}

// no position = end
export function moveEntry(id: Id, to: { date: IsoDate; slot: Slot; position?: number }): void {
	transaction(() => {
		const db = getDb();
		const e = db.prepare('SELECT date, slot FROM plan_entries WHERE id = ?').get(id);
		if (!e) return;
		const siblings = db
			.prepare(
				'SELECT id FROM plan_entries WHERE date = ? AND slot = ? AND id != ? ORDER BY position, id'
			)
			.all(to.date, to.slot, id)
			.map((r) => Number(r.id));
		const at = Math.min(Math.max(to.position ?? siblings.length, 0), siblings.length);
		siblings.splice(at, 0, id);
		db.prepare('UPDATE plan_entries SET date = ?, slot = ? WHERE id = ?').run(to.date, to.slot, id);
		const update = db.prepare('UPDATE plan_entries SET position = ? WHERE id = ?');
		siblings.forEach((sid, i) => update.run(i, sid));
		if (e.date !== to.date || e.slot !== to.slot) renumber(String(e.date), String(e.slot) as Slot);
	});
}

export function deleteEntry(id: Id): void {
	transaction(() => {
		const db = getDb();
		const e = db.prepare('SELECT date, slot FROM plan_entries WHERE id = ?').get(id);
		if (!e) return;
		db.prepare('DELETE FROM plan_entries WHERE id = ?').run(id);
		renumber(String(e.date), String(e.slot) as Slot);
	});
}

export function copyWeek(fromMonday: IsoDate, toMonday: IsoDate): { copied: number } {
	const source = weekEntries(fromMonday);
	return transaction(() => {
		const db = getDb();
		const insert = db.prepare(
			'INSERT INTO plan_entries (date, slot, position, recipe_id, servings, text) VALUES (?, ?, ?, ?, ?, ?)'
		);
		const days = new Map(
			Array.from({ length: 7 }, (_, i) => [addDays(fromMonday, i), addDays(toMonday, i)])
		);
		for (const e of source) {
			const date = days.get(e.date)!;
			insert.run(date, e.slot, endOfSlot(date, e.slot), e.recipe?.id ?? null, e.servings, e.text);
		}
		return { copied: source.length };
	});
}
