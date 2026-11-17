<script lang="ts">
	import type { MockRecipe } from '../../fixtures.ts';
	import Grey from './Grey.svelte';
	import Icon from './Icon.svelte';
	import { totalMinutes, wire } from './util.ts';

	let { recipes, index = 0, worst = false }: { recipes: MockRecipe[]; index?: number; worst?: boolean } = $props();

	const uid = $props.id();
	const items = $derived(recipes.slice(0, 7));
	const current = $derived(items[index]);
	const digits = $derived(Math.max(2, String(items.length).length));
	const pad = (n: number) => String(n).padStart(digits, '0');
	const total = $derived(current ? totalMinutes(current.prepMinutes, current.cookMinutes) : null);
	const line = $derived(items.length === 1 ? 'Your newest addition' : items.length < 7 ? 'The newest additions' : 'The seven newest additions');
</script>

{#if current}
	<section class="w-card featured" aria-labelledby="{uid}-h" aria-roledescription="carousel">
		<div class="w-card-head">
			<h2 id="{uid}-h">Featured</h2>
			<span class="w-note">{line}</span>
		</div>
		<div class="slide" role="group" aria-label="{current.title}, {index + 1} of {items.length}">
			<div class="photo">{#if current.image}<Grey ratio="4 / 3" label="Photo" />{:else}<Grey ratio="4 / 3" plate />{/if}</div>
			<div class="text">
				<span class="position"><span class="sr-only">Featured recipe </span>{pad(index + 1)}<span class="of"><span class="sr-only"> of </span><span aria-hidden="true"> / </span>{pad(items.length)}</span></span>
				<a class="title" href={wire('recipe', worst)}>{current.title}</a>
				{#if current.description}<p class="desc">{current.description}</p>{/if}
				<p class="w-facts">{total !== null ? `${total} min` : ''}{total !== null && current.tags.length ? ' · ' : ''}{current.tags.join(', ')}</p>
			</div>
		</div>
		{#if items.length > 1}
			<div class="controls">
				<button type="button" class="w-icon" aria-label="Previous recipe" disabled={index === 0}><Icon name="chevronLeft" /></button>
				<button type="button" class="w-icon" aria-label="Next recipe" disabled={index === items.length - 1}><Icon name="chevronRight" /></button>
			</div>
		{/if}
	</section>
{/if}

<style>
	.slide {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}

	.text {
		display: grid;
		gap: var(--space-2);
		align-content: start;
		min-inline-size: 0;
	}

	.position {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		font-variant-numeric: var(--numeric-figures);
	}

	.of {
		color: var(--ink-secondary);
	}

	.title {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		color: var(--ink);
		text-decoration: none;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}

	.desc {
		color: var(--ink-secondary);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
		overflow-wrap: anywhere;
	}

	.controls {
		display: flex;
		gap: var(--space-2);
	}

	@media (min-width: 768px) {
		.slide {
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
			align-items: center;
		}
	}
</style>
