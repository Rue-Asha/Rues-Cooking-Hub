// Fixture data for /__mockups/eating-out. Local types on purpose: the real Spot types arrive with the data layer
// and nothing here is read by feature code.
import { photo } from './fixtures.ts';

export interface MockSpot {
	id: number;
	name: string;
	status: 'want' | 'visited';
	score: string | null;
	rank: number | null;
	price: string | null;
	neighbourhood: string | null;
	city: string | null;
	tags: string[];
	image: string | null;
	address: string | null;
	website: string | null;
	notes: string | null;
}

const spot = (s: Partial<MockSpot> & Pick<MockSpot, 'id' | 'name' | 'status'>): MockSpot => ({
	score: null,
	rank: null,
	price: null,
	neighbourhood: null,
	city: null,
	tags: [],
	image: null,
	address: null,
	website: null,
	notes: null,
	...s
});

export const location = (s: Pick<MockSpot, 'neighbourhood' | 'city'>) =>
	[s.neighbourhood, s.city].filter(Boolean).join(', ') || null;

// sorted by score: 9.00, 9.00, 8.75, 8.10 → ranks 1, 1, 3, 4
export const visited: MockSpot[] = [
	spot({
		id: 1,
		name: 'Brasserie Lumière',
		status: 'visited',
		score: '9.00',
		rank: 1,
		price: '€€€',
		neighbourhood: 'Mitte',
		city: 'Berlin',
		tags: ['Brasserie', 'Date night', 'Wine'],
		image: '/mockups/spot-interior.jpg',
		address: 'Torstraße 114, 10119 Berlin',
		website: 'https://brasserie-lumiere.example',
		notes:
			'Table by the zinc bar, order the onion soup and the duck. Book a week ahead; Thursday is the quiet night. They pour the house red by the carafe.'
	}),
	spot({
		id: 2,
		name: 'Terraza Pujol',
		status: 'visited',
		score: '9.00',
		rank: 1,
		price: '€€',
		neighbourhood: 'Malasaña',
		city: 'Madrid',
		tags: ['Tapas', 'Terrace'],
		image: '/mockups/spot-terrace.jpg'
	}),
	spot({
		id: 3,
		name: 'Kuro Ramen',
		status: 'visited',
		score: '8.75',
		rank: 3,
		price: '€€',
		neighbourhood: 'Kreuzberg',
		city: 'Berlin',
		tags: ['Ramen', 'Casual', 'Late'],
		image: '/mockups/spot-ramen.jpg'
	}),
	spot({
		id: 4,
		name: 'Chalet Sauvage',
		status: 'visited',
		score: '8.10',
		rank: 4,
		price: '€€',
		city: 'Villard-Reculas',
		tags: ['Pizza', 'Mountains'],
		image: '/mockups/spot-pizzeria.jpg'
	})
];

// no coffee photo came back from the sources; the breakfast bowl from the recipe fixtures stands in for the café
export const want: MockSpot[] = [
	spot({
		id: 5,
		name: 'Weinbar Kupfer',
		status: 'want',
		price: '€€€',
		neighbourhood: 'Sternschanze',
		city: 'Hamburg',
		tags: ['Wine', 'Date night'],
		image: '/mockups/spot-wine-bar.jpg',
		address: 'Schulterblatt 58, 20357 Hamburg',
		website: 'https://weinbar-kupfer.example'
	}),
	spot({
		id: 6,
		name: 'Morgenrot Café',
		status: 'want',
		price: '€',
		neighbourhood: 'Prenzlauer Berg',
		city: 'Berlin',
		tags: ['Brunch', 'Coffee'],
		image: photo('yoghurt-bowl')
	}),
	spot({ id: 7, name: 'Pasta Fresca', status: 'want', city: 'Berlin' })
];

export const topSpots = visited;

export const spotTagChips = ['Brasserie', 'Ramen', 'Tapas', 'Terrace', 'Wine', 'Pizza'];
export const priceLevels = ['€', '€€', '€€€', '€€€€'];
