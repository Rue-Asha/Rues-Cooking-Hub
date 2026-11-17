// Menus and popovers stay clear of the navigation: a margin above the phone bar (which already sits above the safe-area
// inset) and below a pinned top bar. Without the bar the viewport edge is the limit, with the same margin.
const CLEAR = 12;

const shown = (bar: HTMLElement | null): bar is HTMLElement => !!bar && bar.getClientRects().length > 0 && !bar.hasAttribute('data-hidden');

// the lowest a menu may reach, in viewport coordinates
export function floorY(): number {
	const dock = document.querySelector<HTMLElement>('[data-bar="phone"]');
	return shown(dock) ? Math.min(dock.getBoundingClientRect().top, innerHeight) - CLEAR : innerHeight - CLEAR;
}

// the highest a menu may reach, in viewport coordinates
export function ceilingY(): number {
	const bar = document.querySelector<HTMLElement>('[data-bar="top"]');
	const bottom = shown(bar) ? bar.getBoundingClientRect().bottom : 0;
	return Math.max(bottom, 0) + CLEAR;
}

// A menu anchored under its trigger (absolute, in the trigger's positioned box) opens above the trigger instead when
// it would reach under the phone bar or past the viewport, and above fits; with no room either way it takes the roomier
// side. Offsets, not the box: the opening scale must not count.
export function clearOfBar(node: HTMLElement) {
	const anchor = (node.offsetParent as HTMLElement | null)?.getBoundingClientRect();
	if (!anchor) return;
	const gap = node.offsetTop - anchor.height;
	const below = anchor.top + node.offsetTop + node.offsetHeight;
	const above = anchor.top - gap - node.offsetHeight;
	const floor = floorY();
	const ceiling = ceilingY();
	if (below <= floor) return;
	if (above >= ceiling || above - ceiling > floor - below) node.dataset.side = 'above';
}
