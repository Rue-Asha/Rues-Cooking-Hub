<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { plural, wire } from '../recipes/util.ts';
	import '../recipes/wire.css';
	import TagsBody from './TagsBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>Manage tags (wireframe)</title></svelte:head>

<Frame area="recipes">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>{plural(data.tags.length, 'tag')}</li></ul>
			<h1>Manage tags</h1>
			<p class="lede">Rename a tag onto one that already exists and the two become one. New tags are added while editing a recipe.</p>
			<div class="w-lead-actions"><a class="w-btn" href={wire('recipes', data.worst)}>All recipes</a></div>
		</div>
	</div>
	<div class="screen-body w-body">
		<TagsBody tags={data.tags} />
	</div>
</Frame>
