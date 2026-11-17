<script lang="ts">
	import type { Snippet } from 'svelte';

	// A window of a fixed width: the bar sits on its bottom edge with the 8 px side margin the phone Frame gives it.
	type Props = { width: number; label: string; height?: number; top?: Snippet; children?: Snippet; bar?: Snippet };
	let { width, label, height = 460, top, children, bar }: Props = $props();
</script>

<div class="device" role="group" aria-label={label} style:inline-size={`${width}px`} style:min-block-size={`${height}px`}>
	<div class="chrome">{width} px</div>
	{#if top}<div class="top">{@render top()}</div>{/if}
	<div class="body">{@render children?.()}</div>
	{#if bar}<div class="bar">{@render bar()}</div>{/if}
</div>

<style>
	.device {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-inline-size: none;
		padding: var(--space-2) var(--space-2) var(--space-2);
		border-radius: var(--radius-card);
		background: var(--surface-page);
		box-shadow: var(--ring-control);
		color: var(--ink);
	}
	.chrome {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-muted);
		text-align: center;
		font-variant-numeric: var(--numeric-figures);
	}
	.top,
	.body {
		min-inline-size: 0;
		padding-inline: var(--space-1);
	}
	.body {
		flex: 1;
		display: grid;
		gap: var(--space-3);
		align-content: start;
	}
</style>
