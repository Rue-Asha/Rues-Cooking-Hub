<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import Ic from '../recipes/Ic.svelte';
	import { lang, plural, total } from '../recipes/util.ts';

	type Props = { recipe: MockRecipeFull; hide?: { source?: boolean; times?: boolean; tags?: boolean } };
	let { recipe, hide = {} }: Props = $props();

	const minutes = $derived(hide.times ? null : total(recipe.prepMinutes, recipe.cookMinutes));
	const host = $derived(recipe.sourceUrl && !hide.source ? new URL(recipe.sourceUrl).host : null);
	const ingredients = $derived(recipe.ingredients.reduce((n, s) => n + s.lines.length, 0));
	const steps = $derived(recipe.steps.reduce((n, s) => n + s.lines.length, 0));
	const tags = $derived(hide.tags ? [] : recipe.tags);
</script>

<aside class="card facts" data-surface="inverse" aria-label="At a glance">
	<p class="overline">At a glance</p>
	<p class="big">
		{#if minutes !== null}
			<span class="figure">{minutes.toLocaleString('en-GB')}</span><span class="unit">min in total</span>
		{:else}
			<span class="figure">{recipe.servings}</span><span class="unit">{recipe.servings === 1 ? 'serving' : 'servings'}</span>
		{/if}
	</p>
	<ul class="rules">
		{#if minutes !== null}<li>Serves {recipe.servings}</li>{/if}
		<li>{plural(ingredients, 'ingredient')}</li>
		<li>{plural(steps, 'step')}</li>
	</ul>
	{#if tags.length}
		<ul class="tags" aria-label="Tags">
			{#each tags as tag (tag)}<li lang={lang(tag)}>{tag}</li>{/each}
		</ul>
	{/if}
	{#if host}
		<a class="source" href={recipe.sourceUrl} target="_blank" rel="noreferrer" data-hover>
			<span class="source-text"><span class="label">Source</span> {host}<span class="sr-only"> (opens in a new tab)</span></span>
			<span class="circle" aria-hidden="true"><span data-nudge="out"><Ic name="out" size={16} /></span></span>
		</a>
	{/if}
</aside>

<style>
	.facts {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.overline {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-on-inverse-secondary);
	}
	.big {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-2-5);
	}
	.figure {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-l-size);
		line-height: 1;
		letter-spacing: var(--type-display-l-tracking);
		font-variant-numeric: var(--numeric-figures);
	}
	.unit {
		font-size: var(--type-body-s-size);
		color: var(--ink-on-inverse-secondary);
	}
	.rules {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.rules li {
		padding: var(--space-0-5) 0 var(--space-0-5) var(--space-3-5);
		box-shadow: var(--rule-start-on-inverse);
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--weight-medium);
		text-transform: uppercase;
		font-variant-numeric: var(--numeric-figures);
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.tags li {
		max-inline-size: 100%;
		padding: var(--space-0-5) var(--space-2-5);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse-tint-strong);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		overflow-wrap: anywhere;
	}
	.source {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1) var(--space-1) var(--space-1) var(--space-4);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse-tint);
		box-shadow: var(--ring-on-inverse);
		color: var(--ink-on-inverse);
		font-size: var(--type-body-s-size);
		line-height: 1.3;
		text-decoration: none;
	}
	.source-text {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.label {
		color: var(--ink-on-inverse-secondary);
	}
	.circle {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-9);
		block-size: var(--space-9);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		color: var(--ink);
	}
	.circle > span {
		display: grid;
	}
	@media (hover: hover) {
		.source:hover {
			background: var(--surface-inverse-tint-strong);
		}
	}
</style>
