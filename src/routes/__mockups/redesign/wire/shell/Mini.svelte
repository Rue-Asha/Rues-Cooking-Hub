<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, lines = 3, children }: { title: string; lines?: number; children?: Snippet } = $props();
</script>

<div class="mini">
	<h4>{title}</h4>
	{#if children}{@render children()}{:else}
		<div class="w-ph block">Content</div>
		{#each Array.from({ length: lines }) as _, i (i)}<div class="w-ph line"></div>{/each}
	{/if}
</div>

<style>
	.mini {
		display: grid;
		gap: var(--space-2);
		min-inline-size: 0;
	}
	h4 {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		overflow-wrap: anywhere;
	}
	.block {
		min-block-size: var(--space-16);
		border-radius: var(--radius-item);
	}
	.line {
		block-size: var(--space-4);
		border-radius: var(--radius-pill);
	}
	.line:nth-child(odd) {
		inline-size: 70%;
	}
</style>
