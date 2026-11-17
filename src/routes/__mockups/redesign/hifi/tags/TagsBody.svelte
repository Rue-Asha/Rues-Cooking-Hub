<script lang="ts">
	import type { MockTag } from '../../fixtures.ts';
	import Button from '../shell/Button.svelte';
	import Field from '../form/Field.svelte';
	import Notice from '../form/Notice.svelte';
	import Ic from '../recipes/Ic.svelte';
	import { go, lang, plural } from '../recipes/util.ts';

	type Props = { tags: MockTag[]; renaming?: string | null; renameValue?: string; renameError?: boolean; status?: string | null; deleting?: string | null; worst?: boolean };
	let { tags, renaming = null, renameValue = '', renameError = false, status = null, deleting = null, worst = false }: Props = $props();
</script>

<div class="slot" role="status">
	{#if status}<Notice title={status} />{/if}
</div>

{#if tags.length === 0}
	<section class="card empty" data-surface="solid" aria-label="Tags">
		<h2>No tags yet</h2>
		<p>Tags are added while you edit a recipe.</p>
		<Button href={go.recipes(worst)}>All recipes</Button>
	</section>
{:else}
	<section class="card" data-surface="solid" aria-label="Tags">
		<div class="card-head">
			<h2>All tags</h2>
			<span class="card-note">{plural(tags.length, 'tag')}</span>
		</div>
		<ul class="list" aria-label="Tags">
			{#each tags as tag (tag.name)}
				<li class="row" class:open={renaming === tag.name} class:armed={deleting === tag.name} data-hover>
					<div class="who">
						<span class="name" lang={lang(tag.name)}>{tag.name}</span>
						<span class="count">{plural(tag.count, 'recipe')}</span>
					</div>
					{#if renaming === tag.name}
						<form class="rename" onsubmit={(e) => e.preventDefault()}>
							<Field label="New name for {tag.name}" hideLabel value={renameValue || tag.name} error={renameError ? 'Enter a name' : undefined} />
							<div class="acts">
								<Button variant="primary" size="s" type="submit">Save</Button>
								<Button variant="quiet" size="s">Cancel</Button>
							</div>
						</form>
					{:else}
						<div class="acts">
							<Button variant="quiet" icon label="Rename {tag.name}"><Ic name="edit" /></Button>
							<Button variant="quiet" icon label="Delete {tag.name}" aria-haspopup="dialog" class="delete"><Ic name="trash" /></Button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.slot:empty {
		display: none;
	}
	.card {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.empty {
		gap: var(--space-3);
		justify-items: start;
		padding: var(--space-6);
	}
	.empty h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.empty p {
		max-inline-size: var(--measure);
		color: var(--ink-secondary);
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
	.row.armed {
		box-shadow: var(--ring-danger);
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
	@media (min-width: 768px) {
		.rename {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: start;
		}
	}
</style>
