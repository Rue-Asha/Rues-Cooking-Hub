import { readQuantity } from '../ingredients/parse.ts';
import { fold } from '../text.ts';
import type { Amount, ParsedLine } from '../types.ts';

export interface Contribution {
	factor: number; // entry servings / recipe servings
	lines: ParsedLine[];
}
export interface AggregatedItem {
	name: string;
	nameKey: string;
	amounts: Amount[];
}

const BASE: Record<string, { base: 'g' | 'ml'; factor: number }> = {
	g: { base: 'g', factor: 1 },
	kg: { base: 'g', factor: 1000 },
	ml: { base: 'ml', factor: 1 },
	l: { base: 'ml', factor: 1000 }
};
const BIG: Record<string, string> = { g: 'kg', ml: 'l' };

// 0.1 * 3 and 300 / 1000 must not leave float noise in a stored amount
const round = (n: number) => Math.round(n * 1e6) / 1e6;

export function aggregate(contributions: Contribution[]): AggregatedItem[] {
	const groups = new Map<string, { name: string; amounts: Amount[] }>();
	for (const { factor, lines } of contributions) {
		for (const line of lines) {
			const name = line.name.trim().replace(/\s+/g, ' ');
			if (name === '') continue;
			const key = nameKey(name);
			const group = groups.get(key) ?? { name, amounts: [] };
			groups.set(key, group);
			if (name.length > group.name.length) group.name = name;
			if (line.quantity !== null) {
				group.amounts = mergeAmounts(group.amounts, [
					{ quantity: round(line.quantity * factor), unit: line.unit }
				]);
			}
		}
	}
	return [...groups].map(([key, { name, amounts }]) => ({ name, nameKey: key, amounts }));
}

export function mergeAmounts(a: Amount[], b: Amount[]): Amount[] {
	const sums = new Map<string, number>();
	for (const { quantity, unit } of [...a, ...b]) {
		const family = unit === null ? undefined : BASE[unit];
		const key = family?.base ?? unit ?? '';
		sums.set(key, (sums.get(key) ?? 0) + quantity * (family?.factor ?? 1));
	}
	return [...sums].map(([key, sum]) => {
		const quantity = round(sum);
		if (key in BIG && quantity >= 1000) return { quantity: round(quantity / 1000), unit: BIG[key] };
		return { quantity, unit: key === '' ? null : key };
	});
}

// fold() + last word singularised (design.md → Name keys)
export function nameKey(name: string): string {
	const folded = fold(name);
	const at = folded.lastIndexOf(' ') + 1;
	const word = folded.slice(at);
	let single = word;
	if (word.endsWith('ies')) single = word.slice(0, -3) + 'y';
	else if (word.endsWith('oes')) single = word.slice(0, -2);
	else if (/(ch|sh|ss|x|z)es$/.test(word)) single = word.slice(0, -2);
	else if (word.endsWith('s') && !/(ss|us|is)$/.test(word)) single = word.slice(0, -1);
	return folded.slice(0, at) + single;
}

const shownQuantity = (n: number) => String(Number(n.toFixed(2)));

// "1 cup + 200 g", "1.5 kg", ""
export function formatAmounts(amounts: Amount[]): string {
	return amounts
		.map(({ quantity, unit }) => (unit === null ? shownQuantity(quantity) : `${shownQuantity(quantity)} ${unit}`))
		.join(' + ');
}

// "1 cup + 200 g" → 2 amounts; "" → []; unreadable → null
export function parseAmounts(text: string): Amount[] | null {
	if (text.trim() === '') return [];
	const amounts: Amount[] = [];
	for (const part of text.split('+')) {
		const read = readQuantity(part);
		if (!read || read.rest !== '') return null;
		amounts.push({ quantity: read.quantity, unit: read.unit });
	}
	return amounts;
}
