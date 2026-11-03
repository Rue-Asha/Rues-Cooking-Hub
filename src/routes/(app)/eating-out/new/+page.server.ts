import { fail, redirect } from '@sveltejs/kit';
import { saveSpotFromForm, spotSavedLocation } from '#lib/spots/save.ts';
import { spotTags } from '#lib/server/spots.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ tags: spotTags() });

export const actions: Actions = {
	default: async ({ request }) => {
		const result = await saveSpotFromForm(await request.formData());
		if ('errors' in result) return fail(400, { errors: result.errors });
		redirect(303, spotSavedLocation(result));
	}
};
