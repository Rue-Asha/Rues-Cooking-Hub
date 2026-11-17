<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Snapshot } from './$types';
	import { tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import EmptyState from '#lib/components/empty-state/EmptyState.svelte';
	import { COPY } from '#lib/copy.ts';
	import { flipOnPage } from '#lib/motion.ts';
	import FeaturedStack from '#lib/recipes/FeaturedStack.svelte';
	import FilterBar from '#lib/recipes/FilterBar.svelte';
	import { hasFilters, toSearch, type ParsedQuery } from '#lib/recipes/query.ts';
	import RecipeCard from '#lib/recipes/RecipeCard.svelte';
	import { useStage } from '#lib/shell/stage.svelte.ts';

	let { data } = $props();

	const PAGE = 24;

	let featuredIndex = $state(0);
	// the featured recipe's photo is the stage, as signed; without one, the first shown recipe that has a photo
	useStage(() => {
		const id = data.featured[featuredIndex]?.imageId ?? data.featured.find((r) => r.imageId != null)?.imageId;
		return id == null ? null : `/images/${id}`;
	});
	let handoff = $state<number | null>(null);

	// Back from a recipe: the same recipe is in front of the stack and takes the hero back, and the list shows as many
	// rows as before. SvelteKit scrolls before it restores, so the scroll is taken again once the rows are back.
	export const snapshot: Snapshot<{ index: number; handoff: number | null; paged: { key: string; shown: number }; y: number }> = {
		capture: () => ({ index: featuredIndex, handoff, paged, y: window.scrollY }),
		restore: async (s) => {
			({ index: featuredIndex, handoff } = s);
			// a reload or a fresh visit starts the list at PAGE again; only Back keeps the rows
			if (settle) return;
			paged = s.paged;
			await tick();
			if (s.paged.shown > PAGE) scrollTo({ top: s.y, behavior: 'instant' });
		}
	};

	const plural = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'recipe' : 'recipes'}`;
	const filtered = $derived(hasFilters(data.query));
	const selected = $derived(data.tags.filter((t) => data.query.tagIds.includes(t.id)).map((t) => t.name));
	const where = $derived(
		[
			selected.length ? `in ${selected.join(', ')}` : data.query.favouritesOnly ? 'in Favourites' : '',
			data.query.q.trim() ? `for “${data.query.q.trim()}”` : ''
		]
			.filter(Boolean)
			.join(' ')
	);

	// the page settles in on a full page load only: the server-rendered page, never one mounted by in-app navigation
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');

	// how many rows are shown; any other filter, search or sort starts at PAGE again
	const queryKey = $derived(toSearch(data.query));
	let paged = $state({ key: '', shown: PAGE });
	// forget the paging as soon as the query changes, so coming back to an earlier query starts at PAGE as well
	$effect.pre(() => {
		if (paged.key !== queryKey) paged = { key: queryKey, shown: PAGE };
	});
	const limit = $derived(paged.key === queryKey ? paged.shown : PAGE);
	const rows = $derived(data.recipes.slice(0, limit));
	let listEl = $state<HTMLUListElement>();

	async function more() {
		const before = rows.length;
		paged = { key: queryKey, shown: limit + PAGE };
		await tick();
		listEl?.querySelectorAll('li')[before]?.querySelector('a')?.focus();
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

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker">
			<li>Archive</li>
			{#if data.total > 0}<li>{plural(data.total)}</li>{/if}
		</ul>
		<h1>Recipes worth <em class="accent-word">keeping</em></h1>
		<p class="lede">Search by name, ingredient or tag, or open one of the newest.</p>
		<div class="lead-actions">
			<Button variant="primary" arrow href="/recipes/new">Add recipe</Button>
			<Button href="/recipes/tags">Manage tags</Button>
		</div>
	</div>
	{#if data.total > 0}
		<ul class="screen-facts" data-surface="inverse" aria-label="Your archive">
			<li class="facts-caption" aria-hidden="true">Whole archive</li>
			<li><span class="n">{data.total.toLocaleString('en-GB')}</span>{data.total === 1 ? 'Recipe' : 'Recipes'}</li>
			<li><span class="n">{data.tags.length.toLocaleString('en-GB')}</span>{data.tags.length === 1 ? 'Tag' : 'Tags'}</li>
		</ul>
	{/if}
</header>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	{#if data.total === 0}
		<EmptyState title="Start your archive" body="Import a recipe from any web page, or write down one you know by heart.">
			{#snippet action()}<Button variant="primary" arrow href="/recipes/new">Add your first recipe</Button>{/snippet}
		</EmptyState>
	{:else}
		{#if data.featured.length > 0}
			<FeaturedStack recipes={data.featured} bind:index={featuredIndex} bind:handoff />
		{/if}

		<section class="card all" data-surface="solid" aria-labelledby="all-title">
			<div class="card-head">
				<h2 id="all-title">All recipes</h2>
				<span class="card-note"><span role="status">{plural(data.recipes.length)}</span>{where ? ` ${where}` : ''}</span>
			</div>

			<FilterBar tags={data.tags} query={data.query} onquery={navigate} />

			{#if filtered && data.recipes.length > 0}
				<div class="clear"><Button variant="quiet" size="s" onclick={clear}>Clear filters</Button></div>
			{/if}

			{#if data.recipes.length === 0}
				<div class="none">
					<h3>{COPY.noMatch}</h3>
					<p>Try fewer tags or a different word.</p>
					<Button onclick={clear}>Clear filters</Button>
				</div>
			{:else}
				<ul class="list" aria-label="Recipes" bind:this={listEl}>
					{#each rows as recipe (recipe.id)}
						<li animate:flipOnPage>
							<RecipeCard {recipe} named={handoff !== recipe.id} />
						</li>
					{/each}
				</ul>
				{#if data.recipes.length > rows.length}
					<div class="paging">
						<span class="card-note">Showing {rows.length.toLocaleString('en-GB')} of {data.recipes.length.toLocaleString('en-GB')}</span>
						<Button onclick={more}>Show {Math.min(PAGE, data.recipes.length - rows.length)} more</Button>
					</div>
				{/if}
			{/if}
		</section>
	{/if}
</div>

<style>
	.lead-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-1);
	}
	.all {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.list > li {
		min-inline-size: 0;
	}
	.clear {
		justify-self: start;
	}
	.paging {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.none {
		display: grid;
		gap: var(--space-2);
		justify-items: start;
		padding: var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	.none h3 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.none p {
		color: var(--ink-secondary);
	}
</style>
