<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import ArchiveBody from '../ArchiveBody.svelte';
	import Specimen from '../Specimen.svelte';
	import '../wire.css';

	const data = $derived(mockData(new URL(page.url.href)));
	const some = $derived(data.recipes.slice(0, 3));
	const one = $derived(data.recipes.slice(0, 1));
	const soup = $derived(data.recipes.filter((r) => r.tags.includes('Soup') || r.tags.includes('Quick')));
	const bare = $derived(data.recipes.filter((r) => !r.image || !r.description || r.prepMinutes === null || r.cookMinutes === null).slice(0, 4));
	const longest = $derived([...data.recipes].sort((a, b) => b.title.length - a.title.length).slice(0, 3));
</script>

<svelte:head><title>Recipes, states (wireframe)</title></svelte:head>

<Frame area="recipes">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>States</li></ul>
			<h1 data-long>Recipes worth keeping</h1>
		</div>
	</div>
	<div class="screen-body w-states">
		<Specimen label="No recipes" note="Empty archive: no Featured, filters or list. One action.">
			<div class="w-body"><ArchiveBody all={[]} shown={[]} tags={[]} worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Zero matches" note="Filters Soup + Favourites and the word “lemon” match nothing. Clear filters is the one action.">
			<div class="w-body"><ArchiveBody all={data.recipes} shown={[]} tags={data.tags} selected={['Soup']} fav q="lemon" worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Filters active, matches exist" note="Tag filter Soup plus search “soup”: count line names the filters; Clear filters stays available.">
			<div class="w-body"><ArchiveBody all={data.recipes} shown={soup} tags={data.tags} selected={['Soup']} q="soup" worst={data.worst} /></div>
		</Specimen>
		<Specimen label="One recipe" note="“1 recipe”, Featured 01 / 01 without previous and next.">
			<div class="w-body"><ArchiveBody all={one} shown={one} tags={data.tags.slice(0, 3)} worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Three recipes" note="Featured 01 / 03, previous disabled at the first.">
			<div class="w-body"><ArchiveBody all={some} shown={some} tags={data.tags} worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Without image, description or time" note="A plate stands in for the photo; absent lines leave no gap.">
			<div class="w-body"><ArchiveBody all={bare} shown={bare} tags={data.tags} featuredIndex={Math.max(0, bare.length - 1)} worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Long titles and all tags" note="Titles clamp to two lines in the list and three in Featured; tag filters wrap and show every tag when opened.">
			<div class="w-body"><ArchiveBody all={longest} shown={longest} tags={data.tags} expanded worst={data.worst} /></div>
		</Specimen>
	</div>
</Frame>
