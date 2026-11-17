import { goto, replaceState } from '$app/navigation';
import type { Area } from '#lib/nav.ts';

let handler: (() => void) | null = null;

export function registerContextAdd(next: () => void): () => void {
	handler = next;
	return () => {
		if (handler === next) handler = null;
	};
}

export function addHref(area: Area): string | null {
	if (area === 'recipes') return '/recipes/new';
	if (area === 'eating-out') return '/eating-out/new';
	return null;
}

// the handler runs inside the tap: iOS opens the keyboard for a focus() only from a user gesture
export function contextAdd(area: Area): void {
	if (handler) {
		handler();
		return;
	}
	const href = addHref(area);
	if (href) void goto(href);
}

export function takeAddFlag(url: URL): boolean {
	if (url.searchParams.get('add') !== '1') return false;
	const next = new URL(url);
	next.searchParams.delete('add');
	replaceState(next.pathname + next.search + next.hash, {});
	return true;
}
