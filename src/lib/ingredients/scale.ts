import type { ParsedLine } from '../types.ts';
import { canonicalUnit } from './parse.ts';

export const shownQuantity = (n: number) => String(Number(n.toFixed(2)));

const printable = (s: string) => /^\d+(\.\d+)?$/.test(s) && s !== '0';

// parsed units are canonical ("clove"); the line shows the word as written ("cloves")
function writtenUnit(line: ParsedLine): string | null {
	if (line.unit === null) return null;
	const words = line.text.match(/\p{L}+/gu) ?? [];
	return words.find((w) => canonicalUnit(w) === line.unit) ?? line.unit;
}

export function scaleIngredient(line: ParsedLine, from: number, to: number): string {
	if (line.quantity === null || from === to || !Number.isInteger(to) || to < 1 || !(from > 0)) return line.text;
	const factor = to / from;
	const high = shownQuantity(line.quantity * factor);
	const low = line.quantityMin === undefined ? null : shownQuantity(line.quantityMin * factor);
	if (!printable(high) || (low !== null && !printable(low))) return line.text;
	const amount = low === null ? high : `${low}–${high}`;
	const main = [amount, writtenUnit(line), line.name].filter((p) => p !== null && p !== '').join(' ');
	return line.note ? `${main}, ${line.note}` : main;
}
