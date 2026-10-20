export type Id = number;
export type IsoDate = string;
export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export const SLOTS: readonly { id: Slot; label: string }[] = [
	{ id: 'breakfast', label: 'Breakfast' },
	{ id: 'lunch', label: 'Lunch' },
	{ id: 'dinner', label: 'Dinner' },
	{ id: 'snacks', label: 'Snacks' }
];
export type Category =
	| 'produce'
	| 'dairy-eggs'
	| 'meat-fish'
	| 'bakery'
	| 'pantry'
	| 'frozen'
	| 'drinks'
	| 'household'
	| 'other';
export const CATEGORIES: readonly { id: Category; label: string }[] = [
	{ id: 'produce', label: 'Produce' },
	{ id: 'dairy-eggs', label: 'Dairy & Eggs' },
	{ id: 'meat-fish', label: 'Meat & Fish' },
	{ id: 'bakery', label: 'Bakery' },
	{ id: 'pantry', label: 'Pantry' },
	{ id: 'frozen', label: 'Frozen' },
	{ id: 'drinks', label: 'Drinks' },
	{ id: 'household', label: 'Household' },
	{ id: 'other', label: 'Other' }
];
export type ArchiveSort = 'newest' | 'title' | 'time';

export interface Section<T> {
	title: string | null;
	lines: T[];
}
export interface ParsedLine {
	text: string;
	quantity: number | null;
	unit: string | null;
	name: string;
	note: string | null;
}
export interface Tag {
	id: Id;
	name: string;
}
export interface TagWithCount extends Tag {
	count: number;
}

// stored fields; totalMinutes is derived = (prep ?? 0) + (cook ?? 0), null when both are null
export interface Recipe {
	id: Id;
	title: string;
	description: string | null;
	sourceUrl: string | null;
	servings: number;
	prepMinutes: number | null;
	cookMinutes: number | null;
	totalMinutes: number | null;
	notes: string | null;
	favourite: boolean;
	favouritedAt: string | null;
	imageId: Id | null;
	createdAt: string;
	updatedAt: string;
	tags: Tag[];
	ingredients: Section<ParsedLine>[];
	steps: Section<string>[];
}
export interface RecipeCard {
	id: Id;
	title: string;
	description: string | null;
	imageId: Id | null;
	totalMinutes: number | null;
	servings: number;
	tags: Tag[];
	favourite: boolean;
	createdAt: string;
}
export interface RecipeInput {
	title: string;
	description: string | null;
	sourceUrl: string | null;
	servings: number;
	prepMinutes: number | null;
	cookMinutes: number | null;
	notes: string | null;
	favourite: boolean;
	imageId: Id | null; // already stored via images.ts; on update a different id or null ("Remove image") deletes the old row
	tagNames: string[]; // ensureTags() resolves them
	ingredients: Section<string>[]; // raw lines; parsed with parseIngredient on save; empty sections dropped
	steps: Section<string>[];
}
export interface ArchiveQuery {
	q?: string;
	tagIds?: Id[];
	favouritesOnly?: boolean;
	sort?: ArchiveSort;
}

// import result and form prefill
export interface RecipeDraft {
	title: string;
	description: string | null;
	sourceUrl: string;
	servings: number;
	prepMinutes: number | null;
	cookMinutes: number | null;
	imageUrl: string | null;
	tagNames: string[]; // recipeCategory + keywords, de-duplicated by fold()
	ingredients: Section<string>[];
	steps: Section<string>[];
}
export type ImportResult =
	| { kind: 'recipe'; draft: RecipeDraft }
	| { kind: 'fallback'; draft: RecipeDraft } // sourceUrl, title from meta or '', imageUrl from og:image, rest empty
	| { kind: 'invalid' };

export interface PlanEntry {
	id: Id;
	date: IsoDate;
	slot: Slot;
	position: number;
	recipe: { id: Id; title: string; imageId: Id | null; servings: number } | null; // servings = recipe default
	servings: number | null; // entry servings (recipe entries only)
	text: string | null; // free-text entries only
}
export type PlanEntryInput =
	| { date: IsoDate; slot: Slot; recipeId: Id; servings: number }
	| { date: IsoDate; slot: Slot; text: string };

export interface Amount {
	quantity: number;
	unit: string | null;
}
export interface ShoppingItem {
	id: Id;
	name: string;
	category: Category;
	checked: boolean;
	origin: 'manual' | 'plan';
	position: number;
	manualAmounts: Amount[]; // stored parts
	planAmounts: Amount[];
	amounts: Amount[]; // derived = mergeAmounts(manualAmounts, planAmounts), what the list shows
}
export type AddFromPlanResult = { kind: 'added'; count: number } | { kind: 'empty' };

export interface Dashboard {
	hero:
		| { kind: 'today'; recipe: RecipeCard; slot: Slot }
		| { kind: 'newest'; recipe: RecipeCard }
		| { kind: 'welcome' };
	week: {
		date: IsoDate;
		entries: { title: string; imageId: Id | null; recipeId: Id | null }[];
	}[]; // Mon–Sun
	list: { open: number; first: string[] }; // first ≤ 3 open item names in display order
	favourite: RecipeCard | null;
}
