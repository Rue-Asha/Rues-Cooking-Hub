<script lang="ts">
	import { tick } from 'svelte';
	import type { TransitionConfig } from 'svelte/transition';
	import { easeOut, reducedMotion } from '#lib/motion.ts';
	import { ceilingY, floorY } from '#lib/shell/clear.ts';
	import { CATEGORIES, type Category } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let {
		name,
		current,
		anchor,
		onpick,
		onclose
	}: {
		name: string;
		current: Category;
		anchor: HTMLElement;
		onpick: (category: Category) => void;
		onclose: () => void;
	} = $props();

	const GAP = 6;
	// the sheet rule of every dialog: a bottom sheet below 768 px, a panel by its button from there
	const sheet = matchMedia('(max-width: 767px)').matches;

	let menu: HTMLElement;
	let place = $state<{ top: number; right: number; above: boolean } | null>(null);

	// from 768 px the menu opens beside its button, above it when there is no room below (the phone bar of a tablet counts),
	// and follows it on scroll
	function position() {
		const a = anchor.getBoundingClientRect();
		const h = menu.offsetHeight;
		const floor = floorY();
		const above = a.bottom + GAP + h > floor && a.top - GAP - h >= ceilingY();
		place = {
			top: above ? a.top - GAP - h : Math.min(a.bottom + GAP, floor - h),
			right: Math.max(GAP, document.documentElement.clientWidth - a.right),
			above
		};
	}

	// the menu stays hidden until it has a place, and a hidden element takes no focus
	$effect(() => {
		position();
		tick().then(() => menu.querySelector<HTMLElement>('[aria-checked="true"]')?.focus({ preventScroll: true }));
	});

	function close() {
		anchor.focus();
		onclose();
	}

	function onkeydown(event: KeyboardEvent) {
		const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitemradio"]')];
		const at = items.indexOf(document.activeElement as HTMLElement);
		const go = (i: number) => items[(i + items.length) % items.length].focus();
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'Tab') {
			// it is modal behind its scrim: Tab moves between the chosen aisle and Close, and never out
			event.preventDefault();
			const closer = menu.querySelector<HTMLElement>('.close')!;
			if (document.activeElement === closer) (items.find((i) => i.tabIndex === 0) ?? items[0]).focus();
			else closer.focus();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			go(at + 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			go(at - 1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			go(0);
		} else if (event.key === 'End') {
			event.preventDefault();
			go(-1);
		}
	}

	function pick(category: Category) {
		if (category !== current) onpick(category);
		close();
	}

	// the panel grows out of its button, the phone sheet slides up from its edge; both leave faster than they came
	function enter(_node: Element): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		if (sheet) return { duration: 260, easing: easeOut, css: (_t, u) => `transform: translateY(${(u * 100).toFixed(2)}%)` };
		return { duration: 160, easing: easeOut, css: (t) => `opacity: ${t}; transform: scale(${(0.97 + 0.03 * t).toFixed(3)})` };
	}

	function exit(_node: Element): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		if (sheet) return { duration: 160, easing: easeOut, css: (_t, u) => `transform: translateY(${(u * 100).toFixed(2)}%)` };
		return { duration: 120, easing: easeOut, css: (t) => `opacity: ${t}; transform: scale(${(0.97 + 0.03 * t).toFixed(3)})` };
	}

	// to <body>, as the other sheets: inside the frame its backdrop filter would hold the fixed scrim and panel to the frame,
	// and a click outside the frame would not reach the scrim
	function portal(node: HTMLElement) {
		document.body.append(node);
		return { destroy: () => node.remove() };
	}

	const scrim = (_node: Element): TransitionConfig => ({ duration: reducedMotion() ? 0 : 160, css: (t) => `opacity: ${t}` });
</script>

<svelte:window onscroll={() => !sheet && position()} onresize={close} />

<button type="button" class="scrim" class:sheet tabindex="-1" aria-hidden="true" onclick={close} transition:scrim use:portal></button>
<div
	class="menu"
	class:sheet
	class:above={place?.above}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	aria-label="Move {name} to"
	style:top={!sheet && place ? `${place.top}px` : undefined}
	style:right={!sheet && place ? `${place.right}px` : undefined}
	bind:this={menu}
	in:enter
	out:exit
	use:portal
	{onkeydown}
>
	<div class="head">
		<p class="title" aria-hidden="true">Move <b>{name}</b> to</p>
		<button type="button" class="close" aria-label="Close" data-press="round" onclick={close}><Icon name="x" size={18} /></button>
	</div>
	<ul role="menu" aria-label="Move {name} to">
		{#each CATEGORIES as c (c.id)}
			<li role="none">
				<button
					type="button"
					role="menuitemradio"
					aria-checked={c.id === current}
					tabindex={c.id === current ? 0 : -1}
					onclick={() => pick(c.id)}
				>
					<span>{c.label}</span>
					{#if c.id === current}<Icon name="check" size={16} stroke={2.2} />{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: var(--z-menu);
		padding: 0;
		border: 0;
		background: none;
		cursor: default;
	}

	.scrim.sheet {
		background: var(--surface-tint-strong);
	}

	.menu {
		position: fixed;
		z-index: var(--z-sheet);
		inline-size: 248px;
		padding: var(--space-1-5);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
		transform-origin: top right;
	}

	.menu.above {
		transform-origin: bottom right;
	}

	.menu:not(.sheet):not([style]) {
		visibility: hidden;
	}

	.menu.sheet {
		inset: auto 0 0;
		inline-size: auto;
		padding: var(--space-4) var(--space-3) max(var(--space-4), env(safe-area-inset-bottom));
		border-radius: var(--radius-card) var(--radius-card) 0 0;
		/* reading sits on solid: the dialog is opaque, not glass (--surface-card lets a charcoal card show through) */
		background: var(--surface-raised);
		box-shadow: var(--elevation-card);
	}

	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.close {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height-s), var(--target));
		block-size: max(var(--control-height-s), var(--target));
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		color: var(--ink);
	}

	@media (hover: hover) {
		.close:hover {
			background: var(--surface-sunken);
		}
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.title {
		flex: 1;
		min-inline-size: 0;
		padding: var(--space-1) var(--space-3) var(--space-2);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}

	.title b {
		font-weight: var(--weight-semibold);
		color: var(--ink);
	}

	[role='menuitemradio'] {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target));
		padding: var(--space-1) var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: none;
		color: var(--ink);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		text-align: start;
	}

	.menu button:focus-visible {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: calc(-1 * var(--focus-width));
	}

	[role='menuitemradio'][aria-checked='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	[role='menuitemradio'][aria-checked='true']:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
	}

	@media (hover: hover) {
		[role='menuitemradio'][aria-checked='false']:hover {
			background: var(--surface-sunken);
		}
	}

	.sheet ul {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-0-5) var(--space-2);
	}
</style>
