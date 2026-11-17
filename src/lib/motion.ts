import type { OnNavigate } from '$app/navigation';
import { flip, type AnimationConfig } from 'svelte/animate';
import type { TransitionConfig } from 'svelte/transition';

// Durations and curves mirror --motion-quick / --motion-glide / --motion-settle and --ease-out / --ease-in-out in the
// fingerprint tokens. What the user makes happen moves short and eases out; only transform and opacity move.
const FAST = 160;
const BASE = 260;
const STAGGER_STEP = 40;
const STAGGER_MAX = 12;

// cubic-bezier(x1, y1, x2, y2) as an easing function: Newton's method on x, then y at that t
export function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
	const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
	const slope = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
	return (x) => {
		if (x <= 0 || x >= 1) return x;
		let t = x;
		for (let i = 0; i < 8; i++) {
			const d = slope(x1, x2, t);
			if (Math.abs(d) < 1e-6) break;
			t -= (at(x1, x2, t) - x) / d;
		}
		return at(y1, y2, Math.min(1, Math.max(0, t)));
	};
}

export const easeOut = bezier(0.23, 1, 0.32, 1);
export const easeInOut = bezier(0.77, 0, 0.175, 1);

export function reducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function rise(_node: Element, { delay = 0, y = 16 }: { delay?: number; y?: number } = {}): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		delay,
		duration: BASE,
		easing: easeOut,
		css: (t, u) => `transform: translateY(${(u * y).toFixed(2)}px); opacity: ${t}`
	};
}

// A row the user just made (a list item, a plan entry) settles in from a few pixels above.
export function arrive(_node: Element, { delay = 0 }: { delay?: number } = {}): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		delay,
		duration: BASE,
		easing: easeOut,
		css: (t, u) => `opacity: ${t}; transform: translateY(${(u * -6).toFixed(2)}px) scale(${(0.98 + 0.02 * t).toFixed(3)})`
	};
}

export function stagger(index: number): number {
	return Math.min(index, STAGGER_MAX) * STAGGER_STEP;
}

// the rows that stay glide to their new place
export const flipOptions = (): { duration: number; easing: (t: number) => number } => ({
	duration: reducedMotion() ? 0 : BASE,
	easing: easeInOut
});

// The page's scroll offset as of the last scroll event. When a removal shortens the page, the browser clamps the scroll
// while the rows are measured again, before any scroll event: this still holds the offset the rows were first measured at.
let scrolled = typeof window === 'undefined' ? 0 : window.scrollY;
if (typeof window !== 'undefined') window.addEventListener('scroll', () => (scrolled = window.scrollY), { passive: true });

// FLIP measured on the page, not in the viewport: a row that kept its place on the page doesn't glide by the clamp
export function flipOnPage(node: Element, { from, to }: { from: DOMRect; to: DOMRect }): AnimationConfig {
	const shift = typeof window === 'undefined' ? 0 : scrolled - window.scrollY;
	const start = new DOMRect(from.x, from.y + shift, from.width, from.height);
	const still = Math.abs(start.top - to.top) < 0.5 && Math.abs(start.left - to.left) < 0.5 && start.width === to.width && start.height === to.height;
	if (still) return { duration: 0 };
	return flip(node, { from: start, to }, flipOptions());
}

// Controls already on the page that take a new layout (the add chips of a plan day that just emptied) fade up in
// their new places, one after another. No travel: they did not come from anywhere, and a chip may not ride onto the
// row above it.
export function arriveInPlace(nodes: Element[]): void {
	if (reducedMotion()) return;
	nodes.forEach((node, i) =>
		node.animate([{ opacity: 0, transform: 'scale(0.97)' }, { opacity: 1, transform: 'none' }], {
			duration: BASE,
			delay: stagger(i),
			easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
			fill: 'backwards'
		})
	);
}

// A menu, popover or chip opens out of its trigger: a short fade and a scale up from 0.97, out a little faster. The
// caller sets transform-origin on the node; a closing one is inert at once, so it can't take a second click.
export function pop(node: Element, _params?: unknown, options?: { direction: 'in' | 'out' | 'both' }): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	const out = options?.direction === 'out';
	// a menu reopened mid-exit plays the same node back in
	(node as HTMLElement).inert = out;
	return {
		duration: out ? FAST * 0.75 : FAST,
		easing: easeOut,
		css: (t) => `opacity: ${t}; transform: scale(${(0.97 + 0.03 * t).toFixed(3)})`
	};
}

// A removed row fades and shrinks a touch, faster than it came, while its neighbours close the gap.
export function slideOut(_node: Element): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		duration: FAST,
		easing: easeOut,
		css: (t) => `opacity: ${t}; transform: scale(${(0.98 + 0.02 * t).toFixed(3)})`
	};
}

export function viewTransition(navigation: OnNavigate): Promise<void> | void {
	if (reducedMotion() || typeof document === 'undefined' || !document.startViewTransition) return;
	return new Promise((resolve) => {
		document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
		});
	});
}

export const heroName = (id: number): string => `recipe-hero-${id}`;
export const spotHeroName = (id: number): string => `spot-hero-${id}`;
