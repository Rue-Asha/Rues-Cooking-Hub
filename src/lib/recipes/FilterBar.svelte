<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import Select from '#lib/components/select/Select.svelte';
	import { flipOptions } from '#lib/motion.ts';
	import type { ArchiveSort, TagWithCount } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { SORTS, toggleTag, type ParsedQuery } from './query.ts';

	let {
		tags,
		query,
		onquery
	}: { tags: TagWithCount[]; query: ParsedQuery; onquery: (next: ParsedQuery, replace?: boolean) => void } = $props();

	const COLLAPSED = 8;
	const sortLabel: Partial<Record<ArchiveSort, string>> = { time: 'Total time' };

	// unused tags would only lead to an empty list
	const used = $derived(tags.filter((t) => t.count > 0 || query.tagIds.includes(t.id)));
	let expanded = $state(false);
	// a selected tag outside the first eight stays where it sits in the tag order while the filter is collapsed
	const chips = $derived(expanded ? used : used.filter((t, i) => i < COLLAPSED || query.tagIds.includes(t.id)));

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

	const lang = (text: string) => (/[^\u0000-ɏ]/.test(text) ? 'und' : undefined);
</script>

<div class="tools">
	<Field label="Search recipes" hideLabel type="search" placeholder="Search recipes or ingredients" autocomplete="off" bind:value={q} oninput={search}>
		{#snippet prefix()}<Icon name="search" size={18} stroke={1.75} />{/snippet}
	</Field>
	<Select label="Sort recipes" hideLabel value={query.sort} onchange={(e) => onquery({ ...query, sort: e.currentTarget.value as ArchiveSort })}>
		{#each SORTS as s (s.id)}<option value={s.id}>{sortLabel[s.id] ?? s.label}</option>{/each}
	</Select>
</div>

<div class="filter" role="group" aria-label="Filter by tag">
	<div class="chips">
		<button
			type="button"
			class="chip"
			aria-pressed={query.favouritesOnly}
			data-press
			onclick={() => onquery({ ...query, favouritesOnly: !query.favouritesOnly })}
		>
			{#if query.favouritesOnly}<Icon name="check" size={16} stroke={1.75} />{/if}Favourites
		</button>
		{#each chips as tag (tag.id)}
			{@const on = query.tagIds.includes(tag.id)}
			<span class="slot" animate:flip={flipOptions()}>
				<button type="button" class="chip" aria-pressed={on} data-press title={tag.name} lang={lang(tag.name)} onclick={() => onquery(toggleTag(query, tag.id))}>
					{#if on}<Icon name="check" size={16} stroke={1.75} />{/if}<span class="t">{tag.name}</span><span class="c">{tag.count.toLocaleString('en-GB')}</span>
				</button>
			</span>
		{/each}
	</div>
	{#if used.length > COLLAPSED}
		<Button variant="quiet" size="s" aria-expanded={expanded} onclick={() => (expanded = !expanded)}>
			{expanded ? 'Show fewer tags' : `Show all ${used.length.toLocaleString('en-GB')} tags`}
		</Button>
	{/if}
</div>

<style>
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
	@media (min-width: 768px) {
		.tools {
			grid-template-columns: minmax(0, 1fr) 14rem;
			align-items: end;
		}
	}
</style>
