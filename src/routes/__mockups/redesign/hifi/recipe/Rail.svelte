<!--
	The glass rail beside the recipe's head: back, favourite, edit, delete. The vendored layout puts .rail on the frame's own
	grid (a vertical capsule on wide and tablet, a horizontal one on the photo's lower edge on phones), and Frame has no rail
	slot, so this moves the element up to .frame once mounted. Until then it is out of the way, not in the head.
-->
<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Heart from '../recipes/Heart.svelte';
	import Ic from '../recipes/Ic.svelte';
	import { go } from '../recipes/util.ts';

	type Props = { title: string; favourite: boolean; worst?: boolean };
	let { title, favourite, worst = false }: Props = $props();
	let pressed = $state<boolean | null>(null);

	function toFrame(node: HTMLElement) {
		const frame = node.closest('.frame');
		const screen = frame?.querySelector(':scope > main.screen');
		if (!frame || !screen) return;
		frame.insertBefore(node, screen);
		node.removeAttribute('data-wait');
		return { destroy: () => node.remove() };
	}
</script>

<div class="rail" role="group" aria-label="Recipe actions" data-wait use:toFrame>
	<Button variant="quiet" icon label="Back to recipes" href={go.recipes(worst)}><Ic name="back" /></Button>
	<Heart {title} pressed={pressed ?? favourite} ontoggle={() => (pressed = !(pressed ?? favourite))} solid={false} />
	<Button variant="quiet" icon label="Edit" href={go.edit(worst)}><Ic name="edit" /></Button>
	<Button variant="quiet" icon label="Delete recipe" class="delete"><Ic name="trash" /></Button>
</div>

<style>
	.rail[data-wait] {
		position: absolute;
		visibility: hidden;
	}
	/* the favourite is a toggle: charcoal while pressed, like every current thing */
	.rail :global(.heart[aria-pressed='true']) {
		background: var(--surface-inverse);
	}
	.rail :global(.delete) {
		color: var(--danger);
	}
	@media (hover: hover) {
		.rail :global(.heart:not([aria-pressed='true']):hover) {
			background: var(--surface-hover);
		}
	}
</style>
