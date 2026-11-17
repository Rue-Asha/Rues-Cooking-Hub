<script lang="ts">
	import { fade } from 'svelte/transition';
	import { COPY } from '#lib/copy.ts';
	import { reducedMotion, rise } from '#lib/motion.ts';
	import Button from '#lib/components/button/Button.svelte';

	let { onkeep, ondiscard }: { onkeep: () => void; ondiscard: () => void } = $props();

	let dialog: HTMLElement;

	// focus goes in on open and returns to where it was when the dialog closes
	$effect(() => {
		const before = document.activeElement as HTMLElement | null;
		dialog.querySelector('button')?.focus();
		return () => before?.focus();
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onkeep();
		} else if (event.key === 'Tab') {
			const buttons = [...dialog.querySelectorAll<HTMLElement>('button')];
			const first = buttons[0];
			const last = buttons[buttons.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	const scrim = () => ({ duration: reducedMotion() ? 0 : 160 });
</script>

<svelte:window {onkeydown} />

<div class="scrim" transition:fade={scrim()} aria-hidden="true"></div>
<div class="wrap">
	<div
		class="dialog"
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="discard-title"
		aria-describedby="discard-body"
		bind:this={dialog}
		transition:rise={{ y: 18 }}
	>
		<h2 id="discard-title">{COPY.discard}</h2>
		<p id="discard-body">What you changed on this recipe isn't saved yet.</p>
		<div class="actions">
			<Button variant="secondary" onclick={onkeep}>Keep editing</Button>
			<Button variant="danger" onclick={ondiscard}>Discard</Button>
		</div>
	</div>
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: var(--z-sheet);
		background: var(--surface-tint-strong);
	}

	.wrap {
		position: fixed;
		inset: 0;
		z-index: var(--z-sheet);
		display: grid;
		place-items: end center;
		pointer-events: none;
	}

	.dialog {
		pointer-events: auto;
		inline-size: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-5) calc(var(--space-5) + env(safe-area-inset-bottom));
		border-radius: var(--radius-card) var(--radius-card) 0 0;
		/* reading sits on solid: the dialog is opaque, not glass (--surface-card lets a charcoal card show through) */
		background: var(--surface-raised);
		box-shadow: var(--elevation-card);
		color: var(--ink);
	}

	h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}

	p {
		color: var(--ink-secondary);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-block-start: var(--space-3);
	}

	@media (min-width: 768px) {
		.wrap {
			place-items: center;
		}

		.dialog {
			inline-size: min(var(--measure) * 0.75, 100% - 2 * var(--space-8));
			padding: var(--space-6);
			border-radius: var(--radius-card);
		}
	}
</style>
