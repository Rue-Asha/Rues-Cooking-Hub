<script lang="ts">
	import { heroName } from '#lib/motion.ts';
	import type { RecipeCard as RecipeCardData } from '#lib/types.ts';
	import FavouriteButton from './FavouriteButton.svelte';
	import Picture from './Picture.svelte';

	let { recipe, named = true }: { recipe: RecipeCardData; named?: boolean } = $props();

	const SHOWN = 3;
	const tags = $derived(recipe.tags.map((t) => t.name));
	const lang = (text: string) => (/[^\u0000-ɏ]/.test(text) ? 'und' : undefined);

	// One line of chips: the ones that don't fit give way to "+n". Done on the DOM so a resize re-fits without a re-render.
	function fit(meta: HTMLElement) {
		const chips = [...meta.querySelectorAll<HTMLElement>('[data-chip]')];
		const more = meta.querySelector<HTMLElement>('[data-more]')!;
		const count = more.querySelector<HTMLElement>('[data-count]')!;
		const apply = (visible: number) => {
			chips.forEach((chip, i) => {
				chip.style.display = i < visible ? '' : 'none';
				chip.style.flexShrink = '';
			});
			const hidden = recipe.tags.length - visible;
			more.hidden = hidden === 0;
			count.textContent = `+${hidden}`;
		};
		const run = () => {
			let visible = chips.length;
			for (; visible >= 0; visible--) {
				apply(visible);
				if (meta.scrollWidth <= meta.clientWidth) return;
			}
			// not even one chip fits beside the time: show the first, cut short
			apply(1);
			chips[0]?.style.setProperty('flex-shrink', '1');
		};
		const observer = new ResizeObserver(run);
		observer.observe(meta);
		return () => observer.disconnect();
	}
</script>

<article class="row" data-hover>
	<div class="pic" style:--hero-name={named ? heroName(recipe.id) : null}>
		<Picture title={recipe.title} imageId={recipe.imageId} />
	</div>
	<div class="text">
		<h3 class="title"><a href="/recipes/{recipe.id}">{recipe.title}</a></h3>
		{#if recipe.description}<p class="desc">{recipe.description}</p>{/if}
		{#if recipe.totalMinutes !== null || tags.length}
			<div class="meta" {@attach fit}>
				{#if recipe.totalMinutes !== null}<span class="time">{recipe.totalMinutes} min</span>{/if}
				{#each tags.slice(0, SHOWN) as tag (tag)}<span class="tag" data-chip lang={lang(tag)}>{tag}</span>{/each}
				<span class="more" data-more hidden={tags.length <= SHOWN}
					><span data-count>+{tags.length - SHOWN}</span><span class="sr-only"> more tags</span></span
				>
			</div>
		{/if}
	</div>
	<div class="fav"><FavouriteButton id={recipe.id} title={recipe.title} favourite={recipe.favourite} variant="plain" /></div>
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
	.desc {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.meta {
		display: flex;
		align-items: center;
		gap: var(--space-1-5);
		min-inline-size: 0;
		overflow: hidden;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.time {
		flex: none;
		font-variant-numeric: var(--numeric-figures);
		margin-inline-end: var(--space-1);
	}
	.tag {
		flex: 0 0 auto;
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
		flex: none;
		white-space: nowrap;
	}
	.more[hidden] {
		display: none;
	}
	.fav {
		position: relative;
		z-index: var(--z-raised);
	}
	@media (max-width: 380px) {
		.row {
			grid-template-columns: 4rem minmax(0, 1fr) auto;
			gap: var(--space-2);
		}
	}
</style>
