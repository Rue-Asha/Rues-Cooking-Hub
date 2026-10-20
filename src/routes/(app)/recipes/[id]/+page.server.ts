import { error, fail, redirect } from '@sveltejs/kit';
import { addDays, isIsoDate } from '#lib/dates.ts';
import { ValidationError } from '#lib/errors.ts';
import { canonicalUnit } from '#lib/ingredients/parse.ts';
import { renderInline, renderMarkdown } from '#lib/markdown.ts';
import { today } from '#lib/server/clock.ts';
import { addEntry, entriesInRange } from '#lib/server/plan.ts';
import { deleteRecipe, getRecipe, planUsage } from '#lib/server/recipes.ts';
import { SLOTS } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

const recipeId = (param: string) => (/^\d+$/.test(param) ? Number(param) : null);

// the leading amount ("800 ml", "1 ½ tbsp") is set in bold; the line itself stays as written
function splitAmount(text: string): { amount: string; rest: string } {
	const words = text.split(' ');
	let n = 0;
	while (n < words.length && /^[\d½¼¾⅓⅔.,/–-]+$/.test(words[n]) && /[\d½¼¾⅓⅔]/.test(words[n])) n++;
	if (n === 0) return { amount: '', rest: text };
	if (n < words.length - 1 && canonicalUnit(words[n]) !== null) n++;
	return { amount: words.slice(0, n).join(' '), rest: words.slice(n).join(' ') };
}

export const load: PageServerLoad = ({ params }) => {
	const id = recipeId(params.id);
	const recipe = id === null ? null : getRecipe(id);
	if (!recipe) error(404, 'Not found');
	const now = today();
	return {
		recipe,
		today: now,
		usage: planUsage(recipe.id),
		upcoming: entriesInRange(now, addDays(now, 365))
			.filter((e) => e.recipe?.id === recipe.id)
			.map(({ date, slot }) => ({ date, slot })),
		ingredients: recipe.ingredients.map((s) => ({ title: s.title, lines: s.lines.map((l) => splitAmount(l.text)) })),
		steps: recipe.steps.map((s) => ({ title: s.title, lines: s.lines.map(renderInline) })),
		notes: renderMarkdown(recipe.notes ?? '')
	};
};

export const actions: Actions = {
	plan: async ({ params, request }) => {
		const id = recipeId(params.id);
		if (id === null || !getRecipe(id)) error(404, 'Not found');
		const form = await request.formData();
		const date = String(form.get('date') ?? '');
		const slot = SLOTS.find((s) => s.id === form.get('slot'))?.id;
		if (!isIsoDate(date) || !slot) error(400, 'Pick a day and a meal');
		try {
			addEntry({ date, slot, recipeId: id, servings: Number(form.get('servings')) });
		} catch (e) {
			if (e instanceof ValidationError) return fail(400, { errors: e.errors });
			throw e;
		}
		return { added: { date, slot } };
	},

	delete: ({ params }) => {
		const id = recipeId(params.id);
		if (id === null || !getRecipe(id)) error(404, 'Not found');
		deleteRecipe(id);
		redirect(303, '/recipes');
	}
};
