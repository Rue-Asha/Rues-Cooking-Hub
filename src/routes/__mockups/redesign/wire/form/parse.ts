const UNITS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'cups', 'oz', 'lb', 'pinch', 'clove', 'cloves'];
const QTY = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d*[½¼¾]|\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*(.*)$/;

export interface Parsed {
	quantity: string | null;
	unit: string | null;
	name: string;
	note: string | null;
}

export function parseLine(line: string): Parsed {
	const [main, ...rest] = line.split(',');
	const note = rest.join(',').trim() || null;
	const match = main.trim().match(QTY);
	if (!match) return { quantity: null, unit: null, name: main.trim(), note };
	const [first, ...others] = match[2].split(/\s+/);
	if (first && UNITS.includes(first.toLowerCase())) return { quantity: match[1], unit: first.toLowerCase(), name: others.join(' '), note };
	const attached = match[2].match(/^(g|kg|ml|l)\b\s*(.*)$/i);
	if (attached) return { quantity: match[1], unit: attached[1].toLowerCase(), name: attached[2], note };
	return { quantity: match[1], unit: null, name: match[2], note };
}

export function parsedText(line: string): string {
	const p = parseLine(line);
	if (!line.trim()) return '';
	if (p.quantity === null) return `no amount · ${p.name}${p.note ? ` · ${p.note}` : ''}`;
	return [p.quantity, p.unit, p.name, p.note].filter(Boolean).join(' · ');
}
