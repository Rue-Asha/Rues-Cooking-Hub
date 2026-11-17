import type { MockData, MockDay, MockRecipe, MockSpot } from '../../fixtures.ts';

export type Hero = { recipe: MockRecipe; label: string; planned: boolean } | null;

export interface Dash {
	worst: boolean;
	today: string;
	kicker: string[];
	summary: string;
	hero: Hero;
	week: MockDay[];
	weekRange: string;
	list: { open: number; first: string[] };
	favourite: MockRecipe | null;
	recent: MockRecipe[];
	total: number;
	spots: MockSpot[];
}

const plural = (n: number, one: string, many: string) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`;
const long = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' });

export const minutes = (r: MockRecipe) => {
	const total = (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0);
	return total > 0 ? `${total} min` : null;
};

export const entryCount = (d: MockDay) => Object.values(d.entries).reduce((n, list) => n + list.length, 0);

// the first recipe entry of a day wins over a free text; the label says which kind of entry it is
export function firstEntry(d: MockDay, recipes: MockRecipe[]) {
	const all = [...d.entries.breakfast, ...d.entries.lunch, ...d.entries.dinner, ...d.entries.snacks];
	const entry = all.find((e) => e.recipe !== null) ?? all[0];
	if (!entry) return null;
	const recipe = entry.recipe === null ? null : (recipes.find((r) => r.id === entry.recipe) ?? null);
	const title = recipe?.title ?? entry.text ?? 'Untitled';
	return { title, image: recipe?.image ?? null, recipe: recipe !== null, initial: [...title.trim()][0] ?? '?' };
}

export function dashboard(data: MockData, o: Partial<{ planned: boolean; weekEmpty: boolean; listEmpty: boolean; noFavourite: boolean; noRecipes: boolean; noSpots: boolean }> = {}): Dash {
	const empty = data.week.map((d) => ({ ...d, entries: { breakfast: [], lunch: [], dinner: [], snacks: [] } }));
	const week = o.weekEmpty || o.noRecipes ? empty : data.week;
	const dinnerPlanned = !!data.home.todayDinner && data.home.todayDinner.recipe !== null;
	const recipes = o.noRecipes ? [] : data.recipes;
	const planned = o.planned ?? (dinnerPlanned && !o.weekEmpty);
	const hero: Hero = recipes.length
		? { recipe: data.home.hero ?? recipes[0], label: planned ? 'Tonight · Dinner' : 'Plan your day', planned }
		: null;
	const meals = o.weekEmpty || o.noRecipes ? 0 : data.home.weekPlanned;
	const open = o.listEmpty || o.noRecipes ? 0 : data.home.listOpen;
	const items = data.list.flatMap((c) => c.items).filter((i) => !i.checked);
	return {
		worst: data.worst,
		today: data.today,
		kicker: [long(data.today, { weekday: 'long' }), long(data.today, { day: 'numeric', month: 'long' })],
		summary: `${plural(meals, 'meal', 'meals')} planned this week, ${plural(open, 'thing', 'things')} to buy.`,
		hero,
		week,
		weekRange: `${long(week[0].date, { day: 'numeric' })} – ${long(week[6].date, { day: 'numeric', month: 'long' })}`,
		list: { open, first: o.listEmpty || o.noRecipes ? [] : items.slice(0, 3).map((i) => i.name) },
		favourite: o.noFavourite || o.noRecipes ? null : data.home.favourite,
		recent: recipes.slice(0, 4),
		total: recipes.length,
		spots: o.noSpots ? [] : data.spots.filter((s) => s.status === 'visited').sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 3)
	};
}

export { plural };
