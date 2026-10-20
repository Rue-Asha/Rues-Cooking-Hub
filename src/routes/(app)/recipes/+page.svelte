<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import type { Snapshot } from './$types';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';
	import { COPY } from '#lib/copy.ts';
	import { flipOptions, reducedMotion, rise, stagger } from '#lib/motion.ts';
	import FeaturedStack from '#lib/recipes/FeaturedStack.svelte';
	import FilterBar from '#lib/recipes/FilterBar.svelte';
	import { hasFilters, toSearch, type ParsedQuery } from '#lib/recipes/query.ts';
	import RecipeCard from '#lib/recipes/RecipeCard.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

	let { data } = $props();

	let featuredIndex = $state(0);
	let handoff = $state<number | null>(null);

	// back from a recipe opened in the stack: the same card is in front and takes the hero back
	export const snapshot: Snapshot<{ index: number; handoff: number | null }> = {
		capture: () => ({ index: featuredIndex, handoff }),
		restore: (s) => ({ index: featuredIndex, handoff } = s)
	};

	const recipesLabel = (n: number) => (n === 1 ? '1 recipe' : `${n} recipes`);

	const filtered = $derived(hasFilters(data.query));
	const selected = $derived(data.tags.filter((t) => data.query.tagIds.includes(t.id)).map((t) => t.name));

	// The first cards rise in through CSS, so the entrance plays before hydration; cards that arrive later use rise().
	let intro = $state(true);
	beforeNavigate(() => (intro = false));
	// fixed per card: a delay that changed on reorder would push a finished entrance back into its delay
	const introDelay = new Map(untrack(() => data.recipes).map((r, i) => [r.id, stagger(i)]));

	let arrivals = 0;
	function arrival() {
		if (arrivals++ === 0) queueMicrotask(() => (arrivals = 0));
		return { delay: 160 + stagger(arrivals - 1), y: 20 };
	}

	// Svelte pins a leaving card with an inline translate before this runs; keep it or the card jumps to the grid's corner
	function leave(node: Element): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		const pinned = (node as HTMLElement).style.transform;
		return {
			duration: 220,
			easing: cubicOut,
			css: (t) => `transform: ${pinned} scale(${(0.92 + 0.08 * t).toFixed(3)}); opacity: ${t}`
		};
	}

	function navigate(next: ParsedQuery, replace = false) {
		goto(`/recipes${toSearch(next)}`, { replace, reset: false });
	}

	function clear() {
		navigate({ ...data.query, tagIds: [], favouritesOnly: false, q: '' });
	}
</script>

<svelte:head>
	<title>Recipes · Rues Cooking Hub</title>
</svelte:head>

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={data.total > 0 ? ['Archive', recipesLabel(data.total)] : ['Archive']} />
			<h1>Recipes worth <em>keeping</em></h1>
		</div>
		<a class="tags-link wide" href="/recipes/tags"><Icon name="edit" size={16} /> Manage tags</a>
		<IconButton class="add" variant="dark" icon="plus" label="Add recipe" href="/recipes/new" />
	</header>

	{#if data.total === 0}
		<section class="empty" aria-labelledby="empty-title">
			<div class="empty-text">
				<h2 id="empty-title" data-section-heading>Start your archive</h2>
				<p>Import a recipe from any web page, or write down one you know by heart.</p>
				<Button href="/recipes/new">Add your first recipe</Button>
			</div>
			<div class="empty-art"><ImagePlaceholder size="hero" label="Your first recipe goes here" /></div>
		</section>
	{:else}
		{#if data.featured.length > 0}
			<FeaturedStack recipes={data.featured} bind:index={featuredIndex} bind:handoff />
		{/if}
		<section class="archive" aria-labelledby="all-title">
			<div class="section-head">
				<h2 id="all-title" data-section-heading>All recipes</h2>
				<a class="tags-link narrow" href="/recipes/tags"><Icon name="edit" size={16} /> Manage tags</a>
			</div>

			<FilterBar tags={data.tags} query={data.query} onquery={navigate} />

			<div class="count-row">
				<p class="count" role="status">
					{#key data.recipes.length}<span class="n" in:rise={{ y: 8 }}>{data.recipes.length}</span>{/key}
					{data.recipes.length === 1 ? 'recipe' : 'recipes'}
				</p>
				{#if selected.length > 0}<p class="context"><span>in</span> {selected.join(', ')}</p>{/if}
				{#if data.query.q.trim()}<p class="context"><span>for</span> “{data.query.q.trim()}”</p>{/if}
				{#if filtered && data.recipes.length > 0}
					<button type="button" class="clear" onclick={clear}>Clear filters</button>
				{/if}
			</div>

			{#if data.recipes.length === 0}
				<div class="no-match" in:rise={{ delay: 120 }}>
					<p class="no-match-title">{COPY.noMatch}</p>
					<p>Try fewer tags or a different word.</p>
					<Button variant="secondary" onclick={clear}>Clear filters</Button>
				</div>
			{/if}

			<ul class="grid" class:intro aria-label="Recipes">
				{#each data.recipes as recipe (recipe.id)}
					<li
						class:handoff={handoff === recipe.id}
						style:--delay="{introDelay.get(recipe.id) ?? 0}ms"
						animate:flip={flipOptions()}
						in:rise={arrival()}
						out:leave
					>
						<RecipeCard {recipe} />
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-8);
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-5);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
	}

	.head :global(.add) {
		display: none;
	}

	.tags-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-block-size: 44px;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink-2);
		transition: color var(--d-fast) var(--ease-out);
	}

	.tags-link:hover {
		color: var(--ink);
	}

	.tags-link.narrow {
		display: none;
	}

	.section-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.archive {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}

	.count-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0 6px;
		min-block-size: 44px;
		font-size: 14px;
	}

	.count {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.context {
		font-weight: 600;
	}

	.context span {
		font-weight: 400;
		color: var(--ink-2);
	}

	.clear {
		min-block-size: 44px;
		margin-inline-start: var(--s-2);
		padding: 0 4px;
		border: 0;
		background: none;
		font-size: 14px;
		font-weight: 500;
		color: var(--brick);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.no-match {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-2);
		padding: var(--s-9) var(--s-5);
		border-radius: var(--r-panel);
		border: 1px dashed var(--line);
		text-align: center;
		color: var(--ink-2);
	}

	.no-match-title {
		font-family: var(--font-display);
		font-size: var(--t-display-3);
		font-weight: 300;
		color: var(--ink);
	}

	.no-match :global(.btn) {
		margin-block-start: var(--s-4);
	}

	.grid {
		position: relative;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--s-5) var(--s-4);
	}

	.grid > li {
		display: flex;
		flex-direction: column;
	}

	.grid > li > :global(.card) {
		flex: 1;
	}

	.grid > li.handoff :global(.media) {
		view-transition-name: none;
	}

	.grid.intro > li,
	.empty > * {
		animation: rise-in var(--d-slow) var(--ease-out) var(--delay, 0ms) backwards;
	}

	.empty-art {
		--delay: 90ms;
	}

	@keyframes rise-in {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.grid.intro > li,
		.empty > * {
			animation: none;
		}
	}

	.n {
		display: inline-block;
	}

	.empty {
		display: grid;
		grid-template-columns: 5fr 7fr;
		align-items: center;
		gap: var(--s-8);
	}

	.empty-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-4);
	}

	.empty-text h2 {
		font-size: var(--t-display-2);
	}

	.empty-text p {
		max-inline-size: 36ch;
		margin-block-end: var(--s-3);
		color: var(--ink-2);
	}

	.empty-art {
		aspect-ratio: 16 / 10;
		border-radius: var(--r-frame);
		overflow: hidden;
		box-shadow: var(--shadow-card);
	}

	@media (max-width: 1023px) {
		.page {
			gap: var(--s-7);
		}

		.head {
			align-items: flex-start;
		}

		.head :global(.add) {
			display: inline-grid;
		}

		.tags-link.wide {
			display: none;
		}

		.tags-link.narrow {
			display: inline-flex;
		}

		.grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--s-3);
		}

		.empty {
			grid-template-columns: 1fr;
			gap: var(--s-6);
		}

		.empty-art {
			order: -1;
			aspect-ratio: 4 / 3;
			border-radius: var(--r-panel);
		}
	}
</style>
