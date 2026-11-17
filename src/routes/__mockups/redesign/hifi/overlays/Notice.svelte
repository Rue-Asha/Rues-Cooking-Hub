<!-- The existing status notices on one shared style (G5): raised surface, ink text, an icon, never colour alone. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let { kind = 'status', children }: { kind?: 'status' | 'alert'; children: Snippet } = $props();
</script>

<p class="notice" data-kind={kind} role={kind === 'alert' ? 'alert' : 'status'}>
	<span class="mark" aria-hidden="true"><Icon name={kind === 'alert' ? 'alert' : 'check'} size={16} /></span>
	<span class="text">{@render children()}</span>
</p>

<style>
	.notice {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		inline-size: min(100%, calc(var(--measure) * 0.75));
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-2) var(--space-4) var(--space-2) var(--space-2);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		min-inline-size: 0;
		text-align: start;
	}
	.mark {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-7);
		block-size: var(--space-7);
		border-radius: var(--radius-round);
		background: var(--surface-sunken);
		color: var(--ink);
	}
	.notice[data-kind='alert'] .mark {
		background: var(--danger-soft);
		color: var(--danger);
	}
	.text {
		min-inline-size: 0;
		padding-block: var(--space-1);
		overflow-wrap: anywhere;
	}
</style>
