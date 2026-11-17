import { mockData, type MockData } from '../../fixtures.ts';

// the contract's nine aisles in aisle order; the fixtures spell two of them differently
export const AISLES = ['Produce', 'Dairy & Eggs', 'Meat & Fish', 'Bakery', 'Pantry', 'Frozen', 'Drinks', 'Household', 'Other'];
const alias: Record<string, string> = { Dairy: 'Dairy & Eggs', 'Meat and fish': 'Meat & Fish' };

export interface ListItem {
	id: number;
	name: string;
	amount: string;
	plan: boolean;
	merged?: string;
	checked: boolean;
	category: string;
	lang?: string;
}

export interface ListView {
	worst: boolean;
	kind: 'list' | 'empty' | 'checked';
	items: ListItem[];
	photo: string;
}

export const itemsText = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'item' : 'items'}`;

let ids = 0;

export function listFor(url: URL, kind: ListView['kind'] = 'list'): ListView {
	const data: MockData = mockData(url);
	const items: ListItem[] = [];
	for (const aisle of data.list) {
		const category = alias[aisle.category] ?? aisle.category;
		for (const i of aisle.items) {
			const lemons = !data.worst && i.name === 'lemons';
			items.push({ id: ++ids, name: i.name, amount: lemons ? '3' : i.amount, plan: i.origin === 'plan', merged: lemons ? '1' : undefined, checked: !!i.checked, category });
		}
	}
	if (data.worst) {
		const extra: [string, string, boolean, string?][] = [
			['🥑 Avocados', '2', false],
			['寿司米 (sushi rice)', '1 kg', true],
			['חלב', '1 l', false],
			['Ei', '', false, 'de']
		];
		for (const [name, amount, plan, lang] of extra) items.push({ id: ++ids, name, amount, plan, checked: false, category: 'Other', lang });
	}
	items.sort((a, b) => AISLES.indexOf(a.category) - AISLES.indexOf(b.category));
	if (kind === 'empty') return { worst: data.worst, kind, items: [], photo: 'village-salad' };
	if (kind === 'checked') return { worst: data.worst, kind, items: items.slice(0, 3).map((i) => ({ ...i, checked: true })), photo: 'village-salad' };
	return { worst: data.worst, kind, items, photo: 'village-salad' };
}
