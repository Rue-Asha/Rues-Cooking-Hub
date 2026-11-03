<script lang="ts">
	import { spotHeroName } from '#lib/motion.ts';
	import DeleteSpot from '#lib/spots/DeleteSpot.svelte';
	import { locationText, priceText } from '#lib/spots/format.ts';
	import MarkVisited from '#lib/spots/MarkVisited.svelte';
	import { formatScore } from '#lib/spots/score.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const spot = $derived(data.spot);
	const location = $derived(locationText(spot.neighbourhood, spot.city));
	const host = $derived.by(() => {
		if (!spot.website) return '';
		try {
			return new URL(spot.website).hostname.replace(/^www\./, '');
		} catch {
			return spot.website;
		}
	});

	let deleting = $state(false);
	let visiting = $state(false);
</script>

<svelte:head>
	<title>{spot.name} · Rues Cooking Hub</title>
</svelte:head>

<div class="spot">
	<div class="wrap">
		<div class="hero" data-hero style:--hero-name={spotHeroName(spot.id)}>
			{#if spot.imageId !== null}
				<img class="media" src="/images/{spot.imageId}" alt="" fetchpriority="high" />
			{:else}
				<ImagePlaceholder class="media" size="hero" />
			{/if}
		</div>
		<!-- outside the hero: the shared element would carry the control along with the photo -->
		<div class="controls column">
			<ArrowButton href="/eating-out" variant="glass" direction="left" label="Back to Eating Out" />
		</div>
	</div>

	<div class="column panel-row" data-column>
		<GlassPanel as="header" strong class="info enter" data-page-header data-spot-info>
			<Kicker parts={[spot.status === 'visited' ? 'Visited' : 'Want to go']} />
			<div class="name-row">
				<h1>{spot.name}</h1>
				{#if spot.scoreHundredths !== null}<span class="score tnum">{formatScore(spot.scoreHundredths)}</span>{/if}
			</div>
			{#if spot.price || location}
				<p class="facts">
					{#if spot.price}<span class="price tnum">{priceText(spot.price)}</span>{/if}
					{#if spot.price && location}<span class="dot" aria-hidden="true"></span>{/if}
					{#if location}<span>{location}</span>{/if}
				</p>
			{/if}
			{#if spot.tags.length > 0}
				<div class="tags">
					{#each spot.tags as tag (tag.id)}<Chip static label={tag.name} />{/each}
				</div>
			{/if}
			<div class="actions">
				{#if spot.status === 'want'}
					<Button variant="olive" arrow={false} onclick={() => (visiting = true)}>Mark visited</Button>
				{/if}
				<Button variant="secondary" arrow={false} icon="edit" href="/eating-out/{spot.id}/edit">Edit</Button>
				<Button variant="danger" arrow={false} icon="trash" onclick={() => (deleting = true)}>Delete</Button>
			</div>
		</GlassPanel>

		{#if spot.address || spot.website || data.notes}
			<div class="details enter" data-details>
				{#if spot.address}
					<div class="row">
						<div class="row-main">
							<p class="label">Address</p>
							<p class="value">{spot.address}</p>
						</div>
						{#if data.maps}
							<a class="open" href={data.maps} target="_blank" rel="noopener noreferrer">
								Open in Maps <Icon name="arrow-up-right" size={16} />
							</a>
						{/if}
					</div>
				{/if}
				{#if spot.website}
					<div class="row">
						<div class="row-main">
							<p class="label">Website</p>
							<p class="value">{host}</p>
						</div>
						<a class="open" href={spot.website} target="_blank" rel="noopener noreferrer">
							Visit <Icon name="arrow-up-right" size={16} />
						</a>
					</div>
				{/if}
				{#if data.notes}
					<div class="row notes" data-notes>
						<div class="row-main">
							<p class="label">Notes</p>
							<div class="value prose">{@html data.notes}</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

{#if spot.status === 'want'}
	<MarkVisited open={visiting} name={spot.name} onclose={() => (visiting = false)} />
{/if}
<DeleteSpot open={deleting} name={spot.name} onclose={() => (deleting = false)} />

<style>
	/* the hero runs up under the floating nav (desktop) and to the top edge (phone) */
	.spot {
		margin-block-start: calc(-1 * (14px + var(--nav-h) + var(--s-8)));
	}

	.wrap {
		position: relative;
	}

	.hero {
		position: relative;
		block-size: clamp(380px, 52vh, 480px);
		overflow: hidden;
		border-end-start-radius: var(--r-frame);
		border-end-end-radius: var(--r-frame);
		background: var(--sand);
	}

	.hero > :global(.media) {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		border-radius: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.hero {
			view-transition-name: var(--hero-name);
			view-transition-class: recipe-hero;
		}
	}

	.controls {
		position: absolute;
		inset-block-start: var(--s-4);
		inset-inline: 0;
		display: none;
	}

	.panel-row {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 440px;
		gap: var(--s-4);
		align-items: end;
		margin-block-start: -240px;
	}

	/* the panels overlap the hero, whose shared-element layer would cover them while it moves; as their own
	   layer they stay on top. Only during a transition: a named element would cut the glass off from the photo. */
	:global(:root:active-view-transition) .panel-row {
		view-transition-name: recipe-panels;
	}

	.panel-row :global(.info) {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-7);
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: var(--s-4);
	}

	h1 {
		font-size: var(--t-display-2);
		overflow-wrap: anywhere;
	}

	.score {
		display: inline-flex;
		align-items: center;
		flex: none;
		min-block-size: 40px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		background: var(--dark);
		color: var(--on-dark);
		font-size: 18px;
		font-weight: 600;
	}

	.facts {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		font-size: 15px;
		color: var(--ink-2);
	}

	.price {
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--ink);
	}

	.dot {
		inline-size: 4px;
		block-size: 4px;
		border-radius: var(--r-pill);
		background: var(--stone);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
		margin-block-start: var(--s-2);
	}

	.details {
		display: flex;
		flex-direction: column;
		padding: var(--s-2) var(--s-6);
		border-radius: var(--r-panel);
		background: var(--surface);
		box-shadow: var(--shadow-float);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
		padding-block: var(--s-4);
		border-block-start: 1px solid var(--line);
	}

	.row:first-child {
		border-block-start: 0;
	}

	.row-main {
		min-inline-size: 0;
	}

	.label {
		font-size: var(--t-kicker);
		font-weight: 500;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.value {
		margin-block-start: 4px;
		font-size: 15px;
		line-height: 1.45;
		overflow-wrap: anywhere;
	}

	.prose {
		color: var(--ink-2);
	}

	.prose :global(:is(p, ul, ol)) {
		margin: 0 0 var(--s-2);
	}

	.prose :global(:is(ul, ol)) {
		padding-inline-start: 1.2em;
		list-style: disc;
	}

	.prose :global(a) {
		text-decoration: underline;
		text-underline-offset: 3px;
		color: var(--olive);
	}

	.open {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		min-block-size: 44px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--ink);
		font-size: 14px;
		font-weight: 500;
	}

	.enter {
		animation: enter var(--d-slow) var(--ease-out) both;
	}

	.details.enter {
		animation-delay: 90ms;
	}

	@keyframes enter {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.enter {
			animation: none;
		}
	}

	@media (max-width: 1023px) {
		.spot {
			margin-block-start: calc(-1 * var(--s-7));
		}

		.controls {
			display: flex;
			justify-content: space-between;
		}

		.panel-row {
			grid-template-columns: minmax(0, 1fr);
			margin-block-start: -72px;
		}

		.panel-row :global(.info) {
			padding: var(--s-5);
		}

		.name-row {
			align-items: flex-start;
		}

		.details {
			padding: var(--s-1) var(--s-5);
		}

		.row {
			flex-wrap: wrap;
		}
	}
</style>
