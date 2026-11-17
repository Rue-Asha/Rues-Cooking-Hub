<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import { rise } from '#lib/motion.ts';
	import { formatAmounts } from '#lib/shopping/aggregate.ts';
	import type { ShoppingItem } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let {
		item,
		done = false,
		editing = false,
		moving = false,
		error = null,
		onedit,
		oncancel,
		onmove,
		submitCheck,
		submitEdit
	}: {
		item: ShoppingItem;
		done?: boolean;
		editing?: boolean;
		moving?: boolean;
		error?: string | null;
		onedit: () => void;
		oncancel: () => void;
		onmove: (anchor: HTMLElement) => void;
		submitCheck: SubmitFunction;
		submitEdit: SubmitFunction;
	} = $props();

	const amount = $derived(formatAmounts(item.amounts));
	// a manual row's own amount is what Rue typed; the plan's share is shown beside it, read-only
	const ownPart = $derived(formatAmounts(item.origin === 'manual' ? item.manualAmounts : item.planAmounts));
	const planPart = $derived(item.origin === 'manual' ? formatAmounts(item.planAmounts) : '');

	$effect(() => {
		if (!editing) return;
		const input = document.getElementById(`name-${item.id}`) as HTMLInputElement | null;
		input?.focus();
		input?.select();
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			oncancel();
		} else if (event.key === 'Enter' && !event.isComposing) {
			// implicit submission would press the first submit button in the form, which is Delete
			event.preventDefault();
			const form = (event.currentTarget as HTMLInputElement).form;
			form?.requestSubmit(form.querySelector<HTMLButtonElement>('button[type="submit"]:not([formaction])'));
		}
	}
</script>

<div class="row" class:done class:editing>
	<form class="check-form" method="POST" action="?/check" use:enhance={submitCheck}>
		<input type="hidden" name="id" value={item.id} />
		<input type="hidden" name="checked" value={item.checked ? '0' : '1'} />
		<button class="check" role="checkbox" aria-checked={done} aria-label={item.name} data-check={item.id} data-press="round">
			<span class="box" aria-hidden="true">
				<span class="fill"></span>
				<span class="tick"><Icon name="check" size={14} stroke={2.4} /></span>
			</span>
		</button>
	</form>
	<button type="button" class="main" aria-label="Edit {item.name}" aria-expanded={editing} data-edit={item.id} onclick={onedit}>
		<span class="text-col">
			<span class="name" dir="auto">
				<span class="text">{item.name}</span>
			</span>
			{#if item.origin === 'plan'}
				<span class="from"><Icon name="calendar" size={13} />From the plan</span>
			{/if}
		</span>
		<span class="amount">
			{#key amount}<span class="value" in:rise={{ y: 6 }}>{amount}</span>{/key}
			{#if planPart}<span class="extra">incl. {planPart} from plan</span>{/if}
		</span>
	</button>
	<button
		type="button"
		class="move"
		data-move={item.id}
		data-press="round"
		aria-label="Move {item.name} to another category"
		aria-haspopup="menu"
		aria-expanded={moving}
		onclick={(e) => onmove(e.currentTarget)}
	>
		<Icon name="tag" size={18} />
	</button>
</div>

{#if editing}
	<form
		class="editor"
		aria-label="Edit {item.name}"
		method="POST"
		action="?/edit"
		use:enhance={submitEdit}
		transition:rise={{ y: -8 }}
	>
		<input type="hidden" name="id" value={item.id} />
		<div class="fields">
			<Field id="name-{item.id}" name="name" label="Name" value={item.name} autocomplete="off" {onkeydown} />
			<Field
				id="amount-{item.id}"
				name="amount"
				label="Amount"
				value={ownPart}
				placeholder="e.g. 200 g"
				autocomplete="off"
				{onkeydown}
				error={error ?? undefined}
			/>
		</div>
		{#if planPart}<p class="plan-part"><Icon name="calendar" size={14} />From plan: {planPart}</p>{/if}
		<div class="actions">
			<Button variant="danger" type="submit" formaction="?/delete"><Icon name="trash" size={18} />Delete</Button>
			<span class="spacer"></span>
			<Button onclick={oncancel}>Cancel</Button>
			<Button variant="primary" type="submit">Save</Button>
		</div>
	</form>
{/if}

<style>
	.row {
		display: flex;
		align-items: flex-start;
		gap: var(--space-1);
		min-inline-size: 0;
		min-block-size: max(var(--control-height), var(--target));
	}

	.check-form {
		display: contents;
	}

	.check {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height-xs), var(--target-touch));
		block-size: max(var(--control-height), var(--target-touch));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: none;
		cursor: pointer;
	}

	.check:focus-visible,
	.main:focus-visible,
	.move:focus-visible {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: calc(-1 * var(--focus-width));
	}

	.box {
		position: relative;
		display: grid;
		place-items: center;
		inline-size: var(--space-6);
		block-size: var(--space-6);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-on-inverse);
	}

	.fill,
	.tick {
		grid-area: 1 / 1;
	}

	.fill {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: var(--surface-inverse);
		transform: scale(0);
		transition: transform var(--motion-glide) var(--ease-out);
	}

	.tick {
		position: relative;
		display: grid;
		opacity: 0;
		transition: opacity var(--motion-quick) var(--ease-out);
	}

	.done .fill {
		transform: scale(1);
	}

	.done .tick {
		opacity: 1;
	}

	.main {
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-0-5) var(--space-3);
		min-block-size: max(var(--control-height), var(--target-touch));
		min-inline-size: 0;
		padding: var(--space-2-5) var(--space-1);
		border: 0;
		border-radius: var(--radius-text);
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	/* the row answers the finger before the editor opens */
	.main:active {
		background: var(--surface-tint);
	}

	/* a short basis keeps a short amount ("1 bottle") beside the name in the narrow Checked card; a long one still wraps */
	.text-col {
		display: grid;
		flex: 1 1 4rem;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}

	.name {
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
	}

	.text {
		position: relative;
		transition: opacity var(--motion-glide) var(--ease-out);
	}

	.done .text {
		text-decoration: line-through;
		text-decoration-thickness: var(--stroke-rule);
	}

	.done .text,
	.done .amount {
		opacity: 0.7;
	}

	.from {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	.amount {
		display: grid;
		justify-items: end;
		flex: 0 1 auto;
		margin-inline-start: auto;
		max-inline-size: 100%;
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-variant-numeric: var(--numeric-figures);
		text-align: end;
		overflow-wrap: anywhere;
		transition: opacity var(--motion-glide) var(--ease-out);
	}

	.extra {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	.move {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height-xs), var(--target-touch));
		block-size: max(var(--control-height), var(--target-touch));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: none;
		color: var(--ink-secondary);
		cursor: pointer;
	}

	.move[aria-expanded='true'] {
		background: var(--surface-tint-strong);
		color: var(--ink);
	}

	@media (hover: hover) {
		.move:hover {
			background: var(--surface-tint);
			color: var(--ink);
		}
	}

	/* the Checked card is the screen's charcoal one */
	:global([data-surface='inverse']) .box {
		background: none;
		box-shadow: var(--ring-control-on-inverse);
		color: var(--ink);
	}

	:global([data-surface='inverse']) .fill {
		background: var(--surface-raised);
	}

	:global([data-surface='inverse']) .from,
	:global([data-surface='inverse']) .extra,
	:global([data-surface='inverse']) .move {
		color: var(--ink-on-inverse-secondary);
	}

	:global([data-surface='inverse']) .move[aria-expanded='true'],
	:global([data-surface='inverse']) .move:hover {
		background: var(--surface-inverse-tint-strong);
		color: var(--ink-on-inverse);
	}

	:global([data-surface='inverse']) .check:focus-visible,
	:global([data-surface='inverse']) .main:focus-visible,
	:global([data-surface='inverse']) .move:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
	}

	.editor {
		display: grid;
		gap: var(--space-3);
		margin-block: var(--space-1) var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
	}

	.fields {
		display: grid;
		grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
		gap: var(--space-3);
	}

	.plan-part {
		display: flex;
		align-items: center;
		gap: var(--space-1-5);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.spacer {
		flex: 1;
	}

	@media (max-width: 29.99rem) {
		.fields {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 1023px) {
		.actions :global(.btn) {
			flex: 1;
		}

		.spacer {
			flex-basis: 100%;
			order: 1;
			block-size: 0;
		}

		.actions :global(.btn) {
			order: 2;
		}
	}
</style>
