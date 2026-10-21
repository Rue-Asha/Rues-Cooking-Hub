<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { scale } from 'svelte/transition';
	import { reducedMotion } from '#lib/motion.ts';
	import type { PlanEntry } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import { getBoard } from './dnd.ts';

	let { entry }: { entry: PlanEntry } = $props();

	const board = getBoard();
	const dragging = $derived(board.drag.item?.kind === 'entry' && board.drag.item.id === entry.id);

	const title = $derived(entry.recipe?.title ?? entry.text ?? '');

	let mode = $state<'closed' | 'menu' | 'edit'>('closed');
	let error = $state('');
	let saving = $state(false);
	let root: HTMLElement;
	let trigger: HTMLButtonElement;
	let removal: HTMLFormElement;

	const close = (refocus = false) => {
		mode = 'closed';
		error = '';
		if (refocus) trigger.focus();
	};

	const pop = (node: Element) => scale(node, { start: 0.94, duration: reducedMotion() ? 0 : 160 });

	// Svelte makes the outgoing copy inert but leaves it in the accessible tree until its transition ends
	const leaving = (e: Event) => (e.currentTarget as HTMLElement).setAttribute('aria-hidden', 'true');
	const returning = (e: Event) => (e.currentTarget as HTMLElement).removeAttribute('aria-hidden');

	function first(node: HTMLElement) {
		(node.querySelector('[role="menuitem"], input') as HTMLElement | null)?.focus();
		(node.querySelector('input') as HTMLInputElement | null)?.select();
	}

	function onkeydown(e: KeyboardEvent) {
		if (mode === 'closed' || !root.contains(document.activeElement)) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			close(true);
		} else if (mode === 'menu' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
			e.preventDefault();
			const items = [...root.querySelectorAll<HTMLElement>('[role="menuitem"]')];
			const at = items.indexOf(document.activeElement as HTMLElement);
			items[(at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
		}
	}

	const save: SubmitFunction = () => {
		saving = true;
		return async ({ result, update }) => {
			saving = false;
			if (result.type === 'failure') {
				error = Object.values((result.data as { errors?: Record<string, string> } | undefined)?.errors ?? {})[0] ?? '';
				return;
			}
			await update({ reset: false });
			close(true);
		};
	};
</script>

<svelte:window
	{onkeydown}
	onpointerdown={(e) => {
		if (mode !== 'closed' && !root.contains(e.target as Node)) close();
	}}
	onfocusin={(e) => {
		if (mode !== 'closed' && !root.contains(e.target as Node)) close();
	}}
/>

<!-- svelte-ignore a11y_no_static_element_interactions (dragging is the mouse shortcut; "Move to…" in the menu is the keyboard path) -->
<div
	class="entry"
	class:text={!entry.recipe}
	data-entry={entry.id}
	data-menu-open={mode !== 'closed' ? '' : undefined}
	data-dragging={dragging ? '' : undefined}
	draggable={board.canDrag && mode === 'closed' ? 'true' : undefined}
	ondragstart={(e) => board.start(e, { kind: 'entry', id: entry.id }, root)}
	ondragend={board.end}
	bind:this={root}
>
	{#if entry.recipe}
		<span class="thumb" aria-hidden="true">
			{#if entry.recipe.imageId !== null}<img src="/images/{entry.recipe.imageId}" alt="" loading="lazy" />{:else}<ImagePlaceholder size="thumb" />{/if}
		</span>
	{/if}
	<span class="title">{title}</span>
	{#if entry.servings !== null}
		<span class="serv tnum" title="{entry.servings} servings">
			<span aria-hidden="true">×{entry.servings}</span>
			<span class="visually-hidden">{entry.servings} servings</span>
		</span>
	{/if}

	<button
		type="button"
		class="more"
		bind:this={trigger}
		aria-label="Options for {title}"
		aria-haspopup="menu"
		aria-expanded={mode !== 'closed'}
		onclick={() => (mode === 'closed' ? (mode = 'menu') : close())}
	>
		<Icon name="dots" size={18} />
	</button>

	<form method="POST" action="?/delete" use:enhance bind:this={removal} hidden>
		<input type="hidden" name="id" value={entry.id} />
	</form>

	{#if mode === 'menu'}
		<div class="menu" role="menu" aria-label="Options for {title}" transition:pop onoutrostart={leaving} onintrostart={returning} use:first>
			<button type="button" role="menuitem" onclick={() => (mode = 'edit')}>
				<Icon name="edit" size={18} />{entry.recipe ? 'Change servings' : 'Edit text'}
			</button>
			<button
				type="button"
				role="menuitem"
				onclick={() => {
					close();
					board.moveTo(entry);
				}}
			>
				<Icon name="move" size={18} />Move to…
			</button>
			<button
				type="button"
				role="menuitem"
				class="danger"
				onclick={() => {
					close();
					removal.requestSubmit();
				}}
			>
				<Icon name="trash" size={18} />Delete
			</button>
		</div>
	{:else if mode === 'edit'}
		<form class="menu edit" method="POST" action="?/update" use:enhance={save} transition:pop onoutrostart={leaving} onintrostart={returning} use:first>
			<input type="hidden" name="id" value={entry.id} />
			{#if entry.recipe}
				<label>
					<span>Servings</span>
					<input type="number" name="servings" inputmode="numeric" value={entry.servings} />
				</label>
			{:else}
				<label>
					<span>Text</span>
					<input type="text" name="text" autocomplete="off" value={entry.text} />
				</label>
			{/if}
			{#if error}<p class="error" role="alert">{error}</p>{/if}
			<div class="actions">
				<button type="button" class="cancel" onclick={() => close(true)}>Cancel</button>
				<button type="submit" class="save" disabled={saving}>Save</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.entry {
		position: relative;
		display: grid;
		grid-template-columns: 32px 1fr;
		gap: 6px;
		align-items: start;
		padding: 6px;
		border-radius: var(--r-sm);
		background: var(--white);
		box-shadow: var(--shadow-card);
	}

	.entry.text {
		grid-template-columns: 1fr;
		background: var(--sand);
		box-shadow: none;
	}

	.entry {
		transition:
			opacity var(--d-base) var(--ease-out),
			transform var(--d-base) var(--ease-glide);
	}

	.entry[draggable='true'] {
		cursor: grab;
	}

	/* the card stays behind as a faint placeholder while its tilted copy is in the air, and settles back if the drop misses */
	.entry[data-dragging] {
		opacity: 0.35;
		transform: scale(0.95);
	}

	.thumb {
		display: block;
		grid-row: span 2;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--r-pill);
		overflow: hidden;
	}

	.thumb img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.title {
		font-size: 13px;
		font-weight: 500;
		line-height: 1.25;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.text .title {
		font-style: italic;
	}

	.serv {
		grid-column: 2;
		font-size: 11px;
		color: var(--ink-2);
	}

	@media (max-width: 1023px) {
		.entry {
			display: flex;
			align-items: center;
			gap: 10px;
			min-inline-size: 0;
			padding: 0;
			background: none;
			box-shadow: none;
		}

		.entry.text {
			background: none;
		}

		.thumb {
			flex: none;
			inline-size: 36px;
			block-size: 36px;
		}

		.title {
			flex: 1;
			min-inline-size: 0;
			font-size: 14px;
		}

		.serv {
			font-size: 12px;
		}
	}

	@media (min-width: 1024px) and (max-width: 1179px) {
		.entry {
			grid-template-columns: 1fr;
		}

		.thumb {
			display: none;
		}

		.serv {
			grid-column: 1;
		}
	}

	.more {
		position: absolute;
		inset-block-start: 2px;
		inset-inline-end: 2px;
		display: grid;
		place-items: center;
		inline-size: 26px;
		block-size: 26px;
		border: 0;
		border-radius: var(--r-pill);
		background: var(--white);
		color: var(--ink-2);
		box-shadow: var(--shadow-card);
		opacity: 0;
		transition:
			opacity var(--d-fast) var(--ease-out),
			transform var(--d-fast) var(--ease-out);
	}

	.entry:hover .more,
	.entry:focus-within .more,
	.entry[data-menu-open] .more {
		opacity: 1;
	}

	.more:hover {
		transform: scale(1.08);
	}

	.menu {
		position: absolute;
		inset-block-start: calc(100% + 4px);
		inset-inline-end: 0;
		z-index: 9;
		display: flex;
		flex-direction: column;
		min-inline-size: 200px;
		padding: 6px;
		border-radius: var(--r-md);
		border: 1px solid var(--glass-border);
		background: var(--glass-strong);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-float);
		transform-origin: top right;
	}

	.menu button[role='menuitem'] {
		display: flex;
		align-items: center;
		gap: 10px;
		min-block-size: 44px;
		padding: 0 12px;
		border: 0;
		border-radius: var(--r-sm);
		background: none;
		font-size: 14px;
		font-weight: 500;
		text-align: start;
		color: var(--ink);
	}

	.menu button[role='menuitem']:hover,
	.menu button[role='menuitem']:focus-visible {
		background: var(--ink-wash);
	}

	.menu .danger {
		color: var(--brick);
	}

	.edit {
		gap: var(--s-3);
		padding: var(--s-3);
	}

	.edit label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--ink-2);
	}

	.edit input[type='number'],
	.edit input[type='text'] {
		min-block-size: 44px;
		padding: 0 14px;
		border: 1px solid var(--line);
		border-radius: var(--r-pill);
		background: var(--white);
		font-size: 16px;
		color: var(--ink);
	}

	.error {
		font-size: 13px;
		font-weight: 500;
		color: var(--brick);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--s-2);
	}

	.actions button {
		min-block-size: 40px;
		padding: 0 var(--s-4);
		border: 1px solid transparent;
		border-radius: var(--r-pill);
		font-size: 14px;
		font-weight: 500;
	}

	.cancel {
		background: none;
		border-color: var(--line);
		color: var(--ink);
	}

	.save {
		background: var(--dark);
		color: var(--on-dark);
	}

	.save:disabled {
		opacity: 0.4;
	}

	@media (max-width: 1023px) {
		.more {
			position: static;
			flex: none;
			inline-size: 44px;
			block-size: 44px;
			margin-inline-end: -10px;
			background: none;
			box-shadow: none;
			opacity: 1;
		}
	}

	@media (hover: none) {
		.more {
			opacity: 1;
		}
	}
</style>
