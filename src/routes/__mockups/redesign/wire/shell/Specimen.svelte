<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { label: string; note?: string; width?: number; children: Snippet };
	let { label, note, width, children }: Props = $props();
</script>

<section class="specimen" aria-label={label}>
	<header>
		<h3>{label}</h3>
		{#if note}<p>{note}</p>{/if}
	</header>
	<div class="scroll">
		<div class="box" style:inline-size={width ? `${width}px` : undefined}>{@render children()}</div>
	</div>
</section>

<style>
	.specimen {
		display: grid;
		gap: var(--space-2-5);
		min-inline-size: 0;
	}
	header {
		display: grid;
		gap: var(--space-0-5);
	}
	h3 {
		font-size: var(--type-kicker-size);
		line-height: var(--type-kicker-line);
		letter-spacing: var(--type-kicker-tracking);
		font-weight: var(--type-kicker-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}
	p {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-muted);
		max-inline-size: var(--measure);
	}
	.scroll {
		min-inline-size: 0;
		padding-block-start: var(--space-3);
		border-block-start: var(--stroke-hairline) dashed var(--edge-control);
		overflow-x: auto;
	}
	.box {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		max-inline-size: none;
		min-inline-size: 0;
		padding: var(--space-3);
		border-radius: var(--radius-card-s);
		background: var(--surface-sunken);
	}
</style>
