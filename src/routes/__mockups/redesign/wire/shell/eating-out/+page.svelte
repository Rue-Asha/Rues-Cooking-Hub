<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const visited = $derived(data.spots.filter((s) => s.status === 'visited'));
	const want = $derived(data.spots.length - visited.length);
</script>

<svelte:head><title>Eating Out · wireframe</title></svelte:head>

<Frame area="eating-out">
	<div class="w-page">
		<header class="w-head">
			<p class="w-kicker">Spots · {data.spots.length === 1 ? '1 place' : `${data.spots.length} places`}</p>
			<h1>Eating Out</h1>
			<p class="w-lede">{visited.length} places visited, {want} still on the want-to-go list.</p>
		</header>

		<p class="w-note">Carried along: Eating Out keeps its own pages and moves onto the new shell. The bars show the spot actions here: Search spots and Add spot on the desktop top bar and on the phone, the brand stays, no recipe action is exposed.</p>

		<section class="w-card" aria-label="Spots">
			<div class="w-card-head"><h2>Spots</h2><span class="w-note">{data.spots.length > 8 ? `First 8 of ${data.spots.length}` : `${data.spots.length} places`}</span></div>
			<ul class="spots">
				{#each data.spots.slice(0, 8) as spot (spot.id)}
					<li>
						<div class="w-ph thumb">No photo</div>
						<div class="body">
							<strong class="w-clamp-2">{spot.name}</strong>
							<span class="w-note">{[spot.neighbourhood, spot.city].filter(Boolean).join(', ') || 'No location'}</span>
						</div>
						<span class="score">{spot.score ?? 'Want to go'}</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</Frame>

<style>
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
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
	}
	.thumb {
		flex: none;
		inline-size: var(--space-12);
		block-size: var(--space-12);
		border-radius: var(--radius-item);
	}
	.body {
		display: grid;
		flex: 1;
		min-inline-size: 0;
		font-size: var(--type-body-s-size);
	}
	.score {
		flex: none;
		font-size: var(--type-label-size);
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}
</style>
