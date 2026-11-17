<!-- One recipe page without the frame, for the states: the head, the servings bar and the cards. -->
<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import Bar from './Bar.svelte';
	import Cards from './Cards.svelte';
	import Head from './Head.svelte';

	type Hide = Partial<Record<'times' | 'source' | 'notes' | 'ingredients' | 'steps' | 'tags' | 'description' | 'image', boolean>>;
	type Props = { recipe: MockRecipeFull; start?: { servings?: number; field?: string; alert?: boolean }; hide?: Hide; head?: boolean; bar?: boolean; worst?: boolean };
	let { recipe, start = {}, hide = {}, head = false, bar = true, worst = false }: Props = $props();
	let scaled = $state<number | null>(null);
</script>

<div class="block">
	{#if head}<div class="head"><Head {recipe} {hide} /></div>{/if}
	{#if bar}<Bar {recipe} {start} bind:scaled times={!hide.times} {worst} />{/if}
	<Cards {recipe} scaled={scaled ?? start.servings ?? recipe.servings} {hide} />
</div>

<style>
	.block {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.head {
		display: grid;
		min-inline-size: 0;
	}
	.block :global(.seg-bar) {
		justify-self: stretch;
	}
</style>
