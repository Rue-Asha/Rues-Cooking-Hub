import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { COPY } from '#lib/copy.ts';
import { ValidationError } from '#lib/errors.ts';
import type { Id, PlanEntry, RecipeInput } from '#lib/types.ts';
import { closeDb, getDb } from './db.ts';
import {
	addEntry,
	copyWeek,
	deleteEntry,
	entriesInRange,
	moveEntry,
	updateEntry,
	weekEntries
} from './plan.ts';
import { createRecipe, deleteRecipe } from './recipes.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-plan-')), 'p.db');
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const MON = '2026-10-19';

function recipe(title: string, servings = 2, ingredients: string[] = []): Id {
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
		ingredients: ingredients.length ? [{ title: null, lines: ingredients }] : [],
		steps: []
	};
	return createRecipe(input);
}

function planCount(): number {
	return Number(getDb().prepare('SELECT count(*) AS n FROM plan_entries').get()?.n);
}

function errorsOf(fn: () => unknown): Record<string, string> {
	try {
		fn();
	} catch (e) {
		if (e instanceof ValidationError) return e.errors;
		throw e;
	}
	throw new Error('did not throw');
}

const label = (e: PlanEntry) => e.recipe?.title ?? e.text;

describe('week and entries', () => {
	it('Scenario: Week query returns entries in day, slot and position order', () => {
		const lasagne = recipe('Lasagne', 4);
		addEntry({ date: '2026-10-20', slot: 'dinner', recipeId: lasagne, servings: 6 });
		addEntry({ date: '2026-10-20', slot: 'dinner', text: 'Salad' });
		addEntry({ date: MON, slot: 'snacks', text: 'Apple' });
		addEntry({ date: MON, slot: 'breakfast', recipeId: recipe('Porridge'), servings: 1 });
		const week = weekEntries(MON);
		expect(week.map((e) => [e.date, e.slot, e.position, label(e)])).toEqual([
			[MON, 'breakfast', 0, 'Porridge'],
			[MON, 'snacks', 0, 'Apple'],
			['2026-10-20', 'dinner', 0, 'Lasagne'],
			['2026-10-20', 'dinner', 1, 'Salad']
		]);
		expect(week[0]).toMatchObject({ recipe: { title: 'Porridge', servings: 2 }, servings: 1, text: null });
		expect(week[2]).toMatchObject({ recipe: { id: lasagne, servings: 4 }, servings: 6, text: null });
		expect(week[1]).toMatchObject({ recipe: null, servings: null, text: 'Apple' });
	});

	it('orders the slots breakfast, lunch, dinner, snacks within a day, not alphabetically', () => {
		for (const slot of ['snacks', 'dinner', 'lunch', 'breakfast'] as const)
			addEntry({ date: MON, slot, text: slot });
		expect(weekEntries(MON).map((e) => e.slot)).toEqual(['breakfast', 'lunch', 'dinner', 'snacks']);
	});

	it('keeps the week to Monday to Sunday and a range inclusive', () => {
		addEntry({ date: '2026-10-18', slot: 'dinner', text: 'Sat before' });
		addEntry({ date: MON, slot: 'dinner', text: 'Mon' });
		addEntry({ date: '2026-10-25', slot: 'dinner', text: 'Sun' });
		addEntry({ date: '2026-10-26', slot: 'dinner', text: 'Mon after' });
		expect(weekEntries(MON).map(label)).toEqual(['Mon', 'Sun']);
		expect(entriesInRange('2026-10-25', '2026-10-26').map(label)).toEqual(['Sun', 'Mon after']);
		expect(entriesInRange('2026-10-26', '2026-10-19')).toEqual([]);
	});

	it('shows an entry of a deleted recipe as its free text', () => {
		const id = recipe('Soup');
		addEntry({ date: MON, slot: 'lunch', recipeId: id, servings: 2 });
		deleteRecipe(id);
		expect(weekEntries(MON).map((e) => [e.recipe, e.servings, e.text])).toEqual([[null, null, 'Soup']]);
	});

	it('appends each new entry after the slot, per slot', () => {
		const a = addEntry({ date: MON, slot: 'dinner', text: 'a' });
		const b = addEntry({ date: MON, slot: 'dinner', text: 'b' });
		const c = addEntry({ date: MON, slot: 'lunch', text: 'c' });
		const pos = Object.fromEntries(weekEntries(MON).map((e) => [e.id, e.position]));
		expect(pos).toEqual({ [a]: 0, [b]: 1, [c]: 0 });
	});

	it('Scenario: Empty free text is rejected', () => {
		expect(errorsOf(() => addEntry({ date: MON, slot: 'dinner', text: '  ' }))).toEqual({
			text: COPY.entryEmpty
		});
		expect(errorsOf(() => addEntry({ date: MON, slot: 'dinner', text: '' }))).toEqual({
			text: COPY.entryEmpty
		});
		expect(planCount()).toBe(0);
	});

	it('trims free text on save', () => {
		addEntry({ date: MON, slot: 'dinner', text: '  Pizza night ' });
		expect(weekEntries(MON)[0].text).toBe('Pizza night');
	});

	it('rejects a recipe entry for a recipe that does not exist', () => {
		expect(() => addEntry({ date: MON, slot: 'dinner', recipeId: 999, servings: 2 })).toThrow(
			ValidationError
		);
		expect(planCount()).toBe(0);
	});

	it('Scenario: Servings below 1 are rejected in the plan', () => {
		const id = recipe('Curry');
		expect(errorsOf(() => addEntry({ date: MON, slot: 'dinner', recipeId: id, servings: 0 }))).toEqual({
			servings: COPY.servingsMin
		});
		expect(planCount()).toBe(0);
		const entry = addEntry({ date: MON, slot: 'dinner', recipeId: id, servings: 3 });
		expect(errorsOf(() => updateEntry(entry, { servings: 0 }))).toEqual({
			servings: COPY.servingsMin
		});
		expect(errorsOf(() => updateEntry(entry, { servings: 1.5 }))).toEqual({
			servings: COPY.servingsMin
		});
		expect(weekEntries(MON)[0].servings).toBe(3);
	});

	it('Scenario: Entry servings and text can be edited', () => {
		const entry = addEntry({ date: MON, slot: 'dinner', recipeId: recipe('Curry'), servings: 2 });
		const note = addEntry({ date: MON, slot: 'lunch', text: 'Soup' });
		updateEntry(entry, { servings: 6 });
		updateEntry(note, { text: 'Leftover soup' });
		const week = weekEntries(MON);
		expect(week.find((e) => e.id === entry)?.servings).toBe(6);
		expect(week.find((e) => e.id === note)?.text).toBe('Leftover soup');
		expect(errorsOf(() => updateEntry(note, { text: '  ' }))).toEqual({ text: COPY.entryEmpty });
		expect(weekEntries(MON).find((e) => e.id === note)?.text).toBe('Leftover soup');
	});

	it('an edit that does not fit the entry kind changes nothing', () => {
		const entry = addEntry({ date: MON, slot: 'dinner', recipeId: recipe('Curry'), servings: 2 });
		const note = addEntry({ date: MON, slot: 'lunch', text: 'Soup' });
		updateEntry(entry, { text: 'Hijack' });
		updateEntry(note, { servings: 4 });
		const week = weekEntries(MON);
		expect(week.find((e) => e.id === entry)).toMatchObject({ servings: 2, text: null });
		expect(week.find((e) => e.id === note)).toMatchObject({ servings: null, text: 'Soup' });
	});

	it('deletes an entry and closes the gap in its slot', () => {
		const a = addEntry({ date: MON, slot: 'dinner', text: 'a' });
		const b = addEntry({ date: MON, slot: 'dinner', text: 'b' });
		const c = addEntry({ date: MON, slot: 'dinner', text: 'c' });
		deleteEntry(a);
		expect(weekEntries(MON).map((e) => [e.id, e.position])).toEqual([
			[b, 0],
			[c, 1]
		]);
		deleteEntry(9999);
		expect(planCount()).toBe(2);
	});
});

const NEXT = '2026-10-26';

function slotOf(date: string, slot: string): [string, number][] {
	return entriesInRange(date, date)
		.filter((e) => e.slot === slot)
		.map((e) => [label(e) ?? '', e.position]);
}

describe('moveEntry', () => {
	function three() {
		return ['a', 'b', 'c'].map((text) => addEntry({ date: MON, slot: 'dinner', text }));
	}

	it('Scenario: Moving an entry reorders the slot', () => {
		const [, , c] = three();
		moveEntry(c, { date: MON, slot: 'dinner', position: 0 });
		expect(slotOf(MON, 'dinner')).toEqual([
			['c', 0],
			['a', 1],
			['b', 2]
		]);
	});

	it('moves an earlier entry down within its slot', () => {
		const [a] = three();
		moveEntry(a, { date: MON, slot: 'dinner', position: 2 });
		expect(slotOf(MON, 'dinner')).toEqual([
			['b', 0],
			['c', 1],
			['a', 2]
		]);
	});

	it('without a position the entry goes to the end of the target slot', () => {
		const [a] = three();
		moveEntry(a, { date: MON, slot: 'dinner' });
		expect(slotOf(MON, 'dinner')).toEqual([
			['b', 0],
			['c', 1],
			['a', 2]
		]);
		moveEntry(a, { date: '2026-10-23', slot: 'lunch' });
		expect(slotOf('2026-10-23', 'lunch')).toEqual([['a', 0]]);
	});

	it('renumbers source and target when moving to another day and slot', () => {
		const [a, b] = three();
		const x = addEntry({ date: '2026-10-24', slot: 'lunch', text: 'x' });
		addEntry({ date: '2026-10-24', slot: 'lunch', text: 'y' });
		moveEntry(a, { date: '2026-10-24', slot: 'lunch', position: 1 });
		expect(slotOf(MON, 'dinner')).toEqual([
			['b', 0],
			['c', 1]
		]);
		expect(slotOf('2026-10-24', 'lunch')).toEqual([
			['x', 0],
			['a', 1],
			['y', 2]
		]);
		moveEntry(b, { date: '2026-10-24', slot: 'lunch', position: 0 });
		expect(slotOf('2026-10-24', 'lunch').map(([t]) => t)).toEqual(['b', 'x', 'a', 'y']);
		expect(entriesInRange('2026-10-24', '2026-10-24').find((e) => e.id === x)?.position).toBe(1);
	});

	it('clamps a position beyond the slot to the end and below zero to the start', () => {
		const [a, , c] = three();
		moveEntry(a, { date: MON, slot: 'dinner', position: 99 });
		expect(slotOf(MON, 'dinner').map(([t]) => t)).toEqual(['b', 'c', 'a']);
		moveEntry(c, { date: MON, slot: 'dinner', position: -3 });
		expect(slotOf(MON, 'dinner')).toEqual([
			['c', 0],
			['b', 1],
			['a', 2]
		]);
	});

	it('moving into the slot it is already in at its own place changes nothing', () => {
		const [, b] = three();
		moveEntry(b, { date: MON, slot: 'dinner', position: 1 });
		expect(slotOf(MON, 'dinner')).toEqual([
			['a', 0],
			['b', 1],
			['c', 2]
		]);
	});

	it('keeps a recipe entry intact when moved and ignores an unknown id', () => {
		const id = addEntry({ date: MON, slot: 'dinner', recipeId: recipe('Curry', 2), servings: 5 });
		moveEntry(id, { date: '2026-10-25', slot: 'snacks' });
		moveEntry(9999, { date: MON, slot: 'dinner' });
		expect(weekEntries(MON)).toMatchObject([
			{ id, date: '2026-10-25', slot: 'snacks', position: 0, servings: 5, recipe: { title: 'Curry' } }
		]);
		expect(planCount()).toBe(1);
	});
});

describe('copyWeek', () => {
	it('Scenario: Copy week appends after existing entries', () => {
		const soup = recipe('Soup', 2);
		addEntry({ date: MON, slot: 'dinner', recipeId: soup, servings: 4 });
		addEntry({ date: '2026-10-21', slot: 'lunch', text: 'Salad' });
		addEntry({ date: '2026-10-25', slot: 'snacks', text: 'Nuts' });
		addEntry({ date: NEXT, slot: 'dinner', text: 'Existing' });
		expect(copyWeek(MON, NEXT)).toEqual({ copied: 3 });
		const next = weekEntries(NEXT);
		expect(next.length).toBe(4);
		expect(next.map((e) => [e.date, e.slot, e.position, label(e)])).toEqual([
			[NEXT, 'dinner', 0, 'Existing'],
			[NEXT, 'dinner', 1, 'Soup'],
			['2026-10-28', 'lunch', 0, 'Salad'],
			['2026-11-01', 'snacks', 0, 'Nuts']
		]);
		expect(next[1]).toMatchObject({ servings: 4, recipe: { id: soup } });
		expect(weekEntries(MON).length).toBe(3);
	});

	it('Scenario: Copy from an empty week changes nothing', () => {
		addEntry({ date: NEXT, slot: 'dinner', text: 'Existing' });
		addEntry({ date: '2026-11-03', slot: 'lunch', text: 'Later' });
		expect(copyWeek(MON, NEXT)).toEqual({ copied: 0 });
		expect(weekEntries(NEXT).map(label)).toEqual(['Existing']);
		expect(planCount()).toBe(2);
	});

	it('copies only the source week, not its neighbours', () => {
		addEntry({ date: '2026-10-18', slot: 'dinner', text: 'before' });
		addEntry({ date: MON, slot: 'dinner', text: 'in' });
		addEntry({ date: NEXT, slot: 'dinner', text: 'after' });
		expect(copyWeek(MON, '2026-11-02')).toEqual({ copied: 1 });
		expect(weekEntries('2026-11-02').map(label)).toEqual(['in']);
	});

	it('copies several entries of one slot in order, after the target slot', () => {
		['a', 'b'].forEach((text) => addEntry({ date: MON, slot: 'dinner', text }));
		['x', 'y'].forEach((text) => addEntry({ date: NEXT, slot: 'dinner', text }));
		copyWeek(MON, NEXT);
		expect(slotOf(NEXT, 'dinner')).toEqual([
			['x', 0],
			['y', 1],
			['a', 2],
			['b', 3]
		]);
	});

	it('copies the current order after a move, and copying twice appends twice', () => {
		const ids = ['a', 'b', 'c'].map((text) => addEntry({ date: MON, slot: 'dinner', text }));
		moveEntry(ids[2], { date: MON, slot: 'dinner', position: 0 });
		copyWeek(MON, NEXT);
		expect(slotOf(NEXT, 'dinner').map(([t]) => t)).toEqual(['c', 'a', 'b']);
		copyWeek(MON, NEXT);
		expect(slotOf(NEXT, 'dinner').map(([t]) => t)).toEqual(['c', 'a', 'b', 'c', 'a', 'b']);
		expect(slotOf(NEXT, 'dinner').map(([, p]) => p)).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('copies an entry that was moved onto another day to that day', () => {
		const id = addEntry({ date: MON, slot: 'dinner', text: 'a' });
		moveEntry(id, { date: '2026-10-23', slot: 'lunch' });
		copyWeek(MON, NEXT);
		expect(weekEntries(NEXT).map((e) => [e.date, e.slot])).toEqual([['2026-10-30', 'lunch']]);
	});
});
