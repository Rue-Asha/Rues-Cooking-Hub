import { describe, expect, it } from 'vitest';
import { clearDraft, isDraftWorthKeeping, loadDraft, saveDraft, type DraftStorage, type RecipeFormDraft } from './draft.ts';

const KEY = 'cooking-hub:recipe-draft';

const fakeStorage = (): DraftStorage & { data: Map<string, string> } => {
	const data = new Map<string, string>();
	return {
		data,
		getItem: (k) => data.get(k) ?? null,
		setItem: (k, v) => void data.set(k, v),
		removeItem: (k) => void data.delete(k)
	};
};

const throwing: DraftStorage = {
	getItem: () => {
		throw new Error('blocked');
	},
	setItem: () => {
		throw new Error('blocked');
	},
	removeItem: () => {
		throw new Error('blocked');
	}
};

const empty: RecipeFormDraft = {
	title: '',
	description: '',
	servings: '4',
	prepMinutes: '',
	cookMinutes: '',
	sourceUrl: '',
	notes: '',
	tagNames: [],
	ingredients: [{ title: null, lines: [''] }],
	steps: [{ title: null, lines: [''] }],
	imageUrl: ''
};

const filled: RecipeFormDraft = {
	...empty,
	title: 'Soup',
	ingredients: [{ title: 'Base', lines: ['2 tbsp oil', '1 onion'] }],
	imageUrl: 'https://example.com/soup.jpg'
};

describe('Scenario: Draft round-trips through storage', () => {
	it('loads what was saved', () => {
		const storage = fakeStorage();

		saveDraft(storage, { v: 1, imported: true, form: filled });

		expect(loadDraft(storage)).toEqual({ v: 1, imported: true, form: filled });
	});
});

describe('Scenario: Unreadable or unavailable storage yields no draft', () => {
	it('returns null for invalid JSON and for another version', () => {
		const storage = fakeStorage();
		storage.setItem(KEY, '{nope');
		expect(loadDraft(storage)).toBeNull();

		storage.setItem(KEY, JSON.stringify({ v: 2, imported: false, form: filled }));
		expect(loadDraft(storage)).toBeNull();

		storage.setItem(KEY, JSON.stringify({ v: 1, imported: false }));
		expect(loadDraft(storage)).toBeNull();

		for (const form of [{}, { ...filled, ingredients: 'x' }, { ...filled, tagNames: [1] }, { ...filled, steps: [{ title: 1, lines: [] }] }, { ...filled, title: 5 }]) {
			storage.setItem(KEY, JSON.stringify({ v: 1, imported: false, form }));
			expect(loadDraft(storage)).toBeNull();
		}
	});

	it('does not throw when saving hits the quota', () => {
		const full: DraftStorage = {
			...throwing,
			setItem: () => {
				throw new DOMException('full', 'QuotaExceededError');
			}
		};
		expect(() => saveDraft(full, { v: 1, imported: false, form: filled })).not.toThrow();
	});

	it('returns null and does not throw when the storage throws', () => {
		expect(loadDraft(throwing)).toBeNull();
		expect(() => saveDraft(throwing, { v: 1, imported: false, form: filled })).not.toThrow();
		expect(() => clearDraft(throwing)).not.toThrow();
	});
});

describe('Scenario: Clearing removes the draft', () => {
	it('loads nothing after clear', () => {
		const storage = fakeStorage();
		saveDraft(storage, { v: 1, imported: false, form: filled });

		clearDraft(storage);

		expect(loadDraft(storage)).toBeNull();
		expect(storage.data.size).toBe(0);
	});
});

describe('Scenario: Unchanged form keeps no draft', () => {
	it('is not worth keeping when equal to the starting state, and is with a changed title', () => {
		expect(isDraftWorthKeeping({ ...empty }, empty)).toBe(false);
		expect(isDraftWorthKeeping({ ...empty, title: 'Soup' }, empty)).toBe(true);
	});

	it('compares deeply and ignores key order', () => {
		expect(isDraftWorthKeeping(structuredClone(empty), empty)).toBe(false);
		const reordered = Object.fromEntries(Object.entries(empty).reverse()) as unknown as RecipeFormDraft;
		expect(isDraftWorthKeeping(reordered, empty)).toBe(false);
		const changed = structuredClone(empty);
		changed.ingredients[0].lines[0] = '1 onion';
		expect(isDraftWorthKeeping(changed, empty)).toBe(true);
	});
});

describe('Scenario: Draft comparison ignores key order and a malformed draft is not loaded', () => {
	it('Scenario: Draft comparison ignores key order and a malformed draft is not loaded', () => {
		const reordered = Object.fromEntries(Object.entries(empty).reverse()) as unknown as RecipeFormDraft;
		expect(isDraftWorthKeeping(reordered, empty)).toBe(false);

		const storage = fakeStorage();
		for (const form of [{}, { ...filled, ingredients: 'x' }, { ...filled, tagNames: [1] }, { ...filled, title: 5 }]) {
			storage.setItem(KEY, JSON.stringify({ v: 1, imported: false, form }));
			expect(loadDraft(storage)).toBeNull();
		}
	});
});
