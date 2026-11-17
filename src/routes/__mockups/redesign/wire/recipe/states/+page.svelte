<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Icon from '../../recipes/Icon.svelte';
	import Specimen from '../../recipes/Specimen.svelte';
	import { wire } from '../../recipes/util.ts';
	import '../../recipes/wire.css';
	import { withOdd } from '../data.ts';
	import RecipeView from '../RecipeView.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const full = $derived(withOdd(data.recipe));
	const own = $derived(data.recipe.servings);
</script>

<svelte:head><title>Recipe, states (wireframe)</title></svelte:head>

<Frame area="recipes" plus="shown">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipe</li><li>States</li></ul>
			<h1 data-long>Recipe page states</h1>
		</div>
	</div>
	<div class="screen-body w-states">
		<Specimen label="Scaled up" note="Servings 8: “for 8”, amounts scaled, a range keeps both ends (2–3 cloves becomes 4–6), a line without a quantity stays, “Reset to {own} servings” appears.">
			<div class="w-body"><RecipeView recipe={full} servings={own * 2} worst={data.worst} hide={{ image: false }} /></div>
		</Specimen>
		<Specimen label="Scaled down" note="Servings 2: halves and fractions read as decimals with at most two.">
			<div class="w-body"><RecipeView recipe={full} servings={Math.max(1, Math.floor(own / 2))} worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Invalid scale" note="Typing 0 keeps the previous scale and shows the alert; nothing else moves, focus stays in the field.">
			<div class="w-body"><RecipeView recipe={data.recipe} servings={own} field="0" alert worst={data.worst} /></div>
		</Specimen>
		<Specimen label="No image, no times, no source, no description, no notes" note="The plate says “No photo yet”; absent lines leave no gap; tags fall back to “Recipe”.">
			<div class="w-body"><RecipeView recipe={{ ...data.recipe, tags: [], favourite: false }} worst={data.worst} hide={{ image: true, times: true, source: true, description: true, notes: true }} /></div>
		</Specimen>
		<Specimen label="No ingredients, no steps">
			<div class="w-body"><RecipeView recipe={data.recipe} worst={data.worst} hide={{ ingredients: true, steps: true, notes: true }} /></div>
		</Specimen>
		<Specimen label="Long lines" note="A 150-character line and a 60-character unbroken word wrap inside their card; fractions, decimals and ranges sit in the same list.">
			<div class="w-body"><RecipeView recipe={full} worst={data.worst} chrome={false} /></div>
		</Specimen>
		<Specimen label="Recipe not found" note="Unknown or non-numeric id answers 404; today the framework's page, here a plain not-found with the way back.">
			<section class="w-card w-empty">
				<h2>Recipe not found</h2>
				<p>This recipe doesn't exist, or it was deleted.</p>
				<a class="w-btn" href={wire('recipes', data.worst)}><Icon name="back" />Back to recipes</a>
			</section>
		</Specimen>
	</div>
</Frame>
