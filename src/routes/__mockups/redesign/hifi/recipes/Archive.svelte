<script lang="ts">
	import type { MockRecipe, MockTag } from '../../fixtures.ts';
	import Button from '../shell/Button.svelte';
	import Field from '../form/Field.svelte';
	import Select from '../form/Select.svelte';
	import Featured from './Featured.svelte';
	import Ic from './Ic.svelte';
	import RecipeRow from './RecipeRow.svelte';
	import { go, lang, plural, total } from './util.ts';

	type Sort = 'newest' | 'title' | 'time';
	type Start = { selected?: string[]; fav?: boolean; q?: string; sort?: Sort; expanded?: boolean; limit?: number; featured?: number };
	type Props = { all: MockRecipe[]; tags: MockTag[]; start?: Start; worst?: boolean; featured?: number };
	let { all, tags, start = {}, worst = false, featured = $bindable(0) }: Props = $props();

	const uid = $props.id();
	const COLLAPSED = 8;
	const PAGE = 24;
	// what the person changed on this page; until then the start values (the states page) apply
	let ui = $state<Start>({});
	const selected = $derived(ui.selected ?? start.selected ?? []);
	const fav = $derived(ui.fav ?? start.fav ?? false);
	const q = $derived(ui.q ?? start.q ?? '');
	const sort = $derived(ui.sort ?? start.sort ?? 'newest');
	const expanded = $derived(ui.expanded ?? start.expanded ?? false);
	const limit = $derived(ui.limit ?? start.limit ?? PAGE);
	let flipped = $state<Record<number, boolean>>({});

	const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const isFav = (r: MockRecipe) => flipped[r.id] ?? r.favourite;
	const active = $derived(selected.length > 0 || fav || q.trim() !== '');
	const matches = $derived.by(() => {
		const needle = fold(q.trim());
		const found = all.filter(
			(r) =>
				(!fav || isFav(r)) &&
				selected.every((t) => r.tags.includes(t)) &&
				(needle === '' || fold([r.title, r.description ?? '', ...r.tags].join(' ')).includes(needle))
		);
		if (sort === 'title') return [...found].sort((a, b) => fold(a.title).localeCompare(fold(b.title)));
		if (sort === 'time') return [...found].sort((a, b) => (total(a.prepMinutes, a.cookMinutes) ?? Infinity) - (total(b.prepMinutes, b.cookMinutes) ?? Infinity));
		return found;
	});
	const ordered = $derived([...tags].sort((a, b) => a.name.localeCompare(b.name)));
	// a selected tag outside the first eight stays in view while the filter is collapsed
	const visibleTags = $derived(expanded ? ordered : ordered.filter((t, i) => i < COLLAPSED || selected.includes(t.name)));
	const rows = $derived(matches.slice(0, limit));
	const where = $derived(
		[selected.length ? `in ${selected.join(', ')}` : '', fav && !selected.length ? 'in Favourites' : '', q.trim() ? `for “${q.trim()}”` : ''].filter(Boolean).join(' ')
	);

	function toggle(name: string) {
		ui = { ...ui, selected: selected.includes(name) ? selected.filter((t) => t !== name) : [...selected, name], limit: PAGE };
	}
	function clear() {
		ui = { selected: [], fav: false, q: '', limit: PAGE };
	}
</script>

{#if all.length === 0}
	<section class="card empty" data-surface="solid" aria-labelledby="{uid}-empty">
		<h2 id="{uid}-empty">Start your archive</h2>
		<p>Import a recipe from any web page, or write down one you know by heart.</p>
		<Button variant="primary" arrow href={go.import(worst)}>Add your first recipe</Button>
	</section>
{:else}
	<Featured recipes={all} bind:index={featured} {worst} />

	<section class="card all" data-surface="solid" aria-labelledby="{uid}-all">
		<div class="card-head">
			<h2 id="{uid}-all">All recipes</h2>
			<span class="card-note" role="status">{plural(matches.length, 'recipe')}{where ? ` ${where}` : ''}</span>
		</div>

		<div class="tools">
			<Field label="Search recipes" hideLabel type="search" placeholder="Search recipes or ingredients" autocomplete="off" value={q} oninput={(e) => (ui = { ...ui, q: e.currentTarget.value, limit: PAGE })}>
				{#snippet prefix()}<Ic name="search" />{/snippet}
			</Field>
			<Select label="Sort recipes" hideLabel value={sort} onchange={(e) => (ui = { ...ui, sort: e.currentTarget.value as Sort, limit: PAGE })}>
				<option value="newest">Newest first</option>
				<option value="title">Title A–Z</option>
				<option value="time">Total time</option>
			</Select>
		</div>

		<div class="filter" role="group" aria-label="Filter by tag">
			<div class="chips">
				<button type="button" class="chip" aria-pressed={fav} data-press onclick={() => (ui = { ...ui, fav: !fav, limit: PAGE })}>
					{#if fav}<Ic name="check" size={16} />{/if}Favourites
				</button>
				{#each visibleTags as tag (tag.name)}
					<button type="button" class="chip" aria-pressed={selected.includes(tag.name)} data-press title={tag.name} lang={lang(tag.name)} onclick={() => toggle(tag.name)}>
						{#if selected.includes(tag.name)}<Ic name="check" size={16} />{/if}<span class="t">{tag.name}</span><span class="c">{tag.count.toLocaleString('en-GB')}</span>
					</button>
				{/each}
			</div>
			{#if ordered.length > COLLAPSED}
				<Button variant="quiet" size="s" aria-expanded={expanded} onclick={() => (ui = { ...ui, expanded: !expanded })}>
					{expanded ? 'Show fewer tags' : `Show all ${ordered.length.toLocaleString('en-GB')} tags`}
				</Button>
			{/if}
		</div>

		{#if active && matches.length > 0}
			<div class="clear"><Button variant="quiet" size="s" onclick={clear}>Clear filters</Button></div>
		{/if}

		{#if matches.length === 0}
			<div class="none">
				<h3>No recipes match</h3>
				<p>Try fewer tags or a different word.</p>
				<Button onclick={clear}>Clear filters</Button>
			</div>
		{:else}
			<ul class="list" aria-label="Recipes">
				{#each rows as recipe (recipe.id)}
					<RecipeRow {recipe} favourite={isFav(recipe)} ontoggle={() => (flipped = { ...flipped, [recipe.id]: !isFav(recipe) })} {worst} />
				{/each}
			</ul>
			{#if matches.length > rows.length}
				<div class="paging">
					<span class="card-note">Showing {rows.length.toLocaleString('en-GB')} of {matches.length.toLocaleString('en-GB')}</span>
					<Button onclick={() => (ui = { ...ui, limit: limit + PAGE })}>Show {Math.min(PAGE, matches.length - rows.length)} more</Button>
				</div>
			{/if}
		{/if}
	</section>
{/if}

<style>
	.empty {
		display: grid;
		gap: var(--space-3);
		justify-items: start;
		padding: var(--space-6);
	}
	.empty p {
		max-inline-size: var(--measure);
		color: var(--ink-secondary);
	}
	.empty h2,
	.none h3 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.all {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.tools {
		display: grid;
		gap: var(--space-2);
		min-inline-size: 0;
	}
	.filter {
		display: grid;
		gap: var(--space-1);
		justify-items: start;
		min-inline-size: 0;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3-5);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-align: start;
	}
	.chip .t {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.chip .c {
		color: var(--ink-secondary);
		font-weight: var(--weight-regular);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.chip[aria-pressed='true'] {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}
	@media (hover: hover) {
		.chip:not([aria-pressed='true']):hover {
			background: var(--surface-sunken);
		}
	}
	.list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
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
	.none p {
		color: var(--ink-secondary);
	}
	@media (min-width: 768px) {
		.tools {
			grid-template-columns: minmax(0, 1fr) 14rem;
			align-items: end;
		}
	}
</style>
