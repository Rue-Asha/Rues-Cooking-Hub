<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import RecipeForm from './RecipeForm.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>Write a recipe · hi-fi</title></svelte:head>

<Frame area="recipes" plus="hidden">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>New</li></ul>
			<h1>Write it <em class="accent-word">down</em></h1>
			<p class="lede">A title is all it needs. Everything else can be added later.</p>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<RecipeForm recipe={data.worst ? data.recipe : null} photo={data.worst ? 'image' : 'none'} worst={data.worst} />
	</div>
</Frame>
