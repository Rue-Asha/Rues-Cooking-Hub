<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Button from '../shell/Button.svelte';
	import Archive from './Archive.svelte';
	import { go, photoName, plural } from './util.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	let featured = $state(0);
	const favourites = $derived(data.recipes.filter((r) => r.favourite).length);
	const photo = $derived(photoName(data.recipes[Math.min(featured, 6)]?.image ?? null));
</script>

<svelte:head><title>Recipes · hi-fi</title></svelte:head>

<Frame area="recipes" {photo}>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>{plural(data.recipes.length, 'recipe')}</li></ul>
			<h1>Recipes worth <em class="accent-word">keeping</em></h1>
			<p class="lede">Search by name, ingredient or tag, or open one of the newest.</p>
			<div class="lead-actions">
				<Button variant="primary" arrow href={go.import(data.worst)}>Add recipe</Button>
				<Button href={go.tags(data.worst)}>Manage tags</Button>
			</div>
		</div>
		<ul class="screen-facts" data-surface="inverse" aria-label="Your archive">
			<li class="facts-caption" aria-hidden="true">Whole archive</li>
			<li><span class="n">{data.recipes.length.toLocaleString('en-GB')}</span>{data.recipes.length === 1 ? 'Recipe' : 'Recipes'}</li>
			<li><span class="n">{favourites.toLocaleString('en-GB')}</span>{favourites === 1 ? 'Favourite' : 'Favourites'}</li>
			<li><span class="n">{data.tags.length.toLocaleString('en-GB')}</span>{data.tags.length === 1 ? 'Tag' : 'Tags'}</li>
		</ul>
	</header>

	<div class="screen-body" data-settle>
		<Archive all={data.recipes} tags={data.tags} worst={data.worst} bind:featured />
	</div>
</Frame>

<style>
	.lead-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-1);
	}
</style>
