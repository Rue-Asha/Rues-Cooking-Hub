<script lang="ts">
	import SpotForm, { emptySpot } from '#lib/spots/SpotForm.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Add spot · Rues Cooking Hub</title>
</svelte:head>

<div class="column page" data-column>
	<header class="enter" data-page-header>
		<Kicker parts={['Eating Out', 'New']} />
		<h1>A new <em>spot</em></h1>
	</header>

	<SpotForm draft={emptySpot()} tags={data.tags} errors={form?.errors} />
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-7);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
	}

	.enter {
		animation: enter var(--d-slow) var(--ease-out) both;
	}

	@keyframes enter {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.enter {
			animation: none;
		}
	}
</style>
