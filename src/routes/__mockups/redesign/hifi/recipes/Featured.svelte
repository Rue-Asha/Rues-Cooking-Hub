<script lang="ts">
	import type { MockRecipe } from '../../fixtures.ts';
	import Button from '../shell/Button.svelte';
	import { clip, lang, pad, go, total } from './util.ts';
	import Ic from './Ic.svelte';
	import Picture from './Picture.svelte';

	type Props = { recipes: MockRecipe[]; index?: number; worst?: boolean };
	let { recipes, index = $bindable(0), worst = false }: Props = $props();

	const uid = $props.id();
	const items = $derived(recipes.slice(0, 7));
	const at = $derived(Math.min(index, items.length - 1));
	const current = $derived(items[at]);
	const digits = $derived(String(items.length).length);
	const minutes = $derived(current ? total(current.prepMinutes, current.cookMinutes) : null);
	const line = $derived(items.length === 1 ? 'Your newest addition' : items.length < 7 ? 'The newest additions' : 'The seven newest additions');
	let startX: number | null = null;

	function step(by: number) {
		index = Math.min(items.length - 1, Math.max(0, at + by));
	}
	function key(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') step(-1);
		else if (event.key === 'ArrowRight') step(1);
		else return;
		event.preventDefault();
	}
	function up(event: PointerEvent) {
		if (startX !== null && event.pointerType === 'touch') {
			const dx = event.clientX - startX;
			if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
		}
		startX = null;
	}
</script>

{#if current}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<section class="card featured" data-surface="solid" aria-labelledby="{uid}-h" aria-roledescription="carousel" tabindex="0" onkeydown={key} onpointerdown={(e) => (startX = e.clientX)} onpointerup={up} onpointercancel={() => (startX = null)}>
		<div class="card-head">
			<h2 id="{uid}-h">Featured</h2>
			<span class="card-note">{line}</span>
		</div>
		<div class="slide" role="group" aria-roledescription="slide" aria-label="{current.title}, {at + 1} of {items.length}">
			<div class="photo"><Picture title={current.title} image={current.image} ratio="4 / 3" /></div>
			<div class="text">
				<span class="position"><span class="sr-only">Featured recipe </span>{pad(at + 1, digits)}<span class="of"><span class="sr-only"> of </span><span aria-hidden="true"> / </span>{pad(items.length, digits)}</span></span>
				<h3 class="title"><a href={go.recipe(worst)}>{clip(current.title)}</a></h3>
				{#if current.description}<p class="desc">{clip(current.description)}</p>{/if}
				{#if minutes !== null || current.tags.length}
					<p class="meta">
						{#if minutes !== null}<span>{minutes} min</span>{/if}
						{#each current.tags.slice(0, 3) as tag (tag)}<span lang={lang(tag)}>{tag}</span>{/each}
					</p>
				{/if}
				{#if items.length > 1}
					<div class="controls">
						<Button icon label="Previous recipe" disabled={at === 0} onclick={() => step(-1)}><Ic name="chevron-left" /></Button>
						<Button icon label="Next recipe" disabled={at === items.length - 1} onclick={() => step(1)}><Ic name="chevron" /></Button>
					</div>
				{/if}
			</div>
		</div>
		<p class="sr-only" aria-live="polite">{current.title}, {at + 1} of {items.length}</p>
	</section>
{/if}

<style>
	.featured {
		position: relative;
		display: grid;
		gap: var(--space-4);
		padding: var(--space-5);
		min-inline-size: 0;
		touch-action: pan-y;
	}
	.slide {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.text {
		display: grid;
		gap: var(--space-2-5);
		align-content: start;
		min-inline-size: 0;
	}
	.title {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
		overflow-wrap: anywhere;
	}
	.title a {
		color: inherit;
		text-decoration: none;
	}
	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-card);
	}
	.title a:focus-visible {
		outline: none;
	}
	.title a:focus-visible::after {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: calc(-1 * var(--focus-width));
	}
	.desc {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
		overflow-wrap: anywhere;
		color: var(--ink-secondary);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-0-5) var(--space-3);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
		overflow-wrap: anywhere;
	}
	.controls {
		position: relative;
		z-index: var(--z-raised);
		display: flex;
		gap: var(--space-2);
		margin-block-start: var(--space-1);
	}
	@media (min-width: 768px) {
		.slide {
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
			align-items: center;
			gap: var(--space-6);
		}
	}
</style>
