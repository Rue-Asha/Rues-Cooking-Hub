<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	const missing = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{missing ? 'Recipe not found' : 'Something went wrong'} · Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker">
			<li>Recipe</li>
			<li>{page.status}</li>
		</ul>
		{#if missing}
			<h1>Recipe not <em class="accent-word">found</em></h1>
		{:else}
			<h1>Something went <em class="accent-word">wrong</em></h1>
		{/if}
	</div>
</header>

<div class="screen-body" data-settle>
	<section class="card gone" data-surface="solid" aria-label={missing ? 'Recipe not found' : 'Something went wrong'}>
		<p>{missing ? "This recipe doesn't exist, or it was deleted." : page.error?.message}</p>
		<Button href="/recipes"><Icon name="arrow-left" size={18} />Back to recipes</Button>
	</section>
</div>

<style>
	.gone {
		display: grid;
		gap: var(--space-3);
		justify-items: start;
		padding: var(--space-6);
		max-inline-size: 36rem;
	}
	.gone p {
		color: var(--ink-secondary);
	}
</style>
