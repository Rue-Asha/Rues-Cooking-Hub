<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { photoName } from '../recipes/util.ts';
	import Bar from './Bar.svelte';
	import Cards from './Cards.svelte';
	import Head from './Head.svelte';
	import Rail from './Rail.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const recipe = $derived(data.recipe);
	let scaled = $state<number | null>(null);
</script>

<svelte:head><title>{recipe.title} · hi-fi</title></svelte:head>

<Frame area="recipes" plus="shown" photo={photoName(recipe.image)}>
	<Rail title={recipe.title} favourite={recipe.favourite} worst={data.worst} />
	<header class="screen-head">
		<Head {recipe} />
		<Bar {recipe} bind:scaled worst={data.worst} />
	</header>

	<div class="screen-body">
		<Cards {recipe} scaled={scaled ?? recipe.servings} />
	</div>
</Frame>
