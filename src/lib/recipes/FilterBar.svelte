<script lang="ts">
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { flipOptions } from '#lib/motion.ts';
	import type { ArchiveSort, TagWithCount } from '#lib/types.ts';
	import Chip from '#lib/ui/Chip.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { SORTS, toggleTag, type ParsedQuery } from './query.ts';

	let {
		tags,
		query,
		onquery
	}: { tags: TagWithCount[]; query: ParsedQuery; onquery: (next: ParsedQuery, replace?: boolean) => void } = $props();

	// Selected tags lead the row so they are in view after a reload or Back; the order is taken once, because a chip
	// that jumped to the front on click would leave the pointer and slide across its neighbours.
	const lead = untrack(() => query.tagIds);
	const rank = (id: number) => (lead.includes(id) ? 0 : 1);
	// unused tags would only lead to an empty grid
	const chips = $derived(
		tags.filter((t) => t.count > 0 || query.tagIds.includes(t.id)).sort((a, b) => rank(a.id) - rank(b.id))
	);

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

	const sortLabel = $derived(SORTS.find((s) => s.id === query.sort)?.label);
</script>

<div class="filters">
	<div class="chips" role="group" aria-label="Filter by tag">
		<Chip
			label="Favourites"
			icon="heart"
			active={query.favouritesOnly}
			onclick={() => onquery({ ...query, favouritesOnly: !query.favouritesOnly })}
		/>
		{#each chips as tag (tag.id)}
			<span class="chip-slot" animate:flip={flipOptions()}>
				<Chip
					label={tag.name}
					count={tag.count}
					active={query.tagIds.includes(tag.id)}
					onclick={() => onquery(toggleTag(query, tag.id))}
				/>
			</span>
		{/each}
	</div>
	<label class="search">
		<Icon name="search" size={18} />
		<span class="visually-hidden">Search recipes</span>
		<input type="search" placeholder="Search recipes or ingredients" bind:value={q} oninput={search} />
	</label>
	<label class="sort">
		<Icon name="sort" size={18} />
		<span class="sort-label" aria-hidden="true">{sortLabel}</span>
		<Icon name="chevron-down" size={16} />
		<select
			aria-label="Sort recipes"
			onchange={(e) => onquery({ ...query, sort: e.currentTarget.value as ArchiveSort })}
		>
			{#each SORTS as s (s.id)}<option value={s.id} selected={s.id === query.sort}>{s.label}</option>{/each}
		</select>
	</label>
</div>

<style>
	.filters {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	.chips {
		display: flex;
		gap: var(--s-2);
		flex: 1;
		min-inline-size: 0;
		overflow-x: auto;
		scrollbar-width: none;
		/* room for the focus ring inside the scroller */
		padding-block: 4px;
		margin-block: -4px;
		mask-image: linear-gradient(90deg, var(--ink) 88%, transparent);
	}

	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
		inline-size: 280px;
		min-block-size: 44px;
		padding: 0 var(--s-4);
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

	.sort {
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
	}

	.sort:has(select:focus-visible) {
		box-shadow: var(--focus-ring);
	}

	/* the native picker sits invisibly over the pill, so phone and keyboard get the system list */
	.sort select {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		opacity: 0;
		cursor: pointer;
		font-size: 16px;
	}

	.chip-slot {
		display: flex;
		flex: none;
	}

	@media (max-width: 1023px) {
		.filters {
			flex-wrap: wrap;
		}

		.chips {
			flex: 0 0 100%;
			margin-inline: calc(-1 * var(--gutter));
			padding-inline: var(--gutter);
			mask-image: none;
		}

		.search {
			flex: 1;
			inline-size: auto;
		}

		.sort-label {
			display: none;
		}
	}
</style>
