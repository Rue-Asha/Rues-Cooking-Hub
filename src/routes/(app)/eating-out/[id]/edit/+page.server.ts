import { error, fail, redirect } from '@sveltejs/kit';
import { getSpot, spotTags } from '#lib/server/spots.ts';
import { saveSpotFromForm, spotSavedLocation } from '#lib/spots/save.ts';
import { formatScore } from '#lib/spots/score.ts';
import type { Actions, PageServerLoad } from './$types';

const spotId = (param: string) => (/^\d+$/.test(param) ? Number(param) : null);
const imageFailed = (param: string | null) => (param === '1' ? 'none' : param === 'kept' ? 'kept' : null);

export const load: PageServerLoad = ({ params, url }) => {
	const id = spotId(params.id);
	const spot = id === null ? null : getSpot(id);
	if (!spot) error(404, 'Not found');
	return {
		id: spot.id,
		tags: spotTags(),
		imageFailed: imageFailed(url.searchParams.get('imageFailed')),
		draft: {
			name: spot.name,
			status: spot.status,
			score: spot.scoreHundredths === null ? '' : formatScore(spot.scoreHundredths),
			price: spot.price,
			city: spot.city ?? '',
			neighbourhood: spot.neighbourhood ?? '',
			address: spot.address ?? '',
			website: spot.website ?? '',
			notes: spot.notes ?? '',
			tagNames: spot.tags.map((t) => t.name),
			imageId: spot.imageId
		}
	};
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const id = spotId(params.id);
		if (id === null || !getSpot(id)) error(404, 'Not found');
		const result = await saveSpotFromForm(await request.formData(), id);
		if ('errors' in result) return fail(400, { errors: result.errors });
		redirect(303, spotSavedLocation(result));
	}
};
