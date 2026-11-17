<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Button from '../shell/Button.svelte';
	import { go, plural } from '../recipes/util.ts';
	import TagsBody from './TagsBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const used = $derived(data.tags.filter((t) => t.count > 0).length);
</script>

<svelte:head><title>Manage tags · hi-fi</title></svelte:head>

<Frame area="recipes">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>{plural(data.tags.length, 'tag')}</li></ul>
			<h1>Manage <em class="accent-word">tags</em></h1>
			<p class="lede">Rename a tag onto one that already exists and the two become one. New tags are added while editing a recipe.</p>
			<Button href={go.recipes(data.worst)}>All recipes</Button>
		</div>
		<ul class="screen-facts" data-surface="inverse" aria-label="Your tags">
			<li class="facts-caption" aria-hidden="true">Your tags</li>
			<li><span class="n">{data.tags.length.toLocaleString('en-GB')}</span>{data.tags.length === 1 ? 'Tag' : 'Tags'}</li>
			<li><span class="n">{used.toLocaleString('en-GB')}</span>In use</li>
			<li><span class="n">{(data.tags.length - used).toLocaleString('en-GB')}</span>Unused</li>
		</ul>
	</header>

	<div class="screen-body" data-settle>
		<TagsBody tags={data.tags} worst={data.worst} />
	</div>
</Frame>
