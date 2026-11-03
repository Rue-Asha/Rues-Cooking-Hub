import { today } from '#lib/server/clock.ts';
import { dashboard } from '#lib/server/home.ts';
import { featuredRecipes, listRecipes } from '#lib/server/recipes.ts';
import { topSpots } from '#lib/server/spots.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	dashboard: dashboard(),
	today: today(),
	recent: featuredRecipes().slice(0, 4),
	total: listRecipes({}).length,
	spots: topSpots(4).map((s) => ({ ...s, rank: null }))
});
