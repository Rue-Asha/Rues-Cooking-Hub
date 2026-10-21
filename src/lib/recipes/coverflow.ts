export interface Place {
	d: number; // signed distance from the front card, in cards
	x: number; // horizontal offset in step widths
	scale: number;
	fade: number; // 1 = fully visible, 0 = hidden behind the stack
	z: number;
}

// per whole step away from the front: offset, size and visibility; past the last entry cards rest there
const X = [0, 1, 1.72, 2.2, 2.4];
const SCALE = [1, 0.84, 0.7, 0.6, 0.52];
const FADE = [1, 0.92, 0.7, 0.45, 0];

export const SWIPE_PX = 40;

function lerp(table: number[], a: number): number {
	const i = Math.min(Math.floor(a), table.length - 1);
	const next = Math.min(i + 1, table.length - 1);
	return table[i] + (table[next] - table[i]) * (a - i);
}

export function stepIndex(index: number, by: number, count: number): number {
	return Math.max(0, Math.min(count - 1, index + by));
}

// right to left (negative dx) brings the next card to the front
export function swipeStep(dx: number, threshold = SWIPE_PX): -1 | 0 | 1 {
	if (Math.abs(dx) < threshold) return 0;
	return dx < 0 ? 1 : -1;
}

// a stack position that follows the finger, with resistance past either end
export function dragPosition(index: number, dx: number, stepPx: number, count: number): number {
	const p = index - dx / stepPx;
	const last = count - 1;
	if (p < 0) return p / 3;
	if (p > last) return last + (p - last) / 3;
	return p;
}

// position may be fractional while a card is dragged between two steps
export function place(i: number, position: number): Place {
	const d = i - position;
	const a = Math.min(Math.abs(d), X.length - 1);
	return {
		d,
		x: Math.sign(d) * lerp(X, a),
		scale: lerp(SCALE, a),
		fade: lerp(FADE, a),
		z: Math.round(100 - a * 10)
	};
}
