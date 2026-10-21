// Fixture data for the static mockups at /__mockups/*. Shapes follow design.md → Contracts loosely; nothing here
// is read by feature code.

export const photo = (name: string) => `/mockups/${name}.jpg`;

export interface MockLine {
	text: string;
	quantity: string | null;
	unit: string | null;
	name: string;
	note: string | null;
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

export const recipes: MockRecipe[] = [
	{
		id: 12,
		title: 'Roasted pumpkin soup with sage brown butter',
		description: 'Hokkaido roasted until sticky, blended silky with ginger and topped with crisp sage and croutons.',
		image: photo('pumpkin-soup'),
		prepMinutes: 15,
		cookMinutes: 40,
		servings: 4,
		tags: ['Soup', 'Vegetarian', 'Autumn'],
		favourite: true,
		sourceUrl: 'https://www.bonappetit.com/recipe/roasted-pumpkin-soup'
	},
	{
		id: 11,
		title: 'Lemon ricotta pancakes',
		description: 'Fluffy, barely sweet, with raspberries warmed in their own juice.',
		image: photo('ricotta-pancakes'),
		prepMinutes: 10,
		cookMinutes: 15,
		servings: 2,
		tags: ['Breakfast', 'Sweet'],
		favourite: false,
		sourceUrl: null
	},
	{
		id: 10,
		title: 'Spaghetti al pomodoro',
		description: 'Five ingredients, twenty minutes: the tomato sauce everything else is measured against.',
		image: photo('spaghetti-pomodoro'),
		prepMinutes: 5,
		cookMinutes: 20,
		servings: 2,
		tags: ['Main Course', 'Pasta'],
		favourite: true,
		sourceUrl: 'https://www.seriouseats.com/spaghetti-al-pomodoro'
	},
	{
		id: 9,
		title: 'Village salad with feta and oregano',
		description: 'Ripe tomatoes, cucumber, red onion and a slab of feta. No lettuce allowed.',
		image: photo('village-salad'),
		prepMinutes: 15,
		cookMinutes: null,
		servings: 2,
		tags: ['Salad', 'Side'],
		favourite: false,
		sourceUrl: null
	},
	{
		id: 8,
		title: 'Weekend sourdough',
		description: 'Overnight cold proof, baked in the Dutch oven. Plan it Friday evening.',
		image: photo('sourdough'),
		prepMinutes: 30,
		cookMinutes: 45,
		servings: 8,
		tags: ['Baking'],
		favourite: true,
		sourceUrl: null
	},
	{
		id: 7,
		title: 'One-pot penne arrabbiata',
		description: 'Pasta cooked right in the sauce, with chilli, garlic and a fistful of basil.',
		image: photo('penne-arrabbiata'),
		prepMinutes: 10,
		cookMinutes: 20,
		servings: 3,
		tags: ['Main Course', 'Pasta', 'Quick'],
		favourite: false,
		sourceUrl: 'https://www.budgetbytes.com/one-pot-penne-arrabbiata'
	},
	{
		id: 6,
		title: 'Käse-Spätzle with crispy onions',
		description: 'Hand-scraped spätzle layered with Bergkäse. Oma’s recipe, written down at last.',
		image: null,
		prepMinutes: 25,
		cookMinutes: 20,
		servings: 4,
		tags: ['Main Course'],
		favourite: true,
		sourceUrl: null
	},
	{
		id: 5,
		title: 'Red lentil soup with lemon',
		description: 'Cumin, smoked paprika and a squeeze of lemon. Freezes beautifully.',
		image: photo('lentil-soup'),
		prepMinutes: 10,
		cookMinutes: 30,
		servings: 4,
		tags: ['Soup', 'Vegan'],
		favourite: false,
		sourceUrl: null
	},
	{
		id: 4,
		title: 'Yoghurt bowl with berries and toasted nuts',
		description: null,
		image: photo('yoghurt-bowl'),
		prepMinutes: 5,
		cookMinutes: null,
		servings: 1,
		tags: ['Breakfast', 'Quick'],
		favourite: false,
		sourceUrl: null
	},
	{
		id: 3,
		title: 'Plum cake from the tray',
		description: 'Zwetschgendatschi with a yeast base and a crumble that is mostly butter.',
		image: null,
		prepMinutes: 40,
		cookMinutes: 35,
		servings: 12,
		tags: ['Dessert', 'Baking'],
		favourite: false,
		sourceUrl: null
	}
];

export const recipeTotal = 48;

export const byId = (id: number) => recipes.find((r) => r.id === id)!;

export const totalMinutes = (r: MockRecipe) =>
	r.prepMinutes === null && r.cookMinutes === null ? null : (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0);

export const featured = recipes.slice(0, 7);

export const tags: { name: string; count: number }[] = [
	{ name: 'Baking', count: 8 },
	{ name: 'Breakfast', count: 7 },
	{ name: 'Dessert', count: 6 },
	{ name: 'Main Course', count: 19 },
	{ name: 'Pasta', count: 9 },
	{ name: 'Quick', count: 11 },
	{ name: 'Salad', count: 5 },
	{ name: 'Soup', count: 6 },
	{ name: 'Vegetarian', count: 8 }
];

// The recipe shown on /__mockups/recipe (and as the import preview, before it was saved).
export const detail = {
	recipe: recipes[0],
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
		{
			title: 'For the sage brown butter',
			lines: ['60 g butter', '1 bunch sage', '2 slices sourdough, cubed']
		}
	],
	steps: [
		{
			title: null,
			lines: [
				'Heat the oven to 220 °C. Halve the pumpkin, scoop out the seeds and cut it into wedges — the skin can stay on.',
				'Toss with olive oil and salt, roast for 35–40 minutes until the edges caramelise.',
				'Soften the onion in a large pot, add garlic and ginger for a minute, then the pumpkin and stock. Simmer 10 minutes.',
				'Blend until silky, stir in the coconut milk and season. Loosen with stock if it is too thick.'
			]
		},
		{
			title: 'For the sage brown butter',
			lines: [
				'Melt the butter over medium heat until it smells nutty and turns hazelnut brown.',
				'Fry the sage leaves until crisp, then the bread cubes until golden. Spoon over each bowl.'
			]
		}
	],
	notes:
		'Doubles well — freeze half **before** adding the coconut milk. Butternut works too, but needs peeling. Rue’s tweak: a pinch of *smoked paprika* in the croutons.'
};

// Live parse shown beside each line in the import preview.
export const parsed: MockLine[] = [
	{ text: '1 Hokkaido pumpkin (about 1,2 kg)', quantity: '1', unit: null, name: 'Hokkaido pumpkin', note: 'about 1,2 kg' },
	{ text: '2 tbsp olive oil', quantity: '2', unit: 'tbsp', name: 'olive oil', note: null },
	{ text: '1 onion, chopped', quantity: '1', unit: null, name: 'onion', note: 'chopped' },
	{ text: '2 cloves garlic', quantity: '2', unit: 'clove', name: 'garlic', note: null },
	{ text: '1 thumb of ginger, grated', quantity: '1', unit: null, name: 'thumb of ginger', note: 'grated' },
	{ text: '800 ml vegetable stock', quantity: '800', unit: 'ml', name: 'vegetable stock', note: null },
	{ text: '200 ml coconut milk', quantity: '200', unit: 'ml', name: 'coconut milk', note: null },
	{ text: 'Salt and pepper', quantity: null, unit: null, name: 'Salt and pepper', note: null }
];

export const importDraft = {
	url: 'https://www.bonappetit.com/recipe/roasted-pumpkin-soup',
	site: 'bonappetit.com',
	tags: [
		{ name: 'Soup', existing: true },
		{ name: 'Vegetarian', existing: true },
		{ name: 'Autumn', existing: false }
	]
};

export const fallbackDraft = {
	url: 'https://www.instagram.com/p/C9xk2ottolenghi',
	site: 'instagram.com',
	title: 'Charred hispi cabbage with miso butter',
	image: photo('village-salad')
};

// The plan week shown on /__mockups/plan and the home tiles. Mockup "today" is Wednesday 21 October 2026.
export const today = '2026-10-21';

export type MockSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export const slots: { id: MockSlot; label: string }[] = [
	{ id: 'breakfast', label: 'Breakfast' },
	{ id: 'lunch', label: 'Lunch' },
	{ id: 'dinner', label: 'Dinner' },
	{ id: 'snacks', label: 'Snacks' }
];

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
	entries: Partial<Record<MockSlot, MockEntry[]>>;
}

export const week: MockDay[] = [
	{
		date: '2026-10-19',
		weekday: 'Monday',
		short: 'Mon',
		day: 19,
		entries: {
			breakfast: [{ recipe: 4, servings: 1 }],
			lunch: [{ recipe: null, text: 'Leftover lasagne' }],
			dinner: [{ recipe: 10, servings: 2 }]
		}
	},
	{
		date: '2026-10-20',
		weekday: 'Tuesday',
		short: 'Tue',
		day: 20,
		entries: {
			breakfast: [{ recipe: 4, servings: 1 }],
			dinner: [{ recipe: 5, servings: 4 }]
		}
	},
	{
		date: '2026-10-21',
		weekday: 'Wednesday',
		short: 'Wed',
		day: 21,
		entries: {
			breakfast: [{ recipe: 11, servings: 2 }],
			lunch: [{ recipe: 9, servings: 2 }],
			dinner: [{ recipe: 12, servings: 4 }],
			snacks: [{ recipe: null, text: 'Apples & peanut butter' }]
		}
	},
	{
		date: '2026-10-22',
		weekday: 'Thursday',
		short: 'Thu',
		day: 22,
		entries: {
			lunch: [{ recipe: 12, servings: 2 }],
			dinner: [{ recipe: 7, servings: 3 }]
		}
	},
	{
		date: '2026-10-23',
		weekday: 'Friday',
		short: 'Fri',
		day: 23,
		entries: {
			dinner: [{ recipe: null, text: 'Pizza night at Lena’s' }],
			snacks: [{ recipe: 8, servings: 8 }]
		}
	},
	{
		date: '2026-10-24',
		weekday: 'Saturday',
		short: 'Sat',
		day: 24,
		entries: {
			breakfast: [{ recipe: 11, servings: 4 }],
			dinner: [{ recipe: 6, servings: 4 }, { recipe: 9, servings: 4 }]
		}
	},
	{
		date: '2026-10-25',
		weekday: 'Sunday',
		short: 'Sun',
		day: 25,
		entries: {
			lunch: [{ recipe: 5, servings: 2 }]
		}
	}
];

export interface MockItem {
	name: string;
	amount: string;
	fromPlan?: string;
	origin: 'manual' | 'plan';
	checked?: boolean;
}

export const list: { category: string; items: MockItem[] }[] = [
	{
		category: 'Produce',
		items: [
			{ name: 'onions', amount: '3', origin: 'plan' },
			{ name: 'tomatoes', amount: '1 kg', origin: 'plan' },
			{ name: 'Hokkaido pumpkin', amount: '1', origin: 'plan' },
			{ name: 'ginger', amount: '1 thumb', origin: 'plan' },
			{ name: 'sage', amount: '1 bunch', origin: 'plan' },
			{ name: 'lemons', amount: '2', origin: 'manual' }
		]
	},
	{
		category: 'Dairy & Eggs',
		items: [
			{ name: 'butter', amount: '250 g', fromPlan: '+ 60 g from plan', origin: 'manual' },
			{ name: 'feta', amount: '200 g', origin: 'plan' },
			{ name: 'ricotta', amount: '250 g', origin: 'plan' },
			{ name: 'oat milk', amount: '2 l', origin: 'manual' }
		]
	},
	{
		category: 'Pantry',
		items: [
			{ name: 'red lentils', amount: '300 g', origin: 'plan' },
			{ name: 'coconut milk', amount: '400 ml', origin: 'plan' },
			{ name: 'flour', amount: '1 cup + 200 g', origin: 'plan' },
			{ name: 'olive oil', amount: '', origin: 'manual' }
		]
	},
	{
		category: 'Bakery',
		items: [{ name: 'sourdough loaf', amount: '1', origin: 'manual' }]
	},
	{
		category: 'Household',
		items: [
			{ name: 'baking paper', amount: '', origin: 'manual' },
			{ name: 'dish soap', amount: '', origin: 'manual' }
		]
	}
];

export const checked: MockItem[] = [
	{ name: 'spaghetti', amount: '500 g', origin: 'plan', checked: true },
	{ name: 'garlic', amount: '6 cloves', origin: 'plan', checked: true },
	{ name: 'basil', amount: '1 bunch', origin: 'plan', checked: true }
];

export const openCount = list.reduce((n, c) => n + c.items.length, 0);
