<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../home/State.svelte';
	import { withOdd } from '../data.ts';
	import Block from '../Block.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const full = $derived(withOdd(data.recipe));
	const own = $derived(data.recipe.servings);
</script>

<svelte:head><title>Recipe, states · hi-fi</title></svelte:head>

<Frame area="recipes" plus="shown">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipe</li><li>States</li></ul>
			<h1 data-long>Recipe page <em class="accent-word">states</em></h1>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<div class="states">
			<State label="Scaled up" note="Servings {own * 2}: “for {own * 2}”, amounts scaled and in the accent colour, a range keeps both ends (2–3 cloves becomes 4–6), a line without a quantity stays, “Reset to {own} servings” appears.">
				<Block recipe={full} start={{ servings: own * 2 }} worst={data.worst} />
			</State>
			<State label="Scaled down" note="Servings {Math.max(1, Math.floor(own / 2))}: halves and fractions read as decimals with at most two.">
				<Block recipe={full} start={{ servings: Math.max(1, Math.floor(own / 2)) }} worst={data.worst} />
			</State>
			<State label="At one serving" note="The reset reads “Reset to {own} servings” here; at a recipe with one serving it would read “Reset to 1 serving” (proposed, gate 5).">
				<Block recipe={full} start={{ servings: 1 }} worst={data.worst} />
			</State>
			<State label="Invalid scale" note="Typing 0 keeps the previous scale and shows the alert; nothing else moves, focus stays in the field.">
				<Block recipe={data.recipe} start={{ servings: own, field: '0', alert: true }} worst={data.worst} />
			</State>
			<State label="No image, no times, no source, no description, no notes" note="The plate says “No photo yet”; absent lines leave no gap; tags fall back to “Recipe”.">
				<Block recipe={{ ...data.recipe, tags: [], favourite: false }} head hide={{ image: true, times: true, source: true, description: true, notes: true, tags: true }} worst={data.worst} />
			</State>
			<State label="Markup in the text" note="Notes and description are Markdown shown as typed: HTML and script in them stay inert text, never markup that runs.">
				<Block recipe={{ ...data.recipe, description: 'A <em>description</em> with <a href="javascript:alert(1)">markup</a>', notes: '<script>alert(1)<\/script> <img src=x onerror=alert(1)> <b>not bold</b> and **not bold either**' }} head hide={{ image: true, times: true, source: true, ingredients: true, steps: true, tags: true }} bar={false} worst={data.worst} />
			</State>
			<State label="No ingredients, no steps" note="Each card says so in one line.">
				<Block recipe={data.recipe} hide={{ ingredients: true, steps: true, notes: true }} worst={data.worst} />
			</State>
			<State label="Long lines" note="A 150-character line and a 60-character unbroken word wrap inside their card; fractions, decimals and ranges sit in the same list.">
				<Block recipe={full} bar={false} worst={data.worst} />
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
