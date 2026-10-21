<script lang="ts">
	import { heroName, rise } from '#lib/motion.ts';
	import type { Id, RecipeCard } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import Counter from '#lib/ui/Counter.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import RoundNav from '#lib/ui/RoundNav.svelte';
	import { dragPosition, place, stepIndex, swipeStep } from './coverflow.ts';

	let {
		recipes,
		index = $bindable(0),
		handoff = $bindable(null)
	}: {
		recipes: RecipeCard[];
		index?: number;
		// the recipe whose photo flies into its page: only that card carries the hero name, never the grid's twin
		handoff?: Id | null;
	} = $props();

	const DRAG_PX = 180;

	const n = $derived(recipes.length);
	const current = $derived(stepIndex(index, 0, n));
	let dx = $state<number | null>(null);
	const position = $derived(dx === null ? current : dragPosition(current, dx, DRAG_PX, n));
	// mid-drag the nearest card already shows its title
	const near = $derived(stepIndex(Math.round(position), 0, n));

	let stage: HTMLDivElement;
	let pointer: { id: number; x: number; y: number; horizontal: boolean | null } | null = null;
	let swiped = false;

	function go(to: number) {
		const refocus = stage.contains(document.activeElement) && document.activeElement !== stage;
		index = stepIndex(to, 0, n);
		if (refocus) stage.focus();
	}

	function keydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		go(current + (e.key === 'ArrowRight' ? 1 : -1));
	}

	function pointerdown(e: PointerEvent) {
		if (e.pointerType === 'mouse' || n < 2) return;
		pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, horizontal: null };
	}

	function pointermove(e: PointerEvent) {
		if (!pointer || e.pointerId !== pointer.id) return;
		const mx = e.clientX - pointer.x;
		const my = e.clientY - pointer.y;
		if (pointer.horizontal === null && Math.max(Math.abs(mx), Math.abs(my)) > 8) {
			pointer.horizontal = Math.abs(mx) > Math.abs(my);
			if (pointer.horizontal) stage.setPointerCapture(e.pointerId);
		}
		if (pointer.horizontal) dx = mx;
		else if (pointer.horizontal === false) pointer = null;
	}

	function pointerup(e: PointerEvent) {
		if (!pointer || e.pointerId !== pointer.id) return;
		if (dx !== null) {
			const landed = Math.round(position);
			go(landed !== current ? landed : current + swipeStep(dx));
			swiped = true;
		}
		pointer = null;
		dx = null;
	}

	function cancel() {
		pointer = null;
		dx = null;
	}

	// a card behind the front one steps the stack; only the front card opens its recipe
	function open(e: MouseEvent, i: number, id: Id) {
		if (swiped) {
			swiped = false;
			e.preventDefault();
		} else if (i !== current) {
			e.preventDefault();
			go(i);
		} else handoff = id;
	}
</script>

<!-- a fresh click anywhere else hands the hero back to the grid -->
<svelte:document onclickcapture={() => (handoff = null)} />

<section class="featured" aria-labelledby="featured-title">
	<div class="section-head">
		<div>
			<h2 id="featured-title" data-section-heading>Featured</h2>
			<p class="section-sub">{n === 7 ? 'The seven newest additions' : n === 1 ? 'Your newest addition' : 'The newest additions'}</p>
		</div>
		<div class="stack-controls">
			<span class="head-count">
				{#key current}<span class="tick" in:rise={{ y: 6 }}><Counter index={current + 1} total={n} /></span>{/key}
			</span>
			{#if n > 1}
				<RoundNav
					prevLabel="Previous recipe"
					nextLabel="Next recipe"
					prevDisabled={current === 0}
					nextDisabled={current === n - 1}
					onprev={() => go(current - 1)}
					onnext={() => go(current + 1)}
				/>
			{/if}
		</div>
	</div>

	<p class="visually-hidden" aria-live="polite">{recipes[current]?.title}, {current + 1} of {n}</p>

	<!-- the stage is the carousel's keyboard and swipe surface -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="stage"
		class:dragging={dx !== null}
		data-stage
		role="group"
		aria-roledescription="carousel"
		aria-label="Featured recipes"
		tabindex="0"
		bind:this={stage}
		onkeydown={keydown}
		onpointerdown={pointerdown}
		onpointermove={pointermove}
		onpointerup={pointerup}
		onpointercancel={cancel}
	>
		{#each recipes as r, i (r.id)}
			{@const p = place(i, position)}
			{@const front = i === current}
			<a
				href="/recipes/{r.id}"
				class="cf-card"
				class:front={i === near}
				data-card
				data-front={front ? '' : undefined}
				style="--x: {p.x}; --s: {p.scale}; --o: {p.fade}; --enter: {Math.abs(i - current) * 70}ms; z-index: {p.z}"
				aria-label={r.title}
				aria-hidden={front ? undefined : 'true'}
				tabindex={front ? undefined : -1}
				draggable="false"
				onclick={(e) => open(e, i, r.id)}
			>
				<span class="cf-media" style:--hero-name={handoff === r.id ? heroName(r.id) : null}>
					{#if r.imageId !== null}<img src="/images/{r.imageId}" alt="" draggable="false" />{:else}<ImagePlaceholder size="hero" />{/if}
				</span>
				<span class="cf-scrim" aria-hidden="true"></span>
				<span class="cf-dim" aria-hidden="true"></span>
				<span class="cf-count"><Counter index={i + 1} total={n} tone="light" /></span>
				<span class="cf-body">
					<span class="cf-title">{r.title}</span>
					<span class="cf-meta">
						{#if r.totalMinutes !== null}<span class="tnum">{r.totalMinutes} min</span>{/if}
						{#each r.tags.slice(0, 2) as t (t.id)}<Chip static size="sm" tone="light" label={t.name} />{/each}
					</span>
				</span>
				<span class="cf-arrow"><ArrowButton decorative variant="light" direction="up-right" /></span>
			</a>
		{/each}
	</div>
</section>

<style>
	.featured {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	.section-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.section-sub {
		margin-block-start: 4px;
		font-size: 14px;
		color: var(--ink-2);
	}

	.stack-controls {
		display: flex;
		align-items: center;
		gap: var(--s-4);
	}

	.head-count {
		display: inline-grid;
	}

	.tick {
		grid-area: 1 / 1;
	}

	.stage {
		--w: 360px;
		--step: 250px;
		position: relative;
		block-size: 460px;
		margin-block-start: var(--s-2);
		border-radius: var(--r-panel);
		touch-action: pan-y;
		outline-offset: 6px;
	}

	@media (min-width: 1024px) {
		/* the stack stays inside the column and fades out at its edges */
		.stage {
			box-sizing: content-box;
			padding-block-end: 48px;
			mask-image: linear-gradient(90deg, transparent, var(--ink) 7%, var(--ink) 93%, transparent);
		}
	}

	.cf-card {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 50%;
		inline-size: var(--w);
		block-size: 460px;
		border-radius: var(--r-panel);
		overflow: hidden;
		color: var(--white);
		box-shadow: var(--shadow-lift);
		transform: translateX(calc(-50% + var(--x) * var(--step))) scale(var(--s));
		transition: transform var(--d-slow) var(--ease-out);
		animation: fan-in 640ms var(--ease-out) var(--enter) backwards;
		-webkit-user-select: none;
		user-select: none;
		-webkit-touch-callout: none;
	}

	/* the cards open out of the front one, nearest first */
	@keyframes fan-in {
		from {
			transform: translateX(-50%) scale(0.9);
			opacity: 0;
		}
	}

	.dragging .cf-card,
	.dragging .cf-dim {
		transition: none;
	}

	.cf-media {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		overflow: hidden;
	}

	@media (prefers-reduced-motion: no-preference) {
		.cf-media {
			view-transition-name: var(--hero-name, none);
			view-transition-class: recipe-hero;
		}
	}

	.cf-media img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		transition: transform var(--d-slow) var(--ease-out);
	}

	.front:hover .cf-media img {
		transform: scale(1.04);
	}

	.cf-scrim {
		position: absolute;
		inset: 0;
		background: var(--scrim);
	}

	.cf-dim {
		position: absolute;
		inset: 0;
		z-index: 2;
		background: var(--ground);
		opacity: calc(1 - var(--o));
		transition: opacity var(--d-slow) var(--ease-out);
		pointer-events: none;
	}

	.cf-count {
		position: absolute;
		inset-block-start: var(--s-5);
		inset-inline-end: var(--s-5);
	}

	.cf-body {
		position: absolute;
		inset-inline: var(--s-6);
		inset-block-end: var(--s-6);
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		padding-inline-end: 56px;
		transition:
			opacity var(--d-base) var(--ease-out) 120ms,
			transform var(--d-slow) var(--ease-out) 120ms;
	}

	.cf-card:not(.front) .cf-body {
		opacity: 0;
		transform: translateY(12px);
		transition-delay: 0ms;
	}

	.cf-title {
		font-family: var(--font-display);
		font-size: 30px;
		font-weight: 300;
		line-height: 1.05;
		letter-spacing: -0.01em;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.cf-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		font-size: var(--t-small);
		font-weight: 500;
	}

	.cf-meta > span:first-child {
		margin-inline-end: 4px;
	}

	.cf-arrow {
		position: absolute;
		inset-inline-end: var(--s-5);
		inset-block-end: var(--s-6);
		transition:
			opacity var(--d-base) var(--ease-out) 160ms,
			transform var(--d-base) var(--ease-spring) 160ms;
	}

	.cf-card:not(.front) .cf-arrow {
		opacity: 0;
		transform: scale(0.6);
		transition-delay: 0ms;
	}

	@media (max-width: 1023px) {
		.head-count {
			display: none;
		}

		.stage {
			--w: 256px;
			--step: 92px;
			block-size: 360px;
			margin-block-end: var(--s-2);
		}

		.cf-card {
			block-size: 360px;
		}

		.cf-title {
			font-size: 22px;
		}

		.cf-body {
			inset-inline: var(--s-5);
			inset-block-end: var(--s-5);
		}
	}
</style>
