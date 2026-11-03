import { error, fail, redirect } from '@sveltejs/kit';
import { renderMarkdown } from '#lib/markdown.ts';
import { deleteSpot, getSpot } from '#lib/server/spots.ts';
import { mapsUrl } from '#lib/spots/format.ts';
import { visitFromForm } from '#lib/spots/save.ts';
import type { Actions, PageServerLoad } from './$types';

const spotId = (param: string) => (/^\d+$/.test(param) ? Number(param) : null);

export const load: PageServerLoad = ({ params }) => {
	const id = spotId(params.id);
	const spot = id === null ? null : getSpot(id);
	if (!spot) error(404, 'Not found');
	return { spot, notes: renderMarkdown(spot.notes ?? ''), maps: mapsUrl(spot) };
};

export const actions: Actions = {
	visit: async ({ params, request }) => {
		const id = spotId(params.id);
		if (id === null || getSpot(id)?.status !== 'want') error(404, 'Not found');
		const result = visitFromForm(await request.formData(), id);
		if ('errors' in result) return fail(400, { errors: result.errors });
		return { visited: true };
	},

	delete: ({ params }) => {
		const id = spotId(params.id);
		if (id === null || !getSpot(id)) error(404, 'Not found');
		deleteSpot(id);
		redirect(303, '/eating-out');
	}
};
