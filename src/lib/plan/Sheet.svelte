<!--
	The app's one dialog, on the sheet primitive (components/sheet): a modal <dialog> portalled to body, a bottom sheet
	below 768 px and a centred card from there. The sheet slides up from its edge, the card rises a few pixels and grows
	from 0.97 out of its centre, both leave faster than they came; under reduced motion it is instant (Rue, gate 7).
	Focus moves in on open and back to the opener on close; Tab wraps inside; Escape, the "Close" control and a click outside close it. `actions` is an optional footer row.
-->
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
		children,
		actions
	}: {
		open: boolean;
		title: string;
		label?: string;
		kicker?: string;
		onclose: () => void;
		children: Snippet;
		actions?: Snippet;
	} = $props();

	let dialog: HTMLDialogElement;
	let opener: HTMLElement | null = null;
	let closing = $state(false);

	// the dialog leaves with its own animation before it is really closed
	$effect(() => {
		if (open) {
			closing = false;
			if (!dialog.open) {
				opener = document.activeElement as HTMLElement | null;
				dialog.showModal();
			}
		} else if (dialog.open && !closing) {
			if (reducedMotion()) finish(true);
			else {
				closing = true;
				// nothing animates when no CSS is loaded; close on the next frame then
				requestAnimationFrame(() => {
					if (closing && dialog.getAnimations().length === 0) finish();
				});
			}
		}
	});

	// a sheet that is mounted open and unmounted to close still hands focus back
	$effect(() => () => {
		// still open and modal, the dialog would keep the page behind it inert and refuse the focus
		if (dialog?.open) dialog.close();
		if (opener?.isConnected) opener.focus();
	});

	function finish(now = false) {
		if (!closing && !now) return;
		closing = false;
		dialog.close();
		if (opener?.isConnected) opener.focus();
		opener = null;
	}

	// the sheet leaves the page's flow: a frame with a backdrop filter would otherwise contain it
	function portal(node: HTMLElement) {
		document.body.append(node);
		return { destroy: () => node.remove() };
	}

	const tabbable =
		'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

	function trap(e: KeyboardEvent) {
		if (e.key !== 'Tab') return;
		const stops = [...dialog.querySelectorAll<HTMLElement>(tabbable)].filter((el) => el.checkVisibility());
		if (!stops.length) return;
		const first = stops[0];
		const last = stops[stops.length - 1];
		const active = document.activeElement;
		if (e.shiftKey && (active === first || active === dialog)) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		}
	}
</script>

<dialog
	use:portal
	bind:this={dialog}
	class="sheet"
	data-sheet
	aria-label={label}
	data-closing={closing ? '' : undefined}
	aria-hidden={closing ? 'true' : undefined}
	oncancel={(e) => {
		e.preventDefault();
		onclose();
	}}
	onkeydown={trap}
	onclick={(e) => {
		if (e.target === dialog) onclose();
	}}
	onanimationend={(e) => {
		if (e.target === dialog) finish();
	}}
>
	<header>
		<div class="head">
			{#if kicker}<p class="eyebrow">{kicker}</p>{/if}
			<h2>{title}</h2>
		</div>
		<button type="button" class="close" aria-label="Close" data-press="round" onclick={onclose}><Icon name="x" size={18} /></button>
	</header>
	<div class="body">
		{#if open || closing}{@render children()}{/if}
	</div>
	{#if actions}<footer>{@render actions()}</footer>{/if}
</dialog>

<style>
	/* The page behind stays put while a sheet is open. */
	:global(html:has(dialog[data-sheet][open])) {
		overflow: hidden;
	}

	dialog {
		flex-direction: column;
		inline-size: 100%;
		max-inline-size: none;
		max-block-size: min(88dvh, 100% - var(--space-6));
		margin: auto 0 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius-card) var(--radius-card) 0 0;
		/* reading sits on solid: the dialog is opaque, not glass (--surface-card lets a charcoal card show through) */
		background: var(--surface-raised);
		box-shadow: var(--elevation-card);
		color: var(--ink);
		overflow: hidden;
		animation: rise-full var(--motion-glide) var(--ease-out);
	}
	dialog[open] {
		display: flex;
	}
	dialog::backdrop {
		background: var(--surface-tint-strong);
		animation: fade-in var(--motion-glide) var(--ease-out);
	}
	dialog[data-closing] {
		animation: drop-full var(--motion-quick) var(--ease-out) forwards;
	}
	dialog[data-closing]::backdrop {
		animation: fade-out var(--motion-quick) var(--ease-out) forwards;
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
	/* a recipe name as the kicker wraps onto a second line instead of being cut at the edge */
	.eyebrow {
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
		hyphens: manual;
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
	@media (hover: hover) {
		.close:hover {
			background: var(--surface-sunken);
		}
	}

	.body {
		flex: 1;
		min-block-size: 0;
		overflow: auto;
		overscroll-behavior: contain;
		padding: var(--space-1) var(--space-5) var(--space-5);
		overflow-wrap: anywhere;
	}
	.body:last-child {
		padding-block-end: calc(var(--space-5) + env(safe-area-inset-bottom));
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		padding: var(--sheet-footer-padding-block-start) var(--sheet-footer-padding-inline)
			calc(var(--sheet-footer-padding-block-end) + env(safe-area-inset-bottom));
		box-shadow: var(--sheet-footer-rule);
	}

	@media (min-width: 768px) {
		dialog {
			inline-size: min(var(--measure), 100% - 2 * var(--space-8));
			max-block-size: min(86dvh, 100% - var(--space-16));
			margin: auto;
			border-radius: var(--radius-card);
			animation-name: rise;
			animation-duration: var(--motion-quick);
		}
		dialog[data-closing] {
			animation-name: drop;
			animation-duration: calc(var(--motion-quick) * 0.75);
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

	@keyframes rise-full {
		from {
			transform: translateY(100%);
		}
	}
	@keyframes drop-full {
		to {
			transform: translateY(100%);
		}
	}
	/* the centred card rises a few pixels and grows out of its own centre; it leaves a little faster than it came */
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(var(--space-2)) scale(0.97);
		}
	}
	@keyframes drop {
		to {
			opacity: 0;
			transform: translateY(var(--space-2)) scale(0.97);
		}
	}
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}
	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	/* reduced motion: it is simply there, and simply gone */
	@media (prefers-reduced-motion: reduce) {
		dialog,
		dialog::backdrop {
			animation: none;
		}
	}
</style>
