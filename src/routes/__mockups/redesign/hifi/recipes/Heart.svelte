<!-- The favourite toggle: a round icon button, charcoal while pressed. -->
<script lang="ts">
	import Ic from './Ic.svelte';

	type Props = { title: string; pressed: boolean; ontoggle?: () => void; solid?: boolean };
	let { title, pressed, ontoggle, solid = true }: Props = $props();
</script>

<button type="button" class="heart" class:solid data-press="round" data-focus={pressed ? 'halo' : undefined} aria-pressed={pressed} aria-label="{pressed ? 'Remove' : 'Add'} {title} {pressed ? 'from' : 'to'} favourites" onclick={ontoggle}>
	<Ic name="heart" size={20} fill={pressed} />
</button>

<style>
	.heart {
		display: grid;
		place-items: center;
		inline-size: max(var(--control-height), var(--target));
		block-size: max(var(--control-height), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink);
	}
	.solid {
		background: var(--surface-control-solid);
	}
	@media (hover: hover) {
		.heart:hover {
			background: var(--surface-control-solid-hover);
		}
	}
	.heart[aria-pressed='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.heart[aria-pressed='true']:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}
</style>
