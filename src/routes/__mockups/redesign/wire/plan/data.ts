import { mockData, type MockEntry, type MockRecipe, type Slot } from '../../fixtures.ts';

export const SLOTS: { id: Slot; label: string }[] = [
	{ id: 'breakfast', label: 'Breakfast' },
	{ id: 'lunch', label: 'Lunch' },
	{ id: 'dinner', label: 'Dinner' },
	{ id: 'snacks', label: 'Snacks' }
];

export interface PlanEntry {
	title: string;
	servings: number | null;
	free: boolean;
	deleted?: boolean;
}

export interface PlanDay {
	weekday: string;
	short: string;
	day: number;
	today: boolean;
	slots: Record<Slot, PlanEntry[]>;
	empty: boolean;
}

export interface PlanView {
	worst: boolean;
	kind: 'current' | 'past' | 'empty';
	heading: string;
	weekNumber: number;
	range: string;
	days: PlanDay[];
	entries: number;
	recipes: MockRecipe[];
	todayLabel: string;
}

export const servingsText = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'serving' : 'servings'}`;
export const entriesText = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'entry' : 'entries'}`;
export const minutes = (r: MockRecipe) => (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0);

export function planFor(url: URL, kind: PlanView['kind'] = 'current'): PlanView {
	const data = mockData(url);
	const byId = new Map(data.recipes.map((r) => [r.id, r]));
	const resolve = (e: MockEntry): PlanEntry => {
		const recipe = e.recipe === null ? null : byId.get(e.recipe);
		return recipe ? { title: recipe.title, servings: e.servings ?? recipe.servings, free: false } : { title: e.text ?? 'Untitled', servings: null, free: true };
	};
	const past = kind === 'past';
	const days: PlanDay[] = data.week.map((d, i) => {
		const slots = { breakfast: [], lunch: [], dinner: [], snacks: [] } as Record<Slot, PlanEntry[]>;
		if (kind !== 'empty') for (const s of SLOTS) slots[s.id] = d.entries[s.id].map(resolve);
		if (kind === 'current' && data.worst) {
			if (i === 1) slots.lunch.push({ title: '🍕 Pizzaabend mit Freund:innen', servings: null, free: true });
			if (i === 1) slots.dinner.push({ title: '寿司 Sushi mit Reis', servings: null, free: true });
			if (i === 4) slots.dinner.push({ title: 'عشاء عند العائلة', servings: null, free: true });
			if (i === 5) slots.snacks.push({ title: 'J', servings: null, free: true });
		}
		if (kind === 'current' && i === 3) slots.lunch.push({ title: data.worst ? data.recipes[3].title : 'Spaghetti al pomodoro', servings: null, free: true, deleted: true });
		const empty = SLOTS.every((s) => slots[s.id].length === 0);
		return { weekday: d.weekday, short: d.short, day: past ? 21 + i : d.day, today: kind !== 'past' && d.date === data.today, slots, empty };
	});
	const entries = days.reduce((n, d) => n + SLOTS.reduce((m, s) => m + d.slots[s.id].length, 0), 0);
	return {
		worst: data.worst,
		kind,
		heading: past ? 'Week 39' : 'This week',
		weekNumber: past ? 39 : 43,
		range: past ? '21 – 27 September' : '19 – 25 October',
		days,
		entries,
		recipes: data.recipes,
		todayLabel: 'Wednesday 21'
	};
}
