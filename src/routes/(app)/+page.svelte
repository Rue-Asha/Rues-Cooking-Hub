<script lang="ts">
	import FavouriteTile from '#lib/home/FavouriteTile.svelte';
	import HeroTile from '#lib/home/HeroTile.svelte';
	import ListTile from '#lib/home/ListTile.svelte';
	import WeekTile from '#lib/home/WeekTile.svelte';
	import { heroName } from '#lib/motion.ts';
	import FavouriteButton from '#lib/recipes/FavouriteButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

	let { data } = $props();

	const d = $derived(data.dashboard);
	const fmt = (opts: Intl.DateTimeFormatOptions) =>
		new Date(`${data.today}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
	const meals = $derived(d.week.reduce((n, day) => n + day.entries.length, 0));
	const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

	// one element per recipe-hero name, or startViewTransition fails: the hero tile first, then the favourite, then the cards
	const heroId = $derived(d.hero.kind === 'welcome' ? null : d.hero.recipe.id);
	const favNamed = $derived(d.favourite !== null && d.favourite.id !== heroId);
	const cardName = (id: number) => (id === heroId || (favNamed && id === d.favourite?.id) ? null : heroName(id));
</script>

<svelte:head>
	<title>Rues Cooking Hub</title>
</svelte:head>

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={[fmt({ weekday: 'long' }), fmt({ day: 'numeric', month: 'long' })]} />
			<h1>What’s <em>cooking</em>, Rue?</h1>
		</div>
		<div class="head-side">
			<p>
				{plural(meals, 'meal', 'meals')} planned this week, {plural(d.list.open, 'thing', 'things')} to buy.
			</p>
			<Button href="/plan" variant="secondary" arrow={false} icon="calendar">Open the plan</Button>
		</div>
	</header>

	<section class="bento" aria-label="Today">
		<HeroTile hero={d.hero} />
		<WeekTile week={d.week} today={data.today} />
		<ListTile list={d.list} />
		<FavouriteTile recipe={d.favourite} named={favNamed} />
	</section>

	{#if data.recent.length > 0}
		<section class="recent" aria-labelledby="recent-title">
			<div class="section-head">
				<h2 id="recent-title" data-section-heading>Recently added</h2>
				<a class="more" href="/recipes">All {plural(data.total, 'recipe', 'recipes')} <Icon name="arrow-right" size={16} /></a>
			</div>
			<ul class="grid">
				{#each data.recent as recipe, i (recipe.id)}
					<li style:--i={i}>
						<Card
							href="/recipes/{recipe.id}"
							title={recipe.title}
							description={recipe.description}
							image={recipe.imageId === null ? null : `/images/${recipe.imageId}`}
							minutes={recipe.totalMinutes}
							tags={recipe.tags.map((t) => t.name)}
							favourite={recipe.favourite}
							heroName={cardName(recipe.id)}
						>
							{#snippet fav()}<FavouriteButton id={recipe.id} title={recipe.title} favourite={recipe.favourite} />{/snippet}
						</Card>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
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

	h1 em {
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
		max-inline-size: 30ch;
		text-align: right;
	}

	.bento {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(2, 264px);
		gap: var(--s-4);
	}

	.bento > :global([data-tile='hero']) {
		grid-column: span 2;
		grid-row: span 2;
	}

	.bento > :global([data-tile='week']) {
		grid-column: span 2;
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

	.more :global(svg) {
		transition: transform var(--d-fast) var(--ease-out);
	}

	.more:hover :global(svg) {
		transform: translateX(3px);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--s-4);
	}

	.grid > li {
		display: flex;
		flex-direction: column;
	}

	.grid > li > :global(.card) {
		flex: 1;
	}

	/* header, then the tiles one after another, then the cards: CSS, so it plays before hydration */
	@media (prefers-reduced-motion: no-preference) {
		.head,
		.bento > :global([data-tile]),
		.grid > li {
			animation: home-rise var(--d-slow) var(--ease-out) backwards;
		}

		.bento > :global([data-tile='hero']) {
			animation-delay: 60ms;
		}

		.bento > :global([data-tile='week']) {
			animation-delay: 130ms;
		}

		.bento > :global([data-tile='list']) {
			animation-delay: 200ms;
		}

		.bento > :global([data-tile='favourite']) {
			animation-delay: 270ms;
		}

		.grid > li {
			animation-delay: calc(340ms + var(--i) * 40ms);
		}
	}

	@keyframes home-rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
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

		.bento > :global([data-tile='hero']) {
			grid-row: auto;
		}

		.grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--s-3);
		}
	}
</style>
