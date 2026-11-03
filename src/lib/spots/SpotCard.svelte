<script lang="ts">
	import { spotHeroName } from '#lib/motion.ts';
	import type { SpotCard as SpotCardData } from '#lib/types.ts';
	import Card from '#lib/ui/Card.svelte';
	import { formatScore } from './score.ts';
	import { locationText, priceText } from './format.ts';

	let { spot }: { spot: SpotCardData } = $props();
</script>

{#snippet score()}{formatScore(spot.scoreHundredths!)}{/snippet}
{#snippet extra()}{#if spot.price}<span class="price tnum">{priceText(spot.price)}</span>{/if}{/snippet}

<Card
	href="/eating-out/{spot.id}"
	title={spot.name}
	subtitle={locationText(spot.neighbourhood, spot.city)}
	image={spot.imageId === null ? null : `/images/${spot.imageId}`}
	tags={spot.tags.map((t) => t.name)}
	heart={false}
	rank={spot.rank}
	heroName={spotHeroName(spot.id)}
	badge={spot.scoreHundredths === null ? undefined : score}
	{extra}
/>

<style>
	.price {
		margin-inline-end: 2px;
		font-size: var(--t-small);
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--ink);
	}
</style>
