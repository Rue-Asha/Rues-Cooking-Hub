import { dropStale, parseSpotQuery } from '#lib/spots/query.ts';
import { listSpots, spotCounts, spotFacets, spotTotals } from '#lib/server/spots.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const totals = spotTotals();
	const facets = spotFacets();
	const query = dropStale(parseSpotQuery(url.searchParams, totals), facets);
	const explicitSort = url.searchParams.get('sort') === query.sort;
	return { query, explicitSort, spots: listSpots(query), counts: spotCounts(query), totals, facets };
};
