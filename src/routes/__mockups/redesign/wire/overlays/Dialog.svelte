<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	type Props = {
		title: string;
		context?: string;
		label?: string;
		alert?: boolean;
		wide?: boolean;
		children?: Snippet;
		actions?: Snippet;
	};
	let { title, context, label, alert = false, wide = false, children, actions }: Props = $props();
</script>

<div class="dialog" class:wide role={alert ? 'alertdialog' : 'dialog'} aria-modal="true" aria-label={label ?? title}>
	<header class="head">
		<div class="titles">
			{#if context}<p class="context">{context}</p>{/if}
			<h2 class="title">{title}</h2>
		</div>
		<Button variant="quiet" size="s" icon="close" label="Close" />
	</header>
	{#if children}<div class="content">{@render children()}</div>{/if}
	{#if actions}<footer class="actions">{@render actions()}</footer>{/if}
</div>

<style>
	.dialog {
		display: grid;
		gap: var(--space-4);
		inline-size: min(100%, 28rem);
		padding: var(--space-5) var(--space-6) var(--space-6);
		border-radius: var(--radius-card);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		min-inline-size: 0;
		text-align: start;
	}
	.dialog.wide { inline-size: min(100%, 34rem); }
	.head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); }
	.titles { display: grid; gap: var(--space-1); min-inline-size: 0; }
	.context {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}
	.title {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		overflow-wrap: anywhere;
		hyphens: auto;
	}
	.content { display: grid; gap: var(--space-3); min-inline-size: 0; overflow-wrap: anywhere; }
	.actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-2); padding-block-start: var(--space-3); box-shadow: var(--sheet-footer-rule); }
	@media (max-width: 767px) {
		.dialog {
			inline-size: 100%;
			padding: var(--space-4) var(--space-4) var(--space-5);
			border-end-start-radius: 0;
			border-end-end-radius: 0;
		}
		.actions :global(.btn) { flex: 1 1 8rem; }
	}
</style>
