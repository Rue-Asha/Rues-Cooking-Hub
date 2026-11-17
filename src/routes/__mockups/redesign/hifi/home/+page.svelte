<script lang="ts">
	import { page } from '$app/state';
	import Button from '../shell/Button.svelte';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { areaPath, link } from '../shell/links.ts';
	import Dashboard from './Dashboard.svelte';
	import State from './State.svelte';
	import { dashboard, plural } from './data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const worstData = mockData(new URL('http://x/?data=worst'));
	const d = $derived(dashboard(data));
	const longTitles = dashboard(worstData, { planned: true });
	const first = $derived(data.recipes[0]);
	const single = $derived({ ...data, recipes: [first], home: { ...data.home, hero: first, favourite: first } });
	const favourites = $derived(data.recipes.filter((r) => r.favourite).length);
	const visited = $derived(data.spots.filter((s) => s.status === 'visited').length);
	const photo = $derived(d.hero?.recipe.image?.replace('/mockups/', '').replace('.jpg', '') ?? 'spaghetti-pomodoro');
</script>

<svelte:head><title>Home · hi-fi</title></svelte:head>

<Frame area="home" {photo}>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>{d.kicker[0]}</li><li>{d.kicker[1]}</li></ul>
			<h1>What's <em class="accent-word">cooking</em>, Rue?</h1>
			<p class="lede">{d.summary}</p>
			<Button href={link(areaPath.plan, data.worst)}>Open the plan</Button>
		</div>
		<ul class="screen-facts" data-surface="inverse" aria-label="Your archive">
			<li class="facts-caption" aria-hidden="true">Your archive</li>
			<li><span class="n">{d.total.toLocaleString('en-GB')}</span>{d.total === 1 ? 'Recipe' : 'Recipes'}</li>
			<li><span class="n">{favourites.toLocaleString('en-GB')}</span>{favourites === 1 ? 'Favourite' : 'Favourites'}</li>
			<li><span class="n">{visited.toLocaleString('en-GB')}</span>{visited === 1 ? 'Spot visited' : 'Spots visited'}</li>
		</ul>
	</header>

	<div class="screen-body" data-settle>
		<Dashboard {d} recipes={data.recipes} />

		<div class="states">
		<h2 class="ruled">States</h2>
		<State label="Nothing planned today" note="The newest recipe takes today's place, with Plan your day.">
			<Dashboard d={dashboard(data, { planned: false })} recipes={data.recipes} parts={['hero']} />
		</State>
		<State label="Nothing planned this week" note="All seven days read Nothing planned; the summary counts 0 meals ({plural(0, 'meal', 'meals')}).">
			<Dashboard d={dashboard(data, { weekEmpty: true })} recipes={data.recipes} parts={['week']} />
			<p class="sample">{dashboard(data, { weekEmpty: true }).summary}</p>
		</State>
		<State label="Empty list" note="List is empty with a hint; the card still goes to the list.">
			<Dashboard d={dashboard(data, { listEmpty: true })} recipes={data.recipes} parts={['list']} />
		</State>
		<State label="No favourite" note="The card goes to Recipes.">
			<Dashboard d={dashboard(data, { noFavourite: true })} recipes={data.recipes} parts={['favourite']} />
		</State>
		<State label="No recipes at all: welcome" note="Welcome replaces today's recipe; Recently added and Favourite content are gone, the week and list stay empty.">
			<Dashboard d={dashboard(data, { noRecipes: true, noSpots: true })} recipes={[]} parts={['hero', 'week', 'list', 'favourite']} />
		</State>
		<State label="Exactly one recipe" note="The recipe is today's recipe, the favourite and the only card in Recently added; the link reads “All 1 recipe”.">
			<Dashboard d={dashboard(single, { planned: false })} recipes={single.recipes} parts={['hero', 'favourite', 'recent']} />
		</State>
		<State label="No spots" note="Top spots is simply absent: Recently added ends the page.">
			<Dashboard d={dashboard(data, { noSpots: true })} recipes={data.recipes} parts={['recent']} />
		</State>
		<State label="Long titles" note="120-character titles and long descriptions: titles wrap to at most three lines in the hero and two elsewhere; the recipe page shows them in full.">
			<Dashboard d={longTitles} recipes={worstData.recipes} parts={['hero', 'favourite', 'recent']} />
		</State>
		</div>
	</div>
</Frame>

<style>
	.states {
		display: grid;
		gap: var(--space-8);
		min-inline-size: 0;
		padding-block-start: var(--space-10);
	}
	.states > :global(.ruled) {
		justify-self: start;
	}
	.sample {
		font-size: var(--type-body-s-size);
		color: var(--ink-secondary);
	}
</style>
