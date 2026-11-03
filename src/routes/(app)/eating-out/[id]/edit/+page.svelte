<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import SpotForm from '#lib/spots/SpotForm.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Edit {data.draft.name} · Rues Cooking Hub</title>
</svelte:head>

<div class="column page" data-column>
	<header class="enter" data-page-header>
		<Kicker parts={['Eating Out', 'Edit']} />
		<h1>Edit <em>spot</em></h1>
	</header>

	<SpotForm
		draft={data.draft}
		tags={data.tags}
		errors={form?.errors}
		heading={data.draft.name}
		cancelHref="/eating-out/{data.id}"
		notice={data.imageFailed === 'kept' ? COPY.imageKept : data.imageFailed ? COPY.imageFailed : null}
	/>
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
