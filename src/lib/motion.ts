import type { OnNavigate } from '$app/navigation';
import { backOut, cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

// Durations mirror --d-fast / --d-base / --d-slow in tokens.css.
const FAST = 160;
const BASE = 280;
const SLOW = 480;
const STAGGER_STEP = 40;
const STAGGER_MAX = 12;

export function reducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function rise(_node: Element, { delay = 0, y = 16 }: { delay?: number; y?: number } = {}): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		delay,
		duration: SLOW,
		easing: cubicOut,
		css: (t, u) => `transform: translateY(${(u * y).toFixed(2)}px); opacity: ${t}`
	};
}

export function stagger(index: number): number {
	return Math.min(index, STAGGER_MAX) * STAGGER_STEP;
}

export const flipOptions = (): { duration: number; easing: (t: number) => number } => ({
	duration: reducedMotion() ? 0 : 420,
	easing: cubicOut
});

export function pop(_node: Element): TransitionConfig {
	if (reducedMotion()) return { duration: FAST, css: (t) => `opacity: ${t}` };
	return {
		duration: BASE + 80,
		easing: backOut,
		css: (t) => `transform: scale(${(0.55 + 0.45 * t).toFixed(3)}); opacity: ${Math.min(1, t * 2)}`
	};
}

export function slideOut(_node: Element): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		duration: BASE + 40,
		easing: cubicOut,
		css: (t, u) => `transform: translateY(${(u * 18).toFixed(2)}px) scale(${(1 - u * 0.04).toFixed(3)}); opacity: ${t}`
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
