<script lang="ts">
	import { flip } from 'svelte/animate';
	import { flipOptions } from '#lib/motion.ts';
	import type { IsoDate, PlanEntry, Slot } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { getBoard, placeKey, receive, send } from './dnd.ts';
	import Entry from './Entry.svelte';

	let {
		date,
		dayName,
		slot,
		index,
		entries,
		onadd
	}: {
		date: IsoDate;
		dayName: string;
		slot: { id: Slot; label: string };
		index: number;
		entries: PlanEntry[];
		onadd: (date: IsoDate, slot: Slot) => void;
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
	data-drop-target={target ? '' : undefined}
	style:--row={index * 2 + 3}
>
	<p class="slot-name" aria-hidden="true">{slot.label}</p>
	<div class="slot-entries">
		{#each entries as entry (entry.id)}
			<div
					class="entry-wrap"
					class:before={before === entry.id && dragged !== entry.id}
					in:receive={{ key: entry.id, recipe: entry.recipe?.id }}
					out:send={{ key: entry.id }}
					animate:flip={flipOptions()}
					onoutrostart={leaving}
					onintrostart={returning}
				>
				<Entry {entry} />
			</div>
		{/each}
		<button
			type="button"
			class="add"
			class:compact={entries.length > 0}
			aria-label="Add to {dayName} {slot.label}"
			onclick={() => onadd(date, slot.id)}
		>
			<Icon name="plus" size={16} />
			<span class="add-text">Add</span>
			<span class="drop-hint" aria-hidden="true">{board.drag.item?.kind === 'recipe' ? 'Drop to add' : 'Move here'}</span>
		</button>
	</div>
</div>

<style>
	.slot {
		grid-row: var(--row);
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
		min-block-size: 56px;
	}

	/* the highlight under the pointer grows in behind the entries */
	.slot {
		position: relative;
	}

	.slot::after {
		content: '';
		position: absolute;
		inset: -4px;
		z-index: -1;
		border-radius: var(--r-md);
		border: 1.5px dashed var(--olive);
		background: var(--olive-wash);
		opacity: 0;
		transform: scale(0.96);
		pointer-events: none;
		transition:
			opacity var(--d-fast) var(--ease-out),
			transform var(--d-base) var(--ease-spring);
	}

	.slot[data-drop-target]::after {
		opacity: 1;
		transform: none;
	}

	/* an entry the drop would land before gets a bar above it */
	.entry-wrap {
		position: relative;
	}

	.entry-wrap::before {
		content: '';
		position: absolute;
		inset-inline: 2px;
		inset-block-start: -5px;
		block-size: 3px;
		border-radius: var(--r-pill);
		background: var(--olive);
		opacity: 0;
		transform: scaleX(0.3);
		transition:
			opacity var(--d-fast) var(--ease-out),
			transform var(--d-base) var(--ease-spring);
	}

	.entry-wrap.before::before {
		opacity: 1;
		transform: none;
	}

	.add {
		position: relative;
	}

	.drop-hint {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 12px;
		font-weight: 600;
		color: var(--olive);
		opacity: 0;
		transform: translateY(4px);
		transition:
			opacity var(--d-fast) var(--ease-out),
			transform var(--d-base) var(--ease-out);
	}

	.add > :global(svg) {
		transition: opacity var(--d-fast) var(--ease-out);
	}

	.slot[data-drop-target] .add > :global(svg) {
		opacity: 0;
	}

	.slot[data-drop-target]:not(:has(.entry-wrap.before)) .drop-hint {
		opacity: 1;
		transform: none;
	}

	.slot[data-drop-target] .add.compact {
		opacity: 1;
		border-color: transparent;
	}

	/* while a card is in the air every slot shows it can take it */
	.armed .add.compact {
		opacity: 0.8;
	}

	.slot-name {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}

	.slot-entries {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 6px;
		min-inline-size: 0;
	}

	.entry-wrap:has(:global([data-menu-open])) {
		position: relative;
		z-index: 8;
	}

	.add {
		display: grid;
		place-items: center;
		min-block-size: 56px;
		flex: 1;
		border-radius: var(--r-sm);
		border: 1px dashed var(--line);
		background: transparent;
		color: var(--stone);
		transition:
			background-color var(--d-fast) var(--ease-out),
			color var(--d-fast) var(--ease-out),
			border-color var(--d-fast) var(--ease-out);
	}

	.add:hover {
		background: var(--olive-wash);
		border-color: var(--olive);
		color: var(--olive);
	}

	.add.compact {
		flex: none;
		min-block-size: 22px;
		border-color: transparent;
		opacity: 0.55;
	}

	.add.compact:hover,
	.add.compact:focus-visible {
		opacity: 1;
		border-color: var(--olive);
	}

	.add-text {
		display: none;
	}

	@media (hover: none) {
		.add.compact {
			opacity: 1;
		}
	}

	@media (max-width: 1023px) {
		.slot {
			display: grid;
			grid-template-columns: 84px 1fr;
			gap: var(--s-3);
			align-items: center;
			padding-block: 8px;
			border-block-end: 1px solid var(--line);
		}

		.slot:last-child {
			border: 0;
		}

		.slot-name {
			position: static;
			inline-size: auto;
			block-size: auto;
			overflow: visible;
			clip-path: none;
			font-size: 11px;
			font-weight: 600;
			letter-spacing: 0.14em;
			text-transform: uppercase;
			color: var(--ink-2);
		}

		.slot-entries {
			gap: 4px;
		}

		.add {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			flex: none;
			align-self: flex-start;
			min-block-size: 44px;
			padding: 0 14px;
			border-radius: var(--r-pill);
			font-size: 13px;
			font-weight: 500;
			color: var(--ink-2);
		}

		.add.compact {
			min-block-size: 44px;
			margin-inline-start: -14px;
			opacity: 1;
			color: var(--stone);
		}

		.add-text {
			display: inline;
		}
	}
</style>
