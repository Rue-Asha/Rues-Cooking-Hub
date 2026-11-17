<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let { kind = 'status', children }: { kind?: 'status' | 'alert'; children: Snippet } = $props();
</script>

<p class="notice" role={kind === 'alert' ? 'alert' : 'status'}>
	<Icon name={kind === 'alert' ? 'alert' : 'check'} />
	<span class="text">{@render children()}</span>
</p>

<style>
	.notice {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2-5);
		inline-size: min(100%, 30rem);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		min-inline-size: 0;
	}
	.notice :global(svg) { flex: none; margin-block-start: 1px; }
	.text { min-inline-size: 0; overflow-wrap: anywhere; }
</style>
