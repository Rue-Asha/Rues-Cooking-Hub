import type { MockLine, MockRecipeFull } from '../../fixtures.ts';

const VULGAR: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };
const NUMBER = String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d*[½¼¾⅓⅔]|\d+(?:[.,]\d+)?)`;
const LEAD = new RegExp(String.raw`^(${NUMBER})(?:\s*[–-]\s*(${NUMBER}))?(?=\s|[a-zA-Zµ°]|$)`);
// "2 × 400 g tins": the multiplier belongs to the amount
const TIMES = /^\s*[×x]\s*\d+(?:[.,]\d+)?(?=\s|[a-zA-Zµ°]|$)/i;
const UNIT = /^\s*(?:g|kg|mg|ml|cl|dl|l|tsp|tbsp|cups?|oz|lb|pinch|cloves?|tins?|bunch|slices?)\b/i;

function value(text: string): number {
	const mixed = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
	if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
	const frac = text.match(/^(\d+)\/(\d+)$/);
	if (frac) return Number(frac[1]) / Number(frac[2]);
	const vulgar = text.match(/^(\d*)([½¼¾⅓⅔])$/);
	if (vulgar) return Number(vulgar[1] || 0) + VULGAR[vulgar[2]];
	return Number(text.replace(',', '.'));
}

const show = (n: number) => String(Number(n.toFixed(2)));

// a view only: quantity first, a line without a readable quantity stays as written
export function scaleLine(line: string, from: number, to: number): string {
	if (from === to) return line;
	const match = line.match(LEAD);
	if (!match) return line;
	const factor = to / from;
	const low = show(value(match[1]) * factor);
	const amount = match[2] ? `${low}–${show(value(match[2]) * factor)}` : low;
	return `${amount}${line.slice(match[0].length)}`;
}

// the amount (quantity and a recognised unit) and the rest; a line without a quantity is all rest
export function splitLine(line: string): { amount: string; rest: string } {
	const lead = line.match(LEAD);
	if (!lead) return { amount: '', rest: line };
	let head = lead[0];
	let after = line.slice(head.length);
	const times = after.match(TIMES);
	if (times) {
		head += times[0];
		after = after.slice(times[0].length);
	}
	const unit = after.match(UNIT);
	const amount = unit ? `${head}${unit[0]}` : head;
	return { amount, rest: line.slice(amount.length).trimStart() };
}

const WORD60 = 'Donaudampfschifffahrtsgesellschaftskapitaenslieder'.padEnd(60, 'x').slice(0, 60);
export const LONG_LINE =
	'250 g of the good flaky sea salt, coarsely crushed, the kind sold in a paper tub at the market stall near the station, not the fine table kind (see notes)';

export const odd: MockLine = {
	title: 'Odd lines',
	lines: ['2–3 cloves garlic', '½ tsp salt', '1 1/2 cups flour', '1,5 l water', 'A pinch of sugar', LONG_LINE, `1 jar ${WORD60}`]
};

export function withOdd(recipe: MockRecipeFull): MockRecipeFull {
	return { ...recipe, ingredients: [...recipe.ingredients, odd] };
}
