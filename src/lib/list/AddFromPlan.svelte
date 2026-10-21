<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { cubicOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';
	import { COPY } from '#lib/copy.ts';
	import { addDays } from '#lib/dates.ts';
	import { reducedMotion, rise } from '#lib/motion.ts';
	import type { IsoDate } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import Chip from '#lib/ui/Chip.svelte';

	let {
		week,
		onclose,
		onadded
	}: {
		week: { from: IsoDate; to: IsoDate };
		onclose: () => void;
		onadded: (count: number) => void;
	} = $props();

	const sheet = matchMedia('(max-width: 1023px)').matches;

	/* svelte-ignore state_referenced_locally */
	let from = $state(week.from);
	/* svelte-ignore state_referenced_locally */
	let to = $state(week.to);
	let message = $state<string | null>(null);
	let busy = $state(false);

	const ranges = $derived([
		{ label: 'This week', from: week.from, to: week.to },
		{ label: 'Next week', from: addDays(week.from, 7), to: addDays(week.to, 7) }
	]);

	let dialog: HTMLElement;

	$effect(() => {
		const before = document.activeElement as HTMLElement | null;
		dialog.querySelector<HTMLElement>('input')?.focus();
		return () => before?.focus();
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onclose();
		} else if (event.key === 'Tab') {
			const focusable = [...dialog.querySelectorAll<HTMLElement>('button, input')];
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	const submit: SubmitFunction = () => {
		busy = true;
		message = null;
		return async ({ result, update }) => {
			busy = false;
			const plan = result.type === 'success' || result.type === 'failure' ? result.data?.plan : undefined;
			if (plan?.kind === 'added') {
				onadded(plan.count);
				await update({ reset: false });
			} else message = plan?.kind === 'empty' ? COPY.nothingPlanned : 'Choose a start and an end date';
		};
	};

	function enter(_node: Element): TransitionConfig {
		if (reducedMotion()) return { duration: 120, css: (t) => `opacity: ${t}` };
		if (sheet) return { duration: 360, easing: cubicOut, css: (_t, u) => `transform: translateY(${(u * 100).toFixed(2)}%)` };
		return {
			duration: 260,
			easing: cubicOut,
			css: (t, u) => `opacity: ${t}; transform: translateY(${(u * -8).toFixed(2)}px) scale(${(0.95 + 0.05 * t).toFixed(3)})`
		};
	}

	function exit(_node: Element): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		if (sheet) return { duration: 220, easing: cubicOut, css: (_t, u) => `transform: translateY(${(u * 100).toFixed(2)}%)` };
		return { duration: 160, easing: cubicOut, css: (t) => `opacity: ${t}; transform: scale(${(0.97 + 0.03 * t).toFixed(3)})` };
	}

	const scrim = (_node: Element): TransitionConfig => ({ duration: reducedMotion() ? 0 : 200, css: (t) => `opacity: ${t}` });
</script>

<button type="button" class="scrim" class:sheet tabindex="-1" aria-hidden="true" onclick={onclose} transition:scrim></button>
<div
	class="dialog"
	class:sheet
	role="dialog"
	tabindex="-1"
	aria-modal="true"
	aria-labelledby="plan-title"
	bind:this={dialog}
	in:enter
	out:exit
	{onkeydown}
>
	<h2 id="plan-title">Add from plan</h2>
	<p class="lead">Ingredients of every recipe planned in these days, scaled to their servings.</p>
	<form method="POST" action="?/plan" use:enhance={submit}>
		<div class="ranges" role="group" aria-label="Quick ranges">
			{#each ranges as r (r.label)}
				<Chip
					label={r.label}
					active={from === r.from && to === r.to}
					onclick={() => {
						from = r.from;
						to = r.to;
						message = null;
					}}
				/>
			{/each}
		</div>
		<div class="dates">
			<div class="field">
				<label for="plan-from">From</label>
				<input id="plan-from" name="from" type="date" bind:value={from} oninput={() => (message = null)} required />
			</div>
			<div class="field">
				<label for="plan-to">To</label>
				<input id="plan-to" name="to" type="date" bind:value={to} oninput={() => (message = null)} required />
			</div>
		</div>
		{#if message}<p class="message" role="alert" transition:rise={{ y: 6 }}>{message}</p>{/if}
		<div class="actions">
			<Button variant="secondary" arrow={false} onclick={onclose}>Cancel</Button>
			<Button variant="olive" type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add to list'}</Button>
		</div>
	</form>
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 60;
		padding: 0;
		border: 0;
		background: var(--veil);
		cursor: default;
	}

	.scrim.sheet {
		background: var(--veil-strong);
	}

	.dialog {
		position: absolute;
		inset-block-start: calc(100% + var(--s-3));
		inset-inline-end: 0;
		z-index: 61;
		inline-size: 400px;
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		padding: var(--s-6);
		border-radius: var(--r-panel);
		background: var(--surface);
		box-shadow: var(--shadow-lift);
		transform-origin: top right;
	}

	.dialog.sheet {
		position: fixed;
		inset: auto 0 0;
		inline-size: auto;
		padding-block-end: max(var(--s-6), env(safe-area-inset-bottom));
		border-radius: var(--r-panel) var(--r-panel) 0 0;
	}

	h2 {
		font-size: var(--t-display-3);
	}

	.lead {
		font-size: 14px;
		color: var(--ink-2);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		margin-block-start: var(--s-3);
	}

	.ranges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.dates {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
	}

	.field label {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.field input {
		inline-size: 100%;
		min-block-size: 46px;
		padding: 10px 12px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--white);
		font-size: 15px;
	}

	.field input:focus-visible {
		border-color: var(--olive);
		border-radius: var(--r-sm);
	}

	.message {
		padding: var(--s-3) var(--s-4);
		border-radius: var(--r-sm);
		background: var(--brick-wash);
		font-size: 14px;
		font-weight: 500;
		color: var(--brick);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--s-2);
	}

	.sheet .actions :global(.btn) {
		flex: 1;
	}
</style>
