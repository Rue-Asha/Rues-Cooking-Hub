<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import { heroName, spotHeroName } from '#lib/motion.ts';
	import { weekRange } from '#lib/plan/Week.svelte';
	import FavouriteButton from '#lib/recipes/FavouriteButton.svelte';
	import Picture from '#lib/recipes/Picture.svelte';
	import { useStage } from '#lib/shell/stage.svelte.ts';
	import { locationText } from '#lib/spots/format.ts';
	import { formatScore } from '#lib/spots/score.ts';
	import { SLOTS } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let { data } = $props();

	const d = $derived(data.dashboard);
	const fmt = (opts: Intl.DateTimeFormatOptions) =>
		new Date(`${data.today}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
	const weekday = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
	const meals = $derived(d.week.reduce((n, day) => n + day.entries.length, 0));
	const plural = (n: number, one: string, many: string) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`;
	const initial = (title: string) => [...title.trim()][0] ?? '?';

	const hero = $derived(d.hero.kind === 'welcome' ? null : d.hero.recipe);
	const label = $derived(
		d.hero.kind === 'today'
			? d.hero.slot === 'dinner'
				? 'Tonight · Dinner'
				: `Today · ${SLOTS.find((s) => s.id === (d.hero.kind === 'today' ? d.hero.slot : ''))!.label}`
			: 'Newest in your archive'
	);
	const minutes = (m: number | null) => (m === null ? null : `${m} min`);

	// the hero photo is the stage behind the head
	useStage(() => (hero?.imageId != null ? `/images/${hero.imageId}` : null));

	// one element per recipe-hero name, or startViewTransition fails: the hero first, then the favourite, then the cards
	const favNamed = $derived(d.favourite !== null && d.favourite.id !== hero?.id);
	const cardName = (id: number) => (id === hero?.id || (favNamed && id === d.favourite?.id) ? null : heroName(id));

	// the page settles in on a full page load only
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');
	const spots = $derived(data.spots.slice(0, 3));
</script>

<svelte:head>
	<title>Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker"><li>{fmt({ weekday: 'long' })}</li><li>{fmt({ day: 'numeric', month: 'long' })}</li></ul>
		<h1>What's <em class="accent-word">cooking</em>, Rue?</h1>
		<p class="lede">{plural(meals, 'meal', 'meals')} planned this week, {plural(d.list.open, 'thing', 'things')} to buy.</p>
		<Button href="/plan">Open the plan</Button>
	</div>
	<ul class="screen-facts" data-surface="inverse" aria-label="Your kitchen">
		<li class="facts-caption" aria-hidden="true">Your kitchen</li>
		<li><span class="n">{data.total.toLocaleString('en-GB')}</span>{data.total === 1 ? 'Recipe' : 'Recipes'}</li>
		<li><span class="n">{meals.toLocaleString('en-GB')}</span>{meals === 1 ? 'Meal planned' : 'Meals planned'}</li>
		<li><span class="n">{d.list.open.toLocaleString('en-GB')}</span>To buy</li>
	</ul>
</header>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	<div class="dash">
		{#if hero}
			<article class="card hero" aria-label="Today's recipe" data-surface="solid">
				<div class="shot" style:--hero-name={heroName(hero.id)}><Picture title={hero.title} imageId={hero.imageId} ratio="var(--hero-ratio)" /></div>
				<div class="copy">
					<p class="overline">{label}</p>
					<h2 class="title"><a href="/recipes/{hero.id}">{hero.title}</a></h2>
					<p class="meta">
						{#if hero.totalMinutes !== null}<span>{minutes(hero.totalMinutes)}</span>{/if}
						<span>Serves {hero.servings}</span>
						{#if hero.tags[0]}<span>{hero.tags[0].name}</span>{/if}
					</p>
					{#if d.hero.kind === 'newest'}<div class="act"><Button variant="primary" arrow href="/plan">Plan your day</Button></div>{/if}
				</div>
			</article>
		{:else}
			<article class="card hero welcome" aria-label="Welcome" data-surface="solid">
				<span class="shot"><span class="pic plate" data-plate="1" aria-hidden="true">R</span></span>
				<div class="copy">
					<p class="overline">Welcome · Your kitchen</p>
					<h2 class="title">Every recipe worth <em>keeping</em>, in one place</h2>
					<p class="body">Import one from any web page or write down the one you know by heart. It will wait for you here.</p>
					<div class="act"><Button variant="primary" arrow href="/recipes/new">Add your first recipe</Button></div>
				</div>
			</article>
		{/if}

		<section class="card week" aria-label="This week" data-surface="solid">
			<div class="card-head">
				<h2>This week</h2>
				<a class="plain" href="/plan">{weekRange(d.week[0].date, data.today)}</a>
			</div>
			<ol class="days">
				{#each d.week as day (day.date)}
					{@const entry = day.entries.find((e) => e.recipeId !== null) ?? day.entries[0]}
					<li aria-current={day.date === data.today ? 'date' : undefined}>
						<span class="dayhead">
							<span class="wd">{weekday(day.date)}</span>
							<span class="num">{Number(day.date.slice(8))}</span>
						</span>
						{#if day.date === data.today}<span class="today">Today</span>{/if}
						{#if entry}
							{#if entry.imageId !== null}<img class="thumb" src="/images/{entry.imageId}" alt="" loading="lazy" />{:else}<span class="thumb plate" aria-hidden="true">{initial(entry.title)}</span>{/if}
							<span class="t">{entry.title}</span>
							{#if day.entries.length > 1}<span class="more">+{day.entries.length - 1}<span class="sr-only"> more</span></span>{/if}
						{:else}
							<span class="t none">Nothing planned</span>
						{/if}
					</li>
				{/each}
			</ol>
		</section>

		<a class="card side list" href="/list" data-surface="solid">
			<span class="card-head"><h2>Shopping list</h2><span class="card-note">{d.list.open.toLocaleString('en-GB')} open</span></span>
			{#if d.list.open > 0}
				<ul class="first">
					{#each d.list.first as name, i (i)}<li><span class="box" aria-hidden="true"></span>{name}</li>{/each}
				</ul>
			{:else}
				<span class="empty"><strong>List is empty</strong><span>Add things as you notice them, or fill it from the plan.</span></span>
			{/if}
		</a>

		<a class="card side fav" href={d.favourite ? `/recipes/${d.favourite.id}` : '/recipes'} data-surface="solid">
			<span class="card-head"><h2>Favourite</h2><Icon name="heart" size={20} /></span>
			{#if d.favourite}
				<span class="fav-row">
					<span class="fav-pic" style:--hero-name={favNamed ? heroName(d.favourite.id) : null}>
						{#if d.favourite.imageId !== null}<img class="thumb" src="/images/{d.favourite.imageId}" alt="" loading="lazy" />{:else}<span class="thumb plate" aria-hidden="true">{initial(d.favourite.title)}</span>{/if}
					</span>
					<span class="fav-body">
						<strong class="clamp">{d.favourite.title}</strong>
						<span class="meta">
							{#if d.favourite.totalMinutes !== null}<span>{minutes(d.favourite.totalMinutes)}</span>{/if}
							{#if d.favourite.tags[0]}<span>{d.favourite.tags[0].name}</span>{/if}
						</span>
					</span>
				</span>
			{:else}
				<span class="empty"><strong>Tap the heart on a recipe to keep it here</strong></span>
			{/if}
		</a>

		{#if data.recent.length > 0}
			<section class="block" aria-label="Recently added">
				<div class="block-head">
					<h2>Recently added</h2>
					<a class="plain" href="/recipes">All {plural(data.total, 'recipe', 'recipes')}<Icon name="arrow-right" size={16} /></a>
				</div>
				<ul class="cards">
					{#each data.recent as recipe (recipe.id)}
						<li>
							<article class="card tile" data-surface="solid">
								<div class="shot" style:--hero-name={cardName(recipe.id)}><Picture title={recipe.title} imageId={recipe.imageId} ratio="4 / 3" /></div>
								<h3 class="clamp"><a href="/recipes/{recipe.id}">{recipe.title}</a></h3>
								{#if recipe.description}<p class="desc clamp">{recipe.description}</p>{/if}
								{#if recipe.totalMinutes !== null}<p class="meta"><span>{minutes(recipe.totalMinutes)}</span></p>{/if}
								{#if recipe.tags.length}
									<ul class="tags">{#each recipe.tags.slice(0, 2) as tag (tag.name)}<li class="chip" lang={/[^\u0000-ɏ]/.test(tag.name) ? 'und' : undefined}>{tag.name}</li>{/each}</ul>
								{/if}
								<div class="heart"><FavouriteButton id={recipe.id} title={recipe.title} favourite={recipe.favourite} variant="glass" /></div>
							</article>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if spots.length > 0}
			<section class="block" aria-label="Top spots">
				<div class="block-head">
					<h2>Top spots</h2>
					<a class="plain" href="/eating-out">All spots<Icon name="arrow-right" size={16} /></a>
				</div>
				<ul class="cards spots">
					{#each spots as spot (spot.id)}
						<li>
							<article class="card tile" data-surface="solid">
								<div class="shot" style:--hero-name={spotHeroName(spot.id)}><Picture title={spot.name} imageId={spot.imageId} ratio="4 / 3" /></div>
								<h3 class="clamp"><a href="/eating-out/{spot.id}">{spot.name}</a></h3>
								<p class="meta">
									{#if locationText(spot.neighbourhood, spot.city)}<span>{locationText(spot.neighbourhood, spot.city)}</span>{/if}
									{#if spot.scoreHundredths !== null}<span class="score">{formatScore(spot.scoreHundredths)}</span>{/if}
								</p>
							</article>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
</div>

<style>
	.dash {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		min-inline-size: 0;
	}
	.card {
		min-inline-size: 0;
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
		hyphens: manual;
	}
	.overline {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
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
	.body {
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		color: var(--ink-secondary);
	}
	.plain {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		min-block-size: var(--target);
		color: var(--ink);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
		text-decoration: none;
	}
	@media (hover: hover) {
		.plain:hover {
			text-decoration: underline;
			text-underline-offset: var(--space-1);
		}
	}

	.shot {
		min-inline-size: 0;
		view-transition-name: var(--hero-name, none);
	}
	@media (prefers-reduced-motion: reduce) {
		.shot {
			view-transition-name: none;
		}
	}
	.pic.plate {
		display: grid;
		place-items: center;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-panel);
		background: var(--surface-plate-1);
		box-shadow: var(--ring-hairline);
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-l-size);
		line-height: 1;
		color: var(--ink);
	}

	.hero {
		--hero-ratio: 4 / 3;
		display: grid;
		gap: var(--space-4);
		padding: var(--space-3);
		position: relative;
	}
	.hero .copy {
		display: grid;
		gap: var(--space-2-5);
		align-content: start;
		padding: var(--space-1) var(--space-2) var(--space-2);
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
	.welcome .title {
		display: block;
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
	.title a:focus-visible::after {
		outline: var(--focus-width) solid var(--focus-ring);
		/* inset: the card can sit on main's clipped edge, where an outer ring is cut */
		outline-offset: calc(-1 * var(--focus-width));
	}
	.act {
		position: relative;
		z-index: var(--z-raised);
		justify-self: start;
		max-inline-size: 100%;
		margin-block-start: var(--space-1);
	}

	.week {
		padding: var(--space-5);
		display: grid;
		gap: var(--space-4);
	}
	.days {
		display: grid;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.days > li {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		min-block-size: var(--target-touch);
		min-inline-size: 0;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}
	.days > li[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.dayhead {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		flex: none;
		inline-size: 4rem;
	}
	.wd {
		font-size: var(--type-overline-size);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
	}
	.num {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
	}
	.today {
		flex: none;
		padding-inline: var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse-tint-strong);
		font-size: var(--type-caption-size);
		line-height: var(--type-label-line);
	}
	.days .thumb {
		--thumb: var(--space-8);
	}
	.days .thumb.plate {
		font-size: var(--type-label-size);
	}
	.t {
		flex: 1;
		min-inline-size: 0;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
	}
	.t.none {
		color: var(--ink-muted);
	}
	.days > li[aria-current] .t.none {
		color: var(--ink-on-inverse-muted);
	}
	.more {
		flex: none;
		font-size: var(--type-caption-size);
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}

	.side {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		padding: var(--space-5);
		color: var(--ink);
		text-decoration: none;
	}
	.side :global(.card-head h2) {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
	}
	@media (hover: hover) {
		.side:hover {
			background: var(--surface-raised);
		}
	}
	.side:active {
		background: var(--surface-sunken);
	}
	.first {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}
	.first > li {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.box {
		flex: none;
		inline-size: var(--space-4);
		block-size: var(--space-4);
		border-radius: var(--radius-round);
		box-shadow: var(--ring-hairline);
	}
	.empty {
		display: grid;
		gap: var(--space-1);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		color: var(--ink-secondary);
	}
	.empty strong {
		color: var(--ink);
		font-weight: var(--weight-semibold);
		overflow-wrap: anywhere;
	}
	.fav-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.fav-pic {
		flex: none;
		view-transition-name: var(--hero-name, none);
	}
	@media (prefers-reduced-motion: reduce) {
		.fav-pic {
			view-transition-name: none;
		}
	}
	.fav-row .thumb {
		--thumb: var(--space-14);
	}
	.fav-body {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}

	.block {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.block-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-1) var(--space-4);
	}
	.block-head h2 {
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.cards > li {
		display: grid;
		min-inline-size: 0;
	}
	.tile {
		position: relative;
		display: grid;
		gap: var(--space-2);
		align-content: start;
		padding: var(--space-3);
	}
	.tile h3 {
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--weight-semibold);
	}
	.tile h3 a {
		color: inherit;
		text-decoration: none;
	}
	.tile h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-card);
	}
	.tile h3 a:focus-visible {
		outline: none;
	}
	.tile h3 a:focus-visible::after {
		outline: var(--focus-width) solid var(--focus-ring);
		/* inset: the card can sit on main's clipped edge, where an outer ring is cut */
		outline-offset: calc(-1 * var(--focus-width));
	}
	.desc {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.score {
		font-weight: var(--weight-semibold);
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		max-inline-size: 100%;
		padding: var(--space-0-5) var(--space-2-5);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		overflow-wrap: anywhere;
	}
	.heart {
		position: absolute;
		inset-block-start: var(--space-5);
		inset-inline-end: var(--space-5);
		z-index: var(--z-raised);
	}

	@media (min-width: 768px) {
		.hero {
			--hero-ratio: auto;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: stretch;
		}
		.hero .shot {
			min-block-size: 14rem;
		}
		.hero .shot :global(.pic) {
			block-size: 100%;
		}
		.hero .copy {
			align-content: end;
			padding: var(--space-3);
		}
		.days {
			grid-template-columns: repeat(7, minmax(0, 1fr));
		}
		.days > li {
			display: grid;
			align-content: start;
			justify-items: start;
			padding: var(--space-3);
			min-block-size: 9rem;
			gap: var(--space-1-5);
		}
		.dayhead {
			inline-size: auto;
		}
		.cards {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.cards.spots {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	@media (min-width: 1100px) {
		.dash {
			grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
			grid-template-rows: auto 1fr;
			column-gap: var(--space-4);
		}
		.dash > .week,
		.dash > .block {
			grid-column: 1 / -1;
		}
		.dash > .hero {
			--hero-ratio: 2 / 1;
			grid-column: 1;
			grid-row: 1 / span 2;
			grid-template-columns: minmax(0, 1fr);
		}
		.dash > .hero .shot {
			min-block-size: 16rem;
		}
		.dash > .hero .shot :global(.pic) {
			block-size: auto;
		}
		.dash > .list {
			grid-column: 2;
			grid-row: 1;
		}
		.dash > .fav {
			grid-column: 2;
			grid-row: 2;
		}
	}
</style>
