<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../overlays/Button.svelte';
	import { servingsText, type PlanEntry } from './data.ts';

	type Props = { entry: PlanEntry; state?: 'idle' | 'dragging' | 'open'; below?: Snippet };
	let { entry, state = 'idle', below }: Props = $props();
</script>

<li class="entry" data-free={entry.free || undefined} data-state={state}>
	<div class="row">
		{#if !entry.free}<span class="thumb plate" role="img" aria-label="No photo yet"></span>{/if}
		<span class="text">
			<span class="title" dir="auto">{entry.title}</span>
			{#if entry.servings !== null}<span class="meta">{servingsText(entry.servings)}</span>{/if}
		</span>
		<Button variant="quiet" size="s" icon="more" label="Options for {entry.title}" expanded={state === 'open' ? true : undefined} />
	</div>
	{#if below}<div class="below">{@render below()}</div>{/if}
</li>

<style>
	.entry {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
		padding: var(--space-1-5) var(--space-1) var(--space-1-5) var(--space-2);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.entry[data-free] { background: transparent; box-shadow: var(--ring-hairline); }
	.entry[data-state='dragging'] { opacity: var(--disabled-opacity); box-shadow: var(--ring-control); }
	.row { display: flex; align-items: center; gap: var(--space-2); min-inline-size: 0; }
	.entry :global(.thumb) { --thumb: 28px; display: none; }
	@container (min-width: 13rem) {
		.entry :global(.thumb) { display: block; }
	}
	.text { display: grid; flex: 1; gap: var(--space-0-5); min-inline-size: 0; }
	.title { font-size: var(--type-body-s-size); line-height: var(--type-body-s-line); font-weight: var(--weight-medium); overflow-wrap: anywhere; hyphens: auto; }
	.meta { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.below { display: grid; justify-items: end; min-inline-size: 0; }
</style>
