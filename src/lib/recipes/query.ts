import type { ArchiveQuery, ArchiveSort, Id } from '#lib/types.ts';

export type ParsedQuery = Required<ArchiveQuery>;

export const SORTS: readonly { id: ArchiveSort; label: string }[] = [
	{ id: 'newest', label: 'Newest first' },
	{ id: 'title', label: 'Title A–Z' },
	{ id: 'time', label: 'Shortest time' }
];

export function parseQuery(params: URLSearchParams): ParsedQuery {
	const sort = SORTS.find((s) => s.id === params.get('sort'))?.id ?? 'newest';
	const ids = (params.get('tags') ?? '')
		.split(',')
		.filter((s) => /^\d+$/.test(s))
		.map(Number);
	return { q: params.get('q') ?? '', tagIds: [...new Set(ids)], favouritesOnly: params.get('fav') === '1', sort };
}

// one parameter order and sorted ids, so the same filters always give the same URL
export function toSearch(query: ArchiveQuery): string {
	const parts: string[] = [];
	if (query.tagIds?.length) parts.push(`tags=${[...query.tagIds].sort((a, b) => a - b).join(',')}`);
	if (query.favouritesOnly) parts.push('fav=1');
	if (query.q?.trim()) parts.push(`q=${encodeURIComponent(query.q)}`);
	if (query.sort && query.sort !== 'newest') parts.push(`sort=${query.sort}`);
	return parts.length ? `?${parts.join('&')}` : '';
}

export function toggleTag(query: ParsedQuery, id: Id): ParsedQuery {
	const tagIds = query.tagIds.includes(id) ? query.tagIds.filter((t) => t !== id) : [...query.tagIds, id];
	return { ...query, tagIds };
}

export function hasFilters(query: ArchiveQuery): boolean {
	return Boolean(query.tagIds?.length || query.favouritesOnly || query.q?.trim());
}
