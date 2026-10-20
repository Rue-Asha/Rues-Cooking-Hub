<script lang="ts">
	import type { Snippet } from 'svelte';
	import Chip from './Chip.svelte';
	import Icon from './Icon.svelte';
	import IconButton from './IconButton.svelte';
	import ImagePlaceholder from './ImagePlaceholder.svelte';

	let {
		href,
		title,
		description = null,
		image = null,
		minutes = null,
		tags = [],
		favourite = false,
		compact = false,
		fav,
		heroName = null,
		class: cls = ''
	}: {
		href: string;
		title: string;
		description?: string | null;
		image?: string | null;
		minutes?: number | null;
		tags?: string[];
		favourite?: boolean;
		compact?: boolean;
		// a live favourite control in place of the static heart
		fav?: Snippet;
		// view-transition-name for the card → recipe hero hand-off
		heroName?: string | null;
		class?: string;
	} = $props();
</script>

<article class="card {cls}" class:compact>
	<div class="media" style:--hero-name={heroName}>
		{#if image}<img src={image} alt="" loading="lazy" />{:else}<ImagePlaceholder />{/if}
	</div>
	<!-- outside .media: its view-transition-name makes it a stacking context that would trap the heart under the card link -->
	{#if fav}
		<div class="fav">{@render fav()}</div>
	{:else}
		<IconButton
			class="fav"
			icon="heart"
			label={favourite ? `Remove ${title} from favourites` : `Add ${title} to favourites`}
			pressed={favourite}
		/>
	{/if}
	<div class="body">
		<h3><a {href}>{title}</a></h3>
		{#if description}<p class="desc">{description}</p>{/if}
		<div class="meta">
			{#if minutes !== null}<span class="time tnum"><Icon name="clock" size={15} />{minutes} min</span>{/if}
			{#each tags.slice(0, compact ? 1 : 2) as tag (tag)}<Chip static size="sm" label={tag} />{/each}
		</div>
	</div>
</article>

<style>
	.card {
		position: relative;
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		padding: 6px;
		border-radius: var(--r-card);
		background: var(--surface);
		box-shadow: var(--shadow-card);
		transition: transform var(--d-base) var(--ease-out);
	}

	.card:hover {
		transform: translateY(-3px);
	}

	.media {
		position: relative;
		aspect-ratio: 5 / 4;
		border-radius: var(--r-md);
		overflow: hidden;
	}

	@media (prefers-reduced-motion: no-preference) {
		.media {
			view-transition-name: var(--hero-name, none);
			view-transition-class: recipe-hero;
		}
	}

	.media img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		transition: transform var(--d-slow) var(--ease-out);
	}

	.card:hover .media img {
		transform: scale(1.04);
	}

	.card > :global(.fav) {
		position: absolute;
		inset-block-start: 14px;
		inset-inline-end: 14px;
		z-index: 2;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: var(--s-3) var(--s-3) var(--s-3);
		flex: 1;
	}

	h3 {
		font-size: 17px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		z-index: 1;
	}

	.desc {
		font-size: 14px;
		line-height: 1.45;
		color: var(--ink-2);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		margin-block-start: auto;
		padding-block-start: 4px;
	}

	.time {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-inline-end: 4px;
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--ink);
	}

	@container (max-width: 240px) {
		h3 {
			font-size: 15px;
		}

		.desc {
			font-size: 13px;
		}

		.body {
			padding: 10px 8px 8px;
		}
	}

	.compact h3 {
		font-size: 15px;
	}

	.compact .desc {
		font-size: 13px;
	}

	.compact .body {
		padding: 10px 8px 8px;
	}
</style>
