// Mirror of tokens.css for tests; tokens.test.ts checks that both agree.

export interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

export const colors = {
	ground: '#F4EFE6',
	sand: '#E8DFD0',
	surface: '#FBF8F2',
	line: '#DDD3C2',
	stone: '#8A847A',
	ink: '#2B2723',
	'ink-2': '#5C564E',
	olive: '#55633F',
	'olive-soft': '#E4E7D6',
	brick: '#AC3F2C',
	'brick-soft': '#F3DED7',
	dark: '#2A2724',
	'on-dark': '#F4EFE6',
	white: '#FFFFFF'
} as const;

export type ColorToken = keyof typeof colors;

export const glass = { fill: { r: 251, g: 248, b: 242, a: 0.72 }, blur: 18 } as const;

export const scrim: Rgba = { r: 20, g: 16, b: 12, a: 0.55 };

// Secondary ink (ink-2) is not legible on glass over a dark photo, so glass carries ink only.
export const glassText: readonly ColorToken[] = ['ink'];

// Every text colour / background pair the components use. Stone is decoration only (borders, disabled icons).
export const textPairs: readonly [text: ColorToken, background: ColorToken][] = [
	['ink', 'ground'],
	['ink', 'surface'],
	['ink', 'sand'],
	['ink', 'white'],
	['ink', 'olive-soft'],
	['ink', 'brick-soft'],
	['ink-2', 'ground'],
	['ink-2', 'surface'],
	['ink-2', 'sand'],
	['ink-2', 'white'],
	['olive', 'ground'],
	['olive', 'surface'],
	['olive', 'olive-soft'],
	['brick', 'ground'],
	['brick', 'surface'],
	['brick', 'brick-soft'],
	['on-dark', 'dark'],
	['on-dark', 'olive'],
	['on-dark', 'brick'],
	['white', 'dark'],
	['white', 'olive'],
	['white', 'brick']
];
