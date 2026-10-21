import { fold } from '../text.ts';
import type { Id, Tag, TagWithCount } from '../types.ts';
import { getDb } from './db.ts';
import { refreshSearchText, transaction } from './recipes.ts';

function tidy(name: string): string {
	return name.normalize('NFC').trim().replace(/\s+/g, ' ');
}

export function listTags(): TagWithCount[] {
	return getDb()
		.prepare(
			`SELECT t.id, t.name, count(rt.recipe_id) AS count FROM tags t
			 LEFT JOIN recipe_tags rt ON rt.tag_id = t.id GROUP BY t.id`
		)
		.all()
		.map((t) => ({ id: Number(t.id), name: String(t.name), count: Number(t.count) }))
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || a.id - b.id);
}

export function ensureTags(names: string[]): Tag[] {
	const db = getDb();
	const find = db.prepare('SELECT id, name FROM tags WHERE name_key = ?');
	const insert = db.prepare('INSERT INTO tags (name, name_key) VALUES (?, ?)');
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

function recipesWith(tagId: Id): Id[] {
	return getDb()
		.prepare('SELECT recipe_id FROM recipe_tags WHERE tag_id = ?')
		.all(tagId)
		.map((r) => Number(r.recipe_id));
}

// onto an existing name: recipes move to that tag, this one is deleted
export function renameTag(id: Id, name: string): { mergedInto: Id | null } {
	const db = getDb();
	const key = fold(name);
	return transaction(() => {
		const affected = recipesWith(id);
		const existing = db.prepare('SELECT id FROM tags WHERE name_key = ? AND id != ?').get(key, id);
		let mergedInto: Id | null = null;
		if (existing) {
			mergedInto = Number(existing.id);
			const link = db.prepare('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)');
			for (const recipeId of affected) link.run(recipeId, mergedInto);
			db.prepare('DELETE FROM tags WHERE id = ?').run(id);
		} else {
			db.prepare('UPDATE tags SET name = ?, name_key = ? WHERE id = ?').run(
				tidy(name),
				key,
				id
			);
		}
		for (const recipeId of affected) refreshSearchText(recipeId);
		return { mergedInto };
	});
}

export function deleteTag(id: Id): { removedFrom: number } {
	return transaction(() => {
		const affected = recipesWith(id);
		getDb().prepare('DELETE FROM tags WHERE id = ?').run(id);
		for (const recipeId of affected) refreshSearchText(recipeId);
		return { removedFrom: affected.length };
	});
}
