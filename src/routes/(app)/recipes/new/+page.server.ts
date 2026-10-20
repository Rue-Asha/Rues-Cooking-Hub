import { fail, redirect } from '@sveltejs/kit';
import { savedLocation, saveFromForm } from '#lib/recipes/save.ts';
import { normaliseUrl, readRecipe } from '#lib/server/import.ts';
import { findBySourceUrl } from '#lib/server/recipes.ts';
import { listTags } from '#lib/server/tags.ts';
import { fold } from '#lib/text.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ tags: listTags() });

export const actions: Actions = {
	import: async ({ request }) => {
		const form = await request.formData();
		const url = String(form.get('url') ?? '').trim();
		const sourceUrl = normaliseUrl(url);
		if (!sourceUrl) return fail(400, { url, invalid: true as const });

		const known = form.get('anyway') === '1' ? null : findBySourceUrl(sourceUrl);
		if (known) return { url, duplicate: known };

		const result = await readRecipe(sourceUrl);
		if (result.kind === 'invalid') return fail(400, { url, invalid: true as const });
		// the preview shows an existing tag under its own spelling, so "dessert" appears as Dessert
		const existing = new Map(listTags().map((t) => [fold(t.name), t.name]));
		const tagNames = result.draft.tagNames.map((name) => existing.get(fold(name)) ?? name);
		return { url, preview: { kind: result.kind, draft: { ...result.draft, tagNames } } };
	},

	save: async ({ request }) => {
		const result = await saveFromForm(await request.formData());
		if ('errors' in result) return fail(400, { errors: result.errors });
		redirect(303, savedLocation(result));
	}
};
