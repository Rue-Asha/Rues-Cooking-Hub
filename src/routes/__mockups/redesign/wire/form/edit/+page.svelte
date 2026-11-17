<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import '../../recipes/wire.css';
	import RecipeForm from '../RecipeForm.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>Edit recipe (wireframe)</title></svelte:head>

<Frame area="recipes" plus="hidden">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>Edit</li></ul>
			<h1>Edit recipe</h1>
		</div>
	</div>
	<div class="screen-body w-body">
		<RecipeForm recipe={data.recipe} photo="image" worst={data.worst} cancelTo="recipe" newTags={['Autumn']} />
	</div>
</Frame>
