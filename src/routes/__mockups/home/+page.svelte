<script lang="ts">
	import { byId, list, openCount, recipes, today, totalMinutes, week } from '#lib/mockups/fixtures.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';
	import Tile from '#lib/ui/Tile.svelte';

	const hero = byId(12);
	const favourite = byId(10);
	const firstItems = list.flatMap((c) => c.items).slice(0, 3);
	const days = week.map((d) => {
		const entry = d.entries.dinner?.[0] ?? d.entries.lunch?.[0] ?? d.entries.breakfast?.[0];
		const recipe = entry?.recipe ? byId(entry.recipe) : null;
		return { ...d, title: recipe?.title ?? entry?.text ?? null, image: recipe ? recipe.image : undefined };
	});
	const recent = recipes.slice(1, 5);
	const meals = week.reduce((n, d) => n + Object.values(d.entries).flat().length, 0);
</script>

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={['Wednesday', '21 October']} />
			<h1>What’s <em>cooking</em>, Rue?</h1>
		</div>
		<div class="head-side">
			<p>{meals} meals planned this week, {openCount} things to buy.</p>
			<Button href="/__mockups/plan" variant="secondary" arrow={false} icon="calendar">Open the plan</Button>
		</div>
	</header>

	<section class="bento" aria-label="Today">
		<Tile tone="photo" image={hero.image ?? undefined} href="/__mockups/recipe" class="hero">
			<div class="hero-top">
				<span class="glass-chip"><span class="dot" aria-hidden="true"></span>Tonight · Dinner</span>
			</div>
			<div class="hero-bottom">
				<h2 class="hero-title">Roasted pumpkin soup <em>with sage butter</em></h2>
				<div class="hero-meta">
					<span><Icon name="clock" size={16} /> {totalMinutes(hero)} min</span>
					<span><Icon name="users" size={16} /> Serves 4</span>
					<span class="spacer"></span>
					<ArrowButton decorative variant="light" size="lg" direction="up-right" />
				</div>
			</div>
		</Tile>

		<Tile tone="light" href="/__mockups/plan" class="week">
			<div class="tile-head">
				<div>
					<p class="tile-kicker">This week</p>
					<p class="tile-sub tnum">19 – 25 October</p>
				</div>
				<ArrowButton decorative variant="outline" direction="up-right" />
			</div>
			<ol class="days">
				{#each days as d (d.date)}
					<li class:today={d.date === today}>
						<span class="wd">{d.short}</span>
						<span class="num tnum">{d.day}</span>
						<span class="thumb">
							{#if d.image}<img src={d.image} alt="" />{:else if d.image === null}<ImagePlaceholder size="thumb" />{:else if d.title}<span
									class="text-dot">{d.title.slice(0, 1)}</span
								>{/if}
						</span>
						<span class="t">{d.title ?? '—'}</span>
					</li>
				{/each}
			</ol>
		</Tile>

		<Tile tone="brick" href="/__mockups/list" class="list">
			<div class="tile-head">
				<p class="tile-kicker">Shopping list</p>
				<ArrowButton decorative variant="glass" direction="up-right" class="on-colour" />
			</div>
			<p class="big tnum">{openCount}<span>open</span></p>
			<ul class="ruled">
				{#each firstItems as item (item.name)}
					<li><span>{item.name}</span><span class="tnum">{item.amount}</span></li>
				{/each}
			</ul>
		</Tile>

		<Tile tone="dark" href="/__mockups/recipe" class="fav">
			<div class="tile-head">
				<p class="tile-kicker">Favourite</p>
				<ArrowButton decorative variant="light" direction="up-right" />
			</div>
			<div class="fav-body">
				<img class="round" src={favourite.image} alt="" />
				<div>
					<p class="fav-title">{favourite.title}</p>
					<p class="fav-meta tnum">{totalMinutes(favourite)} min · Pasta</p>
				</div>
			</div>
		</Tile>
	</section>

	<section class="recent">
		<div class="section-head">
			<h2 data-section-heading>Recently added</h2>
			<a class="more" href="/__mockups/recipes">All 48 recipes <Icon name="arrow-right" size={16} /></a>
		</div>
		<div class="grid">
			{#each recent as r (r.id)}
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
		gap: var(--s-7);
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-6);
	}

	.head h1 {
		margin-block-start: var(--s-3);
	}

	h1 em,
	h2 em {
		color: var(--brick);
	}

	.head-side {
		display: flex;
		align-items: center;
		gap: var(--s-5);
		color: var(--ink-2);
		font-size: 15px;
	}

	.head-side p {
		max-inline-size: 22ch;
		text-align: right;
	}

	.bento {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(2, 264px);
		gap: var(--s-4);
	}

	.bento :global(.hero) {
		grid-column: span 2;
		grid-row: span 2;
		padding: var(--s-7);
	}

	.bento :global(.week) {
		grid-column: span 2;
	}

	.hero-top {
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

	.hero-bottom {
		margin-block-start: auto;
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}

	.hero-title {
		font-size: var(--t-display-1);
		font-weight: 300;
		max-inline-size: 13ch;
		color: var(--white);
	}

	.hero-title em {
		color: var(--white);
		opacity: 0.92;
	}

	.hero-meta {
		display: flex;
		align-items: center;
		gap: var(--s-5);
		font-size: 15px;
		font-weight: 500;
	}

	.hero-meta span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.spacer {
		flex: 1;
	}

	.tile-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--s-3);
	}

	.tile-kicker {
		font-family: var(--font-display);
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

	.today .num {
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

	.today .thumb {
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

	.big {
		margin-block: auto var(--s-2);
		font-family: var(--font-display);
		font-size: 64px;
		font-weight: 300;
		line-height: 1;
	}

	.big span {
		margin-inline-start: 8px;
		font-family: var(--font-text);
		font-size: 14px;
		font-weight: 500;
		letter-spacing: 0.04em;
	}

	.ruled li {
		display: flex;
		justify-content: space-between;
		gap: var(--s-3);
		padding-block: 7px;
		border-block-start: 1px solid var(--line-on-dark);
		font-size: 14px;
	}

	.bento :global(.list .on-colour) {
		background: var(--glass-on-dark);
		border-color: var(--line-on-dark);
		color: var(--on-dark);
	}

	.fav-body {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		margin-block-start: auto;
	}

	.round {
		inline-size: 92px;
		block-size: 92px;
		border-radius: var(--r-pill);
		object-fit: cover;
		box-shadow: 0 0 0 4px var(--olive);
	}

	.fav-title {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 360;
		line-height: 1.1;
	}

	.fav-meta {
		margin-block-start: 6px;
		font-size: var(--t-small);
		opacity: 0.8;
	}

	.recent {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
		margin-block-start: var(--s-5);
	}

	.section-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.more {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-block-size: 44px;
		font-size: 14px;
		font-weight: 500;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--s-4);
	}

	@media (max-width: 1023px) {
		.page {
			gap: var(--s-6);
		}

		.head-side {
			display: none;
		}

		.bento {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 460px auto 220px;
			gap: var(--s-3);
		}

		.bento :global(.hero) {
			grid-row: auto;
			margin-inline: calc(-1 * var(--gutter));
			border-radius: 0;
			padding: var(--s-6) var(--gutter);
		}

		.bento :global(.week) {
			padding: var(--s-5);
		}

		.bento :global(.list),
		.bento :global(.fav) {
			padding: var(--s-5);
		}

		.hero-title {
			font-size: 36px;
		}

		.thumb {
			inline-size: 40px;
			block-size: 40px;
		}

		.days {
			gap: 2px;
			margin-block-start: var(--s-5);
		}

		.t {
			display: none;
		}

		.big {
			font-size: 48px;
		}

		.big span {
			display: block;
			margin: 4px 0 0;
		}

		.ruled li:nth-child(n + 3) {
			display: none;
		}

		.tile-kicker {
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

		.fav-title {
			font-size: 18px;
		}

		.grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--s-3);
		}
	}
</style>
