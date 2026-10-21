import { describe, expect, it } from 'vitest';
import { parseIngredient } from './parse.ts';

describe('Scenario: Integer quantity with unit', () => {
	it('splits quantity, canonical unit and name', () => {
		expect(parseIngredient('2 tbsp olive oil')).toEqual({
			text: '2 tbsp olive oil',
			quantity: 2,
			unit: 'tbsp',
			name: 'olive oil',
			note: null
		});
	});
});

describe('Scenario: Decimal quantity', () => {
	it('reads a decimal point', () => {
		const p = parseIngredient('0.5 l milk');

		expect(p.quantity).toBe(0.5);
		expect(p.unit).toBe('l');
		expect(p.name).toBe('milk');
	});
});

describe('Scenario: Comma decimal', () => {
	it('reads a decimal comma', () => {
		const p = parseIngredient('1,5 l Milch');

		expect(p.quantity).toBe(1.5);
		expect(p.unit).toBe('l');
		expect(p.name).toBe('Milch');
	});
});

describe('Scenario: Mixed and unicode fractions', () => {
	it('reads 1 1/2, ½ and 1½', () => {
		const lines = ['1 1/2 cups flour', '½ tsp salt', '1½ cups sugar'].map(parseIngredient);

		expect(lines.map((l) => l.quantity)).toEqual([1.5, 0.5, 1.5]);
		expect(lines.map((l) => l.unit)).toEqual(['cup', 'tsp', 'cup']);
		expect(lines.map((l) => l.name)).toEqual(['flour', 'salt', 'sugar']);
	});

	it('reads a plain fraction and a spaced unicode fraction', () => {
		expect(parseIngredient('1/2 cup milk').quantity).toBe(0.5);
		expect(parseIngredient('1 ½ cups milk').quantity).toBe(1.5);
		expect(parseIngredient('¾ cup milk').quantity).toBe(0.75);
	});

	it('does not divide by zero', () => {
		const p = parseIngredient('1/0 cup milk');

		expect(Number.isFinite(p.quantity ?? 0)).toBe(true);
	});
});

describe('Scenario: Range uses the upper bound', () => {
	it('keeps the range in the text and the upper bound as quantity', () => {
		expect(parseIngredient('2-3 cloves garlic')).toEqual({
			text: '2-3 cloves garlic',
			quantity: 3,
			unit: 'clove',
			name: 'garlic',
			note: null
		});
	});

	it('accepts an en dash and spaces around the dash', () => {
		expect(parseIngredient('2–3 cloves garlic').quantity).toBe(3);
		expect(parseIngredient('2 - 3 cloves garlic').quantity).toBe(3);
	});
});

describe('Scenario: Attached unit', () => {
	it('reads a unit glued to the number', () => {
		const p = parseIngredient('200g butter');

		expect(p.quantity).toBe(200);
		expect(p.unit).toBe('g');
		expect(p.name).toBe('butter');
	});

	it('reads a quantity and unit without a name', () => {
		const p = parseIngredient('200g');

		expect(p).toMatchObject({ quantity: 200, unit: 'g', name: '' });
	});
});

describe('canonical units', () => {
	it('maps spelled-out, plural and dotted forms, ignoring case', () => {
		const unit = (line: string) => parseIngredient(line).unit;

		expect(unit('2 tablespoons oil')).toBe('tbsp');
		expect(unit('2 Tbsp. oil')).toBe('tbsp');
		expect(unit('1 Teaspoon salt')).toBe('tsp');
		expect(unit('2 L water')).toBe('l');
		expect(unit('3 litres water')).toBe('l');
		expect(unit('2 tins tomatoes')).toBe('can');
		expect(unit('1 lb. beef')).toBe('lb');
		expect(unit('2 pinches salt')).toBe('pinch');
	});

	it('keeps a word that is not a unit in the name', () => {
		expect(parseIngredient('2 large onions')).toMatchObject({ unit: null, name: 'large onions' });
		expect(parseIngredient('1 lemon')).toMatchObject({ unit: null, name: 'lemon' });
	});

	it('drops "of" after a unit', () => {
		expect(parseIngredient('2 cloves of garlic')).toMatchObject({ unit: 'clove', name: 'garlic' });
	});
});

describe('Scenario: Trailing note is split off', () => {
	it('splits at the comma', () => {
		expect(parseIngredient('100 g butter, softened')).toEqual({
			text: '100 g butter, softened',
			quantity: 100,
			unit: 'g',
			name: 'butter',
			note: 'softened'
		});
	});

	it('does not treat a decimal comma as a note', () => {
		expect(parseIngredient('1,5 l Milch, kalt')).toMatchObject({ quantity: 1.5, name: 'Milch', note: 'kalt' });
	});

	it('has no note for an empty tail', () => {
		expect(parseIngredient('100 g butter,').note).toBeNull();
	});

	it('splits a note off a line without quantity too', () => {
		expect(parseIngredient('salt, to taste')).toMatchObject({ quantity: null, name: 'salt', note: 'to taste' });
	});
});

describe('Scenario: Count without unit', () => {
	it('has a quantity and no unit', () => {
		expect(parseIngredient('3 eggs')).toMatchObject({ quantity: 3, unit: null, name: 'eggs' });
	});
});

describe('Scenario: Line without quantity', () => {
	it('has the whole line as name', () => {
		expect(parseIngredient('salt to taste')).toEqual({
			text: 'salt to taste',
			quantity: null,
			unit: null,
			name: 'salt to taste',
			note: null
		});
	});
});

describe('Scenario: Unparseable line becomes the name', () => {
	it('keeps the whole line as name', () => {
		for (const text of ['a handful of fresh herbs', '/2 ½ ?']) {
			expect(parseIngredient(text)).toEqual({ text, quantity: null, unit: null, name: text, note: null });
		}
	});

	it('treats a bare number as a name', () => {
		expect(parseIngredient('3')).toMatchObject({ quantity: null, unit: null, name: '3' });
	});

	it('survives an empty line', () => {
		expect(parseIngredient('')).toEqual({ text: '', quantity: null, unit: null, name: '', note: null });
	});
});
