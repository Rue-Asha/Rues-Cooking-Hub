<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../home/State.svelte';
	import Archive from '../Archive.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const some = $derived(data.recipes.slice(0, 3));
	const one = $derived(data.recipes.slice(0, 1));
	const bare = $derived(data.recipes.filter((r) => !r.image || !r.description || r.prepMinutes === null || r.cookMinutes === null).slice(0, 4));
	const longest = $derived([...data.recipes].sort((a, b) => b.title.length - a.title.length).slice(0, 3));
	const manyTags = $derived(data.tags.length > 8 ? data.tags : [...data.tags, ...data.tags.map((t) => ({ ...t, name: `${t.name} too` }))]);
	const lastTag = $derived([...manyTags].sort((a, b) => a.name.localeCompare(b.name)).at(-1)?.name ?? '');
</script>

<svelte:head><title>Recipes, states · hi-fi</title></svelte:head>

<Frame area="recipes">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>States</li></ul>
			<h1 data-long>Recipes <em class="accent-word">states</em></h1>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<div class="states">
			<State label="No recipes" note="Empty archive: no Featured, filters or list. One action.">
				<Archive all={[]} tags={[]} worst={data.worst} />
			</State>
			<State label="Zero matches" note="Favourites plus Soup and the word “lemon” match nothing. Clear filters is the one action.">
				<Archive all={data.recipes} tags={data.tags} start={{ selected: ['Soup'], fav: true, q: 'lemon' }} worst={data.worst} />
			</State>
			<State label="Filters active, matches exist" note="Tag Soup plus search “soup”: the count line names the filters; Clear filters stays available.">
				<Archive all={data.recipes} tags={data.tags} start={{ selected: ['Soup'], q: 'soup' }} worst={data.worst} />
			</State>
			<State label="One recipe" note="“1 recipe”, Featured 01 / 01 without previous and next.">
				<Archive all={one} tags={data.tags.slice(0, 3)} worst={data.worst} />
			</State>
			<State label="Three recipes" note="Featured 01 / 03, previous disabled at the first.">
				<Archive all={some} tags={data.tags} worst={data.worst} />
			</State>
			<State label="Without image, description or time" note="A plate stands in for the photo; absent lines leave no gap. Featured shows the last of them.">
				<Archive all={bare} tags={data.tags} start={{ featured: Math.max(0, bare.length - 1) }} featured={Math.max(0, bare.length - 1)} worst={data.worst} />
			</State>
			<State label="Many tags, collapsed" note="Eight tags and “Show all N tags”; a selected tag outside the eight (here {lastTag}) stays in view.">
				<Archive all={data.recipes} tags={manyTags} start={{ selected: [lastTag] }} worst={data.worst} />
			</State>
			<State label="Long titles and all tags" note="Titles clamp to two lines in the list and three in Featured; the tag filter wraps and shows every tag once opened.">
				<Archive all={longest} tags={manyTags} start={{ expanded: true }} worst={data.worst} />
			</State>
		</div>
	</div>
</Frame>

<style>
	.states {
		display: grid;
		gap: var(--space-8);
		min-inline-size: 0;
	}
</style>
