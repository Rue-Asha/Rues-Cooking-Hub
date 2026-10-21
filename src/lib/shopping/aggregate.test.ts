import { describe, expect, it } from 'vitest';
import { parseIngredient } from '../ingredients/parse.ts';
import { aggregate, formatAmounts, mergeAmounts, nameKey, parseAmounts } from './aggregate.ts';

const lines = (...texts: string[]) => texts.map(parseIngredient);
const one = (factor: number, ...texts: string[]) => ({ factor, lines: lines(...texts) });
const shown = (items: ReturnType<typeof aggregate>) =>
	items.map((i) => `${i.name}: ${formatAmounts(i.amounts)}`);

describe('Scenario: Ingredients scale by entry servings', () => {
	it('multiplies quantities by the factor', () => {
		const items = aggregate([one(4 / 2, '200 g flour', '3 eggs')]);

		expect(items.map((i) => [i.name, i.amounts])).toEqual([
			['flour', [{ quantity: 400, unit: 'g' }]],
			['eggs', [{ quantity: 6, unit: null }]]
		]);
	});

	it('scales fractional factors without float noise', () => {
		expect(aggregate([one(0.1 * 3, '1 kg flour')])[0].amounts).toEqual([{ quantity: 300, unit: 'g' }]);
	});
});

describe('Scenario: Equal names and units merge', () => {
	it('sums equal units across contributions, ignoring case', () => {
		const items = aggregate([one(1, '2 tbsp Olive oil'), one(1, '1 tbsp olive oil')]);

		expect(items).toHaveLength(1);
		expect(items[0].amounts).toEqual([{ quantity: 3, unit: 'tbsp' }]);
		expect(items[0].nameKey).toBe('olive oil');
	});
});

describe('Scenario: Metric family amounts sum', () => {
	it('sums g/kg and ml/l and shows kg or l from 1000', () => {
		const items = aggregate([
			one(1, '500 g flour', '250 ml milk', '300 g sugar'),
			one(1, '1 kg flour', '1 l milk', '200 g sugar')
		]);

		expect(shown(items)).toEqual(['flour: 1.5 kg', 'milk: 1.25 l', 'sugar: 500 g']);
	});
});

describe('Scenario: Mixed units stay on one line', () => {
	it('lists unrelated units side by side', () => {
		const items = aggregate([one(1, '1 cup flour'), one(1, '200 g flour')]);

		expect(items).toHaveLength(1);
		expect(formatAmounts(items[0].amounts)).toBe('1 cup + 200 g');
	});
});

describe('Scenario: Singular and plural names fold to one line', () => {
	it('merges onion/onions and tomato/Tomatoes, showing the longest name', () => {
		const items = aggregate([one(1, '1 onion', '1 tomato'), one(1, '2 onions', '2 Tomatoes')]);

		expect(shown(items)).toEqual(['onions: 3', 'Tomatoes: 3']);
		expect(items.map((i) => i.nameKey)).toEqual(['onion', 'tomato']);
	});
});

describe('Scenario: Line without quantity appears once without amount', () => {
	it('adds nothing to an amount when another line has one', () => {
		const items = aggregate([one(1, 'salt'), one(1, 'salt'), one(1, '1 tsp salt')]);

		expect(items).toHaveLength(1);
		expect(items[0].amounts).toEqual([{ quantity: 1, unit: 'tsp' }]);
	});

	it('shows a single item without amount for quantity-less lines only', () => {
		const items = aggregate([one(1, 'salt'), one(1, 'salt')]);

		expect(items).toHaveLength(1);
		expect(items[0].amounts).toEqual([]);
		expect(formatAmounts(items[0].amounts)).toBe('');
	});
});

describe('aggregate details', () => {
	it('keeps first-seen order and skips lines without a name', () => {
		const items = aggregate([one(1, 'b', '200g', 'a')]);

		expect(items.map((i) => i.name)).toEqual(['b', 'a']);
	});

	it('returns nothing for no contributions', () => {
		expect(aggregate([])).toEqual([]);
	});
});

describe('nameKey', () => {
	it('folds case and whitespace', () => {
		expect(nameKey('  Olive   Oil ')).toBe('olive oil');
	});

	it('singularises the last word only', () => {
		expect(nameKey('red onions')).toBe('red onion');
		expect(nameKey('Tomatoes')).toBe('tomato');
		expect(nameKey('berries')).toBe('berry');
		expect(nameKey('peaches')).toBe('peach');
		expect(nameKey('dishes')).toBe('dish');
		expect(nameKey('glasses')).toBe('glass');
		expect(nameKey('boxes')).toBe('box');
		expect(nameKey('blitzes')).toBe('blitz');
		expect(nameKey('eggs')).toBe('egg');
		expect(nameKey('onions red')).toBe('onions red');
	});

	it('leaves words ending in ss, us, is and non-plurals alone', () => {
		expect(nameKey('watercress')).toBe('watercress');
		expect(nameKey('hummus')).toBe('hummus');
		expect(nameKey('basis')).toBe('basis');
		expect(nameKey('milk')).toBe('milk');
		expect(nameKey('')).toBe('');
	});

	it('maps singular and plural to the same key', () => {
		expect(nameKey('onion')).toBe(nameKey('Onions'));
		expect(nameKey('tomato')).toBe(nameKey('tomatoes'));
	});
});

describe('mergeAmounts', () => {
	it('sums equal units and keeps first-seen order', () => {
		expect(
			mergeAmounts(
				[
					{ quantity: 1, unit: 'cup' },
					{ quantity: 2, unit: null }
				],
				[
					{ quantity: 1, unit: 'cup' },
					{ quantity: 1, unit: null },
					{ quantity: 5, unit: 'tsp' }
				]
			)
		).toEqual([
			{ quantity: 2, unit: 'cup' },
			{ quantity: 3, unit: null },
			{ quantity: 5, unit: 'tsp' }
		]);
	});

	it('sums a metric family and switches to kg / l from 1000', () => {
		expect(mergeAmounts([{ quantity: 1, unit: 'l' }], [{ quantity: 500, unit: 'ml' }])).toEqual([
			{ quantity: 1.5, unit: 'l' }
		]);
		expect(mergeAmounts([{ quantity: 600, unit: 'g' }], [{ quantity: 400, unit: 'g' }])).toEqual([
			{ quantity: 1, unit: 'kg' }
		]);
		expect(mergeAmounts([{ quantity: 0.3, unit: 'kg' }], [{ quantity: 0.2, unit: 'kg' }])).toEqual([
			{ quantity: 500, unit: 'g' }
		]);
	});

	it('does not mix families', () => {
		expect(mergeAmounts([{ quantity: 200, unit: 'g' }], [{ quantity: 200, unit: 'ml' }])).toEqual([
			{ quantity: 200, unit: 'g' },
			{ quantity: 200, unit: 'ml' }
		]);
	});

	it('merges with an empty side', () => {
		expect(mergeAmounts([], [])).toEqual([]);
		expect(mergeAmounts([], [{ quantity: 2, unit: 'l' }])).toEqual([{ quantity: 2, unit: 'l' }]);
	});
});

describe('formatAmounts', () => {
	it('joins amounts with " + " and omits a missing unit', () => {
		expect(
			formatAmounts([
				{ quantity: 1, unit: 'cup' },
				{ quantity: 200, unit: 'g' },
				{ quantity: 3, unit: null }
			])
		).toBe('1 cup + 200 g + 3');
	});

	it('shows at most two decimals without trailing zeros', () => {
		expect(formatAmounts([{ quantity: 1 / 3, unit: 'cup' }])).toBe('0.33 cup');
		expect(formatAmounts([{ quantity: 1.5, unit: 'kg' }])).toBe('1.5 kg');
		expect(formatAmounts([{ quantity: 2.0, unit: 'l' }])).toBe('2 l');
		expect(formatAmounts([{ quantity: 1.005, unit: null }])).toBe('1');
	});

	it('is empty for no amounts', () => {
		expect(formatAmounts([])).toBe('');
	});
});

describe('parseAmounts', () => {
	it('reads a single amount', () => {
		expect(parseAmounts('200 g')).toEqual([{ quantity: 200, unit: 'g' }]);
		expect(parseAmounts('1,5 kg')).toEqual([{ quantity: 1.5, unit: 'kg' }]);
		expect(parseAmounts('  3  ')).toEqual([{ quantity: 3, unit: null }]);
	});

	it('reads amounts joined with plus', () => {
		expect(parseAmounts('1 cup + 200 g')).toEqual([
			{ quantity: 1, unit: 'cup' },
			{ quantity: 200, unit: 'g' }
		]);
		expect(parseAmounts('1 l+500 ml')).toEqual([
			{ quantity: 1, unit: 'l' },
			{ quantity: 500, unit: 'ml' }
		]);
	});

	it('canonicalises units', () => {
		expect(parseAmounts('2 tablespoons')).toEqual([{ quantity: 2, unit: 'tbsp' }]);
	});

	it('returns an empty list for empty or blank text', () => {
		expect(parseAmounts('')).toEqual([]);
		expect(parseAmounts('   ')).toEqual([]);
	});

	it('returns null for text it cannot read', () => {
		for (const text of ['lots', '200 g flour', '200 xyz', '1 cup +', '+ 1 cup', '1 cup + lots']) {
			expect(parseAmounts(text), text).toBeNull();
		}
	});

	it('round-trips through formatAmounts', () => {
		const text = '1 cup + 200 g';

		expect(formatAmounts(parseAmounts(text)!)).toBe(text);
	});
});
