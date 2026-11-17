const UNITS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'cups', 'oz', 'lb', 'pinch', 'clove', 'cloves'];
const QTY = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d*[½¼¾]|\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*(.*)$/;

export interface Parsed {
	quantity: string | null;
	unit: string | null;
	name: string;
	note: string | null;
}

export function parseLine(line: string): Parsed {
	// the first comma that is not a decimal comma starts the note
	const cut = line.search(/(?<!\d),|,(?!\d)/);
	const main = cut === -1 ? line : line.slice(0, cut);
	const note = (cut === -1 ? '' : line.slice(cut + 1)).trim() || null;
	const match = main.trim().match(QTY);
	if (!match) return { quantity: null, unit: null, name: main.trim(), note };
	// "2 × 400 g": the multiplier stays with the quantity
	const times = match[2].match(/^[×x]\s*(\d+(?:[.,]\d+)?)\s*(.*)$/i);
	const quantity = times ? `${match[1]} × ${times[1]}` : match[1];
	const tail = times ? times[2] : match[2];
	const [first, ...others] = tail.split(/\s+/);
	if (first && UNITS.includes(first.toLowerCase())) return { quantity, unit: first.toLowerCase(), name: others.join(' '), note };
	const attached = tail.match(/^(g|kg|ml|l)\b\s*(.*)$/i);
	if (attached) return { quantity, unit: attached[1].toLowerCase(), name: attached[2], note };
	return { quantity, unit: null, name: tail, note };
}

export function parsedText(line: string): string {
	const p = parseLine(line);
	if (!line.trim()) return '';
	if (p.quantity === null) return `no amount · ${p.name}${p.note ? ` · ${p.note}` : ''}`;
	return [p.quantity, p.unit, p.name, p.note].filter(Boolean).join(' · ');
}
