import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nameKey } from '#lib/shopping/aggregate.ts';
import type { Amount, Category, Id, RecipeInput } from '#lib/types.ts';
import { closeDb, getDb } from './db.ts';
import { addEntry, deleteEntry } from './plan.ts';
import { createRecipe, deleteRecipe } from './recipes.ts';
import {
	addFromPlan,
	addManual,
	clearChecked,
	deleteItem,
	listItems,
	setCategory,
	setChecked,
	updateItem
} from './shopping.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-shopping-')), 's.db');
});

afterEach(() => {
	vi.useRealTimers();
	closeDb();
	delete process.env.DATABASE_PATH;
});

interface Row {
	name: string;
	manual?: Amount[];
	plan?: Amount[];
	category?: Category;
	checked?: boolean;
	checkedAt?: string;
	origin?: 'manual' | 'plan';
}

function insertItem(r: Row): Id {
	const db = getDb();
	const position = Number(db.prepare('SELECT coalesce(max(position), -1) + 1 AS p FROM shopping_items').get()?.p);
	const { lastInsertRowid } = db
		.prepare(
			`INSERT INTO shopping_items (name, name_key, manual_amounts, plan_amounts, category, checked, checked_at, origin, position, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.run(
			r.name,
			nameKey(r.name),
			JSON.stringify(r.manual ?? []),
			JSON.stringify(r.plan ?? []),
			r.category ?? 'other',
			r.checked ? 1 : 0,
			r.checked ? (r.checkedAt ?? '2026-10-19T10:00:00.000Z') : null,
			r.origin ?? 'manual',
			position,
			'2026-10-19T09:00:00.000Z'
		);
	return Number(lastInsertRowid);
}

const names = () => listItems().map((i) => i.name);

describe('addManual', () => {
	it('Scenario: Manual item is parsed', () => {
		const id = addManual('2 l milk');
		expect(id).not.toBeNull();
		expect(listItems()).toEqual([
			{
				id,
				name: 'milk',
				category: 'other',
				checked: false,
				origin: 'manual',
				position: 0,
				manualAmounts: [{ quantity: 2, unit: 'l' }],
				planAmounts: [],
				amounts: [{ quantity: 2, unit: 'l' }]
			}
		]);
	});

	it('adds a line without a quantity as an item without amount', () => {
		addManual('salt');
		expect(listItems()[0]).toMatchObject({ name: 'salt', amounts: [], manualAmounts: [] });
	});

	it('Scenario: Empty input adds nothing', () => {
		const keep = insertItem({ name: 'bread', manual: [{ quantity: 1, unit: null }] });
		const before = listItems();
		expect(addManual('')).toBeNull();
		expect(addManual('   ')).toBeNull();
		expect(listItems()).toEqual(before);
		expect(before[0].id).toBe(keep);
	});

	it('Scenario: Same manual name merges amounts', () => {
		const first = addManual('1 l Milk');
		const second = addManual('500 ml milk');
		expect(second).toBe(first);
		const items = listItems();
		expect(items.length).toBe(1);
		expect(items[0].amounts).toEqual([{ quantity: 1.5, unit: 'l' }]);
		expect(items[0].manualAmounts).toEqual([{ quantity: 1.5, unit: 'l' }]);
	});

	it('merges singular and plural and shows the longest name', () => {
		addManual('1 onion');
		addManual('2 onions');
		expect(listItems()).toMatchObject([{ name: 'onions', amounts: [{ quantity: 3, unit: null }] }]);
	});

	it('keeps different units on one line', () => {
		addManual('1 cup flour');
		addManual('200 g flour');
		expect(listItems()[0].amounts).toEqual([
			{ quantity: 1, unit: 'cup' },
			{ quantity: 200, unit: 'g' }
		]);
	});

	it('adding a name twice without amounts stays one item', () => {
		addManual('salt');
		addManual('salt');
		expect(names()).toEqual(['salt']);
	});

	it('does not merge into a checked item or a plan-derived item', () => {
		insertItem({ name: 'milk', manual: [{ quantity: 1, unit: 'l' }], checked: true });
		insertItem({ name: 'flour', plan: [{ quantity: 400, unit: 'g' }], origin: 'plan' });
		addManual('1 l milk');
		addManual('100 g flour');
		const items = listItems();
		expect(items.filter((i) => i.name === 'milk').map((i) => i.checked).sort()).toEqual([false, true]);
		expect(items.filter((i) => i.name === 'flour').length).toBe(2);
		expect(items.find((i) => i.checked)?.amounts).toEqual([{ quantity: 1, unit: 'l' }]);
	});
});

describe('categories', () => {
	it('Scenario: New item uses the remembered category', () => {
		const id = addManual('1 l milk')!;
		setCategory(id, 'dairy-eggs');
		deleteItem(id);
		addManual('1 l Milk');
		expect(listItems()).toMatchObject([{ name: 'Milk', category: 'dairy-eggs' }]);
	});

	it('Scenario: Unknown item goes to Other', () => {
		addManual('3 dragonfruit');
		expect(listItems()[0].category).toBe('other');
	});

	it('Scenario: Category memory ignores case', () => {
		const id = addManual('2 Äpfel')!;
		setCategory(id, 'produce');
		addManual('3 äpfel');
		const items = listItems();
		expect(items.length).toBe(1);
		deleteItem(id);
		addManual('3 äpfel');
		expect(listItems()[0].category).toBe('produce');
	});

	it('remembers across singular and plural and keeps the latest choice', () => {
		const id = addManual('tomatoes')!;
		setCategory(id, 'produce');
		setCategory(id, 'pantry');
		deleteItem(id);
		addManual('1 tomato');
		expect(listItems()[0].category).toBe('pantry');
		expect(
			Number(getDb().prepare('SELECT count(*) AS n FROM category_memory').get()?.n)
		).toBe(1);
	});

	it('does not change other items of other names', () => {
		const a = addManual('milk')!;
		addManual('bread');
		setCategory(a, 'dairy-eggs');
		expect(listItems().find((i) => i.name === 'bread')?.category).toBe('other');
	});

	it('lists items by category order, then position', () => {
		insertItem({ name: 'soap', category: 'household' });
		insertItem({ name: 'milk', category: 'dairy-eggs' });
		insertItem({ name: 'apple', category: 'produce' });
		insertItem({ name: 'banana', category: 'produce' });
		insertItem({ name: 'misc', category: 'other' });
		expect(names()).toEqual(['apple', 'banana', 'milk', 'soap', 'misc']);
	});
});

describe('updateItem, deleteItem and checking', () => {
	it('edits the name and re-keys it for later merges', () => {
		const id = addManual('1 l milk')!;
		updateItem(id, { name: 'oat milk' });
		addManual('1 l oat milks');
		expect(listItems()).toMatchObject([{ id, name: 'oat milks', amounts: [{ quantity: 2, unit: 'l' }] }]);
		updateItem(id, { name: '   ' });
		expect(names()).toEqual(['oat milks']);
	});

	it('edits the manual part of a manual row and the plan part of a plan row', () => {
		const manual = insertItem({ name: 'milk', manual: [{ quantity: 1, unit: 'l' }], plan: [{ quantity: 500, unit: 'ml' }] });
		const plan = insertItem({ name: 'flour', plan: [{ quantity: 400, unit: 'g' }], origin: 'plan' });
		updateItem(manual, { amounts: [{ quantity: 2, unit: 'l' }] });
		updateItem(plan, { amounts: [{ quantity: 1, unit: 'cup' }, { quantity: 100, unit: 'g' }] });
		const items = listItems();
		expect(items.find((i) => i.id === manual)).toMatchObject({
			manualAmounts: [{ quantity: 2, unit: 'l' }],
			planAmounts: [{ quantity: 500, unit: 'ml' }],
			amounts: [{ quantity: 2.5, unit: 'l' }]
		});
		expect(items.find((i) => i.id === plan)).toMatchObject({
			manualAmounts: [],
			planAmounts: [{ quantity: 1, unit: 'cup' }, { quantity: 100, unit: 'g' }]
		});
	});

	it('an empty amount list clears the amount', () => {
		const id = addManual('2 l milk')!;
		updateItem(id, { amounts: [] });
		expect(listItems()[0].amounts).toEqual([]);
	});

	it('deletes an item', () => {
		const a = addManual('milk')!;
		addManual('bread');
		deleteItem(a);
		deleteItem(9999);
		expect(names()).toEqual(['bread']);
	});

	it('checking moves an item last by checkedAt, unchecking returns it to its category', () => {
		const a = insertItem({ name: 'a', category: 'produce' });
		const b = insertItem({ name: 'b', category: 'produce' });
		const c = insertItem({ name: 'c', category: 'dairy-eggs' });
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));
		setChecked(b, true);
		vi.setSystemTime(new Date('2026-10-19T12:00:05Z'));
		setChecked(a, true);
		expect(names()).toEqual(['c', 'b', 'a']);
		expect(listItems().filter((i) => i.checked).map((i) => i.id)).toEqual([b, a]);
		setChecked(b, false);
		expect(names()).toEqual(['b', 'c', 'a']);
		expect(listItems().find((i) => i.id === c)?.checked).toBe(false);
		expect(
			getDb().prepare('SELECT checked_at FROM shopping_items WHERE id = ?').get(b)?.checked_at
		).toBeNull();
	});

	it('Scenario: Clear checked removes all checked items', () => {
		const ids = ['a', 'b', 'c', 'd'].map((name) => insertItem({ name }));
		setChecked(ids[0], true);
		setChecked(ids[2], true);
		expect(clearChecked()).toBe(2);
		expect(listItems().map((i) => [i.name, i.checked])).toEqual([
			['b', false],
			['d', false]
		]);
		expect(clearChecked()).toBe(0);
	});
});

const MON = '2026-10-19';
const SUN = '2026-10-25';

function recipe(title: string, servings: number, lines: string[]): Id {
	const input: RecipeInput = {
		title,
		description: null,
		sourceUrl: null,
		servings,
		prepMinutes: null,
		cookMinutes: null,
		notes: null,
		favourite: false,
		imageId: null,
		tagNames: [],
		ingredients: [{ title: null, lines }],
		steps: []
	};
	return createRecipe(input);
}

const plan = (date: string, recipeId: Id, servings: number, slot: 'dinner' | 'lunch' = 'dinner') =>
	addEntry({ date, slot, recipeId, servings });

const q = (n: number, unit: string | null = null): Amount => ({ quantity: n, unit });
const summary = () =>
	listItems().map((i) => ({
		name: i.name,
		amounts: i.amounts,
		origin: i.origin,
		checked: i.checked,
		category: i.category
	}));
const find = (name: string) => listItems().find((i) => i.name === name);

describe('addFromPlan', () => {
	it('Scenario: Add from plan adds scaled, merged items', () => {
		const pancakes = recipe('Pancakes', 2, ['200 g flour', '3 eggs', '1 tsp salt']);
		const bread = recipe('Bread', 4, ['500 g flour', '2 tbsp olive oil']);
		plan(MON, pancakes, 4);
		plan('2026-10-22', bread, 2);
		const eggs = addManual('eggs')!;
		setCategory(eggs, 'dairy-eggs');
		deleteItem(eggs);
		expect(addFromPlan(MON, SUN)).toEqual({ kind: 'added', count: 4 });
		expect(summary()).toEqual([
			{ name: 'eggs', amounts: [q(6)], origin: 'plan', checked: false, category: 'dairy-eggs' },
			{ name: 'flour', amounts: [q(650, 'g')], origin: 'plan', checked: false, category: 'other' },
			{ name: 'salt', amounts: [q(2, 'tsp')], origin: 'plan', checked: false, category: 'other' },
			{ name: 'olive oil', amounts: [q(1, 'tbsp')], origin: 'plan', checked: false, category: 'other' }
		]);
	});

	it('Scenario: Free-text entries contribute nothing', () => {
		plan(MON, recipe('Soup', 2, ['2 carrots']), 2);
		addEntry({ date: MON, slot: 'lunch', text: 'Pizza night' });
		expect(addFromPlan(MON, SUN)).toEqual({ kind: 'added', count: 1 });
		expect(summary().map((i) => i.name)).toEqual(['carrots']);
	});

	it('only reads entries inside the range', () => {
		const r = recipe('Soup', 2, ['2 carrots']);
		const other = recipe('Stew', 2, ['1 leek']);
		plan('2026-10-18', other, 2);
		plan(MON, r, 2);
		plan('2026-10-26', other, 2);
		addFromPlan(MON, SUN);
		expect(summary().map((i) => i.name)).toEqual(['carrots']);
	});

	it('Scenario: Regenerating replaces open plan items', () => {
		const lasagne = recipe('Lasagne', 2, ['250 g pasta', '400 g tomatoes']);
		const curry = recipe('Curry', 2, ['1 can coconut milk', '2 tbsp curry paste']);
		const entry = plan(MON, lasagne, 2);
		addFromPlan(MON, SUN);
		expect(summary().map((i) => i.name)).toEqual(['pasta', 'tomatoes']);
		deleteEntry(entry);
		plan(MON, curry, 2);
		addFromPlan(MON, SUN);
		expect(summary().map((i) => i.name)).toEqual(['coconut milk', 'curry paste']);
		expect(listItems().every((i) => i.origin === 'plan' && !i.checked)).toBe(true);
	});

	it('running it twice gives the same list, not doubled amounts', () => {
		plan(MON, recipe('Pancakes', 2, ['200 g flour', '3 eggs']), 2);
		addFromPlan(MON, SUN);
		const once = summary();
		addFromPlan(MON, SUN);
		expect(summary()).toEqual(once);
		expect(listItems().length).toBe(2);
	});

	it('Scenario: Manual and checked items survive regenerating', () => {
		const lasagne = recipe('Lasagne', 2, ['250 g pasta', '400 g tomatoes', '1 onion']);
		plan(MON, lasagne, 2);
		addFromPlan(MON, SUN);
		setChecked(find('pasta')!.id, true);
		const bread = addManual('1 loaf bread')!;
		setCategory(bread, 'bakery');
		const before = listItems().filter((i) => i.name === 'pasta' || i.name === 'bread' || i.name === 'loaf bread');
		const unchanged = before.map((i) => ({ ...i }));
		addFromPlan(MON, SUN);
		const after = listItems();
		for (const item of unchanged) expect(after.find((i) => i.id === item.id)).toEqual(item);
		expect(after.filter((i) => i.name === 'tomatoes').length).toBe(1);
		expect(after.filter((i) => i.name === 'onion').length).toBe(1);
		expect(after.length).toBe(4);
	});

	it('Scenario: Checked plan item is not re-added', () => {
		plan(MON, recipe('Pancakes', 2, ['200 g flour', '3 eggs']), 2);
		addFromPlan(MON, SUN);
		setChecked(find('flour')!.id, true);
		expect(addFromPlan(MON, SUN)).toEqual({ kind: 'added', count: 1 });
		const flour = listItems().filter((i) => i.name === 'flour');
		expect(flour.length).toBe(1);
		expect(flour[0].checked).toBe(true);
		expect(listItems().filter((i) => i.name === 'eggs').length).toBe(1);
	});

	it('Scenario: Empty range changes nothing', () => {
		plan(MON, recipe('Pancakes', 2, ['200 g flour']), 2);
		addEntry({ date: '2026-11-02', slot: 'dinner', text: 'Pizza night' });
		addFromPlan(MON, SUN);
		const milk = addManual('1 l milk')!;
		const before = listItems();
		expect(addFromPlan('2026-11-02', '2026-11-08')).toEqual({ kind: 'empty' });
		expect(listItems()).toEqual(before);
		expect(before.some((i) => i.id === milk)).toBe(true);
	});

	it('an empty range keeps the plan part of a merged manual item', () => {
		addManual('1 l milk');
		plan(MON, recipe('Latte', 1, ['500 ml milk']), 1);
		addFromPlan(MON, SUN);
		const before = listItems();
		expect(find('milk')?.planAmounts).toEqual([q(500, 'ml')]);
		expect(addFromPlan('2026-12-01', '2026-12-07')).toEqual({ kind: 'empty' });
		expect(addFromPlan(SUN, MON)).toEqual({ kind: 'empty' });
		expect(listItems()).toEqual(before);
	});

	it('an entry whose recipe was deleted counts as free text', () => {
		const r = recipe('Soup', 2, ['2 carrots']);
		plan(MON, r, 2);
		deleteRecipe(r);
		expect(addFromPlan(MON, SUN)).toEqual({ kind: 'empty' });
		expect(listItems()).toEqual([]);
	});

	it('Scenario: Plan amounts merge into a manual item with the same name', () => {
		const manual = addManual('1 l milk')!;
		plan(MON, recipe('Latte', 1, ['500 ml milk']), 1);
		expect(addFromPlan(MON, SUN)).toEqual({ kind: 'added', count: 1 });
		const items = listItems();
		expect(items.length).toBe(1);
		expect(items[0]).toMatchObject({
			id: manual,
			origin: 'manual',
			manualAmounts: [q(1, 'l')],
			planAmounts: [q(500, 'ml')],
			amounts: [q(1.5, 'l')]
		});
	});

	it('merges into a manual item across singular and plural and keeps its name', () => {
		addManual('2 onions');
		plan(MON, recipe('Soup', 2, ['1 onion']), 2);
		addFromPlan(MON, SUN);
		expect(listItems()).toMatchObject([{ name: 'onions', amounts: [q(3)] }]);
	});

	it('Scenario: Regenerating recalculates the plan part of a manual item', () => {
		addManual('1 l milk');
		const latte = recipe('Latte', 1, ['500 ml milk']);
		const cocoa = recipe('Cocoa', 1, ['250 ml milk']);
		const entry = plan(MON, latte, 1);
		addFromPlan(MON, SUN);
		deleteEntry(entry);
		plan(MON, cocoa, 1);
		addFromPlan(MON, SUN);
		const items = listItems();
		expect(items.length).toBe(1);
		expect(items[0]).toMatchObject({
			manualAmounts: [q(1, 'l')],
			planAmounts: [q(250, 'ml')],
			amounts: [q(1.25, 'l')]
		});
	});

	it('drops the plan part of a manual item when the plan no longer needs it', () => {
		addManual('1 l milk');
		const latte = recipe('Latte', 1, ['500 ml milk']);
		const toast = recipe('Toast', 1, ['2 slices bread']);
		const entry = plan(MON, latte, 1);
		addFromPlan(MON, SUN);
		deleteEntry(entry);
		plan(MON, toast, 1);
		addFromPlan(MON, SUN);
		expect(find('milk')).toMatchObject({ manualAmounts: [q(1, 'l')], planAmounts: [], amounts: [q(1, 'l')] });
	});

	it('a manual item typed after a fill takes over the plan part on the next fill', () => {
		plan(MON, recipe('Latte', 1, ['500 ml milk']), 1);
		addFromPlan(MON, SUN);
		expect(find('milk')?.origin).toBe('plan');
		addManual('1 l milk');
		addFromPlan(MON, SUN);
		expect(listItems()).toMatchObject([
			{ name: 'milk', origin: 'manual', manualAmounts: [q(1, 'l')], planAmounts: [q(500, 'ml')] }
		]);
	});

	it('a checked manual item with a plan part blocks the name, one without does not', () => {
		addManual('1 l milk');
		plan(MON, recipe('Latte', 1, ['500 ml milk', '1 tsp sugar']), 1);
		addFromPlan(MON, SUN);
		setChecked(find('milk')!.id, true);
		addManual('1 tsp sugar');
		setChecked(listItems().find((i) => i.name === 'sugar' && i.origin === 'manual')!.id, true);
		addFromPlan(MON, SUN);
		expect(listItems().filter((i) => i.name === 'milk').length).toBe(1);
		const sugar = listItems().filter((i) => i.name === 'sugar');
		expect(sugar.map((i) => [i.origin, i.checked]).sort()).toEqual([
			['manual', true],
			['plan', false]
		]);
	});

	it('merges the same name across entries and units and leaves lines without quantity amount-free', () => {
		const a = recipe('A', 2, ['1 cup flour', 'salt']);
		const b = recipe('B', 2, ['200 g flour', 'salt']);
		plan(MON, a, 2);
		plan('2026-10-21', b, 2);
		addFromPlan(MON, SUN);
		expect(find('flour')?.amounts).toEqual([q(1, 'cup'), q(200, 'g')]);
		expect(find('salt')?.amounts).toEqual([]);
		expect(listItems().length).toBe(2);
	});

	it('uses the remembered category for new plan items', () => {
		const m = addManual('flour')!;
		setCategory(m, 'pantry');
		deleteItem(m);
		plan(MON, recipe('Pancakes', 2, ['200 g Flour', '3 eggs']), 2);
		addFromPlan(MON, SUN);
		expect(find('Flour')?.category).toBe('pantry');
		expect(find('eggs')?.category).toBe('other');
	});

	it('a regenerated plan item gets the category moved by hand back from memory', () => {
		plan(MON, recipe('Pancakes', 2, ['200 g flour']), 2);
		addFromPlan(MON, SUN);
		setCategory(find('flour')!.id, 'pantry');
		addFromPlan(MON, SUN);
		expect(find('flour')?.category).toBe('pantry');
	});

	it('scales down when the entry has fewer servings than the recipe', () => {
		plan(MON, recipe('Pancakes', 3, ['200 g flour', '3 eggs']), 1);
		addFromPlan(MON, SUN);
		expect(find('flour')!.amounts[0].quantity).toBeCloseTo(66.667, 2);
		expect(find('eggs')?.amounts).toEqual([q(1)]);
	});

	it('a range of recipes without ingredients still replaces open plan items', () => {
		const r = recipe('Pancakes', 2, ['200 g flour']);
		const entry = plan(MON, r, 2);
		addFromPlan(MON, SUN);
		deleteEntry(entry);
		plan(MON, recipe('Water', 1, ['   ']), 1);
		expect(addFromPlan(MON, SUN)).toEqual({ kind: 'added', count: 0 });
		expect(listItems()).toEqual([]);
	});
});
