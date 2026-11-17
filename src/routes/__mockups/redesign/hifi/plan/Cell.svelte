<!-- One slot drawn on its own, for the state specimens: its entries, an optional drop target hint and the add control. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../shell/Button.svelte';
	import Icon from '../overlays/Icon.svelte';
	import Menu, { type Item } from '../overlays/Menu.svelte';
	import Entry from './Entry.svelte';
	import type { PlanEntry } from './data.ts';

	type Props = {
		label: string;
		entries: PlanEntry[];
		width?: string;
		target?: 'add' | 'move';
		dragging?: number;
		before?: number;
		menu?: { name: string; items: Item[] };
		form?: 'editing' | 'error';
	};
	let { label, entries, width = '12rem', target, dragging, before, menu, form }: Props = $props();
</script>

<div class="cell" role="group" aria-label={label} data-drop-target={target ? '' : undefined} style:--w={width}>
	{#if entries.length}
		<ul class="entries">
			{#each entries as e, i (e.id)}
				{#if before === i}<li class="line" aria-hidden="true"></li>{/if}
				<Entry entry={e} mode={dragging === i ? 'dragging' : form && i === 0 ? form : 'idle'} />
			{/each}
		</ul>
	{/if}
	{#if menu}<div class="menu"><Menu name={menu.name} items={menu.items} /></div>{/if}
	{#if target}<p class="drop">{target === 'add' ? 'Drop to add' : 'Move here'}</p>{/if}
	<Button variant="quiet" size="s" class="add" label="Add to {label}"><Icon name="plus" /></Button>
</div>

<style>
	.cell {
		display: grid;
		gap: var(--space-1-5);
		align-content: start;
		inline-size: min(100%, var(--w));
		padding: var(--space-2);
		border-radius: var(--radius-panel);
		background: var(--surface-card);
		box-shadow: var(--elevation-card);
		container: slot / inline-size;
		min-inline-size: 0;
	}
	.cell[data-drop-target] {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}
	.entries {
		display: grid;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.line {
		block-size: var(--stroke-strong);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse);
	}
	.menu {
		justify-self: end;
		inline-size: min(100%, 14rem);
	}
	.drop {
		padding: var(--space-2);
		border-radius: var(--radius-item);
		box-shadow: var(--ring-control);
		text-align: center;
		font-size: var(--type-caption-size);
		font-weight: var(--weight-semibold);
		color: var(--ink);
	}
	.cell :global(.add) {
		justify-self: start;
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
	}
</style>
