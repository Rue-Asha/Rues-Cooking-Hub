import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const dir = new URL('../../../static/mockups/', import.meta.url);
const line = /^(\S+) \| (https?:\/\/\S+) \| author: (.+?) \| licence: (.+)$/;

describe('mockup photos', () => {
	it('Scenario: Every mockup photo is credited', () => {
		const images = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
		const credits = new Map(
			readFileSync(new URL('CREDITS.txt', dir), 'utf8')
				.split('\n')
				.map((l) => l.match(line))
				.filter((m) => m !== null)
				.map((m) => [m[1], { source: m[2], author: m[3].trim(), licence: m[4].trim() }])
		);
		expect(images.length).toBeGreaterThanOrEqual(6);
		for (const image of images) {
			const credit = credits.get(image);
			expect(credit, image).toBeDefined();
			expect(credit!.author.length, image).toBeGreaterThan(0);
			expect(credit!.licence, image).toMatch(/CC0|CC BY|Public Domain/);
		}
	});
});
