import type { SeedInput } from './helpers.ts';

export const TODAY = '2026-11-18'; // a Wednesday

const long = 'Slow-braised ' + 'extraordinarily '.repeat(6) + 'long-named heritage tomato and anchovy stew for a rainy Sunday';
const unbroken = 'Superkalifragilistischexpialigetischer'.repeat(3);
const categories = ['produce', 'dairy-eggs', 'meat-fish', 'bakery', 'pantry', 'frozen'] as const;
const slots = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
const day = (n: number) => new Date(Date.UTC(2026, 10, 16 + n)).toISOString().slice(0, 10);

const recipes: NonNullable<SeedInput['recipes']> = [
	{
		title: long,
		description: long + '. ' + long,
		servings: 12,
		prepMinutes: 95,
		cookMinutes: 305,
		notes: long,
		favourite: true,
		favouritedAt: '2026-11-10T10:00:00Z',
		tags: ['sunday', unbroken, 'one-pot', 'make-ahead', 'freezer-friendly', 'a very long tag that wraps onto a second line'],
		image: true,
		ingredients: [
			{ title: null, lines: Array.from({ length: 24 }, (_, i) => `${i + 1} tbsp ${unbroken.slice(0, 20 + i)} finely chopped`) },
			{ title: 'For the sauce ' + long, lines: ['1 cup stock', '2 cloves garlic'] }
		],
		steps: [{ title: null, lines: Array.from({ length: 18 }, (_, i) => `Step ${i + 1}. ${long}`) }]
	},
	{ title: 'X', servings: 1, ingredients: [{ title: null, lines: ['1 egg'] }], steps: [{ title: null, lines: ['Boil.'] }] },
	{ title: unbroken, servings: 4, tags: ['a'], ingredients: [{ title: null, lines: ['2 cups ' + unbroken] }], steps: [{ title: null, lines: [unbroken] }] },
	...Array.from({ length: 26 }, (_, i) => ({
		title: `Recipe ${i + 1} ${i % 3 === 0 ? long : 'with a normal name'}`,
		servings: 2 + (i % 5),
		favourite: i % 7 === 0,
		favouritedAt: i % 7 === 0 ? `2026-11-0${1 + (i % 9)}T10:00:00Z` : undefined,
		tags: [`tag-${i % 6}`, 'dinner'],
		image: i % 2 === 0,
		ingredients: [{ title: null, lines: ['1 onion', '200 g rice'] }],
		steps: [{ title: null, lines: ['Cook it.'] }]
	}))
];

export const worstCase: SeedInput = {
	recipes,
	entries: [
		...Array.from({ length: 7 }, (_, d) => slots.map((s, i) => ({ date: day(d), slot: s, recipe: (d + i) % recipes.length, servings: 4 }))).flat(),
		{ date: day(2), slot: 'dinner', text: long },
		{ date: day(2), slot: 'dinner', text: unbroken },
		{ date: day(3), slot: 'lunch', text: 'Leftovers' }
	],
	items: Array.from({ length: 80 }, (_, i) => ({
		name: i % 5 === 0 ? long.slice(0, 60 + i) : `Item ${i} ${unbroken.slice(0, i % 30)}`,
		manualAmounts: [{ quantity: i + 1, unit: i % 2 ? 'g' : null }],
		category: categories[i % categories.length],
		checked: i % 4 === 0,
		origin: 'manual' as const
	})),
	spots: [
		{ name: long, status: 'visited', scoreHundredths: 1000, price: 4, city: unbroken, neighbourhood: long, address: long, website: 'https://example.com/' + unbroken, notes: long, tags: ['brunch', unbroken], image: true },
		{ name: 'Y', status: 'want' },
		...Array.from({ length: 24 }, (_, i) => ({
			name: `Spot ${i + 1} ${i % 3 === 0 ? long : 'Corner Kitchen'}`,
			status: (i % 3 === 0 ? 'want' : 'visited') as 'want' | 'visited',
			scoreHundredths: i % 3 === 0 ? undefined : 500 + i * 20,
			price: ((i % 4) + 1) as 1 | 2 | 3 | 4,
			city: 'Berlin',
			tags: [`tag-${i % 4}`],
			image: i % 2 === 0
		}))
	]
};
