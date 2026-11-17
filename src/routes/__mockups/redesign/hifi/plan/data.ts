import { mockData, photo, type MockEntry, type MockRecipe, type Slot } from '../../fixtures.ts';

export const SLOTS: { id: Slot; label: string }[] = [
	{ id: 'breakfast', label: 'Breakfast' },
	{ id: 'lunch', label: 'Lunch' },
	{ id: 'dinner', label: 'Dinner' },
	{ id: 'snacks', label: 'Snacks' }
];

export interface PlanEntry {
	id: number;
	title: string;
	servings: number | null;
	free: boolean;
	image: string | null;
	deleted?: boolean;
}

export interface PlanDay {
	weekday: string;
	short: string;
	day: number;
	today: boolean;
	slots: Record<Slot, PlanEntry[]>;
}

export interface PlanView {
	worst: boolean;
	kind: 'current' | 'past' | 'empty' | 'future';
	title: [string, string];
	weekNumber: number;
	range: string;
	days: PlanDay[];
	entries: number;
	perSlot: { label: string; n: number }[];
	todayIndex: number;
	recipes: MockRecipe[];
	photo: string;
}

export const servingsText = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'serving' : 'servings'}`;
export const entriesText = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'entry' : 'entries'}`;
export const minutes = (r: MockRecipe) => (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0);
export const initial = (title: string) => [...title.trim()][0] ?? '?';
export const plate = (title: string) => (([...title].reduce((n, c) => n + c.codePointAt(0)!, 0) % 2) + 1) as 1 | 2;

let ids = 0;

export function planFor(url: URL, kind: PlanView['kind'] = 'current'): PlanView {
	const data = mockData(url);
	const byId = new Map(data.recipes.map((r) => [r.id, r]));
	const resolve = (e: MockEntry): PlanEntry => {
		const recipe = e.recipe === null ? null : byId.get(e.recipe);
		return recipe
			? { id: ++ids, title: recipe.title, servings: e.servings ?? recipe.servings, free: false, image: recipe.image }
			: { id: ++ids, title: e.text ?? 'Untitled', servings: null, free: true, image: null };
	};
	const text = (title: string): PlanEntry => ({ id: ++ids, title, servings: null, free: true, image: null });
	const past = kind === 'past';
	const future = kind === 'future';
	const days: PlanDay[] = data.week.map((d, i) => {
		const slots = { breakfast: [], lunch: [], dinner: [], snacks: [] } as Record<Slot, PlanEntry[]>;
		if (kind !== 'empty' && !future) for (const s of SLOTS) slots[s.id] = d.entries[s.id].map(resolve);
		if (kind === 'current' && data.worst) {
			if (i === 1) slots.lunch.push(text('🍕 Pizzaabend mit Freund:innen'));
			if (i === 1) slots.dinner.push(text('寿司 Sushi mit Reis'));
			if (i === 4) slots.dinner.push(text('عشاء عند العائلة'));
			if (i === 5) slots.snacks.push(text('J'));
		}
		if (kind === 'current' && i === 3) slots.lunch.push({ ...text(data.worst ? data.recipes[3].title : 'Spaghetti al pomodoro'), deleted: true });
		return { weekday: d.weekday, short: d.short, day: past ? 21 + i : future ? 15 + i : d.day, today: kind !== 'past' && !future && d.date === data.today, slots };
	});
	const perSlot = SLOTS.map((s) => ({ label: s.label, n: days.reduce((m, d) => m + d.slots[s.id].length, 0) }));
	return {
		worst: data.worst,
		kind,
		title: past ? ['Week ', '39'] : future ? ['Week ', '11'] : ['This ', 'week'],
		weekNumber: past ? 39 : future ? 11 : 43,
		range: past ? '21 – 27 September' : future ? '15 – 21 March' : '19 – 25 October',
		days,
		entries: perSlot.reduce((n, s) => n + s.n, 0),
		perSlot,
		todayIndex: days.findIndex((d) => d.today),
		recipes: data.recipes,
		photo: 'penne-arrabbiata'
	};
}

export { photo };
