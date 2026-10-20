<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { heroName, reducedMotion } from '#lib/motion.ts';
	import type { Id } from '#lib/types.ts';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';

	let { id, imageId, children }: { id: Id; imageId: Id | null; children?: Snippet } = $props();

	let hero: HTMLDivElement;

	// Browsers without scroll-driven animations (Firefox) get the same drift from a scroll listener.
	onMount(() => {
		if (reducedMotion() || CSS.supports('animation-timeline: view()')) return;
		let frame = 0;
		const update = () => {
			frame = 0;
			const media = hero.querySelector<HTMLElement>('.media');
			if (!media) return;
			const p = Math.min(Math.max(-hero.getBoundingClientRect().top / hero.offsetHeight, 0), 1);
			media.style.transform = `translateY(${(p * 36).toFixed(2)}%) scale(${(1.02 + p * 0.1).toFixed(4)})`;
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		addEventListener('scroll', onScroll, { passive: true });
		return () => {
			removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	});
</script>

<div class="wrap">
	<div class="hero" data-hero bind:this={hero} style:--hero-name={heroName(id)}>
		{#if imageId !== null}
			<img class="media" src="/images/{imageId}" alt="" fetchpriority="high" />
		{:else}
			<ImagePlaceholder class="media" size="hero" />
		{/if}
	</div>
	<!-- outside the hero: the shared element would carry the controls along with the photo -->
	{#if children}<div class="controls column">{@render children()}</div>{/if}
</div>

<style>
	.wrap {
		position: relative;
	}

	.hero {
		position: relative;
		block-size: clamp(420px, 62vh, 560px);
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
		will-change: transform;
	}

	/* the photo drifts down at about a third of the scroll speed and grows a little while the hero leaves the top */
	@media (prefers-reduced-motion: no-preference) {
		.hero {
			view-transition-name: var(--hero-name);
			view-transition-class: recipe-hero;
			view-timeline: --hero block;
		}

		.hero > :global(.media) {
			animation: drift linear both;
			animation-timeline: --hero;
			animation-range: exit 0% exit 100%;
		}
	}

	@keyframes drift {
		from {
			transform: translateY(0) scale(1.02);
		}

		to {
			transform: translateY(36%) scale(1.12);
		}
	}

	.controls {
		position: absolute;
		inset-block-start: var(--s-4);
		inset-inline: 0;
		display: flex;
		justify-content: space-between;
	}

	@media (min-width: 1024px) {
		.controls {
			display: none;
		}
	}

	@media (max-width: 1023px) {
		.hero {
			block-size: 440px;
			border-radius: 0;
		}
	}
</style>
