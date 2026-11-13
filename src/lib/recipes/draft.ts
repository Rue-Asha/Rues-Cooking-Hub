import type { Section } from '../types.ts';

export interface RecipeFormDraft {
	title: string;
	description: string;
	servings: string;
	prepMinutes: string;
	cookMinutes: string;
	sourceUrl: string;
	notes: string;
	tagNames: string[];
	ingredients: Section<string>[];
	steps: Section<string>[];
	imageUrl: string;
}

export interface StoredDraft {
	v: 1;
	imported: boolean;
	form: RecipeFormDraft;
}

export type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const KEY = 'cooking-hub:recipe-draft';

export function saveDraft(storage: DraftStorage, draft: StoredDraft): void {
	try {
		storage.setItem(KEY, JSON.stringify(draft));
	} catch {
		// blocked storage: no draft
	}
}

const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isSections = (v: unknown): v is Section<string>[] =>
	Array.isArray(v) &&
	v.every((s) => typeof s === 'object' && s !== null && (s.title === null || typeof s.title === 'string') && isStrings(s.lines));
const TEXT_FIELDS = ['title', 'description', 'servings', 'prepMinutes', 'cookMinutes', 'sourceUrl', 'notes', 'imageUrl'] as const;

function isFormShape(f: any): f is RecipeFormDraft {
	return (
		typeof f === 'object' &&
		f !== null &&
		TEXT_FIELDS.every((k) => typeof f[k] === 'string') &&
		isStrings(f.tagNames) &&
		isSections(f.ingredients) &&
		isSections(f.steps)
	);
}

export function loadDraft(storage: DraftStorage): StoredDraft | null {
	try {
		const raw = storage.getItem(KEY);
		if (raw === null) return null;
		const parsed = JSON.parse(raw);
		if (parsed?.v !== 1 || typeof parsed.imported !== 'boolean' || !isFormShape(parsed.form)) return null;
		return parsed as StoredDraft;
	} catch {
		return null;
	}
}

export function clearDraft(storage: DraftStorage): void {
	try {
		storage.removeItem(KEY);
	} catch {
		// blocked storage: nothing to clear
	}
}

const sameSections = (a: Section<string>[], b: Section<string>[]) =>
	a.length === b.length &&
	a.every((s, i) => s.title === b[i].title && s.lines.length === b[i].lines.length && s.lines.every((l, j) => l === b[i].lines[j]));

export function isDraftWorthKeeping(draft: RecipeFormDraft, initial: RecipeFormDraft): boolean {
	return !(
		TEXT_FIELDS.every((k) => draft[k] === initial[k]) &&
		draft.tagNames.length === initial.tagNames.length &&
		draft.tagNames.every((t, i) => t === initial.tagNames[i]) &&
		sameSections(draft.ingredients, initial.ingredients) &&
		sameSections(draft.steps, initial.steps)
	);
}
