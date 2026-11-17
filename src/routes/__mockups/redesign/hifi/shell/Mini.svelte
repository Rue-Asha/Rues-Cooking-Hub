<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, lines = 2, children }: { title: string; lines?: number; children?: Snippet } = $props();
</script>

<div class="mini">
	<h4>{title}</h4>
	{#if children}{@render children()}{:else}
		{#each Array.from({ length: lines }) as _, i (i)}<div class="line"></div>{/each}
	{/if}
</div>

<style>
	.mini {
		display: grid;
		gap: var(--space-2);
		min-inline-size: 0;
		padding: var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-card);
		box-shadow: var(--shadow-rim);
	}
	h4 {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		overflow-wrap: anywhere;
	}
	.line {
		block-size: var(--space-3);
		border-radius: var(--radius-pill);
		background: var(--surface-tint-strong);
	}
	.line:nth-child(odd) {
		inline-size: 70%;
	}
</style>
