<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { onMount, untrack, type Snippet } from 'svelte';
	import { flip } from 'svelte/animate';
	import { flipOptions } from '#lib/motion.ts';
	import type { Price, SpotFacets, SpotQuery, SpotSort } from '#lib/types.ts';
	import Field from '#lib/components/field/Field.svelte';
	import Select from '#lib/components/select/Select.svelte';
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

	// a search still waiting when the user leaves would navigate back here and cut that navigation short
	beforeNavigate(({ from, to }) => {
		if (to?.url.pathname !== from?.url.pathname) clearTimeout(timer);
	});

	function toggleTag(id: number) {
		const tagIds = query.tagIds.includes(id) ? query.tagIds.filter((t) => t !== id) : [...query.tagIds, id];
		onquery({ ...query, tagIds });
	}

	// Kit resets focus after a navigation, so the focus waits for it
	const focusSearch = () => {
		if (location.hash === '#search') setTimeout(() => document.getElementById('search')?.focus());
	};
	onMount(focusSearch);
	afterNavigate(focusSearch);

	const sorts = $derived(SPOT_SORTS.filter((s) => sortsFor(query.status).includes(s.id)));
	const lang = (text: string) => (/[^\u0000-ɏ]/.test(text) ? 'und' : undefined);
</script>

<svelte:window onhashchange={focusSearch} />

{@render segment()}

<div class="tools">
	<Field id="search" label="Search spots" hideLabel type="search" placeholder="Search spots, areas or tags" autocomplete="off" bind:value={q} oninput={search}>
		{#snippet prefix()}<Icon name="search" size={18} stroke={1.75} />{/snippet}
	</Field>
	<Select label="Sort spots" hideLabel value={query.sort} onchange={(e) => onquery({ ...query, sort: e.currentTarget.value as SpotSort })}>
		{#each sorts as s (s.id)}<option value={s.id}>{s.label}</option>{/each}
	</Select>
	{#if facets.cities.length > 0}
		<Select label="City" hideLabel value={query.city ?? ''} onchange={(e) => onquery({ ...query, city: e.currentTarget.value || null })}>
			<option value="">All cities</option>
			{#each facets.cities as c (c.key)}<option value={c.key}>{c.name}</option>{/each}
		</Select>
	{/if}
</div>

<div class="chips" role="group" aria-label="Filter spots">
	{#each chips as tag (tag.id)}
		{@const on = query.tagIds.includes(tag.id)}
		<span class="slot" animate:flip={flipOptions()}>
			<button type="button" class="chip" aria-pressed={on} data-press title={tag.name} lang={lang(tag.name)} onclick={() => toggleTag(tag.id)}>
				{#if on}<Icon name="check" size={16} stroke={1.75} />{/if}<span class="t">{tag.name}</span>
			</button>
		</span>
	{/each}
	{#each PRICES as p (p.id)}
		{@const on = query.price === p.id}
		<button
			type="button"
			class="chip"
			aria-pressed={on}
			data-press
			onclick={() => onquery({ ...query, price: on ? null : (p.id as Price) })}
		>
			{#if on}<Icon name="check" size={16} stroke={1.75} />{/if}{priceText(p.id)}
		</button>
	{/each}
</div>

<style>
	.tools {
		display: grid;
		gap: var(--space-2);
		min-inline-size: 0;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.slot {
		display: flex;
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target));
		min-inline-size: max(var(--control-height-s), var(--target));
		justify-content: center;
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
	.chip[aria-pressed='true'] {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}
	@media (hover: hover) {
		.chip:not([aria-pressed='true']):hover {
			background: var(--surface-sunken);
		}
	}
	/* below the desktop the search takes its own row, so its placeholder is never cut off next to two selects */
	@media (min-width: 768px) {
		.tools {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: end;
		}
		.tools > :global(:first-child) {
			grid-column: 1 / -1;
		}
	}
	@media (min-width: 1024px) {
		.tools {
			grid-template-columns: minmax(0, 1fr) 12rem 12rem;
		}
		.tools > :global(:first-child) {
			grid-column: auto;
		}
	}
</style>
