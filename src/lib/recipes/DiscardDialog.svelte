<script lang="ts">
	import { fade } from 'svelte/transition';
	import { COPY } from '#lib/copy.ts';
	import { reducedMotion, rise } from '#lib/motion.ts';
	import Button from '#lib/ui/Button.svelte';

	let { onkeep, ondiscard }: { onkeep: () => void; ondiscard: () => void } = $props();

	let keepButton: HTMLButtonElement | undefined = $state();
	let dialog: HTMLElement;

	// focus goes in on open and returns to where it was when the dialog closes
	$effect(() => {
		const before = document.activeElement as HTMLElement | null;
		keepButton?.focus();
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
			<button bind:this={keepButton} class="keep" type="button" onclick={onkeep}>Keep editing</button>
			<Button variant="danger" arrow={false} onclick={ondiscard}>Discard</Button>
		</div>
	</div>
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: var(--veil-strong);
	}

	.wrap {
		position: fixed;
		inset: 0;
		z-index: 61;
		display: grid;
		place-items: center;
		padding: var(--s-4);
		pointer-events: none;
	}

	.dialog {
		pointer-events: auto;
		inline-size: min(100%, 420px);
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		padding: var(--s-6);
		border-radius: var(--r-panel);
		background: var(--surface);
		box-shadow: var(--shadow-lift);
	}

	h2 {
		font-size: var(--t-display-3);
	}

	p {
		color: var(--ink-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--s-2);
		margin-block-start: var(--s-3);
	}

	.keep {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-block-size: 48px;
		padding: 0 var(--s-5);
		border-radius: var(--r-pill);
		border: 1px solid var(--olive);
		background: var(--olive);
		color: var(--white);
		font-size: 15px;
		font-weight: 500;
	}
</style>
