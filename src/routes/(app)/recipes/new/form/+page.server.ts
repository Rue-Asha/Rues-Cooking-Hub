import { fail, redirect } from '@sveltejs/kit';
import { savedLocation, saveFromForm } from '#lib/recipes/save.ts';
import { listTags } from '#lib/server/tags.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	tags: listTags(),
	draft: {
		title: '',
		description: null,
		sourceUrl: null,
		servings: 2,
		prepMinutes: null,
		cookMinutes: null,
		tagNames: [],
		ingredients: [],
		steps: []
	}
});

export const actions: Actions = {
	default: async ({ request }) => {
		const result = await saveFromForm(await request.formData());
		if ('errors' in result) return fail(400, { errors: result.errors });
		redirect(303, savedLocation(result));
	}
};
