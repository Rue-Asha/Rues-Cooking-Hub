<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { photoName } from '../../recipes/util.ts';
	import RecipeForm from '../RecipeForm.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>Edit recipe · hi-fi</title></svelte:head>

<Frame area="recipes" plus="hidden" photo={photoName(data.recipe.image)}>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>Edit</li></ul>
			<h1>Edit <em class="accent-word">recipe</em></h1>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<RecipeForm recipe={data.recipe} photo="image" heading={data.recipe.title} cancelTo="recipe" newTags={['Autumn']} worst={data.worst} />
	</div>
</Frame>
