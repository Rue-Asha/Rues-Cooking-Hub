<script lang="ts">
	import type { Snippet } from 'svelte';

	// A window of a fixed width on the photo: the strip on top, the bar on its bottom edge with the 8 px margin the frame gives it.
	type Props = { width: number; label: string; height?: number; photo?: string; top?: Snippet; children?: Snippet; bar?: Snippet };
	let { width, label, height = 420, photo = 'spaghetti-pomodoro', top, children, bar }: Props = $props();
</script>

<div class="device" role="group" aria-label={label} style:inline-size={`${width}px`} style:min-block-size={`${height}px`} style:--shot={`url("/mockups/${photo}.jpg")`}>
	<span class="chrome">{width} px</span>
	{#if top}<div class="top">{@render top()}</div>{/if}
	<div class="body">{@render children?.()}</div>
	{#if bar}<div class="bar">{@render bar()}</div>{/if}
</div>

<style>
	.device {
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-inline-size: none;
		padding: var(--space-3-5) var(--space-2) var(--space-2);
		border-radius: var(--radius-frame-compact);
		background: var(--shot) center / cover;
		box-shadow: var(--ring-hairline);
		overflow: clip;
		color: var(--ink);
	}
	.device::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: var(--surface-frame);
	}
	.chrome {
		align-self: center;
		padding-inline: var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-glass-strong);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
	.top,
	.bar {
		min-inline-size: 0;
		padding-inline: var(--space-1);
	}
	.body {
		flex: 1;
		display: grid;
		gap: var(--space-3);
		align-content: start;
		min-inline-size: 0;
		padding-inline: var(--space-2);
	}
</style>
