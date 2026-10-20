<script lang="ts">
	import { onMount } from 'svelte';
	import { heroName, reducedMotion } from '#lib/motion.ts';
	import { SLOTS, type Dashboard } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

	let { hero }: { hero: Dashboard['hero'] } = $props();

	const recipe = $derived(hero.kind === 'welcome' ? null : hero.recipe);
	const label = $derived(
		hero.kind === 'today'
			? hero.slot === 'dinner'
				? 'Tonight · Dinner'
				: `Today · ${SLOTS.find((s) => s.id === hero.slot)!.label}`
			: 'Newest in your archive'
	);

	// "Roasted pumpkin soup with sage butter": the part from " with " on is the italic accent, as in the mockup
	const split = $derived.by(() => {
		const title = recipe?.title ?? '';
		const at = title.search(/ (with|and|&) /i);
		return at > 0 ? [title.slice(0, at), title.slice(at)] : [title, ''];
	});

	let frame: HTMLElement | undefined = $state();

	// Browsers without scroll-driven animations (Firefox) get the same drift from a scroll listener.
	onMount(() => {
		if (reducedMotion() || CSS.supports('animation-timeline: view()')) return;
		let raf = 0;
		const update = () => {
			raf = 0;
			const media = frame?.querySelector<HTMLElement>('.media');
			if (!frame || !media) return;
			const p = Math.min(Math.max(-frame.getBoundingClientRect().top / frame.offsetHeight, 0), 1);
			media.style.transform = `translateY(${(p * 30).toFixed(2)}%) scale(${(1.02 + p * 0.1).toFixed(4)})`;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		update();
		addEventListener('scroll', onScroll, { passive: true });
		return () => {
			removeEventListener('scroll', onScroll);
			cancelAnimationFrame(raf);
		};
	});
</script>

{#if recipe}
	<article class="hero photo" data-tile="hero" bind:this={frame}>
		<div class="photo-frame" style:--hero-name={heroName(recipe.id)}>
			{#if recipe.imageId !== null}
				<img class="media" src="/images/{recipe.imageId}" alt="" fetchpriority="high" />
			{:else}
				<ImagePlaceholder class="media" size="hero" />
			{/if}
		</div>
		<span class="scrim" aria-hidden="true"></span>
		<div class="top">
			<span class="glass-chip"><span class="dot" aria-hidden="true"></span>{label}</span>
		</div>
		<div class="bottom">
			<h2 class="title">
				<a href="/recipes/{recipe.id}">{split[0]}{#if split[1]}<em>{split[1]}</em>{/if}</a>
			</h2>
			<div class="meta">
				{#if recipe.totalMinutes !== null}<span><Icon name="clock" size={16} /> {recipe.totalMinutes} min</span>{/if}
				<span><Icon name="users" size={16} /> Serves {recipe.servings}</span>
				{#if recipe.tags[0]}<span class="tag">{recipe.tags[0].name}</span>{/if}
				<span class="spacer"></span>
				{#if hero.kind === 'newest'}
					<span class="cta"><Button href="/plan" variant="olive">Plan your day</Button></span>
				{:else}
					<ArrowButton decorative variant="light" size="lg" direction="up-right" class="go" />
				{/if}
			</div>
		</div>
	</article>
{:else}
	<article class="hero welcome" data-tile="hero">
		<svg class="art" viewBox="0 0 120 80" aria-hidden="true">
			<circle cx="60" cy="40" r="26" />
			<circle cx="60" cy="40" r="18" />
			<path d="M22 18v14a4 4 0 0 0 8 0V18M26 18v44" />
			<path d="M98 62V18c-5 3-7 9-7 16 0 4 3 7 7 7" />
		</svg>
		<div class="top"><Kicker parts={['Welcome', 'Your kitchen']} /></div>
		<div class="bottom">
			<h2 class="title">Every recipe worth <em>keeping</em>, in one place</h2>
			<p class="lede">Import one from any web page or write down the one you know by heart. It will wait for you here.</p>
			<div class="meta"><span class="cta"><Button href="/recipes/new">Add your first recipe</Button></span></div>
		</div>
	</article>
{/if}

<style>
	.hero {
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: var(--r-panel);
		padding: var(--s-7);
		color: var(--white);
		background: var(--dark);
	}

	.photo-frame,
	.scrim,
	.art {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.photo-frame {
		overflow: hidden;
		background: var(--sand);
		transition: transform var(--d-slow) var(--ease-out);
	}

	.photo-frame > :global(.media) {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		border-radius: 0;
		will-change: transform;
	}

	.hero:has(.title a:hover) .photo-frame {
		transform: scale(1.03);
	}

	.scrim {
		background:
			linear-gradient(180deg, var(--scrim-top) 0%, var(--scrim-clear) 28%),
			var(--scrim);
	}

	.top {
		display: flex;
	}

	.glass-chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		border-radius: var(--r-pill);
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		border: 1px solid var(--glass-border);
		color: var(--ink);
		font-size: 13px;
		font-weight: 500;
	}

	.dot {
		inline-size: 8px;
		block-size: 8px;
		border-radius: var(--r-pill);
		background: var(--brick);
	}

	.bottom {
		margin-block-start: auto;
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}

	.title {
		font-size: var(--t-display-1);
		font-weight: 300;
		max-inline-size: 14ch;
		color: inherit;
	}

	.title em {
		opacity: 0.92;
	}

	.photo .title a::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.photo .title a:focus-visible {
		outline: none;
	}

	.photo:has(.title a:focus-visible) {
		box-shadow: var(--focus-ring);
	}

	.meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--s-3) var(--s-5);
		font-size: 15px;
		font-weight: 500;
	}

	.meta > span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.tag {
		padding: 4px 12px;
		border-radius: var(--r-pill);
		border: 1px solid var(--line-on-photo);
		font-size: 13px;
	}

	.spacer {
		flex: 1;
	}

	.cta {
		position: relative;
		z-index: 2;
	}

	.hero :global(.go) {
		transition: transform var(--d-base) var(--ease-spring);
	}

	.hero:has(.title a:hover) :global(.go) {
		transform: rotate(45deg);
	}

	.welcome {
		background: var(--olive);
		color: var(--on-dark);
	}

	.welcome .art {
		inset: -6% -14% auto auto;
		inline-size: 78%;
		fill: none;
		stroke: var(--on-dark);
		stroke-width: 0.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.22;
	}

	.welcome :global(.kicker) {
		color: var(--on-dark);
	}

	.welcome .title {
		max-inline-size: 16ch;
	}

	.welcome .title em {
		font-style: italic;
		color: var(--brick-soft);
	}

	.lede {
		max-inline-size: 38ch;
		opacity: 0.86;
	}

	/* the photo settles in, the words rise after it; while the tile leaves the top the photo drifts and grows */
	@media (prefers-reduced-motion: no-preference) {
		/* named on the tile: an anonymous view() would bind to the clipping frame, which never scrolls */
		.photo {
			view-timeline: --home-hero block;
		}

		.photo-frame {
			view-transition-name: var(--hero-name, none);
			view-transition-class: recipe-hero;
			animation: settle 1200ms var(--ease-out) backwards;
		}

		.photo-frame > :global(.media) {
			animation: drift linear both;
			animation-timeline: --home-hero;
			animation-range: exit 0% exit 100%;
		}

		.welcome .art {
			animation: art-in 1400ms var(--ease-out) backwards;
		}

		.top,
		.bottom > * {
			animation: words var(--d-slow) var(--ease-out) backwards;
			animation-delay: calc(220ms + var(--i, 0) * 70ms);
		}

		.bottom > :nth-child(2) {
			--i: 1;
		}

		.bottom > :nth-child(3) {
			--i: 2;
		}
	}

	@keyframes settle {
		from {
			transform: scale(1.08);
		}
	}

	@keyframes drift {
		from {
			transform: translateY(0) scale(1.02);
		}
		to {
			transform: translateY(30%) scale(1.12);
		}
	}

	@keyframes art-in {
		from {
			opacity: 0;
			transform: translateY(24px) rotate(-6deg);
		}
	}

	@keyframes words {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	@media (max-width: 1023px) {
		.hero {
			margin-inline: calc(-1 * var(--gutter));
			border-radius: 0;
			padding: var(--s-6) var(--gutter);
		}

		.title {
			font-size: 36px;
		}

		.welcome .title {
			font-size: 32px;
		}
	}
</style>
