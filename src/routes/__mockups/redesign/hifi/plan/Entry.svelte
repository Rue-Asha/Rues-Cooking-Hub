<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Field from '../overlays/Field.svelte';
	import Icon from '../overlays/Icon.svelte';
	import MenuButton from '../overlays/MenuButton.svelte';
	import Pic from './Pic.svelte';
	import { servingsText, type PlanEntry } from './data.ts';

	type Props = {
		entry: PlanEntry;
		mode?: 'idle' | 'dragging' | 'editing' | 'error';
		onmove?: () => void;
		ondelete?: () => void;
		onsave?: (value: string) => void;
	};
	let { entry, mode = 'idle', onmove, ondelete, onsave }: Props = $props();

	const seed = () => ({ touched: mode === 'error', editing: mode === 'editing' || mode === 'error', value: mode === 'error' ? '0' : entry.free ? entry.title : String(entry.servings) });
	let editing = $state(seed().editing);
	let value = $state(seed().value);
	let touched = $state(seed().touched);
	const error = $derived(
		touched ? (entry.free ? (value.trim() ? undefined : 'Enter a recipe or some text') : Number.parseInt(value, 10) >= 1 ? undefined : 'Servings must be at least 1') : undefined
	);
	const items = $derived([{ label: entry.free ? 'Edit text' : 'Change servings' }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger' as const, sep: true }]);

	function pick(label: string) {
		if (label === 'Move to…') onmove?.();
		else if (label === 'Delete') ondelete?.();
		else {
			value = entry.free ? entry.title : String(entry.servings);
			touched = false;
			editing = true;
		}
	}
	function save(event: SubmitEvent) {
		event.preventDefault();
		touched = true;
		if (error === undefined && (entry.free ? value.trim() : Number.parseInt(value, 10) >= 1)) {
			editing = false;
			onsave?.(value);
		}
	}
</script>

<li class="entry" data-free={entry.free || undefined} data-state={mode === 'dragging' ? 'dragging' : undefined} draggable={mode === 'idle' ? 'true' : undefined}>
	{#if editing}
		<form class="edit" onsubmit={save} aria-label="Edit {entry.title}">
			<Field label={entry.free ? 'Text' : 'Servings'} bind:value inputmode={entry.free ? 'text' : 'numeric'} {error} />
			<div class="row">
				<Button size="s" variant="quiet" onclick={() => (editing = false)}>Cancel</Button>
				<Button size="s" variant="primary" type="submit">Save</Button>
			</div>
		</form>
	{:else}
		{#if !entry.free}<span class="lead"><Pic title={entry.title} image={entry.image} /></span>{/if}
		<span class="title" dir="auto" title={entry.title}>{entry.title}</span>
		{#if entry.servings !== null}<span class="meta">{servingsText(entry.servings)}</span>{/if}
		<span class="act">
			<MenuButton label="Options for {entry.title}" name="Options for {entry.title}" {items} onpick={(i) => pick(i.label)}><Icon name="more" /></MenuButton>
		</span>
	{/if}
</li>

<style>
	.entry {
		display: grid;
		grid-template-columns: var(--thumb-size) minmax(0, 1fr) auto;
		grid-template-areas: 'lead title title' 'lead meta act';
		align-items: start;
		column-gap: var(--space-2);
		min-inline-size: 0;
		padding: var(--space-1-5) var(--space-1) var(--space-1) var(--space-1-5);
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
		color: var(--ink);
	}
	:global([data-surface='inverse']) .entry {
		background: var(--surface-inverse-raised);
		color: var(--ink-on-inverse);
	}
	.entry[data-state='dragging'] {
		opacity: var(--disabled-opacity);
		box-shadow: var(--ring-control);
	}
	.entry[draggable='true'] {
		cursor: grab;
	}
	.lead {
		grid-area: lead;
		padding-block-start: var(--space-0-5);
	}
	.lead :global(.thumb) {
		--thumb: var(--thumb-size);
	}
	.title {
		grid-area: title;
		padding-block-start: var(--space-1);
		font-size: var(--type-body-s-size);
		line-height: var(--type-caption-line);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
		hyphens: auto;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		overflow: hidden;
	}
	.meta {
		grid-area: meta;
		align-self: center;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
	:global([data-surface='inverse']) .meta {
		color: var(--ink-on-inverse-secondary);
	}
	.act {
		grid-area: act;
		display: flex;
	}
	.entry[data-free] {
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas: 'title act';
		padding-inline-start: var(--space-2-5);
		background: transparent;
		box-shadow: var(--ring-hairline);
	}
	:global([data-surface='inverse']) .entry[data-free] {
		background: transparent;
		box-shadow: var(--ring-on-inverse);
	}
	.entry:has(.edit) {
		display: block;
		padding: var(--space-3);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
	}
	.edit {
		display: grid;
		gap: var(--space-3);
	}
	.row {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	/* a roomy slot (a stacked day) puts the servings under the title, beside the picture, with the button at the end */
	@container slot (min-width: 17rem) {
		.entry:not([data-free]) {
			grid-template-areas: 'lead title act' 'lead meta act';
			align-items: center;
		}
		.entry .act {
			align-self: center;
		}
	}
</style>
