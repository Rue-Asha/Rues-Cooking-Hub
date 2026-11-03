import { fold } from '#lib/text.ts';
import type { Id, Price, SpotCounts, SpotFacets, SpotQuery, SpotSort, SpotStatus } from '#lib/types.ts';

export const SPOT_SORTS: readonly { id: SpotSort; label: string }[] = [
	{ id: 'score', label: 'Highest score' },
	{ id: 'newest', label: 'Newest first' },
	{ id: 'name', label: 'Name A–Z' }
];

export function sortsFor(status: SpotStatus): SpotSort[] {
	return status === 'visited' ? ['score', 'newest', 'name'] : ['newest', 'name'];
}

export function defaultSort(status: SpotStatus): SpotSort {
	return status === 'visited' ? 'score' : 'newest';
}

export function defaultStatus(totals: SpotCounts): SpotStatus {
	return totals.visited === 0 && totals.want > 0 ? 'want' : 'visited';
}

const asPrice = (n: number): Price | null => (n === 1 || n === 2 || n === 3 || n === 4 ? n : null);

export function parseSpotQuery(params: URLSearchParams, totals: SpotCounts): SpotQuery {
	const raw = params.get('status');
	const status = raw === 'visited' || raw === 'want' ? raw : defaultStatus(totals);
	const sort = sortsFor(status).find((s) => s === params.get('sort')) ?? defaultSort(status);
	const tagIds = (params.get('tags') ?? '')
		.split(',')
		.filter((s) => /^\d+$/.test(s))
		.map(Number);
	const price = params.get('price') ?? '';
	return {
		status,
		q: params.get('q') ?? '',
		tagIds: [...new Set(tagIds)],
		city: fold(params.get('city') ?? '') || null,
		price: /^\d$/.test(price) ? asPrice(Number(price)) : null,
		sort
	};
}

export function dropStale(query: SpotQuery, facets: SpotFacets): SpotQuery {
	const known = new Set<Id>(facets.tags.map((t) => t.id));
	return {
		...query,
		tagIds: query.tagIds.filter((id) => known.has(id)),
		city: facets.cities.some((c) => c.key === query.city) ? query.city : null,
		price: query.price === null ? null : asPrice(query.price)
	};
}

export function toSpotSearch(query: SpotQuery): string {
	const parts = [`status=${query.status}`];
	if (query.q.trim()) parts.push(`q=${encodeURIComponent(query.q)}`);
	if (query.tagIds.length) parts.push(`tags=${[...query.tagIds].sort((a, b) => a - b).join(',')}`);
	if (query.city) parts.push(`city=${encodeURIComponent(query.city)}`);
	if (query.price !== null) parts.push(`price=${query.price}`);
	if (query.sort !== defaultSort(query.status)) parts.push(`sort=${query.sort}`);
	return `?${parts.join('&')}`;
}

export function switchStatus(query: SpotQuery, to: SpotStatus, explicitSort: boolean): SpotQuery {
	const sort = explicitSort && sortsFor(to).includes(query.sort) ? query.sort : defaultSort(to);
	return { ...query, status: to, sort };
}

export function hasSpotFilters(query: SpotQuery): boolean {
	return Boolean(query.q.trim() || query.tagIds.length || query.city || query.price !== null);
}

// standard competition ranking: equal scores share a rank and the next rank skips
export function rankScores(sortedDesc: number[]): number[] {
	const ranks: number[] = [];
	sortedDesc.forEach((score, i) => ranks.push(i > 0 && score === sortedDesc[i - 1] ? ranks[i - 1] : i + 1));
	return ranks;
}
