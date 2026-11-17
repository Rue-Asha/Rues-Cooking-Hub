// The charcoal pill glides (motion.css "2. The pill glides"): an inert copy of the track is laid over it and clipped to the
// current item. Port of the specimen's pill() as a Svelte action; keyboard activation and layout changes jump.
// A navigation bar passes the href of the committed route: a tap marks its link at once, and when a guard cancels the
// navigation (NAVIGATION_CANCELLED on window) the mark and the pill go back to that route.
export const NAVIGATION_CANCELLED = 'app:navigation-cancelled';

const FADE = 56;

function edges(track: HTMLElement, ghost: HTMLElement, host: HTMLElement) {
	const more = track.scrollWidth - track.clientWidth;
	const start = more > 1 && track.scrollLeft > 1;
	const end = more > 1 && track.scrollLeft < more - 1;
	for (const n of [track, ghost]) {
		n.toggleAttribute('data-fade-start', start);
		n.toggleAttribute('data-fade-end', end);
	}
	host.toggleAttribute('data-more-start', start);
	host.toggleAttribute('data-more-end', end);
}

export function pill(track: HTMLElement, current?: string) {
	const items = [...track.querySelectorAll<HTMLElement>('a, button')];
	const isOn = (i: HTMLElement) => i.hasAttribute('aria-current') || i.getAttribute('aria-pressed') === 'true';
	const host = track.parentElement;
	if (!items.length || !host) return;
	host.setAttribute('data-pill-host', '');
	track.setAttribute('data-pill-track', '');
	items.forEach((i) => i.setAttribute('data-pill-item', ''));
	const ghost = track.cloneNode(true) as HTMLElement;
	ghost.removeAttribute('data-pill-track');
	ghost.setAttribute('data-pill-ghost', '');
	ghost.setAttribute('aria-hidden', 'true');
	ghost.inert = true;
	ghost.querySelectorAll('[id], [aria-current], [aria-pressed], [href]').forEach((n) => ['id', 'aria-current', 'aria-pressed', 'href'].forEach((a) => n.removeAttribute(a)));
	ghost.querySelectorAll('a, button').forEach((n) => n.setAttribute('tabindex', '-1'));
	track.after(ghost);

	const place = (instant: boolean) => {
		if (instant) ghost.setAttribute('data-pill-instant', '');
		ghost.scrollLeft = track.scrollLeft;
		const h = host.getBoundingClientRect();
		const b = track.getBoundingClientRect();
		Object.assign(ghost.style, { left: `${b.left - h.left}px`, top: `${b.top - h.top}px`, width: `${b.width}px`, height: `${b.height}px` });
		const cur = items.find(isOn);
		if (cur) {
			const t = cur.offsetTop;
			const l = cur.offsetLeft - track.scrollLeft;
			ghost.style.setProperty('--pill-clip', `inset(${t}px ${track.offsetWidth - l - cur.offsetWidth}px ${track.offsetHeight - t - cur.offsetHeight}px ${l}px round 999px)`);
		} else ghost.style.removeProperty('--pill-clip');
		if (instant) {
			void getComputedStyle(ghost).clipPath;
			ghost.removeAttribute('data-pill-instant');
		}
	};
	const mark = (href: string) =>
		items.forEach((i) => (i.getAttribute('href') === href ? i.setAttribute('aria-current', 'page') : i.removeAttribute('aria-current')));
	const click = (e: MouseEvent) => {
		const hit = items.find((i) => i.contains(e.target as Node));
		if (!hit) return;
		if (hit.hasAttribute('aria-pressed')) items.forEach((i) => i.setAttribute('aria-pressed', String(i === hit)));
		else items.forEach((i) => (i === hit ? i.setAttribute('aria-current', 'page') : i.removeAttribute('aria-current')));
		place(e.detail === 0);
	};
	const cancelled = () => current !== undefined && mark(current);
	addEventListener(NAVIGATION_CANCELLED, cancelled);
	track.addEventListener('click', click);
	const cur = items.find(isOn);
	if (cur && track.scrollWidth > track.clientWidth) {
		const over = cur.offsetLeft + cur.offsetWidth + FADE - track.clientWidth;
		if (over > 0) track.scrollLeft = Math.min(over, cur.offsetLeft - FADE);
	}
	// the app's layout keeps the bar mounted across pages, so the current item also changes from outside
	const marks = new MutationObserver(() => place(false));
	marks.observe(track, { attributes: true, attributeFilter: ['aria-current', 'aria-pressed'], subtree: true });
	const sync = () => {
		edges(track, ghost, host);
		place(true);
	};
	const ro = new ResizeObserver(sync);
	ro.observe(track);
	track.addEventListener('scroll', sync, { passive: true });
	sync();
	return {
		update(next?: string) {
			current = next;
			if (current !== undefined) mark(current);
		},
		destroy() {
			removeEventListener(NAVIGATION_CANCELLED, cancelled);
			ro.disconnect();
			marks.disconnect();
			track.removeEventListener('click', click);
			track.removeEventListener('scroll', sync);
			ghost.remove();
		}
	};
}
