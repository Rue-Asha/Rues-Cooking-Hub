// Fixture data for the redesign mockups at /__mockups/redesign/*. Self-contained on purpose: the old /__mockups fixtures go
// in the cleanup. `?data=worst` swaps in the worst-case set (DESIGN-reference.md worst-case list plus every scope edge).

export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface MockLine {
	title: string | null;
	lines: string[];
}

export interface MockRecipe {
	id: number;
	title: string;
	description: string | null;
	image: string | null;
	prepMinutes: number | null;
	cookMinutes: number | null;
	servings: number;
	tags: string[];
	favourite: boolean;
	sourceUrl: string | null;
}

export interface MockRecipeFull extends MockRecipe {
	ingredients: MockLine[];
	steps: MockLine[];
	notes: string | null;
}

export interface MockEntry {
	recipe: number | null;
	text?: string;
	servings?: number;
}

export interface MockDay {
	date: string;
	weekday: string;
	short: string;
	day: number;
	entries: Record<Slot, MockEntry[]>;
}

export interface MockItem {
	name: string;
	amount: string;
	origin: 'manual' | 'plan';
	fromPlan?: string;
	checked?: boolean;
}

export interface MockAisle {
	category: string;
	items: MockItem[];
}

export interface MockTag {
	name: string;
	count: number;
}

export interface MockSpot {
	id: number;
	name: string;
	status: 'want' | 'visited';
	score: string | null;
	rank: number | null;
	price: string | null;
	neighbourhood: string | null;
	city: string | null;
	tags: string[];
	image: string | null;
}

export interface MockHome {
	greeting: string;
	hero: MockRecipe | null;
	favourite: MockRecipe | null;
	todayDinner: MockEntry | null;
	listOpen: number;
	weekPlanned: number;
}

export interface MockData {
	worst: boolean;
	today: string;
	recipes: MockRecipe[];
	recipe: MockRecipeFull;
	week: MockDay[];
	list: MockAisle[];
	tags: MockTag[];
	spots: MockSpot[];
	home: MockHome;
	empty: { recipes: MockRecipe[]; week: MockDay[]; list: MockAisle[]; tags: MockTag[]; spots: MockSpot[] };
}

export const photo = (name: string) => `/mockups/${name}.jpg`;

const SLOTS: Slot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
const photos = ['pumpkin-soup', 'ricotta-pancakes', 'spaghetti-pomodoro', 'penne-arrabbiata', 'lentil-soup', 'sourdough', 'village-salad', 'yoghurt-bowl'];
const spotPhotos = ['spot-interior', 'spot-pizzeria', 'spot-ramen', 'spot-terrace', 'spot-wine-bar'];

const recipe = (id: number, title: string, image: string | null, extra: Partial<MockRecipe> = {}): MockRecipe => ({
	id,
	title,
	description: null,
	image,
	prepMinutes: 10,
	cookMinutes: 20,
	servings: 2,
	tags: [],
	favourite: false,
	sourceUrl: null,
	...extra
});

const normalRecipes: MockRecipe[] = [
	recipe(12, 'Roasted pumpkin soup with sage brown butter', photo('pumpkin-soup'), {
		description: 'Hokkaido roasted until sticky, blended silky with ginger and topped with crisp sage and croutons.',
		prepMinutes: 15,
		cookMinutes: 40,
		servings: 4,
		tags: ['Soup', 'Vegetarian', 'Autumn'],
		favourite: true,
		sourceUrl: 'https://www.bonappetit.com/recipe/roasted-pumpkin-soup'
	}),
	recipe(11, 'Lemon ricotta pancakes', photo('ricotta-pancakes'), { prepMinutes: 10, cookMinutes: 15, tags: ['Breakfast', 'Sweet'] }),
	recipe(10, 'Spaghetti al pomodoro', photo('spaghetti-pomodoro'), { prepMinutes: 5, tags: ['Main Course', 'Pasta'], favourite: true }),
	recipe(9, 'Penne all’arrabbiata', photo('penne-arrabbiata'), { tags: ['Main Course', 'Pasta', 'Quick'] }),
	recipe(8, 'Red lentil soup with lemon', photo('lentil-soup'), { servings: 4, tags: ['Soup', 'Vegetarian'] }),
	recipe(7, 'Overnight sourdough', photo('sourdough'), { prepMinutes: 30, cookMinutes: 45, servings: 8, tags: ['Baking'] }),
	recipe(6, 'Village salad', photo('village-salad'), { cookMinutes: null, tags: ['Salad', 'Quick'] }),
	recipe(5, 'Yoghurt bowl with honey and walnuts', photo('yoghurt-bowl'), { cookMinutes: null, servings: 1, tags: ['Breakfast', 'Quick'] }),
	recipe(4, 'Weeknight dal', null, { prepMinutes: null, cookMinutes: null, tags: [] })
];

const normalDetail = {
	...normalRecipes[0],
	ingredients: [
		{
			title: null,
			lines: [
				'1 Hokkaido pumpkin (about 1,2 kg)',
				'2 tbsp olive oil',
				'1 onion, chopped',
				'2 cloves garlic',
				'1 thumb of ginger, grated',
				'800 ml vegetable stock',
				'200 ml coconut milk',
				'Salt and pepper'
			]
		},
		{ title: 'For the sage brown butter', lines: ['60 g butter', '1 bunch sage', '2 slices sourdough, cubed'] }
	],
	steps: [
		{
			title: null,
			lines: [
				'Heat the oven to 220 °C. Halve the pumpkin, scoop out the seeds and cut it into wedges.',
				'Toss with olive oil and salt, roast for 35–40 minutes until the edges caramelise.',
				'Soften the onion in a large pot, add garlic and ginger for a minute, then the pumpkin and stock. Simmer 10 minutes.',
				'Blend until silky, stir in the coconut milk and season.'
			]
		},
		{
			title: 'For the sage brown butter',
			lines: ['Melt the butter over medium heat until it turns hazelnut brown.', 'Fry the sage leaves until crisp, then the bread cubes until golden.']
		}
	],
	notes: 'Doubles well. Freeze half before adding the coconut milk.'
} satisfies MockRecipeFull;

const DAYS = [
	['2026-10-19', 'Monday', 'Mon', 19],
	['2026-10-20', 'Tuesday', 'Tue', 20],
	['2026-10-21', 'Wednesday', 'Wed', 21],
	['2026-10-22', 'Thursday', 'Thu', 22],
	['2026-10-23', 'Friday', 'Fri', 23],
	['2026-10-24', 'Saturday', 'Sat', 24],
	['2026-10-25', 'Sunday', 'Sun', 25]
] as const;

const emptySlots = (): Record<Slot, MockEntry[]> => ({ breakfast: [], lunch: [], dinner: [], snacks: [] });

function buildWeek(fill: (index: number, entries: Record<Slot, MockEntry[]>) => void): MockDay[] {
	return DAYS.map(([date, weekday, short, day], index) => {
		const entries = emptySlots();
		fill(index, entries);
		return { date, weekday, short, day, entries };
	});
}

const normalWeek = buildWeek((i, e) => {
	if (i === 0) {
		e.breakfast.push({ recipe: 5, servings: 1 });
		e.lunch.push({ recipe: null, text: 'Leftover lasagne' });
		e.dinner.push({ recipe: 10, servings: 2 });
	}
	if (i === 1) e.dinner.push({ recipe: 8, servings: 4 });
	if (i === 2) {
		e.breakfast.push({ recipe: 11, servings: 2 });
		e.lunch.push({ recipe: 6, servings: 2 });
		e.dinner.push({ recipe: 12, servings: 4 });
		e.snacks.push({ recipe: null, text: 'Apples & peanut butter' });
	}
	if (i === 4) e.dinner.push({ recipe: 9, servings: 2 });
	if (i === 5) e.lunch.push({ recipe: 7, servings: 6 });
});

const normalList: MockAisle[] = [
	{
		category: 'Produce',
		items: [
			{ name: 'onions', amount: '3', origin: 'plan', fromPlan: 'Pumpkin soup' },
			{ name: 'tomatoes', amount: '1 kg', origin: 'plan', fromPlan: 'Spaghetti al pomodoro' },
			{ name: 'Hokkaido pumpkin', amount: '1', origin: 'plan', fromPlan: 'Pumpkin soup' },
			{ name: 'lemons', amount: '2', origin: 'manual' }
		]
	},
	{
		category: 'Dairy',
		items: [
			{ name: 'butter', amount: '250 g', origin: 'plan', fromPlan: 'Pumpkin soup' },
			{ name: 'ricotta', amount: '250 g', origin: 'plan', fromPlan: 'Lemon ricotta pancakes' }
		]
	},
	{
		category: 'Pantry',
		items: [
			{ name: 'spaghetti', amount: '500 g', origin: 'plan', fromPlan: 'Spaghetti al pomodoro' },
			{ name: 'coconut milk', amount: '400 ml', origin: 'manual' },
			{ name: 'red lentils', amount: '300 g', origin: 'manual', checked: true }
		]
	}
];

const normalTags: MockTag[] = [
	{ name: 'Baking', count: 8 },
	{ name: 'Breakfast', count: 7 },
	{ name: 'Main Course', count: 19 },
	{ name: 'Pasta', count: 9 },
	{ name: 'Quick', count: 11 },
	{ name: 'Soup', count: 6 },
	{ name: 'Vegetarian', count: 8 }
];

const spot = (id: number, name: string, status: MockSpot['status'], extra: Partial<MockSpot> = {}): MockSpot => ({
	id,
	name,
	status,
	score: null,
	rank: null,
	price: null,
	neighbourhood: null,
	city: null,
	tags: [],
	image: null,
	...extra
});

const normalSpots: MockSpot[] = [
	spot(1, 'Brasserie Lumière', 'visited', { score: '9.00', rank: 1, price: '€€€', neighbourhood: 'Mitte', city: 'Berlin', tags: ['Brasserie', 'Wine'], image: photo('spot-interior') }),
	spot(2, 'Terraza Pujol', 'visited', { score: '9.00', rank: 1, price: '€€', neighbourhood: 'Gràcia', city: 'Barcelona', tags: ['Tapas', 'Terrace'], image: photo('spot-terrace') }),
	spot(3, 'Ramen Kuma', 'visited', { score: '8.75', rank: 3, price: '€', neighbourhood: 'Kreuzberg', city: 'Berlin', tags: ['Ramen'], image: photo('spot-ramen') }),
	spot(4, 'Pizzeria da Gigi', 'visited', { score: '8.10', rank: 4, price: '€', city: 'Naples', tags: ['Pizza'], image: photo('spot-pizzeria') }),
	spot(5, 'Weinbar Rot', 'want', { price: '€€', neighbourhood: 'Neukölln', city: 'Berlin', tags: ['Wine'], image: photo('spot-wine-bar') })
];

const normalHome: MockHome = {
	greeting: 'Good evening',
	hero: normalRecipes[0],
	favourite: normalRecipes[2],
	todayDinner: { recipe: 12, servings: 4 },
	listOpen: 8,
	weekPlanned: 11
};

const emptySets = { recipes: [], week: [], list: [], tags: [], spots: [] };

// worst case ---------------------------------------------------------------------------------------------------

const pad = (text: string, length: number) => text.repeat(Math.ceil(length / text.length)).slice(0, length);
const ENGLISH = 'Slow-braised short rib with caramelised shallots, pomegranate molasses and a very long list of garnishes ';
const WORD60 = 'Donaudampfschifffahrtsgesellschaftskapitaenslieder'.padEnd(60, 'x').slice(0, 60);
const AISLES = ['Produce', 'Dairy', 'Pantry', 'Bakery', 'Frozen', 'Drinks', 'Meat and fish', 'Household', 'Other'];

const worstRecipes: MockRecipe[] = Array.from({ length: 120 }, (_, i) =>
	recipe(i + 1, i === 0 ? pad(ENGLISH, 120) : i % 7 === 0 ? 'Untitled' : `Recipe number ${i + 1}`, i % 9 === 4 ? null : photo(photos[i % photos.length]), {
		description: i % 3 === 0 ? pad(ENGLISH, 140) : null,
		prepMinutes: i % 5 === 0 ? null : 15,
		cookMinutes: i % 4 === 0 ? null : 40,
		servings: i % 11 === 0 ? 1 : 4,
		tags: i % 2 ? ['Quick', '寿司', 'שלום'] : [],
		favourite: i % 6 === 0
	})
);

const worstDetail: MockRecipeFull = {
	...worstRecipes[0],
	title: pad(ENGLISH, 120),
	description: pad(ENGLISH, 600),
	sourceUrl: `https://example.com/${'a'.repeat(400 - 'https://example.com/'.length)}`,
	tags: Array.from({ length: 40 }, (_, i) => `tag-${String(i).padStart(2, '0')}-`.padEnd(30, 'x')),
	ingredients: [
		{
			title: null,
			lines: Array.from({ length: 50 }, (_, i) =>
				i === 0 ? `2 × 400 g tins + 1 jar (680 g) ${WORD60}` : i === 1 ? '125–150 ml' : `${i + 1} g ingredient ${i + 1}`
			)
		}
	],
	steps: [{ title: null, lines: [pad(ENGLISH, 600), pad(ENGLISH, 300)] }],
	notes: pad(ENGLISH, 600)
};

const worstWeek = buildWeek((i, e) => {
	if (i === 0) {
		e.dinner = Array.from({ length: 5 }, (_, n) => ({ recipe: n + 1, servings: n + 1 }));
		e.lunch.push({ recipe: null, text: pad(ENGLISH, 200) });
	}
	if (i === 3) e.breakfast.push({ recipe: 1, servings: 12 });
	if (i === 6) e.snacks.push({ recipe: null, text: WORD60 });
});

const worstList: MockAisle[] = AISLES.map((category, a) => ({
	category,
	items: Array.from({ length: a < 8 ? 9 : 8 }, (_, i) => ({
		name: a === 0 && i === 0 ? pad(ENGLISH, 90) : a === 1 && i === 0 ? WORD60 : `item ${a + 1}.${i + 1}`,
		amount: i % 3 === 0 ? '' : '2 × 400 g tins + 1 jar (680 g)',
		origin: i % 2 ? ('plan' as const) : ('manual' as const),
		fromPlan: i % 2 ? pad(ENGLISH, 60) : undefined,
		checked: i % 5 === 4
	}))
}));

const worstTags: MockTag[] = [
	{ name: WORD60, count: 1093 },
	...Array.from({ length: 39 }, (_, i) => ({ name: i % 2 ? `Tag ${i}` : `A longer tag name ${i}`, count: i * 3 }))
];

const worstSpots: MockSpot[] = Array.from({ length: 60 }, (_, i) =>
	spot(i + 1, i === 0 ? pad(ENGLISH, 100) : `Spot ${i + 1}`, i % 3 ? 'visited' : 'want', {
		score: i % 3 ? (9 - (i % 9) * 0.1).toFixed(2) : null,
		rank: i % 3 ? i : null,
		price: i % 4 ? '€€€€' : null,
		neighbourhood: i % 2 ? WORD60 : null,
		city: 'Berlin',
		tags: ['Brasserie', 'Wine', '寿司'],
		image: i % 5 === 0 ? null : photo(spotPhotos[i % spotPhotos.length])
	})
);

const worstHome: MockHome = {
	greeting: 'Good evening',
	hero: worstRecipes[0],
	favourite: worstRecipes[6],
	todayDinner: { recipe: null, text: pad(ENGLISH, 200) },
	listOpen: 1093,
	weekPlanned: 240
};

export function mockData(url: URL): MockData {
	const worst = url.searchParams.get('data') === 'worst';
	return {
		worst,
		today: '2026-10-21',
		recipes: worst ? worstRecipes : normalRecipes,
		recipe: worst ? worstDetail : normalDetail,
		week: worst ? worstWeek : normalWeek,
		list: worst ? worstList : normalList,
		tags: worst ? worstTags : normalTags,
		spots: worst ? worstSpots : normalSpots,
		home: worst ? worstHome : normalHome,
		empty: emptySets
	};
}
