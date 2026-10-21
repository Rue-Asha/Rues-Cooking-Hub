<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reducedMotion } from '#lib/motion.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let {
		open,
		title,
		label = title,
		kicker,
		onclose,
		children
	}: { open: boolean; title: string; label?: string; kicker?: string; onclose: () => void; children: Snippet } = $props();

	let dialog: HTMLDialogElement;
	let closing = $state(false);

	// the dialog leaves with its own animation before it is really closed
	$effect(() => {
		if (open) {
			closing = false;
			if (!dialog.open) dialog.showModal();
		} else if (dialog.open) {
			if (reducedMotion()) dialog.close();
			else closing = true;
		}
	});

	function finish() {
		if (!closing) return;
		closing = false;
		dialog.close();
	}
</script>

<dialog
	bind:this={dialog}
	aria-label={label}
	data-closing={closing ? '' : undefined}
	oncancel={(e) => {
		e.preventDefault();
		onclose();
	}}
	onclick={(e) => {
		if (e.target === dialog) onclose();
	}}
	onanimationend={(e) => {
		if (e.target === dialog) finish();
	}}
>
	<div class="sheet">
		<header>
			<div>
				{#if kicker}<p class="kicker">{kicker}</p>{/if}
				<h2>{title}</h2>
			</div>
			<button type="button" class="close" aria-label="Close" onclick={onclose}><Icon name="x" size={18} /></button>
		</header>
		{#if open || closing}{@render children()}{/if}
	</div>
</dialog>

<style>
	dialog {
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--ink);
		overflow: visible;
		max-inline-size: none;
		max-block-size: none;
		margin: auto 0 0;
		inline-size: 100%;
	}

	dialog::backdrop {
		background: var(--backdrop);
		animation: backdrop-in var(--d-base) var(--ease-out) both;
	}

	dialog[open] {
		animation: sheet-up var(--d-slow) var(--ease-out) both;
	}

	dialog[data-closing] {
		animation: sheet-down var(--d-base) var(--ease-in-out) both;
	}

	dialog[data-closing]::backdrop {
		animation: backdrop-out var(--d-base) var(--ease-in-out) both;
	}

	.sheet {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		max-block-size: 88dvh;
		padding: var(--s-5) var(--s-4) calc(var(--s-5) + env(safe-area-inset-bottom));
		border-radius: var(--r-panel) var(--r-panel) 0 0;
		background: var(--surface);
		box-shadow: var(--shadow-lift);
	}

	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--s-3);
	}

	.kicker {
		font-size: var(--t-kicker);
		font-weight: 500;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	h2 {
		margin-block-start: var(--s-1);
		font-size: var(--t-display-3);
	}

	.close {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		margin: -6px -8px 0 0;
		border: 0;
		border-radius: var(--r-pill);
		background: var(--ink-wash);
		color: var(--ink);
	}

	@media (min-width: 768px) {
		dialog {
			margin: auto;
			inline-size: min(560px, 100% - 2 * var(--gutter));
		}

		dialog[open] {
			animation-name: sheet-pop;
		}

		dialog[data-closing] {
			animation-name: sheet-drop;
		}

		.sheet {
			max-block-size: min(720px, 86dvh);
			padding: var(--s-6);
			border-radius: var(--r-panel);
		}
	}

	@keyframes sheet-up {
		from {
			opacity: 0;
			transform: translateY(48px);
		}
	}

	@keyframes sheet-down {
		to {
			opacity: 0;
			transform: translateY(48px);
		}
	}

	@keyframes sheet-pop {
		from {
			opacity: 0;
			transform: translateY(14px) scale(0.97);
		}
	}

	@keyframes sheet-drop {
		to {
			opacity: 0;
			transform: translateY(8px) scale(0.98);
		}
	}

	@keyframes backdrop-in {
		from {
			opacity: 0;
		}
	}

	@keyframes backdrop-out {
		to {
			opacity: 0;
		}
	}
</style>
