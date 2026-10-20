import { error } from '@sveltejs/kit';
import { getRecipe, setFavourite } from '#lib/server/recipes.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const id = /^\d+$/.test(params.id) ? Number(params.id) : null;
	if (id === null || !getRecipe(id)) error(404, 'Not found');
	const value = (await request.formData()).get('favourite');
	if (value !== '0' && value !== '1') error(400, 'favourite must be 0 or 1');
	setFavourite(id, value === '1');
	return new Response(null, { status: 204 });
};
