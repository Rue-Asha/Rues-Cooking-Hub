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
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import { getBoard } from './dnd.ts';

	let { recipes }: { recipes: PlanRecipe[] } = $props();

	const board = getBoard();

	let query = $state('');
	const shown = $derived(recipes.filter((r) => matches(r, query)));
</script>

<aside class="rail" aria-labelledby="rail-title">
	<h2 id="rail-title" data-section-heading>Recipes</h2>
	{#if board.canDrag}<p class="rail-help">Drag onto a day</p>{/if}
	<label class="rail-search">
		<Icon name="search" size={16} />
		<span class="visually-hidden">Find a recipe</span>
		<input type="search" placeholder="Find a recipe" bind:value={query} />
	</label>
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
					<span class="rail-thumb" aria-hidden="true">
						{#if r.imageId !== null}<img src="/images/{r.imageId}" alt="" loading="lazy" />{:else}<ImagePlaceholder size="thumb" />{/if}
					</span>
					<span class="rail-text">
						<span class="rail-title">{r.title}</span>
						{#if r.totalMinutes}<span class="rail-meta tnum">{r.totalMinutes} min</span>{/if}
					</span>
					{#if board.canDrag}<span class="grip" aria-hidden="true"><Icon name="grip" size={16} /></span>{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="rail-empty">{recipes.length === 0 ? 'No recipes yet' : COPY.noMatch}</p>
	{/if}
</aside>

<style>
	.rail {
		position: sticky;
		inset-block-start: 100px;
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		max-block-size: calc(100dvh - 124px);
		min-inline-size: 0;
	}

	h2 {
		font-size: var(--t-display-3);
	}

	.rail-help {
		margin-block-start: -8px;
		font-size: var(--t-small);
		color: var(--ink-2);
	}

	.rail-search {
		display: flex;
		align-items: center;
		gap: 8px;
		min-block-size: 40px;
		padding: 0 14px;
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink-2);
	}

	.rail-search:focus-within {
		box-shadow: var(--focus-ring);
	}

	.rail-search input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: none;
		font-size: 14px;
	}

	.rail-search input:focus {
		outline: none;
		box-shadow: none;
	}

	.rail-search input::placeholder {
		color: var(--ink-2);
	}

	.rail-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 6px;
		overflow-y: auto;
		overscroll-behavior: contain;
		border-radius: var(--r-card);
		background: var(--surface);
		box-shadow: var(--shadow-card);
	}

	/* own classes, not descendants of the list, so the drag image's copy outside the list keeps them */
	.rail-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 8px 6px 6px;
		border-radius: var(--r-sm);
		transition:
			background-color var(--d-fast) var(--ease-out),
			opacity var(--d-base) var(--ease-out),
			transform var(--d-base) var(--ease-glide);
	}

	.rail-item[draggable='true'] {
		cursor: grab;
	}

	.rail-item[draggable='true']:hover {
		background: var(--ink-wash);
		transform: translateX(2px);
	}

	.rail-item[data-dragging] {
		opacity: 0.4;
		transform: scale(0.96);
	}

	.grip {
		display: grid;
		flex: none;
		color: var(--stone);
		opacity: 0.6;
		transition: opacity var(--d-fast) var(--ease-out);
	}

	.rail-item:hover .grip {
		opacity: 1;
	}

	.rail-thumb {
		flex: none;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--r-pill);
		overflow: hidden;
	}

	.rail-thumb img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.rail-text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-inline-size: 0;
	}

	.rail-title {
		font-size: 13px;
		font-weight: 600;
		line-height: 1.25;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.rail-meta {
		font-size: 12px;
		color: var(--ink-2);
	}

	.rail-empty {
		padding: var(--s-3);
		font-size: var(--t-small);
		color: var(--ink-2);
	}

	@media (max-width: 1023px) {
		.rail {
			display: none;
		}
	}

	@media (min-width: 1024px) and (max-width: 1179px) {
		.rail-text .rail-meta {
			display: none;
		}
	}
</style>
