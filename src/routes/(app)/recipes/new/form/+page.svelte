<script lang="ts">
	import RecipeForm from '#lib/recipes/RecipeForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// the page settles in on a full page load only
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');
</script>

<svelte:head>
	<title>New recipe · Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker"><li>Recipes</li><li>New</li></ul>
		<h1>Write it <em class="accent-word">down</em></h1>
		<p class="lede">A title is all it needs. Everything else can be added later.</p>
	</div>
</header>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	<RecipeForm draft={data.draft} tags={data.tags} errors={form?.errors} heading="The recipe" cancelHref="/recipes" untitled="New recipe" keep restore />
</div>
