<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../overlays/Button.svelte';
	import Field from '../overlays/Field.svelte';
	import Icon from '../overlays/Icon.svelte';
	import type { ListItem } from './data.ts';

	type Props = {
		item: ListItem;
		state?: 'idle' | 'editing' | 'moving';
		error?: string;
		below?: Snippet;
	};
	let { item, state = 'idle', error, below }: Props = $props();
</script>

<li class="item" data-checked={item.checked || undefined} data-state={state}>
	{#if state === 'editing'}
		<form class="edit" aria-label="Edit {item.name}">
			<Field label="Name" value={item.name} />
			<Field label="Amount" value={item.amount} placeholder="e.g. 200 g" {error} />
			{#if item.merged}<p class="from"><Icon name="check" />From plan: {item.merged}</p>{/if}
			<div class="actions">
				<Button variant="danger" size="s">Delete</Button>
				<span class="gap"></span>
				<Button variant="quiet" size="s">Cancel</Button>
				<Button variant="primary" size="s">Save</Button>
			</div>
		</form>
	{:else}
		<button type="button" class="check" role="checkbox" aria-checked={item.checked} aria-label={item.name}>
			<span class="box" aria-hidden="true">{#if item.checked}<Icon name="check" />{/if}</span>
		</button>
		<button type="button" class="name" aria-label="Edit {item.name}">
			<span class="n" dir="auto">{item.name}</span>
			{#if item.amount || item.plan}
				<span class="meta">
					{#if item.amount}<span class="amount">{item.amount}{#if item.merged}{` · incl. ${item.merged} from plan`}{/if}</span>{/if}
					{#if item.plan && !item.merged}<span class="tag">From the plan</span>{/if}
				</span>
			{/if}
		</button>
		<Button variant="quiet" size="s" icon="tag" label="Move {item.name} to another category" expanded={state === 'moving' ? true : undefined} />
	{/if}
	{#if below}<div class="below">{@render below()}</div>{/if}
</li>

<style>
	.item {
		display: grid;
		grid-template-columns: var(--target-touch) minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-1);
		min-block-size: var(--target-touch);
		padding-inline: var(--space-1) var(--space-1);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		min-inline-size: 0;
	}
	.item[data-state='editing'] { display: block; padding: var(--space-3); background: var(--surface-raised); box-shadow: var(--elevation-menu); }
	.check { display: grid; place-items: center; inline-size: var(--target-touch); block-size: var(--target-touch); padding: 0; border: 0; background: transparent; }
	.box {
		display: grid;
		place-items: center;
		inline-size: 24px;
		block-size: 24px;
		border-radius: var(--radius-text);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-on-inverse);
	}
	[data-checked] .box { background: var(--surface-inverse); box-shadow: none; }
	.box :global(svg) { inline-size: 16px; block-size: 16px; }
	.name { display: grid; gap: var(--space-0-5); align-content: center; min-block-size: var(--target-touch); padding-block: var(--space-1); border: 0; background: transparent; color: var(--ink); text-align: start; min-inline-size: 0; }
	.n { font-size: var(--type-body-s-size); line-height: var(--type-body-s-line); font-weight: var(--weight-medium); overflow-wrap: anywhere; hyphens: auto; }
	[data-checked] .n { text-decoration: line-through; color: var(--ink-secondary); }
	.meta { display: flex; flex-wrap: wrap; gap: var(--space-0-5) var(--space-2); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.amount { overflow-wrap: anywhere; font-variant-numeric: var(--numeric-figures); }
	.tag { padding-inline: var(--space-2); border-radius: var(--radius-pill); box-shadow: var(--ring-hairline); }
	.edit { display: grid; gap: var(--space-3); }
	.from { display: flex; align-items: center; gap: var(--space-1-5); font-size: var(--type-caption-size); color: var(--ink-secondary); }
	.from :global(svg) { inline-size: 14px; block-size: 14px; }
	.actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
	.gap { flex: 1; }
	.below { grid-column: 1 / -1; display: grid; justify-items: end; padding-block-end: var(--space-1); }
</style>
