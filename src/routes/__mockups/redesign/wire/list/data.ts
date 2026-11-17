import { mockData } from '../../fixtures.ts';

// the contract's nine aisles in aisle order; the fixtures spell two of them differently
export const AISLES = ['Produce', 'Dairy & Eggs', 'Meat & Fish', 'Bakery', 'Pantry', 'Frozen', 'Drinks', 'Household', 'Other'];
const alias: Record<string, string> = { Dairy: 'Dairy & Eggs', 'Meat and fish': 'Meat & Fish' };

export interface ListItem {
	name: string;
	amount: string;
	plan: boolean;
	merged?: string;
	checked: boolean;
}

export interface Group {
	category: string;
	items: ListItem[];
}

export interface ListView {
	worst: boolean;
	kind: 'list' | 'empty' | 'checked';
	groups: Group[];
	checked: ListItem[];
	open: number;
}

export const itemsText = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'item' : 'items'}`;

export function listFor(url: URL, kind: ListView['kind'] = 'list'): ListView {
	const data = mockData(url);
	const all: Group[] = [];
	for (const aisle of data.list) {
		const category = alias[aisle.category] ?? aisle.category;
		const items = aisle.items.map<ListItem>((i) => ({
			name: i.name,
			amount: !data.worst && i.name === 'lemons' ? '3' : i.amount,
			plan: i.origin === 'plan',
			checked: !!i.checked,
			merged: !data.worst && i.name === 'lemons' ? '1' : undefined
		}));
		all.push({ category, items });
	}
	if (data.worst) {
		const other = all.find((g) => g.category === 'Other');
		const extra: ListItem[] = [
			{ name: '🥑 Avocados', amount: '2', plan: false, checked: false },
			{ name: '寿司米 (sushi rice)', amount: '1 kg', plan: true, checked: false },
			{ name: 'חלב', amount: '1 l', plan: false, checked: false },
			{ name: 'Ei', amount: '', plan: false, checked: false }
		];
		if (other) other.items.push(...extra);
	}
	all.sort((a, b) => AISLES.indexOf(a.category) - AISLES.indexOf(b.category));
	const flat = all.flatMap((g) => g.items);
	if (kind === 'empty') return { worst: data.worst, kind, groups: [], checked: [], open: 0 };
	if (kind === 'checked') {
		const checked = (data.worst ? flat.slice(0, 3) : flat.slice(0, 3)).map((i) => ({ ...i, checked: true }));
		return { worst: data.worst, kind, groups: [], checked, open: 0 };
	}
	const groups = all.map((g) => ({ category: g.category, items: g.items.filter((i) => !i.checked) })).filter((g) => g.items.length);
	const checked = flat.filter((i) => i.checked);
	return { worst: data.worst, kind, groups, checked, open: groups.reduce((n, g) => n + g.items.length, 0) };
}
