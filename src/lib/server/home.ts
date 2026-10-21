import { addDays, weekDays, weekStart } from '../dates.ts';
import type { Dashboard } from '../types.ts';
import { today } from './clock.ts';
import { getDb } from './db.ts';
import { entriesInRange } from './plan.ts';
import { listRecipes } from './recipes.ts';
import { listItems } from './shopping.ts';

export function dashboard(): Dashboard {
	const day = today();
	const monday = weekStart(day);
	const entries = entriesInRange(monday, addDays(monday, 6));
	const recipes = new Map(listRecipes({}).map((r) => [r.id, r]));

	// entriesInRange is ordered by slot then position, so the first match is the one Rue sees first in the plan
	const planned = entries.filter((e) => e.date === day && e.recipe);
	const pick = planned.find((e) => e.slot === 'dinner') ?? planned[0];
	const newest = recipes.values().next().value;
	const hero: Dashboard['hero'] = pick
		? { kind: 'today', recipe: recipes.get(pick.recipe!.id)!, slot: pick.slot }
		: newest
			? { kind: 'newest', recipe: newest }
			: { kind: 'welcome' };

	const week = weekDays(monday).map((date) => ({
		date,
		entries: entries
			.filter((e) => e.date === date)
			.map((e) => ({
				title: e.recipe?.title ?? e.text ?? '',
				imageId: e.recipe?.imageId ?? null,
				recipeId: e.recipe?.id ?? null
			}))
	}));

	const open = listItems().filter((i) => !i.checked);

	const fav = getDb()
		.prepare('SELECT id FROM recipes WHERE favourite = 1 ORDER BY favourited_at DESC, id DESC LIMIT 1')
		.get();

	return {
		hero,
		week,
		list: { open: open.length, first: open.slice(0, 3).map((i) => i.name) },
		favourite: fav ? (recipes.get(Number(fav.id)) ?? null) : null
	};
}
