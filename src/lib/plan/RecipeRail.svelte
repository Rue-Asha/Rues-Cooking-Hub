<script lang="ts" module>
	import { fold } from '#lib/text.ts';

	export type PlanRecipe = {
		id: number;
		title: string;
		imageId: number | null;
		servings: number;
		totalMinutes: number | null;
		tags: { id: number; name: string }[];
	};

	export const matches = (r: PlanRecipe, q: string): boolean => {
		const needle = fold(q);
		return !needle || fold(r.title).includes(needle) || r.tags.some((t) => fold(t.name).includes(needle));
	};
</script>

<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import Field from '#lib/components/field/Field.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { initialOf, plateOf } from '#lib/recipes/Picture.svelte';
	import { getBoard } from './dnd.ts';

	let { recipes }: { recipes: PlanRecipe[] } = $props();

	const board = getBoard();

	let query = $state('');
	const shown = $derived(recipes.filter((r) => matches(r, query)));
</script>

<aside class="recipe-rail card" aria-label="Recipes">
	<div class="card-head">
		<h2>Recipes</h2>
		<p class="card-note">{recipes.length.toLocaleString('en-GB')} {recipes.length === 1 ? 'recipe' : 'recipes'}</p>
	</div>
	<Field label="Find a recipe" hideLabel type="search" placeholder="Find a recipe" bind:value={query}>
		{#snippet prefix()}<Icon name="search" size={18} stroke={1.75} />{/snippet}
	</Field>
	{#if board.canDrag && recipes.length > 0}<p class="rail-help"><Icon name="grip" size={16} />Drag onto a day</p>{/if}
	{#if shown.length > 0}
		<ul class="rail-list">
			{#each shown as r (r.id)}
				<li
					class="rail-item"
					data-recipe={r.id}
					data-dragging={board.drag.item?.kind === 'recipe' && board.drag.item.id === r.id ? '' : undefined}
					draggable={board.canDrag ? 'true' : undefined}
					ondragstart={(e) => board.start(e, { kind: 'recipe', id: r.id, servings: r.servings }, e.currentTarget)}
					ondragend={board.end}
				>
					{#if r.imageId !== null}
						<span class="rail-thumb" aria-hidden="true"><img src="/images/{r.imageId}" alt="" loading="lazy" /></span>
					{:else}
						<span class="thumb plate" data-plate={plateOf(r.title)} aria-hidden="true">{initialOf(r.title)}</span>
					{/if}
					<span class="rail-text">
						<span class="rail-title">{r.title}</span>
						<span class="rail-meta">{r.totalMinutes ? `${r.totalMinutes} min` : 'No times'}</span>
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="rail-none" role="status">{recipes.length === 0 ? 'No recipes yet' : COPY.noMatch}</p>
	{/if}
</aside>

<style>
	/* drag is the mouse shortcut of the desktop grid: on touch, and below the posture switch, the Add dialog's own search does the job */
	.recipe-rail {
		display: none;
	}

	@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {
		.recipe-rail {
			display: flex;
			flex-direction: column;
			gap: var(--space-3);
			position: sticky;
			inset-block-start: var(--sticky-block-start, var(--space-4));
			max-block-size: calc(100dvh - var(--space-8));
			min-inline-size: 0;
			padding: var(--space-5) var(--space-3) var(--space-3);
		}
	}

	.card-head {
		padding-inline: var(--space-2);
	}

	.card-head h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
	}

	.rail-help {
		display: flex;
		align-items: center;
		gap: var(--space-1-5);
		padding-inline: var(--space-2);
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
	}

	.rail-none {
		padding: var(--space-6) var(--space-2);
		text-align: center;
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}

	.rail-list {
		display: grid;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
		flex: 1;
		min-block-size: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		scrollbar-color: var(--edge-control) transparent;
	}

	/* own classes, not descendants of the list, so the drag image's copy outside the list keeps them */
	.rail-item {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		min-block-size: max(var(--control-height), var(--target));
		min-inline-size: 0;
		padding: var(--space-1-5) var(--space-2-5) var(--space-1-5) var(--space-1-5);
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
		transition:
			opacity var(--motion-quick) var(--ease-out),
			transform var(--motion-quick) var(--ease-out);
	}

	.rail-item[draggable='true'] {
		cursor: grab;
	}

	.rail-item[data-dragging] {
		opacity: var(--disabled-opacity);
		transform: scale(0.97);
	}

	.rail-thumb {
		flex: none;
		inline-size: var(--thumb-size);
		block-size: var(--thumb-size);
		border-radius: var(--radius-round);
		overflow: hidden;
	}

	.rail-thumb img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.plate {
		box-shadow: var(--ring-hairline);
	}

	.plate[data-plate='1'] {
		background: var(--surface-plate-1);
	}

	.plate[data-plate='2'] {
		background: var(--surface-plate-2);
	}

	.rail-text {
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}

	.rail-title {
		font-size: var(--type-body-s-size);
		line-height: var(--type-caption-line);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	.rail-meta {
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
</style>
