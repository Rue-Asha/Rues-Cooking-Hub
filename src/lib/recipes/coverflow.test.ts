import { describe, expect, it } from 'vitest';
import { dragPosition, place, stepIndex, swipeStep } from './coverflow.ts';

describe('stepIndex', () => {
	it('moves one card at a time', () => {
		expect(stepIndex(0, 1, 7)).toBe(1);
		expect(stepIndex(3, -1, 7)).toBe(2);
	});

	it('stops at both ends instead of wrapping', () => {
		expect(stepIndex(0, -1, 7)).toBe(0);
		expect(stepIndex(6, 1, 7)).toBe(6);
		expect(stepIndex(0, 1, 1)).toBe(0);
	});

	it('pulls an index that outgrew a shorter stack back in', () => {
		expect(stepIndex(6, 0, 3)).toBe(2);
	});
});

describe('swipeStep', () => {
	it('swiping right to left goes to the next card', () => {
		expect(swipeStep(-80)).toBe(1);
	});

	it('swiping left to right goes back', () => {
		expect(swipeStep(80)).toBe(-1);
	});

	it('a short drag is not a swipe', () => {
		expect(swipeStep(-20)).toBe(0);
		expect(swipeStep(0)).toBe(0);
	});
});

describe('dragPosition', () => {
	it('follows the finger by one card per step width', () => {
		expect(dragPosition(2, -125, 250, 7)).toBeCloseTo(2.5);
		expect(dragPosition(2, 250, 250, 7)).toBeCloseTo(1);
	});

	it('resists past the first and last card', () => {
		const past = dragPosition(0, 250, 250, 7);
		expect(past).toBeLessThan(0);
		expect(past).toBeGreaterThan(-0.5);
		expect(dragPosition(6, -250, 250, 7)).toBeLessThan(6.5);
	});
});

describe('place', () => {
	it('puts the front card in the middle at full size, on top', () => {
		const front = place(2, 2);
		expect(front).toMatchObject({ d: 0, x: 0, scale: 1, fade: 1 });
		expect(front.z).toBeGreaterThan(place(3, 2).z);
	});

	it('mirrors neighbours left and right', () => {
		const left = place(1, 2);
		const right = place(3, 2);
		expect(left.x).toBe(-right.x);
		expect(left.scale).toBe(right.scale);
		expect(left.z).toBe(right.z);
	});

	it('shrinks, dims and lowers cards with distance', () => {
		const [a, b, c] = [place(1, 0), place(2, 0), place(3, 0)];
		expect(a.x).toBeLessThan(b.x);
		expect(b.x).toBeLessThan(c.x);
		expect(a.scale).toBeGreaterThan(b.scale);
		expect(b.scale).toBeGreaterThan(c.scale);
		expect(a.fade).toBeGreaterThan(b.fade);
		expect(a.z).toBeGreaterThan(b.z);
	});

	it('hides cards far behind the stack', () => {
		expect(place(6, 0).fade).toBe(0);
		expect(place(6, 0)).toEqual({ ...place(5, 0), d: 6 });
	});

	it('blends between two steps while a card is dragged', () => {
		const half = place(1, 0.5);
		expect(half.x).toBeCloseTo((place(1, 0).x + place(1, 1).x) / 2);
		expect(half.scale).toBeCloseTo((place(1, 0).scale + place(1, 1).scale) / 2);
		expect(Number.isInteger(half.z)).toBe(true);
	});
});
