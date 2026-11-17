<script lang="ts">
	import { tick } from 'svelte';
	import { heroName } from '#lib/motion.ts';
	import type { Id, RecipeCard } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Picture from './Picture.svelte';

	let {
		recipes,
		index = $bindable(0),
		handoff = $bindable(null)
	}: {
		recipes: RecipeCard[];
		index?: number;
		// the recipe whose photo flies into its page: only that photo carries the hero name, never the list's twin
		handoff?: Id | null;
	} = $props();

	const uid = $props.id();
	const n = $derived(recipes.length);
	const at = $derived(Math.min(Math.max(index, 0), n - 1));
	const current = $derived(recipes[at]);
	const digits = $derived(Math.max(2, String(n).length));
	const pad = (v: number) => String(v).padStart(digits, '0');
	const line = $derived(n === 1 ? 'Your newest addition' : n < 7 ? 'The newest additions' : 'The seven newest additions');
	const lang = (text: string) => (/[^\u0000-ɏ]/.test(text) ? 'und' : undefined);
	let startX: number | null = null;
	let section = $state<HTMLElement>();

	// focus stays on the pressed control, so Enter can step on; only a control that went disabled at the end hands it to the carousel
	async function step(by: number) {
		const had = section?.contains(document.activeElement);
		index = Math.min(n - 1, Math.max(0, at + by));
		await tick();
		const now = document.activeElement;
		if (had && (!section?.contains(now) || (now as HTMLButtonElement).disabled)) section?.focus();
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

<!-- a fresh click anywhere else hands the hero back to the list -->
<svelte:document onclickcapture={() => (handoff = null)} />

{#if current}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<section
		class="card featured"
		data-surface="solid"
		bind:this={section}
		aria-labelledby="{uid}-h"
		aria-roledescription="carousel"
		tabindex="0"
		onkeydown={key}
		onpointerdown={(e) => (startX = e.clientX)}
		onpointerup={up}
		onpointercancel={() => (startX = null)}
	>
		<div class="card-head">
			<h2 id="{uid}-h">Featured</h2>
			<span class="card-note">{line}</span>
		</div>
		<div class="slide" role="group" aria-roledescription="slide" aria-label="{current.title}, {at + 1} of {n}">
			<div class="photo" style:--hero-name={handoff === current.id ? heroName(current.id) : null}>
				<Picture title={current.title} imageId={current.imageId} ratio="4 / 3" />
			</div>
			<div class="text">
				<span class="position" aria-hidden="true">{pad(at + 1)}<span class="of">{' / ' + pad(n)}</span></span>
				<h3 class="title"><a href="/recipes/{current.id}" onclick={() => (handoff = current.id)}>{current.title}</a></h3>
				{#if current.description}<p class="desc">{current.description}</p>{/if}
				{#if current.totalMinutes !== null || current.tags.length}
					<div class="meta">
						{#if current.totalMinutes !== null}<span>{current.totalMinutes} min</span>{/if}
						{#each current.tags.slice(0, 3) as tag (tag.id)}<span lang={lang(tag.name)}>{tag.name}</span>{/each}
					</div>
				{/if}
				{#if n > 1}
					<div class="controls">
						<Button icon variant="secondary" label="Previous recipe" disabled={at === 0} onclick={() => step(-1)}><Icon name="chevron-left" size={18} stroke={1.75} /></Button>
						<Button icon variant="secondary" label="Next recipe" disabled={at === n - 1} onclick={() => step(1)}><Icon name="chevron-right" size={18} stroke={1.75} /></Button>
					</div>
				{/if}
			</div>
		</div>
		<p class="sr-only" aria-live="polite">{current.title}, {at + 1} of {n}</p>
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
	.photo {
		view-transition-name: var(--hero-name, none);
		min-inline-size: 0;
	}
	@media (prefers-reduced-motion: reduce) {
		.photo {
			view-transition-name: none;
		}
	}
	.text {
		display: grid;
		gap: var(--space-2-5);
		align-content: start;
		justify-items: start;
		min-inline-size: 0;
	}
	.title {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
		overflow-wrap: anywhere;
		hyphens: manual;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
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
