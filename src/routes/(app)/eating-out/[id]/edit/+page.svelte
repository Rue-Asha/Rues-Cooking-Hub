<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import SpotForm from '#lib/spots/SpotForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Edit {data.draft.name} · Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker">
			<li>Eating Out</li>
			<li>Edit</li>
		</ul>
		<h1>Edit <em class="accent-word">spot</em></h1>
		<p class="lede">{data.draft.name}</p>
	</div>
</header>

<div class="screen-body">
	<SpotForm
		draft={data.draft}
		tags={data.tags}
		errors={form?.errors}
		cancelHref="/eating-out/{data.id}"
		notice={data.imageFailed === 'kept' ? COPY.imageKept : data.imageFailed ? COPY.imageFailed : null}
	/>
</div>
