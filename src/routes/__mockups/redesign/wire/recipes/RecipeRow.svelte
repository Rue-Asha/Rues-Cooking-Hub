<script lang="ts">
	import type { MockRecipe } from '../../fixtures.ts';
	import Grey from './Grey.svelte';
	import Icon from './Icon.svelte';
	import { totalMinutes, wire } from './util.ts';

	let { recipe, worst = false }: { recipe: MockRecipe; worst?: boolean } = $props();
	const total = $derived(totalMinutes(recipe.prepMinutes, recipe.cookMinutes));
</script>

<li class="row">
	<a class="open" href={wire('recipe', worst)}>
		<span class="pic">
			{#if recipe.image}<Grey ratio="1 / 1" caption={false} />{:else}<Grey ratio="1 / 1" caption={false} plate />{/if}
		</span>
		<span class="text">
			<span class="title">{recipe.title}</span>
			{#if recipe.description}<span class="desc">{recipe.description}</span>{/if}
			<span class="meta">
				{#if total !== null}<span class="time">{total} min</span>{/if}
				{#each recipe.tags.slice(0, 3) as tag (tag)}<span class="w-tag">{tag}</span>{/each}
				{#if recipe.tags.length > 3}<span class="w-note">+{recipe.tags.length - 3}</span>{/if}
			</span>
		</span>
	</a>
	<button type="button" class="w-icon fav" aria-pressed={recipe.favourite} aria-label="{recipe.favourite ? 'Remove' : 'Add'} {recipe.title} {recipe.favourite ? 'from' : 'to'} favourites">
		<Icon name={recipe.favourite ? 'starFill' : 'star'} />
	</button>
</li>

<style>
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		gap: var(--space-2);
		min-inline-size: 0;
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}

	.open {
		display: grid;
		grid-template-columns: 4.5rem minmax(0, 1fr);
		gap: var(--space-3);
		min-inline-size: 0;
		color: var(--ink);
		text-decoration: none;
	}

	.pic {
		display: block;
		min-inline-size: 0;
	}

	.text {
		display: grid;
		gap: var(--space-1);
		align-content: start;
		min-inline-size: 0;
	}

	.title,
	.desc {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
	}

	.title {
		-webkit-line-clamp: 2;
		line-clamp: 2;
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
	}

	.desc {
		-webkit-line-clamp: 2;
		line-clamp: 2;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1-5);
	}

	.time {
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
		color: var(--ink-secondary);
	}
</style>
