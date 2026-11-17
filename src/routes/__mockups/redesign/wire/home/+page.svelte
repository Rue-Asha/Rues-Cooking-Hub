<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Specimen from '../shell/Specimen.svelte';
	import Dashboard from './Dashboard.svelte';
	import { dashboard } from './data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const worstData = mockData(new URL('http://x/?data=worst'));
	const d = $derived(dashboard(data));
	const longTitles = dashboard(worstData, { planned: true });
</script>

<svelte:head><title>Home · wireframe</title></svelte:head>

<Frame area="home">
	<div class="w-page">
		<Dashboard {d} recipes={data.recipes} />

		<div class="w-states">
			<h2>States</h2>
			<Specimen label="Nothing planned today" note="The newest recipe takes today's place, with Plan your day.">
				<Dashboard d={dashboard(data, { planned: false })} recipes={data.recipes} parts={['hero', 'week']} />
			</Specimen>
			<Specimen label="Nothing planned this week" note="All seven days read Nothing planned; the summary counts 0 meals.">
				<Dashboard d={dashboard(data, { weekEmpty: true })} recipes={data.recipes} parts={['head', 'week']} />
			</Specimen>
			<Specimen label="Empty list" note="List is empty with a hint; the card still goes to the list.">
				<Dashboard d={dashboard(data, { listEmpty: true })} recipes={data.recipes} parts={['list']} />
			</Specimen>
			<Specimen label="No favourite" note="The card goes to Recipes.">
				<Dashboard d={dashboard(data, { noFavourite: true })} recipes={data.recipes} parts={['favourite']} />
			</Specimen>
			<Specimen label="No recipes at all: welcome" note="Welcome replaces today's recipe; Recently added and the favourite are gone, the week and list stay empty. Add your first recipe goes to the import.">
				<Dashboard d={dashboard(data, { noRecipes: true, noSpots: true })} recipes={[]} />
			</Specimen>
			<Specimen label="No spots" note="Top spots is simply absent.">
				<Dashboard d={dashboard(data, { noSpots: true })} recipes={data.recipes} parts={['recent']} />
			</Specimen>
			<Specimen label="Long titles" note="120-character titles and 600-character descriptions: titles wrap to at most three lines in the hero, two elsewhere; the recipe page shows them in full.">
				<Dashboard d={longTitles} recipes={worstData.recipes} parts={['hero', 'favourite', 'recent']} />
			</Specimen>
		</div>
	</div>
</Frame>
