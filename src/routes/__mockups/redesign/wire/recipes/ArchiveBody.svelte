<script lang="ts">
	import type { MockRecipe, MockTag } from '../../fixtures.ts';
	import Featured from './Featured.svelte';
	import Icon from './Icon.svelte';
	import RecipeRow from './RecipeRow.svelte';
	import { plural } from './util.ts';

	type Props = {
		all: MockRecipe[];
		shown: MockRecipe[];
		tags: MockTag[];
		selected?: string[];
		fav?: boolean;
		q?: string;
		sort?: string;
		expanded?: boolean;
		limit?: number;
		featuredIndex?: number;
		worst?: boolean;
	};
	let { all, shown, tags, selected = [], fav = false, q = '', sort = 'Newest first', expanded = false, limit = 24, featuredIndex = 0, worst = false }: Props = $props();

	const uid = $props.id();
	const COLLAPSED = 8;
	const active = $derived(selected.length > 0 || fav || q.trim() !== '');
	const visibleTags = $derived(expanded ? tags : tags.slice(0, COLLAPSED));
	const rows = $derived(shown.slice(0, limit));
	const where = $derived(
		[selected.length ? `in ${selected.join(', ')}` : '', fav && !selected.length ? 'in Favourites' : '', q.trim() ? `for “${q.trim()}”` : ''].filter(Boolean).join(' ')
	);
</script>

{#if all.length === 0}
	<section class="w-card w-empty" aria-labelledby="{uid}-empty">
		<h2 id="{uid}-empty">Start your archive</h2>
		<p>Import a recipe from any web page, or write down one you know by heart.</p>
		<a class="w-btn primary" href="/__mockups/redesign/wire/import">Add your first recipe<Icon name="arrow" /></a>
	</section>
{:else}
	<Featured recipes={all} index={featuredIndex} {worst} />

	<section class="w-card" aria-labelledby="{uid}-all">
		<div class="w-card-head">
			<h2 id="{uid}-all">All recipes</h2>
			<span class="w-note" role="status">{plural(shown.length, 'recipe')}{where ? ` ${where}` : ''}</span>
		</div>

		<div class="tools">
			<div class="w-field search">
				<label class="sr-only" for="{uid}-search">Search recipes</label>
				<div class="search-box">
					<Icon name="search" />
					<input id="{uid}-search" class="w-input" type="search" value={q} placeholder="Search recipes or ingredients" autocomplete="off" />
				</div>
			</div>
			<div class="w-field sort">
				<label class="sr-only" for="{uid}-sort">Sort recipes</label>
				<select id="{uid}-sort" class="w-input">
					<option selected={sort === 'Newest first'}>Newest first</option>
					<option selected={sort === 'Title A–Z'}>Title A–Z</option>
					<option selected={sort === 'Total time'}>Total time</option>
				</select>
			</div>
		</div>

		<div class="filter" role="group" aria-label="Filter by tag">
			<div class="w-chips">
				<button type="button" class="w-chip" aria-pressed={fav}>Favourites</button>
				{#each visibleTags as tag (tag.name)}
					<button type="button" class="w-chip" aria-pressed={selected.includes(tag.name)} title={tag.name}><span class="t">{tag.name}</span><span class="c">{tag.count.toLocaleString('en')}</span></button>
				{/each}
			</div>
			{#if tags.length > COLLAPSED}
				<button type="button" class="w-btn quiet s more" aria-expanded={expanded}>{expanded ? 'Show fewer tags' : `Show all ${tags.length} tags`}</button>
			{/if}
		</div>

		{#if active && shown.length > 0}
			<div class="clear"><button type="button" class="w-btn quiet s">Clear filters</button></div>
		{/if}

		{#if shown.length === 0}
			<div class="w-empty none">
				<h2>No recipes match</h2>
				<p>Try fewer tags or a different word.</p>
				<button type="button" class="w-btn">Clear filters</button>
			</div>
		{:else}
			<ul class="list" aria-label="Recipes">
				{#each rows as recipe (recipe.id)}
					<RecipeRow {recipe} {worst} />
				{/each}
			</ul>
			{#if shown.length > rows.length}
				<div class="more-rows">
					<span class="w-note">Showing {rows.length.toLocaleString('en')} of {shown.length.toLocaleString('en')}</span>
					<button type="button" class="w-btn">Show {Math.min(limit, shown.length - rows.length)} more</button>
				</div>
			{/if}
		{/if}
	</section>
{/if}

<style>
	.tools {
		display: grid;
		gap: var(--space-2);
	}

	.search-box {
		position: relative;
		display: grid;
		align-items: center;
	}

	.search-box :global(svg) {
		position: absolute;
		inset-inline-start: var(--space-4);
		color: var(--ink-secondary);
		pointer-events: none;
	}

	.search-box .w-input {
		padding-inline-start: var(--space-10);
	}

	.filter {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
	}

	.more {
		justify-self: start;
	}

	.list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.more-rows {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.none {
		padding-inline: 0;
	}

	@media (min-width: 768px) {
		.tools {
			grid-template-columns: minmax(0, 1fr) 14rem;
		}
	}
</style>
