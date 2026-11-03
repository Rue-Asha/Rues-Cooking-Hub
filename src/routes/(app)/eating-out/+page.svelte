<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';
	import { flipOptions, reducedMotion, rise, stagger } from '#lib/motion.ts';
	import { hasSpotFilters, switchStatus, toSpotSearch } from '#lib/spots/query.ts';
	import SpotFilters from '#lib/spots/SpotFilters.svelte';
	import { COPY } from '#lib/copy.ts';
	import SpotCard from '#lib/spots/SpotCard.svelte';
	import type { SpotQuery, SpotStatus } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

	let { data } = $props();

	const places = (n: number) => (n === 1 ? '1 place' : `${n} places`);
	const total = $derived(data.totals.visited + data.totals.want);
	const sides: { status: SpotStatus; label: string }[] = [
		{ status: 'visited', label: 'Visited' },
		{ status: 'want', label: 'Want to go' }
	];
	const emptySide = $derived(
		data.query.status === 'visited' ? 'No visited spots yet.' : 'Nothing on your want-to-go list yet.'
	);

	// The first cards rise in through CSS, so the entrance plays before hydration; cards that arrive later use rise().
	let intro = $state(true);
	beforeNavigate(() => (intro = false));
	// fixed per card: a delay that changed on reorder would push a finished entrance back into its delay
	const introDelay = new Map(untrack(() => data.spots).map((s, i) => [s.id, stagger(i)]));

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

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={total > 0 ? ['Spots', places(total)] : ['Spots']} />
			<h1>Eating <em>Out</em></h1>
		</div>
		{#if total > 0}
			<div class="head-side">
				<p>
					{places(data.totals.visited)} visited, {data.totals.want} still on the want-to-go list.
				</p>
				<Button href="/eating-out/new" variant="olive" class="add">Add spot</Button>
			</div>
		{/if}
	</header>

	{#if total === 0}
		<section class="empty" aria-labelledby="empty-title">
			<div class="empty-text">
				<h2 id="empty-title" data-section-heading>Start your list</h2>
				<p>Keep the places you loved, and the ones you still want to try.</p>
				<Button href="/eating-out/new">Add spot</Button>
			</div>
			<div class="empty-art"><ImagePlaceholder size="hero" label="Your first spot goes here" /></div>
		</section>
	{:else}
		<section class="list" aria-label="Eating Out list">
			{#snippet segment()}
				<div class="segment" role="group" aria-label="Status">
					{#each sides as side (side.status)}
						<button
							type="button"
							aria-pressed={data.query.status === side.status}
							class:on={data.query.status === side.status}
							onclick={() => navigate(switchStatus(data.query, side.status, data.explicitSort))}
						>
							{side.label}
							<span class="n tnum">{data.counts[side.status]}</span>
						</button>
					{/each}
				</div>
			{/snippet}

			{#if data.totals[data.query.status] === 0}
				<div class="controls">{@render segment()}</div>
				<div class="side-empty" in:rise={{ delay: 120 }}>
					<p>{emptySide}</p>
					<Button href="/eating-out/new" variant="secondary" arrow={false}>Add spot</Button>
				</div>
			{:else}
				<SpotFilters facets={data.facets} query={data.query} onquery={navigate} {segment} />
				{#if data.spots.length === 0}
					<div class="no-match" in:rise={{ delay: 120 }}>
						<p class="no-match-title">{COPY.spotsNoMatch}</p>
						<p>Try fewer tags or a different word.</p>
						<Button variant="secondary" arrow={false} onclick={clear}>Clear filters</Button>
					</div>
				{:else}
					<ul class="grid" class:intro aria-label="Spots">
						{#each data.spots as spot (spot.id)}
							<li
								style:--delay="{introDelay.get(spot.id) ?? 0}ms"
								animate:flip={flipOptions()}
								in:rise={arrival()}
								out:leave
							>
								<SpotCard {spot} />
							</li>
						{/each}
						{#if data.query.status === 'want' && !hasSpotFilters(data.query)}
							<li class="tile-slot">
								<a class="add-tile" href="/eating-out/new">
									<span class="plus"><Icon name="plus" size={22} /></span>
									<span class="add-title">Add a place</span>
									<span class="add-sub">A tip from a friend, a corner you walked past</span>
								</a>
							</li>
						{/if}
					</ul>
				{/if}
			{/if}
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
		gap: var(--s-6);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
	}

	.head-side {
		display: flex;
		align-items: center;
		gap: var(--s-5);
		color: var(--ink-2);
		font-size: 15px;
	}

	.head-side p {
		max-inline-size: 24ch;
		text-align: right;
	}

	.head-side :global(.add) {
		display: none;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}


	.controls {
		display: flex;
	}

	.segment {
		display: inline-flex;
		gap: 4px;
		padding: 4px;
		border-radius: var(--r-pill);
		background: var(--ink-wash);
	}

	.segment button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-block-size: 44px;
		padding: 0 var(--s-5);
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		font-size: 15px;
		font-weight: 500;
		white-space: nowrap;
	}

	.segment .on {
		background: var(--dark);
		color: var(--on-dark);
		box-shadow: var(--shadow-card);
	}

	.n {
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.on .n {
		color: var(--on-dark);
		opacity: 0.8;
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

	.side-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-4);
		padding: var(--s-9) var(--s-5);
		border-radius: var(--r-panel);
		border: 1px dashed var(--line);
		text-align: center;
		color: var(--ink-2);
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

	.grid > li > :global(.card),
	.tile-slot > .add-tile {
		flex: 1;
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

	.add-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--s-2);
		padding: var(--s-5);
		border: 1.5px dashed var(--line);
		border-radius: var(--r-card);
		text-align: center;
		transition: transform var(--d-base) var(--ease-out);
	}

	.add-tile:hover {
		transform: translateY(-3px);
	}

	.plus {
		display: grid;
		place-items: center;
		inline-size: 48px;
		block-size: 48px;
		border-radius: var(--r-pill);
		background: var(--olive-wash);
		color: var(--olive);
	}

	.add-title {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 360;
		line-height: 1.1;
	}

	.add-sub {
		max-inline-size: 22ch;
		font-size: 14px;
		color: var(--ink-2);
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

		.head-side p {
			display: none;
		}

		.head-side :global(.add) {
			display: inline-flex;
		}

		.segment {
			display: flex;
			flex: 0 0 100%;
		}

		.controls {
			flex-wrap: wrap;
		}

		.segment button {
			flex: 1;
			justify-content: center;
		}

		.grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--s-3);
		}

		.add-tile {
			padding: var(--s-4);
		}

		.add-title {
			font-size: 19px;
		}

		.add-sub {
			font-size: 13px;
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
