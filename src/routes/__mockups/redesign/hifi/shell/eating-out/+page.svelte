<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const visited = $derived(data.spots.filter((s) => s.status === 'visited'));
	const want = $derived(data.spots.length - visited.length);
	const initial = (name: string) => [...name.trim()][0] ?? '?';
</script>

<svelte:head><title>Eating Out · hi-fi</title></svelte:head>

<Frame area="eating-out" photo="spaghetti-pomodoro">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Spots</li><li>{data.spots.length === 1 ? '1 place' : `${data.spots.length.toLocaleString('en-GB')} places`}</li></ul>
			<h1>Eating <em class="accent-word">Out</em></h1>
			<p class="lede">{visited.length} places visited, {want} still on the want-to-go list. The bars show the spot actions here: Search spots and Add spot replace the recipe actions; the brand stays.</p>
		</div>
		<ul class="screen-facts" data-surface="inverse" aria-label="Your spots">
			<li><span class="n">{visited.length.toLocaleString('en-GB')}</span>Visited</li>
			<li><span class="n">{want.toLocaleString('en-GB')}</span>Want to go</li>
		</ul>
	</header>

	<div class="screen-body" data-settle>
		<section class="card block" data-surface="solid" aria-label="Spots">
			<div class="card-head"><h2>Spots</h2><span class="card-note">{data.spots.length > 8 ? `First 8 of ${data.spots.length.toLocaleString('en-GB')}` : `${data.spots.length} places`}</span></div>
			<ul class="spots">
				{#each data.spots.slice(0, 8) as spot (spot.id)}
					<li>
						{#if spot.image}<img class="thumb" src={spot.image} alt="" loading="lazy" />{:else}<span class="thumb plate" role="img" aria-label="No photo yet">{initial(spot.name)}</span>{/if}
						<span class="body">
							<strong class="clamp">{spot.name}</strong>
							<span class="card-note loc">{[spot.neighbourhood, spot.city].filter(Boolean).join(', ') || 'No location'}</span>
						</span>
						<span class="score">{spot.score ?? 'Want to go'}</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</Frame>

<style>
	.block {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.spots {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.spots li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-inline-size: 0;
		padding: var(--space-2);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	.body {
		display: grid;
		flex: 1;
		min-inline-size: 0;
		font-size: var(--type-body-s-size);
	}
	.clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
	}
	.loc {
		overflow-wrap: anywhere;
	}
	.score {
		flex: none;
		padding-inline-end: var(--space-2);
		font-size: var(--type-label-size);
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}
</style>
