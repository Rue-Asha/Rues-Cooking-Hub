<script module lang="ts">
	import type { IconName } from './Icon.svelte';

	export type Item = { label: string; kind?: 'danger' | 'disabled'; checked?: boolean; hint?: string; sep?: boolean; focus?: boolean; icon?: IconName };
</script>

<!-- A menu drawn open. MenuButton wraps the same items in a popover under their button. -->
<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = { name: string; items: Item[]; radio?: boolean; onpick?: (item: Item) => void };
	let { name, items, radio = false, onpick }: Props = $props();
</script>

<div class="menu" role="menu" aria-label={name}>
	{#each items as item (item.label)}
		{#if item.sep}<hr />{/if}
		<button
			type="button"
			class="item"
			class:danger={item.kind === 'danger'}
			class:focus={item.focus}
			role={radio ? 'menuitemradio' : 'menuitem'}
			aria-checked={radio ? !!item.checked : undefined}
			disabled={item.kind === 'disabled'}
			tabindex={item.checked || (item.focus && !radio) ? 0 : -1}
			onclick={() => onpick?.(item)}
		>
			{#if radio}<span class="mark"><Icon name="check" size={16} /></span>{:else if item.kind === 'danger'}<span class="mark"><Icon name="trash" size={16} /></span>{:else if item.icon}<span class="mark"><Icon name={item.icon} size={16} /></span>{/if}
			<span class="text">{item.label}</span>
			{#if item.hint}<span class="hint">{item.hint}</span>{/if}
		</button>
	{/each}
</div>

<style>
	.menu {
		display: grid;
		gap: var(--space-0-5);
		inline-size: 100%;
		padding: var(--space-1-5);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
		min-inline-size: 0;
	}
	hr {
		block-size: var(--stroke-hairline);
		margin: var(--space-1) var(--space-2);
		border: 0;
		background: var(--hairline);
	}
	.item {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		min-block-size: max(var(--control-height-s), var(--target));
		padding: var(--space-1) var(--space-3-5) var(--space-1) var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: none;
		color: var(--ink);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		text-align: start;
	}
	.mark {
		display: inline-flex;
		flex: none;
	}
	.item[aria-checked='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.item[role='menuitemradio']:not([aria-checked='true']) .mark {
		visibility: hidden;
	}
	.item.danger {
		color: var(--danger);
	}
	.item:disabled {
		opacity: var(--disabled-opacity);
	}
	.text {
		flex: 1;
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.hint {
		flex: none;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
	}
	.item[aria-checked='true'] .hint {
		color: var(--ink-on-inverse-secondary);
	}
	.item.focus {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: calc(-1 * var(--focus-width));
	}
	.item.focus[aria-checked='true'] {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}
	.item:focus-visible {
		outline-offset: calc(-1 * var(--focus-width));
	}
	.item[aria-checked='true']:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}
	@media (hover: hover) {
		.item[aria-checked='false']:not(:disabled):hover,
		.item:not([aria-checked]):not(:disabled):hover {
			background: var(--surface-sunken);
		}
	}
</style>
