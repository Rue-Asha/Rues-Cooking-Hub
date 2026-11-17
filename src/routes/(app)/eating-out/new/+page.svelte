<script lang="ts">
	import SpotForm, { emptySpot } from '#lib/spots/SpotForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Add spot · Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker">
			<li>Eating Out</li>
			<li>New</li>
		</ul>
		<h1>A new <em class="accent-word">spot</em></h1>
		<p class="lede">Only the name is required; Visited asks for a score.</p>
	</div>
</header>

<div class="screen-body">
	<SpotForm draft={emptySpot()} tags={data.tags} errors={form?.errors} />
</div>
