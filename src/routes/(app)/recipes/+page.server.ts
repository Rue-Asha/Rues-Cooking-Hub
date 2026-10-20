import { hasFilters, parseQuery } from '#lib/recipes/query.ts';
import { featuredRecipes, listRecipes } from '#lib/server/recipes.ts';
import { listTags } from '#lib/server/tags.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const query = parseQuery(url.searchParams);
	const recipes = listRecipes(query);
	const total = hasFilters(query) ? listRecipes({}).length : recipes.length;
	return { query, recipes, total, tags: listTags(), featured: featuredRecipes() };
};
