<script lang="ts">
	import { page } from '$app/state';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { pop } from '#lib/motion.ts';
	import type { PlanEntry } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import { clearOfBar } from '#lib/shell/clear.ts';
	import { getBoard } from './dnd.ts';

	let { entry }: { entry: PlanEntry } = $props();

	// a form posts to the page's own URL minus its query; the week stays in view only when it is named again
	const keep = $derived(page.url.searchParams.has('week') ? `&week=${page.url.searchParams.get('week')}` : '');

	const board = getBoard();
	const dragging = $derived(board.drag.item?.kind === 'entry' && board.drag.item.id === entry.id);

	const title = $derived(entry.recipe?.title ?? entry.text ?? '');

	let mode = $state<'closed' | 'menu' | 'edit'>('closed');
	let error = $state('');
	let value = $state('');
	let saving = $state(false);
	let root: HTMLElement;
	let removal: HTMLFormElement;

	const close = (refocus = false) => {
		mode = 'closed';
		error = '';
		if (refocus) root.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
	};

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
	role="group"
	aria-label={title}
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
		<span class="serv figures">{entry.servings} {entry.servings === 1 ? 'serving' : 'servings'}</span>
	{/if}

	<span class="more">
		<Button
			variant="quiet"
			size="xs"
			icon
			label="Options for {title}"
			aria-haspopup="menu"
			aria-expanded={mode !== 'closed'}
			onclick={() => (mode === 'closed' ? (mode = 'menu') : close())}
		>
			<Icon name="dots" size={18} />
		</Button>
	</span>

	<form method="POST" action="?/delete{keep}" use:enhance bind:this={removal} hidden>
		<input type="hidden" name="id" value={entry.id} />
	</form>

	{#if mode === 'menu'}
		<div class="menu" role="menu" aria-label="Options for {title}" in:pop out:pop onoutrostart={leaving} onintrostart={returning} use:clearOfBar use:first>
			<button
				type="button"
				role="menuitem"
				onclick={() => {
					value = entry.recipe ? String(entry.servings) : (entry.text ?? '');
					mode = 'edit';
				}}
			>
				{entry.recipe ? 'Change servings' : 'Edit text'}
			</button>
			<button
				type="button"
				role="menuitem"
				onclick={() => {
					close();
					board.moveTo(entry);
				}}
			>
				Move to…
			</button>
			<hr />
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
		<form class="menu edit" method="POST" action="?/update{keep}" use:enhance={save} in:pop out:pop onoutrostart={leaving} onintrostart={returning} use:clearOfBar use:first>
			<input type="hidden" name="id" value={entry.id} />
			{#if entry.recipe}
				<Field label="Servings" name="servings" inputmode="numeric" autocomplete="off" bind:value {error} />
			{:else}
				<Field label="Text" name="text" autocomplete="off" bind:value {error} />
			{/if}
			<div class="actions">
				<Button size="s" variant="quiet" onclick={() => close(true)}>Cancel</Button>
				<Button size="s" variant="primary" type="submit" disabled={saving}>Save</Button>
			</div>
		</form>
	{/if}
</div>

<style>
	.entry {
		position: relative;
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
		transition:
			opacity var(--motion-quick) var(--ease-out),
			transform var(--motion-quick) var(--ease-out);
	}

	:global([data-surface='inverse']) .entry {
		background: var(--surface-inverse-raised);
		color: var(--ink-on-inverse);
	}

	.entry.text {
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas: 'title act';
		padding-inline-start: var(--space-2-5);
		background: transparent;
		box-shadow: var(--ring-hairline);
	}

	:global([data-surface='inverse']) .entry.text {
		background: transparent;
		box-shadow: var(--ring-on-inverse);
	}

	.entry[draggable='true'] {
		cursor: grab;
	}

	/* the card stays behind as a faint placeholder while its tilted copy is in the air */
	.entry[data-dragging] {
		opacity: var(--disabled-opacity);
		box-shadow: var(--ring-control);
		transform: scale(0.97);
	}

	.thumb {
		grid-area: lead;
		display: block;
		margin-block-start: var(--space-0-5);
		inline-size: var(--thumb-size);
		block-size: var(--thumb-size);
		border-radius: var(--radius-round);
		overflow: hidden;
	}

	.thumb img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.title {
		grid-area: title;
		padding-block-start: var(--space-1);
		font-size: var(--type-body-s-size);
		line-height: var(--type-caption-line);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		overflow: hidden;
	}

	.serv {
		grid-area: meta;
		align-self: center;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}

	:global([data-surface='inverse']) .serv {
		color: var(--ink-on-inverse-secondary);
	}

	.more {
		grid-area: act;
		display: flex;
		justify-self: end;
	}

	.entry[data-menu-open] {
		z-index: var(--z-menu);
	}

	.menu {
		position: absolute;
		inset-block-start: calc(100% + var(--space-1));
		inset-inline-end: 0;
		z-index: var(--z-menu);
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 13rem;
		padding: var(--space-1-5);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
		transform-origin: top right;
	}

	/* the last entries of a long page: the menu opens upwards, clear of the phone bar */
	.menu:global([data-side='above']) {
		inset-block-start: auto;
		inset-block-end: calc(100% + var(--space-1));
		transform-origin: bottom right;
	}

	.menu button[role='menuitem'] {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: none;
		font-size: var(--type-body-s-size);
		font-weight: var(--weight-medium);
		text-align: start;
		color: var(--ink);
	}

	@media (hover: hover) and (pointer: fine) {
		.menu button[role='menuitem']:hover {
			background: var(--surface-tint);
		}
	}

	.menu button[role='menuitem']:focus-visible {
		background: var(--surface-tint);
	}

	.menu hr {
		block-size: var(--stroke-hairline);
		margin: var(--space-1) var(--space-2);
		border: 0;
		background: var(--hairline);
	}

	.menu button.danger {
		color: var(--danger);
	}

	.edit {
		gap: var(--space-3);
		padding: var(--space-3);
		min-inline-size: 15rem;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}

	/* a roomy slot (a stacked day) puts the servings under the title, beside the picture, with the button at the end */
	@container slot (min-width: 17rem) {
		.entry:not(.text) {
			grid-template-areas: 'lead title act' 'lead meta act';
			align-items: center;
		}

		.entry .more {
			align-self: center;
		}
	}
</style>
