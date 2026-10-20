import { today } from '#lib/server/clock.ts';
import { dashboard } from '#lib/server/home.ts';
import { featuredRecipes, listRecipes } from '#lib/server/recipes.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	dashboard: dashboard(),
	today: today(),
	recent: featuredRecipes().slice(0, 4),
	total: listRecipes({}).length
});
