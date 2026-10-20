<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { rise } from '#lib/motion.ts';
	import { formatAmounts } from '#lib/shopping/aggregate.ts';
	import type { ShoppingItem } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
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

	let nameInput: HTMLInputElement | undefined = $state();

	$effect(() => {
		if (!editing || !nameInput) return;
		nameInput.focus();
		nameInput.select();
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			oncancel();
		}
	}
</script>

<div class="row" class:done class:editing>
	<form class="check-form" method="POST" action="?/check" use:enhance={submitCheck}>
		<input type="hidden" name="id" value={item.id} />
		<input type="hidden" name="checked" value={item.checked ? '0' : '1'} />
		<button class="check" role="checkbox" aria-checked={done} aria-label={item.name}>
			<span class="box" aria-hidden="true">
				<span class="fill"></span>
				<span class="tick"><Icon name="check" size={14} stroke={2.4} /></span>
			</span>
		</button>
	</form>
	<button type="button" class="main" aria-label="Edit {item.name}" aria-expanded={editing} onclick={onedit}>
		<span class="name">
			<span class="text">{item.name}<span class="strike" data-strike></span></span>
			{#if item.origin === 'plan'}<span class="from" title="From the plan"><Icon name="calendar" size={13} /></span>{/if}
		</span>
		<span class="amount tnum">
			{#key amount}<span class="value" in:rise={{ y: 6 }}>{amount}</span>{/key}
			{#if planPart}<span class="extra">incl. {planPart} from plan</span>{/if}
		</span>
	</button>
	<button
		type="button"
		class="move"
		data-move={item.id}
		aria-label="Move {item.name} to another category"
		aria-haspopup="menu"
		aria-expanded={moving}
		onclick={(e) => onmove(e.currentTarget)}
	>
		<Icon name="dots" size={18} />
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
			<div class="field">
				<label for="name-{item.id}">Name</label>
				<input id="name-{item.id}" name="name" value={item.name} autocomplete="off" bind:this={nameInput} {onkeydown} />
			</div>
			<div class="field">
				<label for="amount-{item.id}">Amount</label>
				<input
					id="amount-{item.id}"
					name="amount"
					value={ownPart}
					placeholder="e.g. 200 g"
					autocomplete="off"
					{onkeydown}
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={error ? `amount-error-${item.id}` : undefined}
				/>
			</div>
		</div>
		{#if planPart}<p class="plan-part"><Icon name="calendar" size={14} />From plan: {planPart}</p>{/if}
		{#if error}<p class="error" id="amount-error-{item.id}" role="alert" transition:rise={{ y: 6 }}>{error}</p>{/if}
		<div class="actions">
			<button type="submit" class="delete" formaction="?/delete"><Icon name="trash" size={18} />Delete</button>
			<span class="spacer"></span>
			<Button variant="secondary" arrow={false} onclick={oncancel}>Cancel</Button>
			<Button variant="olive" type="submit" arrow={false}>Save</Button>
		</div>
	</form>
{/if}

<style>
	.row {
		display: grid;
		grid-template-columns: 44px 1fr 44px;
		align-items: center;
		gap: 4px;
		min-block-size: 52px;
	}

	.check-form {
		display: contents;
	}

	.check {
		display: grid;
		place-items: center;
		inline-size: 44px;
		block-size: 44px;
		margin-inline-start: -10px;
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: none;
	}

	.box {
		position: relative;
		display: grid;
		place-items: center;
		inline-size: 24px;
		block-size: 24px;
		border-radius: var(--r-pill);
		border: 1.5px solid var(--stone);
		color: var(--white);
		transition: border-color var(--d-fast) var(--ease-out);
	}

	.fill,
	.tick {
		grid-area: 1 / 1;
	}

	.fill {
		position: absolute;
		inset: -1.5px;
		border-radius: inherit;
		background: var(--olive);
		transform: scale(0);
		transition: transform var(--d-base) var(--ease-spring);
	}

	.tick {
		display: grid;
		transform: scale(0.4);
		opacity: 0;
		transition:
			transform var(--d-base) var(--ease-spring) 60ms,
			opacity var(--d-fast) var(--ease-out) 60ms;
	}

	.done .box {
		border-color: var(--olive);
	}

	.done .fill,
	.done .tick {
		transform: scale(1);
		opacity: 1;
	}

	.check:active .box {
		transform: scale(0.9);
	}

	.main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		min-block-size: 44px;
		min-inline-size: 0;
		padding: 0;
		border: 0;
		border-radius: var(--r-xs);
		background: none;
		text-align: start;
	}

	.move {
		display: grid;
		place-items: center;
		inline-size: 44px;
		block-size: 44px;
		margin-inline-end: -12px;
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: none;
		color: var(--stone);
		transition:
			color var(--d-fast) var(--ease-out),
			background-color var(--d-fast) var(--ease-out);
	}

	.move:hover,
	.move[aria-expanded='true'] {
		color: var(--ink);
		background: var(--ink-wash);
	}

	.name {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-inline-size: 0;
		font-size: 15px;
		font-weight: 500;
	}

	.text {
		position: relative;
		overflow-wrap: anywhere;
		transition: opacity var(--d-base) var(--ease-out);
	}

	/* drawn left to right as the box fills */
	.strike {
		position: absolute;
		inset-inline: -2px;
		inset-block-start: calc(50% - 0.75px);
		block-size: 1.5px;
		border-radius: 1px;
		background: var(--ink-2);
		transform: scaleX(0);
		transform-origin: left center;
		transition: transform var(--d-base) var(--ease-out) 80ms;
		pointer-events: none;
	}

	.done .strike {
		transform: scaleX(1);
	}

	.done .text,
	.done .amount {
		opacity: 0.6;
	}

	.from {
		display: inline-grid;
		color: var(--stone);
	}

	.amount {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex: none;
		font-size: 15px;
		transition: opacity var(--d-base) var(--ease-out);
	}

	.value {
		display: inline-block;
	}

	.extra {
		font-size: 12px;
		color: var(--olive);
	}

	.editor {
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		margin: 2px 0 var(--s-3);
		padding: var(--s-4);
		border-radius: var(--r-md);
		background: var(--ground);
		box-shadow: inset 0 0 0 1px var(--line);
	}

	.fields {
		display: grid;
		grid-template-columns: 3fr 2fr;
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
		padding: 11px 14px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--white);
		font-size: 15px;
		transition: border-color var(--d-fast) var(--ease-out);
	}

	.field input:focus-visible {
		border-color: var(--olive);
		border-radius: var(--r-sm);
	}

	.field input[aria-invalid='true'] {
		border-color: var(--brick);
	}

	.plan-part {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: var(--t-small);
		color: var(--olive);
	}

	.error {
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--brick);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}

	.spacer {
		flex: 1;
	}

	.delete {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-block-size: 44px;
		padding: 0 var(--s-3);
		margin-inline-start: calc(-1 * var(--s-3));
		border: 0;
		border-radius: var(--r-pill);
		background: none;
		font-size: 14px;
		font-weight: 500;
		color: var(--brick);
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
