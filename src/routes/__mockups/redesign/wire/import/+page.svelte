<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import '../recipes/wire.css';
	import ImportBody from './ImportBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>Import a recipe (wireframe)</title></svelte:head>

<Frame area="recipes" plus="hidden">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>New</li></ul>
			<h1>Bring a recipe home</h1>
		</div>
	</div>
	<div class="screen-body w-body">
		<ImportBody state="initial" link={data.worst ? (data.recipe.sourceUrl ?? '') : ''} worst={data.worst} />
	</div>
</Frame>
