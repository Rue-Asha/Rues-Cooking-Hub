<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { flipOnPage, slideOut } from '#lib/motion.ts';
	import Sheet from '#lib/plan/Sheet.svelte';
	import type { TagWithCount } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import EmptyState from '#lib/components/empty-state/EmptyState.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Status from '#lib/ui/Status.svelte';

	let { data } = $props();

	// the page settles in on a full page load only
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');

	const recipesLabel = (n: number) => (n === 1 ? '1 recipe' : `${n} recipes`);
	const count = (n: number, noun: string) => (n === 1 ? `1 ${noun}` : `${n} ${noun}s`);
	const used = $derived(data.tags.filter((t) => t.count > 0).length);

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

	// the field takes focus and its name is selected, so typing replaces it
	function focus(node: HTMLElement) {
		const input = node.querySelector('input');
		input?.focus();
		input?.select();
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

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker"><li>Archive</li><li>{count(data.tags.length, 'tag')}</li></ul>
		<h1>Manage <em class="accent-word">tags</em></h1>
		<p class="lede">Rename a tag onto one that already exists and the two become one. New tags are added while editing a recipe.</p>
		{#if data.tags.length > 0}<Button href="/recipes">All recipes</Button>{/if}
	</div>
	{#if data.tags.length > 0}
		<ul class="screen-facts" data-surface="inverse" aria-label="Tag totals">
			<li class="facts-caption" aria-hidden="true">Your tags</li>
			<li><span class="n">{data.tags.length.toLocaleString('en-GB')}</span>{data.tags.length === 1 ? 'Tag' : 'Tags'}</li>
			<li><span class="n">{used.toLocaleString('en-GB')}</span>In use</li>
			<li><span class="n">{(data.tags.length - used).toLocaleString('en-GB')}</span>Unused</li>
		</ul>
	{/if}
</header>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	{#if note}
		<div class="note"><Status>{note}</Status></div>
	{/if}

	{#if data.tags.length === 0}
		<EmptyState title="No tags yet" body="Tags are added while you edit a recipe.">
			{#snippet action()}<Button href="/recipes">All recipes</Button>{/snippet}
		</EmptyState>
	{:else}
		<section class="card" data-surface="solid" aria-labelledby="all-tags">
			<div class="card-head">
				<h2 id="all-tags">All tags</h2>
				<span class="card-note">{count(data.tags.length, 'tag')}</span>
			</div>
			<ul class="list" aria-label="Tags">
				{#each data.tags as tag (tag.id)}
					<li
						class="row"
						class:open={editing === tag.id}
						animate:flipOnPage
						out:slideOut
						onoutrostart={leaving}
					>
						<div class="who">
							<span class="name">{tag.name}</span>
							<span class="count" class:unused={tag.count === 0}>{recipesLabel(tag.count)}</span>
						</div>
						{#if editing === tag.id}
							<form class="rename" method="POST" action="?/rename" use:enhance={rename} use:focus>
								<input type="hidden" name="id" value={tag.id} />
								<Field
									label="New name for {tag.name}"
									hideLabel
									name="name"
									value={tag.name}
									error={error ?? undefined}
									autocomplete="off"
									onkeydown={(e: KeyboardEvent) => e.key === 'Escape' && (editing = null)}
								/>
								<div class="acts">
									<Button variant="primary" size="s" type="submit" disabled={busy}>Save</Button>
									<Button variant="quiet" size="s" onclick={() => (editing = null)}>Cancel</Button>
								</div>
							</form>
						{:else}
							<div class="acts">
								<Button variant="quiet" icon label="Rename {tag.name}" onclick={() => edit(tag.id)}><Icon name="edit" size={18} /></Button>
								<Button variant="quiet" icon label="Delete {tag.name}" class="delete" onclick={() => askDelete(tag)}><Icon name="trash" size={18} /></Button>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<Sheet open={confirming} kicker="Delete tag" title="Delete tag “{target?.name}”?" onclose={() => (confirming = false)}>
	<form id="delete-tag" class="confirm" method="POST" action="?/delete" use:enhance={remove}>
		<input type="hidden" name="id" value={target?.id} />
		{#if target && target.count > 0}
			<p class="usage">It's used by {recipesLabel(target.count)}.</p>
		{/if}
	</form>
	{#snippet actions()}
		<Button onclick={() => (confirming = false)}>Cancel</Button>
		<Button variant="danger" type="submit" form="delete-tag" disabled={busy}>Delete</Button>
	{/snippet}
</Sheet>

<style>
	.note {
		margin-block-end: var(--space-3);
	}
	.card {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-2) var(--space-3);
		min-block-size: var(--space-14);
		min-inline-size: 0;
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	.row.open {
		grid-template-columns: minmax(0, 1fr);
		padding-block: var(--space-3);
		padding-inline: var(--space-4);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	.who {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-0-5) var(--space-3);
		min-inline-size: 0;
	}
	.name {
		min-inline-size: 0;
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		overflow-wrap: anywhere;
	}
	.count {
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
	.acts {
		display: flex;
		gap: var(--space-1);
	}
	.row :global(.delete) {
		color: var(--danger);
	}
	.rename {
		display: grid;
		gap: var(--space-2);
		min-inline-size: 0;
	}
	.usage {
		color: var(--ink-secondary);
	}
	@media (min-width: 768px) {
		.rename {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: start;
		}
	}
</style>
