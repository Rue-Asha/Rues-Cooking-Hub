<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { COPY } from '#lib/copy.ts';
	import { addDays } from '#lib/dates.ts';
	import { rise } from '#lib/motion.ts';
	import Sheet from '#lib/plan/Sheet.svelte';
	import type { IsoDate } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';

	let {
		week,
		onclose,
		onadded
	}: {
		week: { from: IsoDate; to: IsoDate };
		onclose: () => void;
		onadded: (count: number) => void;
	} = $props();

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

	const submit: SubmitFunction = () => {
		busy = true;
		message = null;
		return async ({ result, update }) => {
			busy = false;
			const plan = result.type === 'success' || result.type === 'failure' ? result.data?.plan : undefined;
			if (plan?.kind === 'added') {
				// update() hands the focus to <body>; closing after it lets the sheet give it back to its opener
				await update({ reset: false });
				onadded(plan.count);
			} else message = plan?.kind === 'empty' ? COPY.nothingPlanned : 'Choose a start and an end date';
		};
	};
</script>

<Sheet open kicker="Shopping list" title="Add from plan" {onclose}>
	<form method="POST" action="?/plan" use:enhance={submit}>
		<p class="lead">Ingredients of every recipe planned in these days, scaled to their servings.</p>
		<div class="ranges" role="group" aria-label="Quick ranges">
			{#each ranges as r (r.label)}
				<button
					type="button"
					class="mode"
					aria-pressed={from === r.from && to === r.to}
					onclick={() => {
						from = r.from;
						to = r.to;
						message = null;
					}}>{r.label}</button
				>
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
			<Button variant="quiet" onclick={onclose}>Cancel</Button>
			<Button variant="primary" type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add to list'}</Button>
		</div>
	</form>
</Sheet>

<style>
	.lead {
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		color: var(--ink-secondary);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.ranges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.mode {
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-4);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-control-solid);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		transition:
			background-color var(--motion-quick) var(--ease-out),
			transform var(--motion-quick) var(--ease-out);
	}

	.mode:active {
		transform: scale(0.97);
	}

	.mode[aria-pressed='true'] {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}

	.dates {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: var(--space-3);
	}

	.field {
		display: grid;
		gap: var(--space-1-5);
		min-inline-size: 0;
	}

	.field label {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}

	.field input {
		inline-size: 100%;
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-4);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		font-size: var(--type-body-s-size);
		font-variant-numeric: var(--numeric-figures);
	}

	.message {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-item);
		background: var(--danger-soft);
		color: var(--danger);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--type-label-weight);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
