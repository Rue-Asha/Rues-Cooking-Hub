import { describe, expect, it } from 'vitest';
import { parseIngredient } from './parse.ts';
import { scaleIngredient } from './scale.ts';

const scale = (text: string, from: number, to: number) => scaleIngredient(parseIngredient(text), from, to);

describe('Scenario: Scaling a line doubles its quantity', () => {
	it('reads "400 g flour" for 200 g flour at 2 → 4 servings', () => {
		expect(scale('200 g flour', 2, 4)).toBe('400 g flour');
	});

	it('scales a line without unit', () => {
		expect(scale('3 eggs', 2, 4)).toBe('6 eggs');
	});
});

describe('Scenario: Scaling rounds to two decimals', () => {
	it('reads "0.33 cup milk" for 1 cup milk at 3 → 1 servings', () => {
		expect(scale('1 cup milk', 3, 1)).toBe('0.33 cup milk');
	});

	it('drops trailing zeros', () => {
		expect(scale('1 kg flour', 4, 5)).toBe('1.25 kg flour');
		expect(scale('1 kg flour', 2, 4)).toBe('2 kg flour');
	});
});

describe('Scenario: Lines without quantity and the recipe\'s own servings stay unchanged', () => {
	it('returns the original text for a line without quantity', () => {
		expect(scale('salt to taste', 2, 6)).toBe('salt to taste');
	});

	it('returns the original text at the recipe\'s own servings', () => {
		expect(scale('200g  flour', 2, 2)).toBe('200g  flour');
	});
});

describe('Scenario: Invalid scale target leaves the line unchanged', () => {
	it('returns the original text for 0, negative, fractional or NaN targets', () => {
		for (const to of [0, -1, 2.5, Number.NaN, Infinity]) {
			expect(scale('200 g flour', 2, to)).toBe('200 g flour');
		}
	});
});

describe('Scenario: Unit and note ordering', () => {
	it('keeps the unit as written, then name, then the note after a comma', () => {
		expect(scale('2 cloves garlic, minced', 2, 4)).toBe('4 cloves garlic, minced');
		expect(scale('200g butter, softened', 2, 3)).toBe('300 g butter, softened');
	});
});

describe('Scenario: Scaling a range scales both ends', () => {
	it('reads "4–6 cloves garlic" for 2-3 cloves garlic at 2 → 4 servings', () => {
		expect(scale('2-3 cloves garlic', 2, 4)).toBe('4–6 cloves garlic');
	});

	it('scales decimal ranges and rounds each end', () => {
		expect(scale('1/2-1 cup milk', 3, 1)).toBe('0.17–0.33 cup milk');
		expect(scale('1.5-2.5 kg potatoes', 2, 3)).toBe('2.25–3.75 kg potatoes');
	});
});

describe('Scenario: Scaling edge cases', () => {
	it('leaves the text for an invalid source servings', () => {
		for (const from of [0, Number.NaN]) expect(scale('200 g flour', from, 4)).toBe('200 g flour');
	});

	it('scales fractions and mixed numbers', () => {
		expect(scale('½ cup milk', 1, 2)).toBe('1 cup milk');
		expect(scale('1 1/2 cups milk', 1, 2)).toBe('3 cups milk');
	});

	it('does not print an equal-ended range as a range', () => {
		expect(scale('2-2 cloves garlic', 1, 2)).toBe('4 cloves garlic');
	});

	it('scales a reversed range end for end', () => {
		expect(scale('3-2 cloves garlic', 1, 2)).toBe('4–6 cloves garlic');
	});

	it('reads a decimal comma', () => {
		expect(scale('1,5 kg potatoes', 2, 3)).toBe('2.25 kg potatoes');
	});

	it('leaves the text when the result would print in exponent notation or round to 0', () => {
		expect(scale('1 pinch salt', 1e9, 1)).toBe('1 pinch salt');
		expect(scale('100000000000000000000 g flour', 1, 1000)).toBe('100000000000000000000 g flour');
	});
});

describe('Scenario: Unprintable scaled amounts leave the line unchanged', () => {
	it('Scenario: Unprintable scaled amounts leave the line unchanged', () => {
		expect(scale('1 pinch salt', 1e9, 1)).toBe('1 pinch salt');
		expect(scale('100000000000000000000 g flour', 1, 1000)).toBe('100000000000000000000 g flour');
		for (const from of [0, -2, Number.NaN, Number.POSITIVE_INFINITY]) expect(scale('200 g flour', from, 4)).toBe('200 g flour');
	});
});
