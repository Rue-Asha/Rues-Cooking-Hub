<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Field from '../overlays/Field.svelte';
	import Icon from '../overlays/Icon.svelte';
	import MenuButton from '../overlays/MenuButton.svelte';
	import { AISLES, type ListItem } from './data.ts';

	type Props = {
		item: ListItem;
		mode?: 'idle' | 'editing' | 'error';
		ontick?: (checked: boolean) => void;
		onmove?: (category: string) => void;
		onsave?: (name: string, amount: string) => void;
		ondelete?: () => void;
	};
	let { item, mode = 'idle', ontick, onmove, onsave, ondelete }: Props = $props();

	const seed = () => ({ name: item.name, editing: mode !== 'idle', amount: mode === 'error' ? 'a lot, ish' : item.amount, error: mode === 'error' });
	let editing = $state(seed().editing);
	let name = $state(seed().name);
	let amount = $state(seed().amount);
	let bad = $state(seed().error);
	const aisles = $derived(AISLES.map((a) => ({ label: a, checked: a === item.category })));

	function open() {
		name = item.name;
		amount = item.amount;
		bad = false;
		editing = true;
	}
	function save(event: SubmitEvent) {
		event.preventDefault();
		if (/[a-z]{3,}/i.test(amount.replace(/\b(?:cup|tbsp|tsp|pinch(?:es)?|tins?|jar|bunch|cloves?|pack)\b/gi, ''))) {
			bad = true;
			return;
		}
		editing = false;
		onsave?.(name.trim() || item.name, amount.trim());
	}
</script>

<li class="item" data-checked={item.checked || undefined} lang={item.lang}>
	{#if editing}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<form class="edit" aria-label="Edit {item.name}" onsubmit={save} onkeydown={(e) => e.key === 'Escape' && (editing = false)}>
			<Field label="Name" bind:value={name} />
			<Field label="Amount" placeholder="e.g. 200 g" bind:value={amount} error={bad ? 'Enter an amount like 200 g' : undefined} />
			{#if item.merged}<p class="from"><Icon name="calendar" size={14} />From plan: {item.merged}</p>{/if}
			<div class="actions">
				<Button variant="danger" size="s" onclick={ondelete}><span class="verb"><Icon name="trash" size={16} />Delete</span></Button>
				<span class="gap"></span>
				<Button variant="quiet" size="s" onclick={() => (editing = false)}>Cancel</Button>
				<Button variant="primary" size="s" type="submit">Save</Button>
			</div>
		</form>
	{:else}
		<label class="tick">
			<input type="checkbox" aria-label={item.name} checked={item.checked} onchange={(e) => ontick?.(e.currentTarget.checked)} />
			<Icon name="check" size={14} />
		</label>
		<div class="main">
			<span class="text">
				<button type="button" class="name" dir="auto" onclick={open}>{item.name}</button>
				{#if item.plan}
					<span class="meta"><Icon name="calendar" size={13} />{item.merged ? `incl. ${item.merged} from plan` : 'From the plan'}</span>
				{/if}
			</span>
			{#if item.amount}<span class="value">{item.amount}</span>{/if}
		</div>
		{#if !item.checked}
			<span class="action">
				<MenuButton label="Move {item.name} to another category" name="Move {item.name} to" radio items={aisles} sheet="Move {item.name} to" onpick={(i) => onmove?.(i.label)}><Icon name="tag" /></MenuButton>
			</span>
		{/if}
	{/if}
</li>

<style>
	.item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-1);
		min-inline-size: 0;
		min-block-size: max(var(--control-height), var(--target));
		box-shadow: var(--rule-below);
	}
	:global([data-surface='inverse']) .item {
		box-shadow: var(--rule-below-on-inverse);
	}
	.item:has(.edit) {
		display: block;
		margin-block: var(--space-1);
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
	}
	.main {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-0-5) var(--space-3);
		min-inline-size: 0;
		padding: var(--space-2-5) var(--space-1);
	}
	.text {
		display: grid;
		flex: 1 1 10rem;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}
	.name {
		justify-self: start;
		min-block-size: var(--target);
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--weight-medium);
		text-align: start;
		text-decoration: underline;
		text-decoration-color: var(--hairline);
		text-underline-offset: 0.25em;
		overflow-wrap: anywhere;
		hyphens: auto;
		cursor: pointer;
	}
	@media (hover: hover) {
		.name:hover {
			text-decoration-color: currentColor;
		}
	}
	[data-checked] .name {
		color: var(--ink-on-inverse-secondary);
		text-decoration-line: line-through;
		text-decoration-color: currentColor;
	}
	.meta {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	:global([data-surface='inverse']) .meta {
		color: var(--ink-on-inverse-secondary);
	}
	.value {
		flex: 0 1 auto;
		margin-inline-start: auto;
		max-inline-size: 100%;
		font-size: var(--type-body-s-size);
		font-variant-numeric: var(--numeric-figures);
		text-align: end;
		overflow-wrap: anywhere;
	}
	.action {
		display: flex;
		padding-block-start: var(--space-1);
		color: var(--ink-secondary);
	}

	/* the tick: a real checkbox drawn as the list-row check circle; the label carries the target */
	.tick {
		position: relative;
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height-xs), var(--target-touch));
		min-block-size: max(var(--control-height), var(--target-touch));
		cursor: pointer;
	}
	.tick input {
		appearance: none;
		margin: 0;
		inline-size: var(--space-6);
		block-size: var(--space-6);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		cursor: pointer;
	}
	.tick input:checked {
		background: var(--surface-inverse);
		box-shadow: none;
	}
	.tick :global(svg) {
		position: absolute;
		pointer-events: none;
		color: transparent;
	}
	.tick input:checked + :global(svg) {
		color: var(--ink-on-inverse);
	}
	[data-checked] .tick input {
		background: transparent;
		box-shadow: var(--ring-control-on-inverse);
	}
	[data-checked] .tick input:checked {
		background: var(--surface-raised);
		box-shadow: none;
	}
	[data-checked] .tick input:checked + :global(svg) {
		color: var(--ink);
	}
	.tick input:focus-visible {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	:global([data-surface='inverse']) .tick input:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
	}

	.edit {
		display: grid;
		gap: var(--space-3);
	}
	.from {
		display: flex;
		align-items: center;
		gap: var(--space-1-5);
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}
	.gap {
		flex: 1;
	}
	.verb {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}
</style>
