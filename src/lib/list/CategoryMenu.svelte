<script lang="ts">
	import { tick } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';
	import { reducedMotion } from '#lib/motion.ts';
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
	const sheet = matchMedia('(max-width: 1023px)').matches;

	let menu: HTMLElement;
	let place = $state<{ top: number; right: number; above: boolean } | null>(null);

	// on desktop the menu opens beside its button, above it when the viewport has no room below, and follows it on scroll
	function position() {
		const a = anchor.getBoundingClientRect();
		const h = menu.offsetHeight;
		const above = a.bottom + GAP + h > innerHeight - GAP && a.top - GAP - h >= GAP;
		place = {
			top: above ? a.top - GAP - h : Math.min(a.bottom + GAP, innerHeight - GAP - h),
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
		if (event.key === 'Escape' || event.key === 'Tab') {
			event.preventDefault();
			close();
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

	function enter(_node: Element): TransitionConfig {
		if (reducedMotion()) return { duration: 120, css: (t) => `opacity: ${t}` };
		if (sheet)
			return { duration: 320, easing: cubicOut, css: (_t, u) => `transform: translateY(${(u * 100).toFixed(2)}%)` };
		return {
			duration: 220,
			easing: cubicOut,
			css: (t, u) =>
				`opacity: ${t}; transform: translateY(${(u * (place?.above ? 6 : -6)).toFixed(2)}px) scale(${(0.94 + 0.06 * t).toFixed(3)})`
		};
	}

	function exit(_node: Element): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		if (sheet) return { duration: 220, easing: cubicOut, css: (_t, u) => `transform: translateY(${(u * 100).toFixed(2)}%)` };
		return { duration: 140, easing: cubicOut, css: (t) => `opacity: ${t}; transform: scale(${(0.97 + 0.03 * t).toFixed(3)})` };
	}

	const scrim = (_node: Element): TransitionConfig => ({ duration: reducedMotion() ? 0 : 200, css: (t) => `opacity: ${t}` });
</script>

<svelte:window onscroll={() => !sheet && position()} onresize={close} />

<button type="button" class="scrim" class:sheet tabindex="-1" aria-hidden="true" onclick={close} transition:scrim></button>
<div
	class="menu"
	class:sheet
	class:above={place?.above}
	role="menu"
	tabindex="-1"
	aria-label="Move {name} to"
	style:top={!sheet && place ? `${place.top}px` : undefined}
	style:right={!sheet && place ? `${place.right}px` : undefined}
	bind:this={menu}
	in:enter
	out:exit
	{onkeydown}
>
	<p class="title" aria-hidden="true">Move <b>{name}</b> to</p>
	<ul role="none">
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
		z-index: 60;
		padding: 0;
		border: 0;
		background: none;
		cursor: default;
	}

	.scrim.sheet {
		background: var(--veil-strong);
	}

	.menu {
		position: fixed;
		z-index: 61;
		inline-size: 248px;
		padding: var(--s-2);
		border-radius: var(--r-md);
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-lift);
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
		padding: var(--s-4) var(--s-3) max(var(--s-4), env(safe-area-inset-bottom));
		border-radius: var(--r-panel) var(--r-panel) 0 0;
		background: var(--surface);
		border: 0;
	}

	.title {
		padding: var(--s-1) var(--s-3) var(--s-2);
		font-size: var(--t-small);
		color: var(--ink-2);
	}

	.title b {
		font-weight: 600;
		color: var(--ink);
	}

	.menu button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		inline-size: 100%;
		min-block-size: 44px;
		padding: 0 var(--s-3);
		border: 0;
		border-radius: var(--r-sm);
		background: none;
		font-size: 15px;
		text-align: start;
		transition: background-color var(--d-fast) var(--ease-out);
	}

	.menu button:hover,
	.menu button:focus-visible {
		background: var(--ink-wash);
		box-shadow: none;
	}

	.menu button[aria-checked='true'] {
		font-weight: 600;
		color: var(--olive);
	}

	.sheet ul {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2px var(--s-2);
	}

	.sheet button {
		min-block-size: 48px;
	}
</style>
