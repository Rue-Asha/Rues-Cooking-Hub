import { getContext, setContext } from 'svelte';
import { cubicInOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { reducedMotion, rise, slideOut } from '#lib/motion.ts';
import { SLOTS, type Id, type IsoDate, type PlanEntry, type Slot } from '#lib/types.ts';

export type Place = { date: IsoDate; slot: Slot };
export type Dragged = { kind: 'entry'; id: Id } | { kind: 'recipe'; id: Id; servings: number };

export interface Board {
	// what is in the air, the slot under the pointer and the entry the drop would land before
	readonly drag: { item: Dragged | null; over: string | null; before: Id | null };
	readonly canDrag: boolean;
	start(event: DragEvent, item: Dragged, source: HTMLElement): void;
	end(): void;
	moveTo(entry: PlanEntry): void;
}

const KEY = Symbol('plan-board');
export const setBoard = (board: Board): Board => setContext(KEY, board);
export const getBoard = (): Board => getContext<Board>(KEY);

export const placeKey = (date: IsoDate, slot: Slot): string => `${date}/${slot}`;

// the week as the server will return it after the move, so the entry glides before the round trip ends
export function placed(entries: PlanEntry[], id: Id, to: Place & { position?: number }): PlanEntry[] {
	const moving = entries.find((e) => e.id === id);
	if (!moving) return entries;
	const at = (e: PlanEntry, p: Place) => e.date === p.date && e.slot === p.slot;
	const target = entries.filter((e) => at(e, to) && e.id !== id);
	target.splice(Math.min(to.position ?? target.length, target.length), 0, { ...moving, ...to });
	const order = new Map<Id, number>(target.map((e, i) => [e.id, i]));
	const source = entries.filter((e) => at(e, moving) && e.id !== id);
	if (!at(moving, to)) source.forEach((e, i) => order.set(e.id, i));
	const rank = (s: Slot) => SLOTS.findIndex((x) => x.id === s);
	return entries
		.map((e) => (e.id === id ? { ...e, ...to } : e))
		.map((e) => (order.has(e.id) ? { ...e, position: order.get(e.id)! } : e))
		.sort((a, b) => a.date.localeCompare(b.date) || rank(a.slot) - rank(b.slot) || a.position - b.position);
}

// An entry that changes slot flies from its old place to its new one; an entry with no counterpart rises in or slides out.
// A dropped card lands from where the drag image was let go instead of from its old place.
const sending = new Map<Id, Element>();
const receiving = new Map<Id, Element>();
let landing: { left: number; top: number; entry?: Id; recipe?: Id; until: number } | null = null;
let grab = { x: 0, y: 0 };

export function grabbed(event: DragEvent, source: HTMLElement): void {
	const box = source.getBoundingClientRect();
	grab = { x: event.clientX - box.left, y: event.clientY - box.top };
}

export function land(event: DragEvent, item: Dragged): void {
	landing = {
		left: event.clientX - grab.x,
		top: event.clientY - grab.y,
		[item.kind]: item.id,
		until: performance.now() + 2000
	};
}

function landed(key: Id, recipe: Id | undefined): { left: number; top: number } | null {
	const l = landing;
	if (!l || performance.now() > l.until || (l.entry !== key && (recipe === undefined || l.recipe !== recipe))) return null;
	landing = null;
	return l;
}

function glide(a: { left: number; top: number }, node: Element, intro: boolean): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	const b = node.getBoundingClientRect();
	const dx = a.left - b.left;
	const dy = a.top - b.top;
	return {
		duration: Math.min(640, 340 + Math.sqrt(Math.hypot(dx, dy)) * 9),
		easing: cubicInOut,
		css: (t, u) =>
			intro
				? `transform: translate(${(u * dx).toFixed(2)}px, ${(u * dy).toFixed(2)}px) scale(${(1 + Math.sin(t * Math.PI) * 0.04).toFixed(3)}); opacity: ${Math.min(1, t * 3)}`
				: `opacity: ${Math.max(0, t * 3 - 2)}`
	};
}

function pair(mine: Map<Id, Element>, other: Map<Id, Element>, intro: boolean) {
	return (node: Element, { key, recipe }: { key: Id; recipe?: Id }) => {
		mine.set(key, node);
		return () => {
			const dropped = intro ? landed(key, recipe) : null;
			if (dropped) {
				// the old copy, if its outro has not started yet, still has to find this one and only fade
				other.delete(key);
				requestAnimationFrame(() => mine.delete(key));
				return glide(dropped, node, true);
			}
			const counterpart = other.get(key);
			if (counterpart) {
				other.delete(key);
				return glide(counterpart.getBoundingClientRect(), node, intro);
			}
			mine.delete(key);
			return intro ? rise(node, { y: 10 }) : slideOut(node);
		};
	};
}

export const send = pair(sending, receiving, false);
export const receive = pair(receiving, sending, true);

// The browser's drag image is a snapshot taken during dragstart: a tilted copy of the card, lifted off the page.
export function ghost(event: DragEvent, source: HTMLElement): void {
	if (!event.dataTransfer) return;
	const box = source.getBoundingClientRect();
	const pad = 24;
	const frame = document.createElement('div');
	frame.style.cssText = `position: fixed; inset-block-start: -1000px; inset-inline-start: -1000px; padding: ${pad}px; pointer-events: none;`;
	const card = source.cloneNode(true) as HTMLElement;
	card.removeAttribute('data-dragging');
	card.style.cssText = `inline-size: ${box.width}px; margin: 0; background: var(--white); border-radius: var(--r-sm); box-shadow: var(--shadow-lift); transform: rotate(-3deg) scale(1.03);`;
	frame.append(card);
	document.body.append(frame);
	event.dataTransfer.setDragImage(frame, event.clientX - box.left + pad, event.clientY - box.top + pad);
	requestAnimationFrame(() => frame.remove());
}
