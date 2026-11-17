<script lang="ts">
	import type { MockTag } from '../../fixtures.ts';
	import Icon from '../recipes/Icon.svelte';
	import { plural } from '../recipes/util.ts';

	type Props = { tags: MockTag[]; renaming?: string | null; renameValue?: string; renameError?: boolean; status?: string | null; deleting?: string | null };
	let { tags, renaming = null, renameValue = '', renameError = false, status = null, deleting = null }: Props = $props();

	const uid = $props.id();
</script>

<section class="w-card" aria-label="Tags">
	<div class="w-card-head">
		<span class="w-note">{plural(tags.length, 'tag')}</span>
	</div>

	<div role="status" class="slot">
		{#if status}<div class="w-status"><Icon name="check" /><div><strong>{status}</strong></div></div>{/if}
	</div>

	{#if tags.length === 0}
		<div class="w-empty none">
			<h2>No tags yet</h2>
			<p>Tags are added while you edit a recipe.</p>
			<a class="w-btn" href="/__mockups/redesign/wire/recipes">All recipes</a>
		</div>
	{:else}
		<ul class="list" aria-label="Tags">
			{#each tags as tag (tag.name)}
				<li class="row" class:open={renaming === tag.name} class:armed={deleting === tag.name}>
					<div class="who">
						<span class="name">{tag.name}</span>
						<span class="w-note">{plural(tag.count, 'recipe')}</span>
					</div>
					{#if renaming === tag.name}
						<form class="rename" onsubmit={(e) => e.preventDefault()}>
							<div class="w-field">
								<label class="sr-only" for="{uid}-r">New name for {tag.name}</label>
								<input id="{uid}-r" class="w-input" value={renameValue || tag.name} aria-invalid={renameError} aria-describedby={renameError ? `${uid}-e` : undefined} />
								{#if renameError}<p class="w-error" id="{uid}-e"><Icon name="alert" size={14} />Enter a name</p>{/if}
							</div>
							<div class="rename-actions">
								<button type="button" class="w-btn primary s">Save</button>
								<button type="button" class="w-btn quiet s">Cancel</button>
							</div>
						</form>
					{:else}
						<div class="acts">
							<button type="button" class="w-icon" aria-label="Rename {tag.name}"><Icon name="edit" /></button>
							<button type="button" class="w-icon danger" aria-label="Delete {tag.name}" aria-haspopup="dialog" aria-pressed={deleting === tag.name}><Icon name="trash" /></button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if deleting}<p class="w-hint">“Delete tag “{deleting}”?” opens as a dialog (see Overlays).</p>{/if}
</section>

<style>
	.slot:empty {
		display: none;
	}

	.list {
		display: grid;
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
		min-block-size: 3.5rem;
		padding: var(--space-2) var(--space-3) var(--space-2) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		min-inline-size: 0;
	}

	.row.open {
		grid-template-columns: minmax(0, 1fr);
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
		font-weight: var(--type-title-weight);
		overflow-wrap: anywhere;
	}

	.acts,
	.rename-actions {
		display: flex;
		gap: var(--space-1);
	}

	.rename {
		display: grid;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.none {
		padding-inline: 0;
	}

	@media (min-width: 768px) {
		.rename {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: start;
		}
	}
</style>
