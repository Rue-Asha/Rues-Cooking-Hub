<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import '../recipes/wire.css';
	import RecipeView from './RecipeView.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>{data.recipe.title} (wireframe)</title></svelte:head>

<Frame area="recipes" plus="shown">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipe</li>{#if data.recipe.tags[0]}<li>{data.recipe.tags[0]}</li>{/if}</ul>
			<h1 data-long={data.recipe.title.length > 60 ? '' : undefined}>{data.recipe.title}</h1>
		</div>
	</div>
	<div class="screen-body w-body">
		<RecipeView recipe={data.recipe} worst={data.worst} />
	</div>
</Frame>
