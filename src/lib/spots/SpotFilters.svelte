<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount, untrack, type Snippet } from 'svelte';
	import { flip } from 'svelte/animate';
	import { flipOptions } from '#lib/motion.ts';
	import type { Price, SpotFacets, SpotQuery, SpotSort } from '#lib/types.ts';
	import Chip from '#lib/ui/Chip.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { PRICES, priceText } from './format.ts';
	import { SPOT_SORTS, sortsFor } from './query.ts';

	let {
		facets,
		query,
		onquery,
		segment
	}: {
		facets: SpotFacets;
		query: SpotQuery;
		onquery: (next: SpotQuery, replace?: boolean) => void;
		segment: Snippet;
	} = $props();

	// Selected tags lead the row so they are in view after a reload or Back; the order is taken once, because a chip
	// that jumped to the front on click would leave the pointer and slide across its neighbours.
	const lead = untrack(() => query.tagIds);
	const rank = (id: number) => (lead.includes(id) ? 0 : 1);
	const chips = $derived([...facets.tags].sort((a, b) => rank(a.id) - rank(b.id)));

	let q = $state(untrack(() => query.q));
	// what this field last put into the URL; any other incoming value (Back, Clear filters) replaces the text
	let sent = untrack(() => query.q);
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const incoming = query.q;
		if (incoming !== sent) {
			clearTimeout(timer);
			sent = incoming;
			q = incoming;
		}
	});

	function search() {
		clearTimeout(timer);
		timer = setTimeout(() => {
			sent = q;
			onquery({ ...query, q }, true);
		}, 200);
	}

	function toggleTag(id: number) {
		const tagIds = query.tagIds.includes(id) ? query.tagIds.filter((t) => t !== id) : [...query.tagIds, id];
		onquery({ ...query, tagIds });
	}

	let input: HTMLInputElement;
	// Kit resets focus after a navigation, so the focus waits for it
	const focusSearch = () => {
		if (location.hash === '#search') setTimeout(() => input.focus());
	};
	onMount(focusSearch);
	afterNavigate(focusSearch);

	const sortLabel = $derived(SPOT_SORTS.find((s) => s.id === query.sort)?.label);
	const sorts = $derived(SPOT_SORTS.filter((s) => sortsFor(query.status).includes(s.id)));
	const cityName = $derived(facets.cities.find((c) => c.key === query.city)?.name ?? 'All');
</script>

<svelte:window onhashchange={focusSearch} />

<div class="controls">
	{@render segment()}
	<label class="search">
		<Icon name="search" size={18} />
		<span class="visually-hidden">Search spots</span>
		<input id="search" type="search" placeholder="Search spots, areas or tags" bind:this={input} bind:value={q} oninput={search} />
	</label>
	<label class="select sort">
		<Icon name="sort" size={18} />
		<span class="select-label" aria-hidden="true">{sortLabel}</span>
		<Icon name="chevron-down" size={16} />
		<select aria-label="Sort spots" onchange={(e) => onquery({ ...query, sort: e.currentTarget.value as SpotSort })}>
			{#each sorts as s (s.id)}<option value={s.id} selected={s.id === query.sort}>{s.label}</option>{/each}
		</select>
	</label>
</div>

<div class="chips" role="group" aria-label="Filter spots">
	{#each chips as tag (tag.id)}
		<span class="chip-slot" animate:flip={flipOptions()}>
			<Chip label={tag.name} active={query.tagIds.includes(tag.id)} onclick={() => toggleTag(tag.id)} />
		</span>
	{/each}
	{#if chips.length > 0 && facets.cities.length > 0}<span class="rule" aria-hidden="true"></span>{/if}
	{#if facets.cities.length > 0}
		<label class="select city">
			<span aria-hidden="true">City: {cityName}</span>
			<Icon name="chevron-down" size={16} />
			<select aria-label="City" onchange={(e) => onquery({ ...query, city: e.currentTarget.value || null })}>
				<option value="" selected={query.city === null}>All cities</option>
				{#each facets.cities as c (c.key)}<option value={c.key} selected={c.key === query.city}>{c.name}</option>{/each}
			</select>
		</label>
	{/if}
	{#if chips.length > 0 || facets.cities.length > 0}<span class="rule" aria-hidden="true"></span>{/if}
	{#each PRICES as p (p.id)}
		<Chip
			label={priceText(p.id)}
			active={query.price === p.id}
			onclick={() => onquery({ ...query, price: query.price === p.id ? null : (p.id as Price) })}
		/>
	{/each}
</div>

<style>
	.controls {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-inline-size: 0;
		min-block-size: 44px;
		padding: 0 var(--s-4);
		margin-inline-start: auto;
		max-inline-size: 360px;
		border-radius: var(--r-pill);
		background: var(--surface);
		border: 1px solid var(--line);
		color: var(--ink-2);
		transition: border-color var(--d-fast) var(--ease-out);
	}

	.search:focus-within {
		border-color: var(--olive);
	}

	.search input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: transparent;
		font-size: 14px;
		color: var(--ink);
	}

	.search input:focus-visible {
		box-shadow: none;
	}

	.search input::placeholder {
		color: var(--ink-2);
	}

	.select {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex: none;
		min-block-size: 44px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
	}

	.select:has(select:focus-visible) {
		box-shadow: var(--focus-ring);
	}

	/* the native picker sits invisibly over the pill, so phone and keyboard get the system list */
	.select select {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		opacity: 0;
		cursor: pointer;
		font-size: 16px;
	}

	/* wide screens wrap, so the city and price filters never hide behind a long tag row */
	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
		scrollbar-width: none;
		/* room for the focus ring inside the scroller */
		padding-block: 4px;
		margin-block: -4px;
	}

	.chip-slot {
		display: flex;
		flex: none;
	}

	.chips :global(.chip) {
		flex: none;
	}

	.rule {
		flex: none;
		inline-size: 1px;
		block-size: 24px;
		margin-inline: var(--s-2);
		background: var(--line);
	}

	@media (max-width: 1023px) {
		.controls {
			flex-wrap: wrap;
		}

		.search {
			margin-inline-start: 0;
			max-inline-size: none;
		}

		.select-label {
			display: none;
		}

		.chips {
			flex-wrap: nowrap;
			overflow-x: auto;
			margin-inline: calc(-1 * var(--gutter));
			padding-inline: var(--gutter);
		}
	}
</style>
