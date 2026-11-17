<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { fly } from 'svelte/transition';
	import { COPY } from '#lib/copy.ts';
	import { reducedMotion, rise } from '#lib/motion.ts';
	import type { IsoDate } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Sheet from './Sheet.svelte';
	import { weekRange } from './Week.svelte';

	let {
		open,
		monday,
		today,
		existing,
		sources,
		onclose
	}: {
		open: boolean;
		monday: IsoDate;
		today: IsoDate;
		existing: number;
		sources: { monday: IsoDate; count: number }[];
		onclose: () => void;
	} = $props();

	// sources run from the week before the shown one backwards
	let at = $state(0);
	let confirming = $state(false);
	let message = $state('');
	let submitting = $state(false);
	let direction = $state(1);

	$effect(() => {
		if (!open) return;
		at = 0;
		confirming = false;
		message = '';
		submitting = false;
	});

	const source = $derived(sources[at]);
	const plural = (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`;

	const step = (by: number) => {
		direction = by;
		at = at + by;
		message = '';
	};

	const submit: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type !== 'success') return;
			if ((result.data as { copied: number }).copied === 0) {
				message = COPY.nothingToCopy;
				return;
			}
			await update({ reset: false });
			onclose();
		};
	};
</script>

<Sheet {open} kicker="Meal plan" title="Copy week" {onclose}>
	<form method="POST" action="?/copy" use:enhance={submit}>
		<input type="hidden" name="from" value={source.monday} />
		<input type="hidden" name="to" value={monday} />

		<div class="source">
			<div class="stepper">
				<Button variant="secondary" size="s" icon label="Earlier week" disabled={at >= sources.length - 1} onclick={() => step(1)}>
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
				</Button>
				{#key source.monday}
					<div class="range" in:fly={{ x: reducedMotion() ? 0 : -direction * 18, duration: reducedMotion() ? 0 : 240 }}>
						<span class="from">Copy from</span>
						<strong class="figures">{weekRange(source.monday, today)}</strong>
						<span class="count">{source.count === 0 ? 'No entries in this week' : plural(source.count)}</span>
					</div>
				{/key}
				<Button variant="secondary" size="s" icon arrow label="Later week" disabled={at === 0} onclick={() => step(-1)} />
			</div>
			<p class="into">into <strong class="figures">{weekRange(monday, today)}</strong></p>
		</div>

		{#if confirming}
			<p class="confirm" in:rise={{ y: 8 }}>
				This week already has {plural(existing)}. The copied entries are added after them.
			</p>
		{:else if message}
			<p class="message" role="status" in:rise={{ y: 8 }}>{message}</p>
		{/if}

		<div class="foot">
			<Button variant="quiet" onclick={() => (confirming ? (confirming = false) : onclose())}>
				{confirming ? 'Back' : 'Cancel'}
			</Button>
			{#if confirming}
				<Button type="submit" variant="primary" disabled={submitting}>Add anyway</Button>
			{:else if existing > 0 && source.count > 0}
				<Button variant="primary" onclick={() => (confirming = true)}>Copy {plural(source.count)}</Button>
			{:else}
				<Button type="submit" variant="primary" disabled={submitting}>{source.count > 0 ? `Copy ${plural(source.count)}` : 'Copy'}</Button>
			{/if}
		</div>
	</form>
</Sheet>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.stepper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
	}

	.range {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		min-inline-size: 0;
	}

	.from {
		font-size: var(--type-kicker-size);
		line-height: var(--type-kicker-line);
		font-weight: var(--type-kicker-weight);
		letter-spacing: var(--type-kicker-tracking);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}

	.range strong {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
	}

	.count {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	.into {
		margin-block-start: var(--space-3);
		text-align: center;
		color: var(--ink-secondary);
	}

	.into strong {
		color: var(--ink);
		font-weight: var(--weight-semibold);
	}

	.confirm,
	.message {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-item);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--type-label-weight);
	}

	.confirm {
		background: var(--surface-selected);
		color: var(--accent-text);
	}

	.message {
		background: var(--danger-soft);
		color: var(--danger);
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		padding-block-start: var(--space-3);
		box-shadow: var(--sheet-footer-rule);
	}
</style>
