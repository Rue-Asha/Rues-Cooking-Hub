<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import RecipeForm from '#lib/recipes/RecipeForm.svelte';
	import { useStage } from '#lib/shell/stage.svelte.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// the page settles in on a full page load only
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');

	useStage(() => (data.draft.imageId ? `/images/${data.draft.imageId}` : null));
</script>

<svelte:head>
	<title>Edit {data.draft.title} · Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker"><li>Recipes</li><li>Edit</li></ul>
		<h1>Edit <em class="accent-word">recipe</em></h1>
	</div>
</header>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	<RecipeForm
		draft={data.draft}
		tags={data.tags}
		errors={form?.errors}
		heading={data.draft.title}
		cancelHref="/recipes/{data.id}"
		notice={data.imageFailed === 'kept' ? COPY.imageKept : data.imageFailed ? COPY.imageFailed : null}
	/>
</div>
