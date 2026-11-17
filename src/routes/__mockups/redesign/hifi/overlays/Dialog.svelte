<!--
	A dialog drawn open, for specimens: the same look as shell/Sheet.svelte (glass card, display-s title, round close,
	footer rule) without the modal behaviour. Bottom sheet below 768 px, centred card from 768 px.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Props = { title: string; kicker?: string; label?: string; alert?: boolean; children?: Snippet; actions?: Snippet };
	let { title, kicker, label, alert = false, children, actions }: Props = $props();
	const uid = $props.id();
</script>

<div class="dialog" role={alert ? 'alertdialog' : 'dialog'} aria-modal="true" aria-label={label} aria-labelledby={label ? undefined : `${uid}-t`}>
	<header>
		<div class="head">
			{#if kicker}<p class="kicker">{kicker}</p>{/if}
			<h2 id="{uid}-t">{title}</h2>
		</div>
		<button type="button" class="close" aria-label="Close" data-press="round"><Icon name="close" /></button>
	</header>
	{#if children}<div class="body">{@render children()}</div>{/if}
	{#if actions}<footer>{@render actions()}</footer>{/if}
</div>

<style>
	.dialog {
		display: flex;
		flex-direction: column;
		inline-size: 100%;
		max-inline-size: var(--measure);
		border-radius: var(--radius-card) var(--radius-card) 0 0;
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		color: var(--ink);
		overflow: hidden;
		min-inline-size: 0;
		text-align: start;
	}
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-4) var(--space-3) var(--space-5);
	}
	.head {
		min-inline-size: 0;
	}
	.kicker {
		margin-block-end: var(--space-1);
		font-size: var(--type-kicker-size);
		line-height: var(--type-kicker-line);
		letter-spacing: var(--type-kicker-tracking);
		font-weight: var(--type-kicker-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
	h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		overflow-wrap: anywhere;
		hyphens: auto;
	}
	.close {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height-s), var(--target));
		block-size: max(var(--control-height-s), var(--target));
		margin-block-start: calc(-1 * var(--space-1));
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		color: var(--ink);
	}
	.body {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-1) var(--space-5) var(--space-5);
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		padding: var(--sheet-footer-padding-block-start) var(--sheet-footer-padding-inline) var(--sheet-footer-padding-block-end);
		box-shadow: var(--sheet-footer-rule);
	}
	@media (min-width: 768px) {
		.dialog {
			border-radius: var(--radius-card);
		}
		header {
			padding: var(--space-6) var(--space-5) var(--space-3) var(--space-6);
		}
		.body {
			padding-inline: var(--space-6);
		}
		footer {
			padding-inline: var(--sheet-footer-padding-inline-wide);
		}
	}
</style>
