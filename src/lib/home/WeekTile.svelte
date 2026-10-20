<script lang="ts">
	import { weekRange } from '#lib/plan/Week.svelte';
	import type { Dashboard, IsoDate } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import Tile from '#lib/ui/Tile.svelte';

	let { week, today }: { week: Dashboard['week']; today: IsoDate } = $props();

	const weekday = (d: IsoDate) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });

	// a day shows one entry; one with a recipe (and so a photo) wins over a note
	const shown = (entries: Dashboard['week'][number]['entries']) => entries.find((e) => e.recipeId !== null) ?? entries[0];
</script>

<Tile tone="light" href="/plan" class="home-week" data-tile="week">
	<div class="tile-head">
		<div>
			<h2 class="tile-title">This week</h2>
			<p class="tile-sub tnum">{weekRange(week[0].date, today)}</p>
		</div>
		<ArrowButton decorative variant="outline" direction="up-right" class="go" />
	</div>
	<ol class="days">
		{#each week as d, i (d.date)}
			{@const entry = shown(d.entries)}
			<li data-day={d.date} data-today={d.date === today ? '' : undefined} style:--i={i}>
				<span class="wd" data-weekday>{weekday(d.date)}</span>
				<span class="num tnum">{Number(d.date.slice(8))}</span>
				<span class="thumb" class:filled={entry}>
					{#if entry?.imageId}
						<img src="/images/{entry.imageId}" alt="" loading="lazy" />
					{:else if entry?.recipeId}
						<ImagePlaceholder size="thumb" label={entry.title} />
					{:else if entry}
						<span class="text-dot" aria-hidden="true">{entry.title.slice(0, 1)}</span>
					{/if}
				</span>
				{#if entry}
					<span class="t" data-entry>{entry.title}</span>
					{#if d.entries.length > 1}<span class="more tnum">+{d.entries.length - 1}</span>{/if}
				{:else}
					<span class="t none"><span aria-hidden="true">—</span><span class="visually-hidden">Nothing planned</span></span>
				{/if}
			</li>
		{/each}
	</ol>
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
	}

	.tile-sub {
		margin-block-start: 2px;
		font-size: var(--t-small);
		color: var(--ink-2);
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--s-2);
		margin-block-start: auto;
	}

	.days li {
		display: grid;
		justify-items: center;
		align-content: start;
		gap: 4px;
		text-align: center;
		min-inline-size: 0;
	}

	.wd {
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.num {
		display: grid;
		place-items: center;
		inline-size: 28px;
		block-size: 28px;
		border-radius: var(--r-pill);
		font-family: var(--font-display);
		font-size: 16px;
	}

	[data-today] .num {
		background: var(--brick);
		color: var(--white);
	}

	.thumb {
		display: grid;
		place-items: center;
		inline-size: 56px;
		block-size: 56px;
		margin-block-start: 4px;
		border-radius: var(--r-pill);
		overflow: hidden;
		background: var(--sand);
		box-shadow: 0 0 0 3px var(--surface);
	}

	.thumb:not(.filled) {
		background: transparent;
		box-shadow: inset 0 0 0 1px var(--line);
	}

	[data-today] .thumb {
		box-shadow:
			0 0 0 3px var(--surface),
			0 0 0 5px var(--brick);
	}

	.thumb img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.text-dot {
		font-family: var(--font-display);
		font-style: italic;
		font-size: 22px;
		color: var(--olive);
	}

	.t {
		font-size: 12px;
		line-height: 1.3;
		color: var(--ink-2);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		inline-size: 100%;
	}

	.none {
		color: var(--stone);
	}

	.more {
		font-size: 11px;
		font-weight: 600;
		color: var(--olive);
	}

	:global(.home-week .go) {
		transition: transform var(--d-base) var(--ease-spring);
	}

	:global(a.home-week:hover .go) {
		transform: rotate(45deg);
	}

	/* the round photos pop in along the week after the tile has risen */
	@media (prefers-reduced-motion: no-preference) {
		.thumb.filled {
			animation: thumb-in 420ms var(--ease-spring) backwards;
			animation-delay: calc(360ms + var(--i) * 45ms);
		}

		[data-today] .num {
			animation: today-in 520ms var(--ease-spring) 300ms backwards;
		}
	}

	@keyframes thumb-in {
		from {
			opacity: 0;
			transform: scale(0.6);
		}
	}

	@keyframes today-in {
		from {
			transform: scale(0.4);
		}
	}

	@media (max-width: 1023px) {
		:global(.home-week.tile) {
			padding: var(--s-5);
		}

		.tile-title {
			font-size: 19px;
		}

		.tile-head :global(.arrow) {
			inline-size: 32px;
			block-size: 32px;
		}

		.thumb {
			inline-size: 40px;
			block-size: 40px;
		}

		.days {
			gap: 2px;
			margin-block-start: var(--s-5);
		}

		.t,
		.more {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
	}
</style>
