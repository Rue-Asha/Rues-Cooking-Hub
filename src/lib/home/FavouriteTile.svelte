<script lang="ts">
	import { heroName } from '#lib/motion.ts';
	import type { RecipeCard } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import Tile from '#lib/ui/Tile.svelte';

	// named: false when the hero already carries this recipe's shared-element name
	let { recipe, named = true }: { recipe: RecipeCard | null; named?: boolean } = $props();
</script>

<Tile tone="dark" href={recipe ? `/recipes/${recipe.id}` : '/recipes'} class="home-fav" data-tile="favourite">
	<div class="tile-head">
		<h2 class="tile-title">Favourite</h2>
		<ArrowButton decorative variant="light" direction="up-right" class="go" />
	</div>
	{#if recipe}
		<div class="body">
			<span class="round" style:--hero-name={named ? heroName(recipe.id) : null}>
				{#if recipe.imageId !== null}<img src="/images/{recipe.imageId}" alt="" loading="lazy" />{:else}<ImagePlaceholder
						size="thumb"
						label={recipe.title}
					/>{/if}
			</span>
			<div>
				<p class="title" data-title>{recipe.title}</p>
				<p class="meta tnum">
					{[recipe.totalMinutes !== null ? `${recipe.totalMinutes} min` : null, recipe.tags[0]?.name].filter(Boolean).join(' · ')}
				</p>
			</div>
		</div>
	{:else}
		<div class="body">
			<span class="heart" aria-hidden="true"><Icon name="heart" size={28} /></span>
			<p class="invite">Tap the heart on a recipe to keep it here</p>
		</div>
	{/if}
</Tile>

<style>
	.tile-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--s-3);
	}

	.tile-title {
		font-size: 24px;
		font-weight: 360;
		line-height: 1.1;
		color: inherit;
	}

	:global(.home-fav .go) {
		transition: transform var(--d-base) var(--ease-spring);
	}

	:global(a.home-fav:hover .go) {
		transform: rotate(45deg);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		margin-block-start: auto;
	}

	.round {
		display: block;
		inline-size: 92px;
		block-size: 92px;
		border-radius: var(--r-pill);
		overflow: hidden;
		box-shadow: 0 0 0 4px var(--olive);
		transition: transform var(--d-slow) var(--ease-out);
	}

	.round img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	:global(a.home-fav:hover) .round {
		transform: scale(1.05) rotate(-3deg);
	}

	.title {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 360;
		line-height: 1.1;
	}

	.meta {
		margin-block-start: 6px;
		font-size: var(--t-small);
		opacity: 0.8;
	}

	.heart {
		display: grid;
		place-items: center;
		inline-size: 56px;
		block-size: 56px;
		border-radius: var(--r-pill);
		border: 1px dashed var(--line-on-dark);
		color: var(--brick-soft);
	}

	.invite {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 300;
		line-height: 1.2;
	}

	@media (prefers-reduced-motion: no-preference) {
		.round {
			view-transition-name: var(--hero-name, none);
			view-transition-class: recipe-hero;
			animation: round-in 620ms var(--ease-spring) 380ms backwards;
		}

		.heart {
			animation: beat 1600ms var(--ease-in-out) 700ms 2;
		}
	}

	@keyframes round-in {
		from {
			opacity: 0;
			transform: scale(0.7) rotate(-8deg);
		}
	}

	@keyframes beat {
		0%,
		60%,
		100% {
			transform: scale(1);
		}
		20% {
			transform: scale(1.12);
		}
		40% {
			transform: scale(0.96);
		}
	}

	@media (max-width: 1023px) {
		:global(.home-fav.tile) {
			padding: var(--s-5);
		}

		.tile-title {
			font-size: 19px;
		}

		.tile-head :global(.arrow) {
			inline-size: 32px;
			block-size: 32px;
		}

		.round {
			inline-size: 64px;
			block-size: 64px;
		}

		.title {
			font-size: 18px;
		}

		.invite {
			font-size: 16px;
		}

		.heart {
			inline-size: 44px;
			block-size: 44px;
		}
	}
</style>
