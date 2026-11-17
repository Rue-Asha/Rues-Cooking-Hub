<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { label: string; note?: string; width?: number; children: Snippet };
	let { label, note, width, children }: Props = $props();
</script>

<section class="spec" aria-label={label}>
	<header>
		<h3 class="ruled">{label}</h3>
		{#if note}<p>{note}</p>{/if}
	</header>
	<div class="scroll">
		<div class="box" style:inline-size={width ? `${width}px` : undefined}>{@render children()}</div>
	</div>
</section>

<style>
	.spec {
		display: grid;
		gap: var(--space-2-5);
		min-inline-size: 0;
	}
	header {
		display: grid;
		gap: var(--space-1);
	}
	p {
		max-inline-size: var(--measure);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.scroll {
		min-inline-size: 0;
		overflow-x: auto;
		padding-block: var(--space-1);
	}
	.box {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		min-inline-size: 0;
		max-inline-size: none;
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
</style>
