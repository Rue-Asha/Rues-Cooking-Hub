<script lang="ts">
	import type { MockRecipe } from '../../fixtures.ts';
	import Field from '../overlays/Field.svelte';
	import Icon from '../overlays/Icon.svelte';
	import Pic from './Pic.svelte';
	import { minutes } from './data.ts';

	type Props = { recipes: MockRecipe[]; mode?: 'idle' | 'dragging' | 'empty' | 'nomatch'; query?: string; hint?: boolean; scroll?: boolean };
	let { recipes, mode = 'idle', query: start = '', hint = true, scroll = true }: Props = $props();

	const seed = () => (mode === 'nomatch' ? start : '');
	let query = $state(seed());
	const sorted = $derived([...recipes].sort((a, b) => a.title.localeCompare(b.title, 'en')));
	const shown = $derived(mode === 'empty' || mode === 'nomatch' ? [] : sorted.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase())));
	const total = $derived(mode === 'empty' ? 0 : recipes.length);
</script>

<aside class="picker card" aria-label="Recipes">
	<div class="card-head">
		<h2>Recipes</h2>
		<p class="card-note">{total.toLocaleString('en-GB')} {total === 1 ? 'recipe' : 'recipes'}</p>
	</div>
	<Field label="Find a recipe" hideLabel type="search" icon="search" placeholder="Find a recipe" bind:value={query} />
	{#if hint && mode !== 'empty' && mode !== 'nomatch'}<p class="hint"><Icon name="grip" size={16} />Drag onto a day</p>{/if}
	{#if mode === 'empty'}
		<p class="none">No recipes yet</p>
	{:else if mode === 'nomatch' || shown.length === 0}
		<p class="none" role="status">No recipes match</p>
	{:else}
		<ul class="list" class:scroll>
			{#each shown as r, i (r.id)}
				<li class="item" data-state={mode === 'dragging' && i === 1 ? 'dragging' : undefined} draggable="true">
					<Pic title={r.title} image={r.image} />
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
	.picker {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		min-inline-size: 0;
		padding: var(--space-5) var(--space-3) var(--space-3);
	}
	.card-head {
		padding-inline: var(--space-2);
	}
	.card-head h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
	}
	.hint {
		display: none;
		align-items: center;
		gap: var(--space-1-5);
		padding-inline: var(--space-2);
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
	}
	@media (hover: hover) and (pointer: fine) {
		.hint {
			display: flex;
		}
	}
	.none {
		padding: var(--space-6) var(--space-2);
		text-align: center;
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}
	.list {
		display: grid;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.list.scroll {
		max-block-size: 34rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		scrollbar-color: var(--edge-control) transparent;
	}
	.item {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		min-block-size: max(var(--control-height), var(--target));
		min-inline-size: 0;
		padding: var(--space-1-5) var(--space-2-5) var(--space-1-5) var(--space-1-5);
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
	}
	@media (hover: hover) and (pointer: fine) {
		.item {
			cursor: grab;
		}
	}
	.item[data-state='dragging'] {
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
	}
	.text {
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}
	.t {
		font-size: var(--type-body-s-size);
		line-height: var(--type-caption-line);
		overflow-wrap: anywhere;
		hyphens: auto;
	}
	.m {
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
</style>
