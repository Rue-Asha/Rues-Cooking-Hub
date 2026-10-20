<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { fly } from 'svelte/transition';
	import { COPY } from '#lib/copy.ts';
	import { reducedMotion, rise } from '#lib/motion.ts';
	import type { IsoDate } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
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
				<ArrowButton variant="outline" direction="left" label="Earlier week" disabled={at >= sources.length - 1} onclick={() => step(1)} />
				{#key source.monday}
					<div class="range" in:fly={{ x: reducedMotion() ? 0 : -direction * 18, duration: reducedMotion() ? 0 : 240 }}>
						<span class="from">Copy from</span>
						<strong class="tnum">{weekRange(source.monday, today)}</strong>
						<span class="count">{source.count === 0 ? 'No entries in this week' : plural(source.count)}</span>
					</div>
				{/key}
				<ArrowButton variant="dark" label="Later week" disabled={at === 0} onclick={() => step(-1)} />
			</div>
			<p class="into">into <strong class="tnum">{weekRange(monday, today)}</strong></p>
		</div>

		{#if confirming}
			<p class="confirm" in:rise={{ y: 8 }}>
				This week already has {plural(existing)}. The copied entries are added after them.
			</p>
		{:else if message}
			<p class="message" role="status" in:rise={{ y: 8 }}>{message}</p>
		{/if}

		<div class="foot">
			<Button variant="secondary" arrow={false} onclick={() => (confirming ? (confirming = false) : onclose())}>
				{confirming ? 'Back' : 'Cancel'}
			</Button>
			{#if confirming}
				<Button type="submit" disabled={submitting}>Add anyway</Button>
			{:else if existing > 0 && source.count > 0}
				<Button onclick={() => (confirming = true)}>Copy {plural(source.count)}</Button>
			{:else}
				<Button type="submit" disabled={submitting}>{source.count > 0 ? `Copy ${plural(source.count)}` : 'Copy'}</Button>
			{/if}
		</div>
	</form>
</Sheet>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	.stepper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		padding: var(--s-3);
		border-radius: var(--r-card);
		background: var(--white);
		box-shadow: var(--shadow-card);
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
		font-size: var(--t-kicker);
		font-weight: 500;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.range strong {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 400;
		line-height: 1.2;
	}

	.count {
		font-size: 13px;
		color: var(--ink-2);
	}

	.into {
		margin-block-start: var(--s-3);
		text-align: center;
		color: var(--ink-2);
	}

	.into strong {
		color: var(--ink);
		font-weight: 600;
	}

	.confirm,
	.message {
		padding: var(--s-3) var(--s-4);
		border-radius: var(--r-sm);
		font-size: 14px;
		font-weight: 500;
	}

	.confirm {
		background: var(--olive-soft);
		color: var(--olive);
	}

	.message {
		background: var(--brick-soft);
		color: var(--brick);
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		padding-block-start: var(--s-3);
		border-block-start: 1px solid var(--line);
	}
</style>
