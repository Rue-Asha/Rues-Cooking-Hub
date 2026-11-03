import { describe, expect, it } from 'vitest';
import { locationText, mapsUrl, PRICES, priceText } from './format.ts';

describe('spot formatting', () => {
	it('Scenario: Location text joins what exists', () => {
		expect([
			locationText('Mitte', 'Berlin'),
			locationText('Mitte', null),
			locationText(null, 'Berlin'),
			locationText(null, null)
		]).toEqual(['Mitte, Berlin', 'Mitte', 'Berlin', null]);
	});

	it('Scenario: Maps link is built from name, address and city', () => {
		const base = 'https://www.google.com/maps/search/?api=1&query=Caf%C3%A9%20M%C3%BCller%2C%20Hauptstra%C3%9Fe%205';

		expect(mapsUrl({ name: 'Café Müller', address: 'Hauptstraße 5', city: 'Berlin' })).toBe(`${base}%2C%20Berlin`);
		expect(mapsUrl({ name: 'Café Müller', address: 'Hauptstraße 5', city: null })).toBe(base);
		expect(mapsUrl({ name: 'Café Müller', address: null, city: 'Berlin' })).toBeNull();
	});

	it('prices read as euro signs, one to four', () => {
		expect(PRICES.map((p) => p.label)).toEqual(['€', '€€', '€€€', '€€€€']);
		expect(PRICES.map((p) => p.id)).toEqual([1, 2, 3, 4]);
		expect(priceText(3)).toBe('€€€');
	});
});
