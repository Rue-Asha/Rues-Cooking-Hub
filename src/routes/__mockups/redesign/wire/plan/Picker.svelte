<script lang="ts">
	import type { MockRecipe } from '../../fixtures.ts';
	import Field from '../overlays/Field.svelte';
	import Icon from '../overlays/Icon.svelte';
	import { minutes } from './data.ts';

	type Props = { recipes: MockRecipe[]; state?: 'idle' | 'dragging' | 'empty' | 'nomatch'; query?: string; hint?: boolean; scroll?: boolean };
	let { recipes, state = 'idle', query = '', hint = true, scroll = true }: Props = $props();
	const sorted = $derived([...recipes].sort((a, b) => a.title.localeCompare(b.title, 'en')));
	const shown = $derived(state === 'empty' || state === 'nomatch' ? [] : sorted);
</script>

<aside class="picker card" aria-label="Recipes">
	<div class="head">
		<h2 class="title">Recipes</h2>
		<span class="card-note">{state === 'empty' ? '0 recipes' : `${recipes.length.toLocaleString('en-GB')} recipes`}</span>
	</div>
	<Field label="Find a recipe" hideLabel type="search" placeholder="Find a recipe" value={state === 'nomatch' ? query : ''} />
	{#if hint && (state === 'idle' || state === 'dragging')}<p class="hint"><Icon name="grip" /><span>Drag onto a day</span></p>{/if}
	{#if state === 'empty'}
		<p class="none">No recipes yet</p>
	{:else if state === 'nomatch'}
		<p class="none" role="status">No recipes match</p>
	{:else}
		<ul class="list" class:scroll>
			{#each shown as r, i (r.id)}
				<li class="item" data-state={state === 'dragging' && i === 1 ? 'dragging' : undefined}>
					<span class="grip"><Icon name="grip" /></span>
					<span class="thumb plate" role="img" aria-label={r.image ? 'Photo' : 'No photo yet'}></span>
					<span class="text">
						<span class="t">{r.title}</span>
						<span class="m">{minutes(r) ? `${minutes(r)} min` : 'No times'}</span>
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</aside>

<style>
	.picker { display: grid; gap: var(--space-3); align-content: start; padding: var(--space-4); min-inline-size: 0; }
	.head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--space-1) var(--space-3); }
	.title { font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); letter-spacing: var(--type-display-s-tracking); }
	.hint { display: flex; align-items: center; gap: var(--space-1-5); font-size: var(--type-caption-size); color: var(--ink-secondary); }
	.hint :global(svg) { inline-size: 16px; block-size: 16px; }
	.none { padding: var(--space-6) var(--space-2); text-align: center; color: var(--ink-secondary); }
	.list { display: grid; gap: var(--space-1); margin: 0; padding: 0; list-style: none; }
	.list.scroll { max-block-size: 34rem; overflow-y: auto; padding-inline-end: var(--space-1); }
	.item { display: flex; align-items: center; gap: var(--space-2); min-block-size: var(--target-touch); padding: var(--space-1) var(--space-2); border-radius: var(--radius-panel); background: var(--surface-sunken); min-inline-size: 0; }
	.item[data-state='dragging'] { box-shadow: var(--ring-control); background: var(--surface-raised); }
	.grip { color: var(--ink-muted); display: grid; }
	.grip :global(svg) { inline-size: 16px; block-size: 16px; }
	.item :global(.thumb) { --thumb: 28px; }
	.text { display: grid; gap: var(--space-0-5); min-inline-size: 0; }
	.t { font-size: var(--type-body-s-size); line-height: var(--type-body-s-line); font-weight: var(--weight-medium); overflow-wrap: anywhere; hyphens: auto; }
	.m { font-size: var(--type-caption-size); color: var(--ink-secondary); }
</style>
