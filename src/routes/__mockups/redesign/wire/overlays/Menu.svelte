<script module lang="ts">
	export type Item = { label: string; kind?: 'danger' | 'disabled'; checked?: boolean; hint?: string; sep?: boolean };
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let { name, items, radio = false, width = '16rem' }: { name: string; items: Item[]; radio?: boolean; width?: string } = $props();
</script>

<div class="menu" role="menu" aria-label={name} style:--w={width}>
	{#each items as item (item.label)}
		{#if item.sep}<hr />{/if}
		<button
			type="button"
			class="item"
			class:checked={item.checked}
			class:radio
			role={radio ? 'menuitemradio' : 'menuitem'}
			aria-checked={radio ? !!item.checked : undefined}
			disabled={item.kind === 'disabled'}
		>
			{#if radio}<span class="mark" aria-hidden="true">{#if item.checked}<Icon name="check" />{/if}</span>{/if}
			{#if item.kind === 'danger'}<span class="mark" aria-hidden="true"><Icon name="trash" /></span>{/if}
			<span class="text">{item.label}</span>
			{#if item.hint}<span class="hint">{item.hint}</span>{/if}
		</button>
	{/each}
</div>

<style>
	.menu {
		display: grid;
		gap: var(--space-0-5);
		inline-size: min(100%, var(--w));
		padding: var(--space-1-5);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		min-inline-size: 0;
	}
	hr { margin: var(--space-1) 0; border: 0; block-size: var(--stroke-hairline); background: var(--hairline); }
	.item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: var(--target-touch);
		padding: var(--space-1) var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: transparent;
		color: var(--ink);
		font-size: var(--type-label-size);
		text-align: start;
	}
	.item.checked { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.item:disabled { color: var(--ink-muted); opacity: var(--disabled-opacity); }
	.mark { display: grid; place-items: center; inline-size: 20px; flex: none; }
	.text { flex: 1; min-inline-size: 0; overflow-wrap: anywhere; }
	.hint { color: var(--ink-muted); font-size: var(--type-caption-size); }
</style>
