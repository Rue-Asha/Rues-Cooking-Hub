import type { Price } from '#lib/types.ts';

export const PRICES: readonly { id: Price; label: string }[] = [
	{ id: 1, label: '€' },
	{ id: 2, label: '€€' },
	{ id: 3, label: '€€€' },
	{ id: 4, label: '€€€€' }
];

export function priceText(price: Price): string {
	return '€'.repeat(price);
}

export function locationText(neighbourhood: string | null, city: string | null): string | null {
	return [neighbourhood, city].filter(Boolean).join(', ') || null;
}

export function mapsUrl(spot: { name: string; address: string | null; city: string | null }): string | null {
	if (!spot.address) return null;
	const query = [spot.name, spot.address, spot.city].filter(Boolean).join(', ');
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
