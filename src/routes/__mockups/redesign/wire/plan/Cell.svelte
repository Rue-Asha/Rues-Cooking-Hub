<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../overlays/Icon.svelte';
	import Entry from './Entry.svelte';
	import type { PlanEntry } from './data.ts';

	type Props = {
		label: string;
		entries: PlanEntry[];
		width?: string;
		target?: 'add' | 'move';
		dragging?: number;
		before?: number;
		below?: Snippet;
		open?: number;
	};
	let { label, entries, width = '12rem', target, dragging, before, below, open }: Props = $props();
</script>

<div class="cell" role="group" aria-label={label} data-drop-target={target ? '' : undefined} style:--w={width}>
	{#if entries.length}
		<ul class="entries">
			{#each entries as e, i (i)}
				{#if before === i}<li class="line" aria-hidden="true"></li>{/if}
				<Entry entry={e} state={dragging === i ? 'dragging' : open === i ? 'open' : 'idle'} below={open === i ? below : undefined} />
			{/each}
		</ul>
	{/if}
	{#if target}
		<p class="drop">{target === 'add' ? 'Drop to add' : 'Move here'}</p>
	{/if}
	<button type="button" class="add" aria-label="Add to {label}"><Icon name="plus" /></button>
</div>

<style>
	.cell {
		display: grid;
		gap: var(--space-1-5);
		align-content: start;
		inline-size: min(100%, var(--w));
		padding: var(--space-2);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		container-type: inline-size;
		min-inline-size: 0;
	}
	.cell[data-drop-target] { outline: var(--stroke-strong) solid var(--ink); background: var(--surface-raised); }
	.entries { display: grid; gap: var(--space-1); margin: 0; padding: 0; list-style: none; }
	.line { block-size: var(--stroke-strong); border-radius: var(--radius-pill); background: var(--surface-inverse); }
	.drop { padding: var(--space-2); text-align: center; font-size: var(--type-caption-size); font-weight: var(--weight-medium); color: var(--ink); border: var(--stroke-hairline) dashed var(--ink); border-radius: var(--radius-panel); }
	.add { display: flex; align-items: center; justify-content: center; min-block-size: var(--control-height-xs); border: var(--stroke-hairline) dashed var(--edge-control); border-radius: var(--radius-panel); background: transparent; color: var(--ink-secondary); }
	.add :global(svg) { inline-size: 18px; block-size: 18px; }
</style>
