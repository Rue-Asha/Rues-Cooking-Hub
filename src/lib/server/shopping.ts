import { parseIngredient } from '../ingredients/parse.ts';
import { aggregate, mergeAmounts, nameKey } from '../shopping/aggregate.ts';
import { CATEGORIES } from '../types.ts';
import type { AddFromPlanResult, Amount, Category, Id, IsoDate, ParsedLine, ShoppingItem } from '../types.ts';
import { getDb } from './db.ts';
import { entriesInRange } from './plan.ts';
import { getRecipe, transaction } from './recipes.ts';

const RANK = new Map(CATEGORIES.map((c, i) => [c.id, i]));

const amountsOf = (json: unknown): Amount[] => JSON.parse(String(json));

function toItem(r: Record<string, unknown>): ShoppingItem {
	const manualAmounts = amountsOf(r.manual_amounts);
	const planAmounts = amountsOf(r.plan_amounts);
	return {
		id: Number(r.id),
		name: String(r.name),
		category: String(r.category) as Category,
		checked: r.checked === 1,
		origin: String(r.origin) as 'manual' | 'plan',
		position: Number(r.position),
		manualAmounts,
		planAmounts,
		amounts: mergeAmounts(manualAmounts, planAmounts)
	};
}

// category order, then position; checked last by checkedAt
export function listItems(): ShoppingItem[] {
	const rows = getDb()
		.prepare('SELECT * FROM shopping_items')
		.all()
		.map((r) => ({ item: toItem(r), checkedAt: r.checked_at === null ? '' : String(r.checked_at) }));
	return rows
		.sort((a, b) =>
			a.item.checked !== b.item.checked
				? Number(a.item.checked) - Number(b.item.checked)
				: a.item.checked
					? a.checkedAt.localeCompare(b.checkedAt) || a.item.id - b.item.id
					: RANK.get(a.item.category)! - RANK.get(b.item.category)! ||
						a.item.position - b.item.position ||
						a.item.id - b.item.id
		)
		.map((r) => r.item);
}

// null = nothing added
export function addManual(text: string): Id | null {
	const line = text.trim();
	if (!line) return null;
	const parsed = parseIngredient(line);
	const name = parsed.name.trim();
	if (!name) return null;
	const key = nameKey(name);
	const amount: Amount[] = parsed.quantity === null ? [] : [{ quantity: parsed.quantity, unit: parsed.unit }];
	return transaction(() => {
		const db = getDb();
		const open = db
			.prepare(
				"SELECT id, name, manual_amounts FROM shopping_items WHERE name_key = ? AND origin = 'manual' AND checked = 0 ORDER BY id"
			)
			.get(key);
		if (open) {
			const shown = name.length > String(open.name).length ? name : String(open.name);
			db.prepare('UPDATE shopping_items SET name = ?, manual_amounts = ? WHERE id = ?').run(
				shown,
				JSON.stringify(mergeAmounts(amountsOf(open.manual_amounts), amount)),
				Number(open.id)
			);
			return Number(open.id);
		}
		const memory = db.prepare('SELECT category FROM category_memory WHERE name_key = ?').get(key);
		const position = Number(
			db.prepare('SELECT coalesce(max(position), -1) + 1 AS p FROM shopping_items').get()?.p
		);
		const { lastInsertRowid } = db
			.prepare(
				`INSERT INTO shopping_items (name, name_key, manual_amounts, category, origin, position, created_at)
				 VALUES (?, ?, ?, ?, 'manual', ?, ?)`
			)
			.run(
				name,
				key,
				JSON.stringify(amount),
				memory ? String(memory.category) : 'other',
				position,
				new Date().toISOString()
			);
		return Number(lastInsertRowid);
	});
}

// amounts = manual part (manual rows) or plan part (plan rows)
export function updateItem(id: Id, patch: { name?: string; amounts?: Amount[] }): void {
	const db = getDb();
	transaction(() => {
		const name = patch.name?.trim();
		if (name) db.prepare('UPDATE shopping_items SET name = ?, name_key = ? WHERE id = ?').run(name, nameKey(name), id);
		if (patch.amounts)
			db.prepare(
				`UPDATE shopping_items SET manual_amounts = CASE origin WHEN 'manual' THEN ?1 ELSE manual_amounts END,
				 plan_amounts = CASE origin WHEN 'plan' THEN ?1 ELSE plan_amounts END WHERE id = ?2`
			).run(JSON.stringify(patch.amounts), id);
	});
}

export function deleteItem(id: Id): void {
	getDb().prepare('DELETE FROM shopping_items WHERE id = ?').run(id);
}

export function setChecked(id: Id, checked: boolean): void {
	getDb()
		.prepare('UPDATE shopping_items SET checked = ?, checked_at = ? WHERE id = ?')
		.run(checked ? 1 : 0, checked ? new Date().toISOString() : null, id);
}

export function clearChecked(): number {
	return Number(getDb().prepare('DELETE FROM shopping_items WHERE checked = 1').run().changes);
}

// also writes category_memory
export function setCategory(id: Id, category: Category): void {
	transaction(() => {
		const db = getDb();
		const r = db.prepare('SELECT name_key FROM shopping_items WHERE id = ?').get(id);
		if (!r) return;
		db.prepare('UPDATE shopping_items SET category = ? WHERE id = ?').run(category, id);
		db.prepare(
			'INSERT INTO category_memory (name_key, category) VALUES (?, ?) ON CONFLICT (name_key) DO UPDATE SET category = excluded.category'
		).run(String(r.name_key), category);
	});
}

export function addFromPlan(from: IsoDate, to: IsoDate): AddFromPlanResult {
	const entries = entriesInRange(from, to).filter((e) => e.recipe !== null);
	if (entries.length === 0) return { kind: 'empty' };
	const lines = new Map<Id, ParsedLine[]>();
	const contributions = entries.map((e) => {
		const recipeId = e.recipe!.id;
		if (!lines.has(recipeId))
			lines.set(recipeId, getRecipe(recipeId)!.ingredients.flatMap((s) => s.lines));
		return { factor: e.servings! / e.recipe!.servings, lines: lines.get(recipeId)! };
	});
	const items = aggregate(contributions);
	return transaction(() => {
		const db = getDb();
		db.prepare("DELETE FROM shopping_items WHERE origin = 'plan' AND checked = 0").run();
		db.prepare(
			"UPDATE shopping_items SET plan_amounts = '[]' WHERE origin = 'manual' AND checked = 0"
		).run();
		const blocked = db.prepare(
			"SELECT 1 FROM shopping_items WHERE name_key = ? AND checked = 1 AND (origin = 'plan' OR plan_amounts != '[]')"
		);
		const openManual = db.prepare(
			"SELECT id FROM shopping_items WHERE name_key = ? AND origin = 'manual' AND checked = 0 ORDER BY id"
		);
		const setPlanPart = db.prepare('UPDATE shopping_items SET plan_amounts = ? WHERE id = ?');
		const remembered = db.prepare('SELECT category FROM category_memory WHERE name_key = ?');
		const insert = db.prepare(
			`INSERT INTO shopping_items (name, name_key, plan_amounts, category, origin, position, created_at)
			 VALUES (?, ?, ?, ?, 'plan', (SELECT coalesce(max(position), -1) + 1 FROM shopping_items), ?)`
		);
		let count = 0;
		for (const item of items) {
			if (blocked.get(item.nameKey)) continue;
			const manual = openManual.get(item.nameKey);
			if (manual) setPlanPart.run(JSON.stringify(item.amounts), Number(manual.id));
			else {
				const memory = remembered.get(item.nameKey);
				insert.run(
					item.name,
					item.nameKey,
					JSON.stringify(item.amounts),
					memory ? String(memory.category) : 'other',
					new Date().toISOString()
				);
			}
			count++;
		}
		return { kind: 'added', count };
	});
}
