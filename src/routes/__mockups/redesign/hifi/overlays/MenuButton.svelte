<!--
	A button and its menu, live: a popover under the button (it flips above when there is no room), focus on the checked
	or first item, arrows / Home / End move, Escape closes and hands focus back. With sheet set, a coarse pointer opens
	the same items in a bottom sheet instead.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../shell/Button.svelte';
	import Sheet from '../shell/Sheet.svelte';
	import Menu, { type Item } from './Menu.svelte';

	type Props = {
		label: string;
		name: string;
		items: Item[];
		radio?: boolean;
		align?: 'start' | 'end';
		sheet?: string;
		onpick?: (item: Item) => void;
		children: Snippet;
	};
	let { label, name, items, radio = false, align = 'end', sheet, onpick, children }: Props = $props();

	const uid = $props.id();
	const anchor = `--menu-${uid}`;
	let pop: HTMLElement;
	let expanded = $state(false);
	let sheetOpen = $state(false);

	function focusItem() {
		const items = pop.querySelectorAll<HTMLElement>('[role^=menuitem]:not(:disabled)');
		(pop.querySelector<HTMLElement>('[tabindex="0"]') ?? items[0])?.focus();
	}
	function toggle() {
		if (sheet && matchMedia('(pointer: coarse)').matches) sheetOpen = true;
		else pop.togglePopover();
	}
	function key(event: KeyboardEvent) {
		const items = [...pop.querySelectorAll<HTMLElement>('[role^=menuitem]:not(:disabled)')];
		const at = items.indexOf(document.activeElement as HTMLElement);
		const next =
			event.key === 'ArrowDown' ? (at + 1) % items.length : event.key === 'ArrowUp' ? (at - 1 + items.length) % items.length : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : -1;
		if (next < 0) return;
		event.preventDefault();
		items[next].focus();
	}
	function pick(item: Item) {
		pop.hidePopover();
		sheetOpen = false;
		onpick?.(item);
	}
</script>

<Button variant="quiet" size="s" icon {label} aria-haspopup="menu" aria-expanded={expanded} style="anchor-name: {anchor}" onclick={toggle}>{@render children()}</Button>
<div
	role="presentation"
	bind:this={pop}
	popover="auto"
	class="pop"
	data-align={align}
	style="position-anchor: {anchor}"
	ontoggle={(e) => {
		expanded = (e as ToggleEvent).newState === 'open';
		if (expanded) focusItem();
	}}
	onkeydown={key}
>
	<Menu {name} {items} {radio} onpick={pick} />
</div>
{#if sheet}
	<Sheet bind:open={sheetOpen} title={sheet}>
		<Menu {name} {items} {radio} onpick={pick} />
	</Sheet>
{/if}

<style>
	.pop {
		position: fixed;
		position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
		inset: auto;
		top: anchor(bottom);
		margin: var(--space-1-5) 0;
		padding: 0;
		border: 0;
		background: transparent;
		overflow: visible;
		min-inline-size: max(14rem, anchor-size(width));
		max-inline-size: min(20rem, 100vw - 2 * var(--space-4));
		color: var(--ink);
	}
	.pop[data-align='start'] {
		left: anchor(left);
	}
	.pop[data-align='end'] {
		right: anchor(right);
	}
</style>
