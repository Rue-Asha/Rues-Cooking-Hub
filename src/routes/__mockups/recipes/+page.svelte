<script lang="ts">
	import { featured, recipes, tags, totalMinutes } from '#lib/mockups/fixtures.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import Counter from '#lib/ui/Counter.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';
	import RoundNav from '#lib/ui/RoundNav.svelte';

	// the mockup shows the stack mid-way so both sides peek
	let index = $state(2);
	const active = new Set(['Vegetarian']);
	// selected tags lead the row so they stay in view
	const chipOrder = [...tags].sort((a, b) => Number(active.has(b.name)) - Number(active.has(a.name)));
	const shown = recipes.filter((r) => r.id !== 4 && r.id !== 3);

	// depth for each card relative to the front one: offset in steps, mirrored left and right
	const place = (i: number) => {
		const d = i - index;
		const a = Math.abs(d);
		return {
			d,
			x: Math.sign(d) * [0, 1, 1.72, 2.2][Math.min(a, 3)],
			scale: [1, 0.84, 0.7, 0.6][Math.min(a, 3)],
			z: 10 - a,
			fade: a === 0 ? 1 : a === 1 ? 0.92 : a === 2 ? 0.7 : 0.45
		};
	};

	function step(by: number) {
		index = Math.max(0, Math.min(featured.length - 1, index + by));
	}
</script>

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={['Archive', '48 recipes']} />
			<h1>Recipes worth <em>keeping</em></h1>
		</div>
		<a class="tags-link" href="/__mockups/recipes"><Icon name="edit" size={16} /> Manage tags</a>
	</header>

	<section class="featured" aria-labelledby="featured-title">
		<div class="section-head">
			<div>
				<h2 id="featured-title" data-section-heading>Featured</h2>
				<p class="section-sub">The seven newest additions</p>
			</div>
			<div class="stack-controls">
				<Counter index={index + 1} total={featured.length} />
				<RoundNav
					prevLabel="Previous recipe"
					nextLabel="Next recipe"
					prevDisabled={index === 0}
					nextDisabled={index === featured.length - 1}
					onprev={() => step(-1)}
					onnext={() => step(1)}
				/>
			</div>
		</div>

		<div class="stage">
			{#each featured as r, i (r.id)}
				{@const p = place(i)}
				<a
					href="/__mockups/recipe"
					class="cf-card"
					class:front={p.d === 0}
					style="--x: {p.x}; --s: {p.scale}; --o: {p.fade}; z-index: {p.z}"
					aria-hidden={p.d === 0 ? undefined : 'true'}
					tabindex={p.d === 0 ? undefined : -1}
				>
					{#if r.image}<img src={r.image} alt="" />{:else}<ImagePlaceholder size="hero" />{/if}
					<span class="cf-scrim" aria-hidden="true"></span>
					<span class="cf-dim" aria-hidden="true"></span>
					<span class="cf-count"><Counter index={i + 1} total={featured.length} tone="light" /></span>
					<span class="cf-body">
						<span class="cf-title">{r.title}</span>
						<span class="cf-meta">
							{#if totalMinutes(r)}<span class="tnum">{totalMinutes(r)} min</span>{/if}
							{#each r.tags.slice(0, 2) as t (t)}<Chip static size="sm" tone="light" label={t} />{/each}
						</span>
					</span>
					{#if p.d === 0}<span class="cf-arrow"><ArrowButton decorative variant="light" direction="up-right" /></span>{/if}
				</a>
			{/each}
		</div>
	</section>

	<section class="archive" aria-labelledby="all-title">
		<div class="section-head">
			<h2 id="all-title" data-section-heading>All recipes</h2>
		</div>
		<div class="filters">
			<div class="chips" role="group" aria-label="Filter by tag">
				<Chip label="Favourites" icon="heart" />
				{#each chipOrder as t (t.name)}
					<Chip label={t.name} count={t.count} active={active.has(t.name)} />
				{/each}
			</div>
			<label class="search">
				<Icon name="search" size={18} />
				<span class="visually-hidden">Search recipes</span>
				<input type="search" placeholder="Search recipes or ingredients" />
			</label>
			<button type="button" class="sort">
				<Icon name="sort" size={18} />
				<span>Newest first</span>
				<Icon name="chevron-down" size={16} />
			</button>
		</div>
		<p class="count"><span class="tnum">{shown.length}</span> recipes <span class="sep">in</span> Vegetarian
			<button type="button" class="clear">Clear filters</button></p>

		<div class="grid">
			{#each shown as r (r.id)}
				<Card
					href="/__mockups/recipe"
					title={r.title}
					description={r.description}
					image={r.image}
					minutes={totalMinutes(r)}
					tags={r.tags}
					favourite={r.favourite}
				/>
			{/each}
		</div>
	</section>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-8);
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-5);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
	}

	.tags-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-block-size: 44px;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink-2);
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

	.featured {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	.stage {
		--w: 360px;
		--step: 250px;
		position: relative;
		block-size: 460px;
		margin-block-start: var(--s-2);
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
		block-size: 100%;
		border-radius: var(--r-panel);
		overflow: hidden;
		color: var(--white);
		box-shadow: var(--shadow-lift);
		transform: translateX(calc(-50% + var(--x) * var(--step))) scale(var(--s));
		transition: transform var(--d-slow) var(--ease-out);
	}

	.cf-dim {
		position: absolute;
		inset: 0;
		z-index: 2;
		background: var(--ground);
		opacity: calc(1 - var(--o));
		transition: opacity var(--d-slow) var(--ease-out);
	}

	.cf-card:not(.front) .cf-body {
		opacity: 0;
	}

	.cf-body {
		transition: opacity var(--d-base) var(--ease-out);
	}

	.cf-card img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.cf-scrim {
		position: absolute;
		inset: 0;
		background: var(--scrim);
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
	}

	.cf-title {
		font-family: var(--font-display);
		font-size: 30px;
		font-weight: 300;
		line-height: 1.05;
		letter-spacing: -0.01em;
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
	}

	.archive {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}

	.filters {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	.chips {
		display: flex;
		gap: var(--s-2);
		flex: 1;
		min-inline-size: 0;
		overflow-x: auto;
		scrollbar-width: none;
		mask-image: linear-gradient(90deg, var(--ink) 88%, transparent);
	}

	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
		inline-size: 280px;
		min-block-size: 44px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		background: var(--surface);
		border: 1px solid var(--line);
		color: var(--ink-2);
	}

	.search input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: transparent;
		font-size: 14px;
		color: var(--ink);
	}

	.search input::placeholder {
		color: var(--ink-2);
	}

	.sort {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex: none;
		min-block-size: 44px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: transparent;
		font-size: 14px;
		font-weight: 500;
	}

	.count {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		font-weight: 600;
	}

	.sep {
		font-weight: 400;
		color: var(--ink-2);
	}

	.clear {
		min-block-size: 44px;
		margin-inline-start: var(--s-2);
		padding: 0 4px;
		border: 0;
		background: none;
		font-size: 14px;
		font-weight: 500;
		color: var(--brick);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--s-5) var(--s-4);
	}

	@media (max-width: 1023px) {
		.page {
			gap: var(--s-7);
		}

		.tags-link {
			display: none;
		}

		.stack-controls :global(.counter) {
			display: none;
		}

		.stage {
			margin-block-end: var(--s-2);
			--w: 256px;
			--step: 92px;
			block-size: 360px;
		}

		.cf-title {
			font-size: 22px;
		}

		.cf-body {
			inset-inline: var(--s-5);
			inset-block-end: var(--s-5);
		}

		.filters {
			flex-wrap: wrap;
		}

		.chips {
			flex: 0 0 100%;
			margin-inline: calc(-1 * var(--gutter));
			padding-inline: var(--gutter);
			mask-image: none;
		}

		.search {
			flex: 1;
			inline-size: auto;
		}

		.sort span {
			display: none;
		}

		.grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--s-3);
		}
	}
</style>
