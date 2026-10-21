<script lang="ts">
	import { heroName } from '#lib/motion.ts';
	import type { RecipeCard as RecipeCardData } from '#lib/types.ts';
	import Card from '#lib/ui/Card.svelte';
	import FavouriteButton from './FavouriteButton.svelte';

	let { recipe, compact = false }: { recipe: RecipeCardData; compact?: boolean } = $props();
</script>

<Card
	href="/recipes/{recipe.id}"
	title={recipe.title}
	description={recipe.description}
	image={recipe.imageId === null ? null : `/images/${recipe.imageId}`}
	minutes={recipe.totalMinutes}
	tags={recipe.tags.map((t) => t.name)}
	favourite={recipe.favourite}
	heroName={heroName(recipe.id)}
	{compact}
>
	{#snippet fav()}<FavouriteButton id={recipe.id} title={recipe.title} favourite={recipe.favourite} />{/snippet}
</Card>
