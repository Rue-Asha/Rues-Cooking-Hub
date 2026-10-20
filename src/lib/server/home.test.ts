import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Id, RecipeInput } from '#lib/types.ts';
import { setTestToday } from './clock.ts';
import { closeDb, getDb } from './db.ts';
import { dashboard } from './home.ts';
import { addEntry } from './plan.ts';
import { createRecipe } from './recipes.ts';
import { addManual, setChecked } from './shopping.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'hub-home-')), 'h.db');
	process.env.COOKING_HUB_TEST = '1';
	setTestToday(WED);
});

afterEach(() => {
	closeDb();
	setTestToday(null);
	delete process.env.DATABASE_PATH;
	delete process.env.COOKING_HUB_TEST;
});

const MON = '2026-10-19';
const WED = '2026-10-21';

function recipe(title: string): Id {
	const input: RecipeInput = {
		title,
		description: null,
		sourceUrl: null,
		servings: 2,
		prepMinutes: null,
		cookMinutes: null,
		notes: null,
		favourite: false,
		imageId: null,
		tagNames: [],
		ingredients: [],
		steps: []
	};
	return createRecipe(input);
}

describe('dashboard', () => {
	it('Scenario: Dashboard prefers today\'s dinner', () => {
		const soup = recipe('Soup');
		const lasagne = recipe('Lasagne');
		addEntry({ date: WED, slot: 'lunch', recipeId: soup, servings: 2 });
		addEntry({ date: WED, slot: 'dinner', recipeId: lasagne, servings: 2 });

		const { hero } = dashboard();
		expect(hero.kind).toBe('today');
		if (hero.kind !== 'today') return;
		expect(hero.recipe.id).toBe(lasagne);
		expect(hero.recipe.title).toBe('Lasagne');
		expect(hero.slot).toBe('dinner');
	});

	it('Scenario: Dashboard falls back to the first recipe entry of today', () => {
		const salad = recipe('Salad');
		const nuts = recipe('Nuts');
		addEntry({ date: WED, slot: 'snacks', recipeId: nuts, servings: 1 });
		addEntry({ date: WED, slot: 'breakfast', text: 'Toast' });
		addEntry({ date: WED, slot: 'lunch', recipeId: salad, servings: 2 });

		const { hero } = dashboard();
		expect(hero).toMatchObject({ kind: 'today', slot: 'lunch', recipe: { id: salad } });
	});

	it('shows the newest recipe without a recipe entry today, and the welcome without recipes', () => {
		expect(dashboard().hero).toEqual({ kind: 'welcome' });
		recipe('Old');
		const fresh = recipe('Fresh');
		getDb().prepare(`UPDATE recipes SET created_at = '2026-01-01T00:00:00.000Z' WHERE title = 'Old'`).run();
		addEntry({ date: WED, slot: 'dinner', text: 'Eat out' });
		addEntry({ date: MON, slot: 'dinner', recipeId: fresh, servings: 2 });
		expect(dashboard().hero).toMatchObject({ kind: 'newest', recipe: { id: fresh } });
	});

	it('lists Mon–Sun of the current week with their entries', () => {
		const soup = recipe('Soup');
		addEntry({ date: MON, slot: 'dinner', recipeId: soup, servings: 2 });
		addEntry({ date: '2026-10-22', slot: 'lunch', text: 'Leftovers' });
		addEntry({ date: '2026-10-26', slot: 'lunch', text: 'Next week' });

		const { week } = dashboard();
		expect(week.map((d) => d.date)).toEqual([
			'2026-10-19',
			'2026-10-20',
			'2026-10-21',
			'2026-10-22',
			'2026-10-23',
			'2026-10-24',
			'2026-10-25'
		]);
		expect(week[0].entries).toEqual([{ title: 'Soup', imageId: null, recipeId: soup }]);
		expect(week[3].entries).toEqual([{ title: 'Leftovers', imageId: null, recipeId: null }]);
		expect(week.filter((d) => d.entries.length === 0)).toHaveLength(5);
	});

	it('counts open items and names the first three in display order', () => {
		for (const name of ['milk', 'apples', 'bread', 'rice', 'soap']) addManual(name);
		const gone = addManual('eggs')!;
		setChecked(gone, true);

		const { list } = dashboard();
		expect(list.open).toBe(5);
		expect(list.first).toHaveLength(3);
		expect(list.first).not.toContain('eggs');
	});

	it('picks the most recently favourited recipe', () => {
		expect(dashboard().favourite).toBeNull();
		const a = recipe('A');
		const b = recipe('B');
		const set = getDb().prepare('UPDATE recipes SET favourite = 1, favourited_at = ? WHERE id = ?');
		set.run('2026-10-02T10:00:00.000Z', a);
		set.run('2026-10-01T10:00:00.000Z', b);
		expect(dashboard().favourite?.id).toBe(a);
	});
});
