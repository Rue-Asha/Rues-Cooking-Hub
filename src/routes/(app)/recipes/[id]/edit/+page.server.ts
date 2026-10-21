import { error, fail, redirect } from '@sveltejs/kit';
import { saveFromForm, savedLocation } from '#lib/recipes/save.ts';
import { getRecipe } from '#lib/server/recipes.ts';
import { listTags } from '#lib/server/tags.ts';
import type { Actions, PageServerLoad } from './$types';

const recipeId = (param: string) => (/^\d+$/.test(param) ? Number(param) : null);
const imageFailed = (param: string | null) => (param === '1' ? 'none' : param === 'kept' ? 'kept' : null);

export const load: PageServerLoad = ({ params, url }) => {
	const id = recipeId(params.id);
	const recipe = id === null ? null : getRecipe(id);
	if (!recipe) error(404, 'Not found');
	return {
		id: recipe.id,
		tags: listTags(),
		imageFailed: imageFailed(url.searchParams.get('imageFailed')),
		draft: {
			title: recipe.title,
			description: recipe.description,
			sourceUrl: recipe.sourceUrl,
			servings: recipe.servings,
			prepMinutes: recipe.prepMinutes,
			cookMinutes: recipe.cookMinutes,
			notes: recipe.notes,
			imageId: recipe.imageId,
			tagNames: recipe.tags.map((t) => t.name),
			ingredients: recipe.ingredients.map((s) => ({ title: s.title, lines: s.lines.map((l) => l.text) })),
			steps: recipe.steps
		}
	};
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const id = recipeId(params.id);
		if (id === null || !getRecipe(id)) error(404, 'Not found');
		const result = await saveFromForm(await request.formData(), id);
		if ('errors' in result) return fail(400, { errors: result.errors });
		redirect(303, savedLocation(result));
	}
};
