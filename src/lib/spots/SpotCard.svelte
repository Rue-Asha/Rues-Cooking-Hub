<script lang="ts">
	import { spotHeroName } from '#lib/motion.ts';
	import Picture from '#lib/recipes/Picture.svelte';
	import type { SpotCard as SpotCardData } from '#lib/types.ts';
	import { locationText, priceText } from './format.ts';
	import { formatScore } from './score.ts';

	let { spot, named = true }: { spot: SpotCardData; named?: boolean } = $props();

	const SHOWN = 2;
	const place = $derived(locationText(spot.neighbourhood, spot.city));
	const tags = $derived(spot.tags.map((t) => t.name));
	const lang = (text: string) => (/[^\u0000-ɏ]/.test(text) ? 'und' : undefined);
	const hasMeta = $derived(spot.rank !== null || spot.price !== null || tags.length > 0);
</script>

<article class="row" data-hover>
	<div class="pic" style:--hero-name={named ? spotHeroName(spot.id) : null}>
		<Picture title={spot.name} imageId={spot.imageId} />
	</div>
	<div class="text">
		<h3 class="title"><a href="/eating-out/{spot.id}">{spot.name}</a></h3>
		{#if place}<p class="place">{place}</p>{/if}
		{#if hasMeta}
			<div class="meta">
				{#if spot.rank !== null}<span class="rank">#{spot.rank}</span>{/if}
				{#if spot.price !== null}<span class="price">{priceText(spot.price)}</span>{/if}
				{#each tags.slice(0, SHOWN) as tag (tag)}<span class="tag" lang={lang(tag)}>{tag}</span>{/each}
				{#if tags.length > SHOWN}<span class="more">+{tags.length - SHOWN}<span class="sr-only"> more tags</span></span>{/if}
			</div>
		{/if}
	</div>
	{#if spot.scoreHundredths !== null}<span class="score">{formatScore(spot.scoreHundredths)}</span>{/if}
</article>

<style>
	.row {
		position: relative;
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr) auto;
		align-items: start;
		gap: var(--space-3);
		block-size: 100%;
		min-inline-size: 0;
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	@media (hover: hover) {
		.row:hover {
			background: var(--surface-raised);
		}
	}
	/* pressed, the row darkens under the finger before the page changes */
	.row:has(a:active) {
		background: var(--surface-tint-strong);
	}
	.pic {
		view-transition-name: var(--hero-name, none);
	}
	@media (prefers-reduced-motion: reduce) {
		.pic {
			view-transition-name: none;
		}
	}
	.text {
		display: grid;
		gap: var(--space-1);
		align-content: start;
		min-inline-size: 0;
	}
	.title {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
		hyphens: manual;
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
	}
	.title a {
		color: inherit;
		text-decoration: none;
	}
	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-panel);
	}
	.title a:focus-visible {
		outline: none;
	}
	.title a:focus-visible::after {
		outline: var(--focus-width) solid var(--focus-ring);
		/* inset: the card can sit on main's clipped edge, where an outer ring is cut */
		outline-offset: calc(-1 * var(--focus-width));
	}
	.place {
		overflow: hidden;
		overflow-wrap: anywhere;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-1-5);
		min-inline-size: 0;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.rank,
	.price {
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
		color: var(--ink);
	}
	.tag {
		max-inline-size: 100%;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding-inline: var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		color: var(--ink);
	}
	.more {
		white-space: nowrap;
	}
	.score {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
		font-variant-numeric: var(--numeric-figures);
		color: var(--accent-text);
	}
	@media (max-width: 380px) {
		.row {
			grid-template-columns: 4rem minmax(0, 1fr) auto;
			gap: var(--space-2);
		}
	}
</style>
