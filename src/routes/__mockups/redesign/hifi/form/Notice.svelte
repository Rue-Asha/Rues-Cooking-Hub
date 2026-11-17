<!--
	The status notice every outcome uses (P9: the existing messages, restyled, no toast): a raised card with an ink mark and
	words, never colour alone. tone "alert" adds the danger ring and the alert icon and is announced at once.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Ic, { type Name } from '../recipes/Ic.svelte';

	type Props = { title: string; tone?: 'ok' | 'info' | 'alert'; icon?: Name; children?: Snippet; actions?: Snippet };
	let { title, tone = 'ok', icon, children, actions }: Props = $props();
	const shown = $derived<Name>(icon ?? (tone === 'alert' ? 'alert' : tone === 'info' ? 'search' : 'check'));
</script>

<div class={['notice', tone]} data-surface="solid" role={tone === 'alert' ? 'alert' : 'status'}>
	<span class="mark" aria-hidden="true"><Ic name={shown} /></span>
	<div class="body">
		<strong>{title}</strong>
		{#if children}<p>{@render children()}</p>{/if}
		{#if actions}<div class="acts">{@render actions()}</div>{/if}
	</div>
</div>

<style>
	.notice {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-card);
		color: var(--ink);
		min-inline-size: 0;
	}
	.alert {
		box-shadow: var(--ring-danger);
	}
	.mark {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-9);
		block-size: var(--space-9);
		border-radius: var(--radius-round);
		background: var(--surface-tint-strong);
	}
	.alert .mark {
		background: var(--danger-soft);
		color: var(--danger);
	}
	.body {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
		padding-block: var(--space-1-5);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		overflow-wrap: anywhere;
	}
	strong {
		font-weight: var(--weight-semibold);
	}
	p {
		color: var(--ink-secondary);
	}
	.body :global(a) {
		color: var(--ink);
		font-weight: var(--weight-semibold);
	}
	.acts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-2);
	}
</style>
