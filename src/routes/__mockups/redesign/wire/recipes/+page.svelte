<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import ArchiveBody from './ArchiveBody.svelte';
	import Icon from './Icon.svelte';
	import { plural, wire } from './util.ts';
	import './wire.css';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>Recipes (wireframe)</title></svelte:head>

<Frame area="recipes">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>{plural(data.recipes.length, 'recipe')}</li></ul>
			<h1>Recipes worth keeping</h1>
			<div class="w-lead-actions">
				<a class="w-btn primary" href={wire('import', data.worst)}>Add recipe<Icon name="arrow" /></a>
				<a class="w-btn" href={wire('tags', data.worst)}>Manage tags</a>
			</div>
		</div>
	</div>
	<div class="screen-body w-body">
		<ArchiveBody all={data.recipes} shown={data.recipes} tags={data.tags} worst={data.worst} expanded={false} />
	</div>
</Frame>
