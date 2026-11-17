<script lang="ts">
	import type { MockRecipe } from '../../fixtures.ts';
	import Heart from './Heart.svelte';
	import Picture from './Picture.svelte';
	import { clip, go, lang, total } from './util.ts';

	type Props = { recipe: MockRecipe; favourite: boolean; ontoggle?: () => void; worst?: boolean };
	let { recipe, favourite, ontoggle, worst = false }: Props = $props();
	const minutes = $derived(total(recipe.prepMinutes, recipe.cookMinutes));
</script>

<li class="row" data-hover>
	<div class="pic"><Picture title={recipe.title} image={recipe.image} /></div>
	<div class="text">
		<h3 class="title"><a href={go.recipe(worst)}>{clip(recipe.title)}</a></h3>
		{#if recipe.description}<p class="desc">{clip(recipe.description)}</p>{/if}
		{#if minutes !== null || recipe.tags.length}
			<p class="meta">
				{#if minutes !== null}<span class="time">{minutes} min</span>{/if}
				{#each recipe.tags.slice(0, 3) as tag (tag)}<span class="tag" lang={lang(tag)}>{tag}</span>{/each}
				{#if recipe.tags.length > 3}<span class="more">+{recipe.tags.length - 3}<span class="sr-only"> more tags</span></span>{/if}
			</p>
		{/if}
	</div>
	<div class="fav"><Heart title={recipe.title} pressed={favourite} {ontoggle} solid={false} /></div>
</li>

<style>
	.row {
		position: relative;
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr) auto;
		align-items: start;
		gap: var(--space-3);
		min-inline-size: 0;
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	@media (hover: hover) {
		.row:hover {
			background: var(--surface-raised);
		}
	}
	.text {
		display: grid;
		gap: var(--space-1);
		align-content: start;
		min-inline-size: 0;
	}
	.title {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
	}
	.title a {
		color: inherit;
		text-decoration: none;
	}
	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-panel);
	}
	.title a:focus-visible {
		outline: none;
	}
	.title a:focus-visible::after {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.desc {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-1-5);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.time {
		font-variant-numeric: var(--numeric-figures);
		margin-inline-end: var(--space-1);
	}
	.tag {
		padding-inline: var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		color: var(--ink);
		overflow-wrap: anywhere;
	}
	.fav {
		position: relative;
		z-index: var(--z-raised);
	}
	@media (max-width: 380px) {
		.row {
			grid-template-columns: 4rem minmax(0, 1fr) auto;
			gap: var(--space-2);
		}
	}
</style>
