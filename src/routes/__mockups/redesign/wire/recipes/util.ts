export const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;

export const worstQuery = (worst: boolean) => (worst ? '?data=worst' : '');

export const wire = (slug: string, worst: boolean) => `/__mockups/redesign/wire/${slug}${worstQuery(worst)}`;

export function totalMinutes(prep: number | null, cook: number | null): number | null {
	if (prep === null && cook === null) return null;
	return (prep ?? 0) + (cook ?? 0);
}

export function timesLine(prep: number | null, cook: number | null): string | null {
	const total = totalMinutes(prep, cook);
	if (total === null) return null;
	return [prep !== null ? `Prep ${prep} min` : null, cook !== null ? `Cook ${cook} min` : null, `${total} min total`].filter(Boolean).join(' · ');
}
