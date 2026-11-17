<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '#lib/components/button/Button.svelte';
	import EmptyState from '#lib/components/empty-state/EmptyState.svelte';
	import { COPY } from '#lib/copy.ts';
	import { flipOnPage } from '#lib/motion.ts';
	import { pill } from '#lib/shell/pill.ts';
	import { useStage } from '#lib/shell/stage.svelte.ts';
	import { switchStatus, toSpotSearch } from '#lib/spots/query.ts';
	import SpotCard from '#lib/spots/SpotCard.svelte';
	import SpotFilters from '#lib/spots/SpotFilters.svelte';
	import type { SpotQuery, SpotStatus } from '#lib/types.ts';

	let { data } = $props();

	const places = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'place' : 'places'}`;
	// the first listed spot with a photo is the stage
	useStage(() => {
		const id = data.spots.find((s) => s.imageId != null)?.imageId;
		return id == null ? null : `/images/${id}`;
	});
	const total = $derived(data.totals.visited + data.totals.want);
	const sides: { status: SpotStatus; label: string }[] = [
		{ status: 'visited', label: 'Visited' },
		{ status: 'want', label: 'Want to go' }
	];
	const emptySide = $derived(
		data.query.status === 'visited' ? 'No visited spots yet.' : 'Nothing on your want-to-go list yet.'
	);

	// the page settles in on a full page load only, never on in-app navigation
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');

	function clear() {
		navigate({ ...data.query, q: '', tagIds: [], city: null, price: null });
	}

	function navigate(next: SpotQuery, replace = false) {
		goto(`/eating-out${toSpotSearch(next)}`, { replace, reset: false });
	}
</script>

<svelte:head>
	<title>Eating Out · Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker">
			<li>Spots</li>
			{#if total > 0}<li>{places(total)}</li>{/if}
		</ul>
		<h1>Eating <em class="accent-word">Out</em></h1>
		<p class="lede">The places you loved, and the ones you still want to try.</p>
		<div class="lead-actions">
			<Button variant="primary" arrow href="/eating-out/new">Add spot</Button>
		</div>
	</div>
	{#if total > 0}
		<ul class="screen-facts" data-surface="inverse" aria-label="Spot totals">
			<li><span class="n">{data.totals.visited.toLocaleString('en-GB')}</span>Visited</li>
			<li><span class="n">{data.totals.want.toLocaleString('en-GB')}</span>Want to go</li>
		</ul>
	{/if}
</header>

{#snippet segment()}
	<div class="seg-host">
		<div class="segment" role="group" aria-label="Status" data-pill use:pill>
			{#each sides as side (side.status)}
				<button
					type="button"
					aria-pressed={data.query.status === side.status}
					onclick={() => navigate(switchStatus(data.query, side.status, data.explicitSort))}
				>
					{side.label}
					<span class="n">{data.counts[side.status]}</span>
				</button>
			{/each}
		</div>
	</div>
{/snippet}

<div class="screen-body" data-settle={settle ? '' : undefined}>
	{#if total === 0}
		<EmptyState title="Start your list" body="Keep the places you loved, and the ones you still want to try.">
			{#snippet action()}<Button variant="primary" arrow href="/eating-out/new">Add spot</Button>{/snippet}
		</EmptyState>
	{:else}
		<section class="card all" data-surface="solid" aria-label="Eating Out list">
			<div class="card-head">
				<h2>Your spots</h2>
				<span class="card-note" role="status">{places(data.spots.length)}</span>
			</div>

			{#if data.totals[data.query.status] === 0}
				{@render segment()}
				<div class="none">
					<p class="none-title">{emptySide}</p>
					<Button href="/eating-out/new">Add spot</Button>
				</div>
			{:else}
				<SpotFilters facets={data.facets} query={data.query} onquery={navigate} {segment} />
				{#if data.spots.length === 0}
					<div class="none">
						<h3 class="none-title">{COPY.spotsNoMatch}</h3>
						<p>Try fewer tags or a different word.</p>
						<Button onclick={clear}>Clear filters</Button>
					</div>
				{:else}
					<ul class="list" aria-label="Spots">
						{#each data.spots as spot (spot.id)}
							<li animate:flipOnPage>
								<SpotCard {spot} />
							</li>
						{/each}
					</ul>
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
	.seg-host {
		justify-self: start;
		max-inline-size: 100%;
		border-radius: var(--radius-pill);
		background: var(--surface-sunken);
	}
	.segment {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-1);
		border-radius: var(--radius-pill);
	}
	.segment button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-5);
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		white-space: nowrap;
	}
	.segment button[aria-pressed='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.segment .n {
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
		opacity: 0.75;
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
	.none {
		display: grid;
		gap: var(--space-2);
		justify-items: start;
		padding: var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	.none-title {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.none p:not(.none-title) {
		color: var(--ink-secondary);
	}
	@media (max-width: 767px) {
		.seg-host {
			justify-self: stretch;
		}
		.segment button {
			flex: 1;
		}
	}
</style>
