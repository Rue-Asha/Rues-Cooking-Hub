import type { Area } from '#lib/nav.ts';

export const base = '/__mockups/redesign';

export const areaPath: Record<Area, string> = {
	home: 'wire/home',
	recipes: 'wire/recipes',
	plan: 'wire/plan',
	list: 'wire/list',
	'eating-out': 'wire/shell/eating-out'
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
		? { search: { label: 'Search spots', path: 'wire/shell/eating-out' }, add: { label: 'Add spot', path: 'wire/shell/eating-out' } }
		: { search: { label: 'Search recipes', path: 'wire/recipes' }, add: { label: 'Add recipe', path: 'wire/import' } };

// working labels for the round "+", fixed at gate 5 (COPY.contextAdd)
export const plusLabel: Record<Area, string> = {
	home: 'Add…',
	recipes: 'Add recipe',
	plan: 'Add to plan',
	list: 'Add an item',
	'eating-out': 'Add spot'
};
