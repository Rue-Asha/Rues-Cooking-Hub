import type { ParsedLine } from '../types.ts';

const UNITS: Record<string, string[]> = {
	g: ['g', 'gram', 'grams'],
	kg: ['kg', 'kilogram', 'kilograms'],
	ml: ['ml', 'millilitre', 'millilitres', 'milliliter', 'milliliters'],
	l: ['l', 'litre', 'litres', 'liter', 'liters'],
	tsp: ['tsp', 'teaspoon', 'teaspoons'],
	tbsp: ['tbsp', 'tbs', 'tablespoon', 'tablespoons'],
	cup: ['cup', 'cups'],
	oz: ['oz', 'ounce', 'ounces'],
	lb: ['lb', 'lbs', 'pound', 'pounds'],
	pinch: ['pinch', 'pinches'],
	clove: ['clove', 'cloves'],
	can: ['can', 'cans', 'tin', 'tins'],
	slice: ['slice', 'slices'],
	bunch: ['bunch', 'bunches'],
	sprig: ['sprig', 'sprigs']
};
const UNIT_OF = new Map(
	Object.entries(UNITS).flatMap(([unit, words]) => words.map((w) => [w, unit] as const))
);

const FRACTIONS = '½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞';
const FRACTION_VALUE: Record<string, number> = {
	'½': 1 / 2,
	'¼': 1 / 4,
	'¾': 3 / 4,
	'⅓': 1 / 3,
	'⅔': 2 / 3,
	'⅕': 1 / 5,
	'⅖': 2 / 5,
	'⅗': 3 / 5,
	'⅘': 4 / 5,
	'⅙': 1 / 6,
	'⅚': 5 / 6,
	'⅛': 1 / 8,
	'⅜': 3 / 8,
	'⅝': 5 / 8,
	'⅞': 7 / 8
};
const NUMBER = [
	{ re: /^(\d+)\s+(\d+)\/([1-9]\d*)/, value: (m: RegExpMatchArray) => +m[1] + +m[2] / +m[3] },
	{ re: new RegExp(`^(\\d+)\\s*([${FRACTIONS}])`), value: (m: RegExpMatchArray) => +m[1] + FRACTION_VALUE[m[2]] },
	{ re: /^(\d+)\/([1-9]\d*)/, value: (m: RegExpMatchArray) => +m[1] / +m[2] },
	{ re: /^(\d+(?:[.,]\d+)?)/, value: (m: RegExpMatchArray) => +m[1].replace(',', '.') },
	{ re: new RegExp(`^([${FRACTIONS}])`), value: (m: RegExpMatchArray) => FRACTION_VALUE[m[1]] }
];

function number(s: string): { value: number; length: number } | null {
	for (const { re, value } of NUMBER) {
		const m = s.match(re);
		if (m) return { value: value(m), length: m[0].length };
	}
	return null;
}

export function canonicalUnit(word: string): string | null {
	return UNIT_OF.get(word.toLowerCase().replace(/\.$/, '')) ?? null;
}

export interface QuantityUnit {
	quantity: number;
	unit: string | null;
	rest: string;
}

// leading quantity (range → upper bound) and unit; `rest` is what follows, trimmed
export function readQuantity(text: string): QuantityUnit | null {
	const s = text.trim();
	const first = number(s);
	if (!first) return null;
	let quantity = first.value;
	let at = first.length;
	const dash = s.slice(at).match(/^\s*[-–]\s*/);
	if (dash) {
		const second = number(s.slice(at + dash[0].length));
		if (second) {
			quantity = Math.max(quantity, second.value);
			at += dash[0].length + second.length;
		}
	}
	if (!/^(\s|\p{L}|$)/u.test(s.slice(at))) return null;
	const word = s.slice(at).match(/^\s*(\p{L}+)\.?/u);
	const unit = word ? canonicalUnit(word[0].trim()) : null;
	if (word && unit) at += word[0].length;
	return { quantity, unit, rest: s.slice(at).trim() };
}

// a comma between digits is a decimal comma, any other one starts the note
const NOTE_COMMA = /,(?!\d)|(?<!\d),/;

export function parseIngredient(text: string): ParsedLine {
	const comma = text.search(NOTE_COMMA);
	const main = comma < 0 ? text : text.slice(0, comma);
	const note = comma < 0 ? '' : text.slice(comma + 1).trim();
	const read = readQuantity(main);
	if (!read || (read.rest === '' && read.unit === null)) {
		return { text, quantity: null, unit: null, name: main.trim(), note: note || null };
	}
	const name = read.unit ? read.rest.replace(/^of\s+/i, '') : read.rest;
	return { text, quantity: read.quantity, unit: read.unit, name, note: note || null };
}
