import type { Area } from '#lib/nav.ts';

export const base = '/__mockups/redesign';

export const areaPath: Record<Area, string> = {
	home: 'hifi/home',
	recipes: 'hifi/recipes',
	plan: 'hifi/plan',
	list: 'hifi/list',
	'eating-out': 'hifi/shell/eating-out'
};

export const areas: { area: Area; label: string; phone: string }[] = [
	{ area: 'home', label: 'Home', phone: 'Home' },
	{ area: 'recipes', label: 'Recipes', phone: 'Recipes' },
	{ area: 'plan', label: 'Plan', phone: 'Plan' },
	{ area: 'list', label: 'List', phone: 'List' },
	{ area: 'eating-out', label: 'Eating Out', phone: 'Spots' }
];

export const link = (path: string, worst = false) => `${base}/${path}${worst ? '?data=worst' : ''}`;

export const actions = (area: Area) =>
	area === 'eating-out'
		? { search: { label: 'Search spots', path: 'hifi/shell/eating-out' }, add: { label: 'Add spot', path: 'hifi/shell/eating-out' } }
		: { search: { label: 'Search recipes', path: 'hifi/recipes' }, add: { label: 'Add recipe', path: 'hifi/import' } };

// proposed COPY.contextAdd, the accessible names of the round "+"
export const plusLabel: Record<Area, string> = {
	home: 'Add to your kitchen',
	recipes: 'Add recipe',
	plan: 'Add to plan',
	list: 'Add an item',
	'eating-out': 'Add spot'
};

export const phoneIcon = { home: 'home', recipes: 'book', plan: 'calendar', list: 'basket', 'eating-out': 'pin' } as const;
