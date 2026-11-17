<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import '../recipes/wire.css';
	import RecipeForm from './RecipeForm.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>Write a recipe (wireframe)</title></svelte:head>

<Frame area="recipes" plus="hidden">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>New</li></ul>
			<h1>Write it down</h1>
			<p class="lede">{data.worst ? '50 ingredient lines: Save stays in reach in a bar that sticks to the bottom edge.' : 'Save stays in reach in a bar that sticks to the bottom edge.'}</p>
		</div>
	</div>
	<div class="screen-body w-body">
		<RecipeForm recipe={data.worst ? data.recipe : null} photo="none" worst={data.worst} />
	</div>
</Frame>
