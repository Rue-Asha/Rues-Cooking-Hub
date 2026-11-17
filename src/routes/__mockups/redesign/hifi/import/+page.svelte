<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import ImportBody from './ImportBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>Import a recipe · hi-fi</title></svelte:head>

<Frame area="recipes" plus="hidden">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>New</li></ul>
			<h1>Bring a recipe <em class="accent-word">home</em></h1>
			<p class="lede">Paste the link to a recipe page and check what we found before it is saved.</p>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<ImportBody state="initial" link={data.worst ? (data.recipe.sourceUrl ?? '') : ''} worst={data.worst} />
	</div>
</Frame>
