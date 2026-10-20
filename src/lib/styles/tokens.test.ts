import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { colors, glass, glassText, scrim, textPairs, type Rgba } from './tokens.ts';

function channel(c: number): number {
	const s = c / 255;
	return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function hex(h: string): Rgba {
	const n = parseInt(h.slice(1), 16);
	return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 };
}

function luminance({ r, g, b }: Rgba): number {
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgba, b: Rgba): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

function over(top: Rgba, under: Rgba): Rgba {
	const mix = (t: number, u: number) => t * top.a + u * (1 - top.a);
	return { r: mix(top.r, under.r), g: mix(top.g, under.g), b: mix(top.b, under.b), a: 1 };
}

const black = hex('#000000');
const white = hex('#FFFFFF');

describe('tokens', () => {
	it('Scenario: Text contrast meets 4.5:1', () => {
		expect(textPairs.length).toBeGreaterThan(10);
		const failing = textPairs
			.map(([text, bg]) => ({ pair: `${text} on ${bg}`, ratio: contrast(hex(colors[text]), hex(colors[bg])) }))
			.filter((p) => p.ratio < 4.5);
		expect(failing).toEqual([]);
	});

	it('Scenario: Glass panel text stays legible over any photo', () => {
		expect(glass.fill.a).toBeGreaterThanOrEqual(0.72);
		for (const photo of [black, white]) {
			const ground = over(glass.fill, photo);
			for (const text of glassText) expect(contrast(hex(colors[text]), ground)).toBeGreaterThanOrEqual(4.5);
		}
		expect(contrast(white, over(scrim, white))).toBeGreaterThanOrEqual(3);
	});

	it('tokens.css declares the same values as tokens.ts', () => {
		const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
		const declared = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
		for (const [name, value] of Object.entries(colors)) expect(declared(name)?.toUpperCase()).toBe(value);
		const rgba = ({ r, g, b, a }: Rgba) => `rgb(${r} ${g} ${b} / ${a})`;
		expect(declared('glass')).toBe(rgba(glass.fill));
		expect(declared('glass-blur')).toBe(`${glass.blur}px`);
		expect(declared('scrim-end')).toBe(rgba(scrim));
	});

	it('declares light only', () => {
		const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
		expect(css).toMatch(/color-scheme:\s*light;/);
		expect(css).not.toMatch(/prefers-color-scheme/);
	});
});
