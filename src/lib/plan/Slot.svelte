<script lang="ts">
	import { flipOnPage } from '#lib/motion.ts';
	import type { IsoDate, PlanEntry, Slot } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { getBoard, placeKey, receive, send } from './dnd.ts';
	import Entry from './Entry.svelte';

	let {
		date,
		dayName,
		slot,
		entries,
		onadd,
		ongone
	}: {
		date: IsoDate;
		dayName: string;
		slot: { id: Slot; label: string };
		entries: PlanEntry[];
		onadd: (date: IsoDate, slot: Slot) => void;
		// an entry has finished leaving
		ongone?: () => void;
	} = $props();

	const board = getBoard();
	const target = $derived(board.drag.over === placeKey(date, slot.id));
	const before = $derived(target ? board.drag.before : null);
	const dragged = $derived(board.drag.item?.kind === 'entry' ? board.drag.item.id : null);

	// the copy that glides away stays in the DOM for its transition; only the arriving one counts for assistive tech
	const leaving = (e: Event) => (e.currentTarget as HTMLElement).setAttribute('aria-hidden', 'true');
	const returning = (e: Event) => (e.currentTarget as HTMLElement).removeAttribute('aria-hidden');
</script>

<div
	class="slot"
	class:armed={board.drag.item !== null}
	role="group"
	aria-label="{dayName} {slot.label}"
	data-date={date}
	data-slot={slot.id}
	data-filled={entries.length > 0 ? '' : undefined}
	data-drop-target={target ? '' : undefined}
>
	<p class="slot-name ruled" aria-hidden="true">{slot.label}</p>
	<div class="entries">
		{#each entries as entry (entry.id)}
			<div
				class="entry-wrap"
				class:before={before === entry.id && dragged !== entry.id}
				in:receive={{ key: entry.id, recipe: entry.recipe?.id }}
				out:send={{ key: entry.id }}
				animate:flipOnPage
				onoutrostart={leaving}
				onoutroend={ongone}
				onintrostart={returning}
			>
				<Entry {entry} />
			</div>
		{/each}
	</div>
	<Button variant="quiet" size="s" class="slot-add" label="Add to {dayName} {slot.label}" onclick={() => onadd(date, slot.id)}>
		<Icon name="plus" size={16} />
		<span class="add-text">{slot.label}</span>
		<span class="drop-hint" aria-hidden="true">{board.drag.item?.kind === 'recipe' ? 'Drop to add' : 'Move here'}</span>
	</Button>
</div>

<style>
	.slot {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas: 'name add' 'list list';
		align-items: center;
		gap: var(--space-1) var(--space-2);
		min-inline-size: 0;
		padding-inline-start: var(--space-1);
		container: slot / inline-size;
	}

	.slot:has(:global([data-menu-open])) {
		z-index: var(--z-menu);
	}

	.slot-name {
		grid-area: name;
		min-inline-size: 0;
		color: var(--ink-secondary);
	}

	:global([data-surface='inverse']) .slot-name {
		color: var(--ink-on-inverse-secondary);
	}

	.slot[data-filled] .slot-name {
		color: var(--ink);
	}

	:global([data-surface='inverse']) .slot[data-filled] .slot-name {
		color: var(--ink-on-inverse);
	}

	.entries {
		grid-area: list;
		display: grid;
		gap: var(--space-1-5);
		min-inline-size: 0;
		padding-block-end: var(--space-1-5);
	}

	.entries:empty {
		display: none;
	}

	.entry-wrap {
		position: relative;
		min-inline-size: 0;
	}

	/* the target under the pointer takes the selected fill behind the entries */
	.slot::after {
		content: '';
		position: absolute;
		inset: calc(-1 * var(--space-1));
		z-index: -1;
		border-radius: var(--radius-item);
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
		opacity: 0;
		transform: scale(0.97);
		pointer-events: none;
		transition:
			opacity var(--motion-quick) var(--ease-out),
			transform var(--motion-quick) var(--ease-out);
	}

	.slot[data-drop-target]::after {
		opacity: 1;
		transform: none;
	}

	/* an entry the drop would land before gets a bar above it */
	.entry-wrap::before {
		content: '';
		position: absolute;
		inset-inline: var(--space-0-5);
		inset-block-start: calc(-1 * var(--space-1));
		block-size: var(--stroke-strong);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse);
		opacity: 0;
		transform: scaleX(0.3);
		transition:
			opacity var(--motion-quick) var(--ease-out),
			transform var(--motion-quick) var(--ease-out);
	}

	.entry-wrap.before::before {
		opacity: 1;
		transform: none;
	}

	.slot :global(.slot-add) {
		grid-area: add;
		position: relative;
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
	}

	:global([data-surface='inverse']) .slot :global(.slot-add) {
		box-shadow: var(--ring-on-inverse);
		color: var(--ink-on-inverse-secondary);
	}

	.add-text {
		display: none;
	}

	/* the hint is wider than an icon-only add button: it grows toward the entries instead of out of the page */
	.drop-hint {
		position: absolute;
		inset-block: 0;
		inset-inline-end: 0;
		inline-size: max-content;
		min-inline-size: 100%;
		padding-inline: var(--space-3);
		white-space: nowrap;
		display: grid;
		place-items: center;
		border-radius: inherit;
		background: var(--surface-selected);
		font-size: var(--type-caption-size);
		font-weight: var(--weight-semibold);
		color: var(--ink);
		opacity: 0;
		transition: opacity var(--motion-quick) var(--ease-out);
		pointer-events: none;
	}

	.slot[data-drop-target]:not(:has(.entry-wrap.before)) .drop-hint {
		opacity: 1;
	}

	/* while a card is in the air every slot shows it can take it */
	.armed :global(.slot-add) {
		box-shadow: var(--ring-control);
	}

	/* the posture switch: from 1024 px a slot is one cell of the day's row; its name lives in the column heads */
	@media (min-width: 1024px) {
		.slot {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas: none;
			align-content: start;
			gap: var(--space-1-5);
			padding: 0;
		}

		.slot-name {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}

		.entries,
		.slot :global(.slot-add) {
			grid-area: auto;
		}

		.entries {
			padding: 0;
		}

		.slot :global(.slot-add) {
			justify-self: start;
			padding-inline: var(--space-3);
		}
	}
</style>
