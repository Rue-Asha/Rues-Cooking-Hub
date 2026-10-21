<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { flipOptions, rise, slideOut, stagger } from '#lib/motion.ts';
	import Sheet from '#lib/plan/Sheet.svelte';
	import type { TagWithCount } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

	let { data } = $props();

	const recipesLabel = (n: number) => (n === 1 ? '1 recipe' : `${n} recipes`);
	const introDelay = new Map(untrack(() => data.tags).map((t, i) => [t.id, stagger(i)]));

	let editing = $state<number | null>(null);
	let error = $state<string | null>(null);
	let note = $state('');
	let target = $state<TagWithCount | null>(null);
	let confirming = $state(false);
	let busy = $state(false);

	const leaving = (e: Event) => (e.currentTarget as HTMLElement).setAttribute('aria-hidden', 'true');

	function edit(id: number) {
		editing = id;
		error = null;
	}

	function focus(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	const rename: SubmitFunction = () => {
		busy = true;
		return async ({ result, update }) => {
			busy = false;
			if (result.type === 'failure') {
				error = String(result.data?.error ?? '');
				return;
			}
			if (result.type === 'success') {
				const merged = result.data?.merged as { from: string; into: string } | null;
				note = merged ? `Merged ${merged.from} into ${merged.into}` : '';
				editing = null;
			}
			await update();
		};
	};

	function askDelete(tag: TagWithCount) {
		target = tag;
		confirming = true;
	}

	const remove: SubmitFunction = () => {
		busy = true;
		return async ({ result, update }) => {
			busy = false;
			if (result.type === 'success') {
				note = `Deleted ${target?.name}`;
				confirming = false;
			}
			await update();
		};
	};
</script>

<svelte:head>
	<title>Tags · Rues Cooking Hub</title>
</svelte:head>

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={['Archive', data.tags.length === 1 ? '1 tag' : `${data.tags.length} tags`]} />
			<h1>Manage <em>tags</em></h1>
			<p class="sub">Rename a tag onto one that already exists and the two become one. New tags are added while editing a recipe.</p>
		</div>
		<a class="back" href="/recipes"><Icon name="arrow-left" size={16} /> All recipes</a>
	</header>

	<p class="note" role="status">
		{#key note}{#if note}<span in:rise={{ y: 6 }}><Icon name="check" size={16} /> {note}</span>{/if}{/key}
	</p>

	<ul class="tags" aria-label="Tags">
		{#each data.tags as tag (tag.id)}
			<li
				style:--delay="{introDelay.get(tag.id) ?? 0}ms"
				class:editing={editing === tag.id}
				animate:flip={flipOptions()}
				out:slideOut
				onoutrostart={leaving}
			>
				{#if editing === tag.id}
					<form
						class="edit"
						method="POST"
						action="?/rename"
						use:enhance={rename}
						in:rise={{ y: 6 }}
					>
						<input type="hidden" name="id" value={tag.id} />
						<input
							class="field"
							name="name"
							value={tag.name}
							aria-label="New name for {tag.name}"
							aria-invalid={error ? 'true' : undefined}
							autocomplete="off"
							onkeydown={(e) => e.key === 'Escape' && (editing = null)}
							use:focus
						/>
						<Button type="submit" variant="olive" arrow={false} icon="check" disabled={busy}>Save</Button>
						<Button variant="ghost" arrow={false} onclick={() => (editing = null)}>Cancel</Button>
						{#if error}<p class="error" in:rise={{ y: 4 }}>{error}</p>{/if}
					</form>
				{:else}
					<div class="show" in:rise={{ y: 6 }}>
						<span class="name">{tag.name}</span>
						<span class="count tnum" class:unused={tag.count === 0}>
							{#key tag.count}<span in:rise={{ y: 6 }}>{recipesLabel(tag.count)}</span>{/key}
						</span>
						<span class="actions">
							<IconButton icon="edit" variant="plain" label="Rename {tag.name}" onclick={() => edit(tag.id)} />
							<IconButton class="del" icon="trash" variant="plain" label="Delete {tag.name}" onclick={() => askDelete(tag)} />
						</span>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</div>

<Sheet open={confirming} kicker="Delete tag" title="Delete tag “{target?.name}”?" onclose={() => (confirming = false)}>
	<form class="confirm" method="POST" action="?/delete" use:enhance={remove}>
		<input type="hidden" name="id" value={target?.id} />
		{#if target && target.count > 0}
			<p class="usage">It's used by {recipesLabel(target.count)}.</p>
		{/if}
		<div class="foot">
			<Button variant="secondary" arrow={false} onclick={() => (confirming = false)}>Cancel</Button>
			<Button type="submit" variant="danger" icon="trash" disabled={busy}>Delete</Button>
		</div>
	</form>
</Sheet>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-6);
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-5);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
	}

	.sub {
		max-inline-size: 52ch;
		margin-block-start: var(--s-3);
		color: var(--ink-2);
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex: none;
		min-block-size: 44px;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink-2);
	}

	.note {
		min-block-size: 24px;
		font-size: 14px;
		font-weight: 500;
		color: var(--olive);
	}

	.note span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.tags {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-3) var(--s-4);
	}

	.tags > li {
		min-block-size: 64px;
		padding: 0 var(--s-2) 0 var(--s-5);
		border-radius: var(--r-md);
		background: var(--surface);
		box-shadow: var(--shadow-card);
		animation: rise-in var(--d-slow) var(--ease-out) var(--delay, 0ms) backwards;
		transition: box-shadow var(--d-base) var(--ease-out);
	}

	.tags > li.editing {
		box-shadow:
			0 0 0 2px var(--olive),
			var(--shadow-card);
	}

	@keyframes rise-in {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
	}

	.show,
	.edit {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		min-block-size: 64px;
	}

	.edit {
		flex-wrap: wrap;
		padding-block: var(--s-2);
	}

	.name {
		flex: 1;
		min-inline-size: 0;
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 400;
		overflow-wrap: anywhere;
	}

	.count {
		display: inline-grid;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink-2);
		white-space: nowrap;
	}

	.count > span {
		grid-area: 1 / 1;
	}

	.unused {
		color: var(--stone);
	}

	.actions {
		display: flex;
	}

	.actions :global(.del) {
		color: var(--brick);
	}

	.field {
		flex: 1;
		min-inline-size: 10ch;
		min-block-size: 44px;
		padding: 0 var(--s-4);
		border: 1px solid var(--line);
		border-radius: var(--r-pill);
		background: var(--ground);
		font-size: 16px;
		color: var(--ink);
	}

	.field {
		transition: border-color var(--d-fast) var(--ease-out);
	}

	.field:focus {
		outline: none;
		border-color: var(--olive);
	}

	.error {
		flex: 0 0 100%;
		padding-inline-start: var(--s-4);
		font-size: 14px;
		font-weight: 500;
		color: var(--brick);
	}

	.confirm {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	.usage {
		padding: var(--s-3) var(--s-4);
		border-radius: var(--r-sm);
		background: var(--brick-soft);
		color: var(--brick);
		font-size: 14px;
		font-weight: 500;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		padding-block-start: var(--s-3);
		border-block-start: 1px solid var(--line);
	}

	@media (prefers-reduced-motion: reduce) {
		.tags > li {
			animation: none;
		}
	}

	@media (max-width: 1023px) {
		.head {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--s-2);
		}

		.back {
			order: -1;
			margin-inline-start: -4px;
		}

		.tags {
			grid-template-columns: 1fr;
		}

		.tags > li {
			padding-inline-start: var(--s-4);
		}

		.name {
			font-size: 19px;
		}
	}
</style>
