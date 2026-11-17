<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import Grey from '../recipes/Grey.svelte';
	import Icon from '../recipes/Icon.svelte';
	import { timesLine, wire } from '../recipes/util.ts';
	import { scaleLine } from './data.ts';

	type Hide = Partial<Record<'image' | 'times' | 'source' | 'description' | 'notes' | 'ingredients' | 'steps' | 'tags', boolean>>;
	type Props = { recipe: MockRecipeFull; servings?: number; field?: string; alert?: boolean; hide?: Hide; worst?: boolean; chrome?: boolean };
	let { recipe, servings, field, alert = false, hide = {}, worst = false, chrome = true }: Props = $props();

	const uid = $props.id();
	const scaled = $derived(servings ?? recipe.servings);
	const shownField = $derived(field ?? String(scaled));
	const times = $derived(hide.times ? null : timesLine(recipe.prepMinutes, recipe.cookMinutes));
	const host = $derived(recipe.sourceUrl ? new URL(recipe.sourceUrl).host : null);
	const starts = $derived(recipe.steps.map((_, i) => recipe.steps.slice(0, i).reduce((sum, section) => sum + section.lines.length, 0)));
</script>

<div class="top">
	<a class="w-btn quiet s" href={wire('recipes', worst)}><Icon name="back" />Back to recipes</a>
	<div class="acts">
		<button type="button" class="w-icon" aria-pressed={recipe.favourite} aria-label="{recipe.favourite ? 'Remove' : 'Add'} {recipe.title} {recipe.favourite ? 'from' : 'to'} favourites"><Icon name={recipe.favourite ? 'starFill' : 'star'} /></button>
		<a class="w-btn s" href={wire('form/edit', worst)}><Icon name="edit" size={16} /><span>Edit</span></a>
		<button type="button" class="w-btn s danger"><Icon name="trash" size={16} /><span>Delete recipe</span></button>
	</div>
</div>

<article class="w-card info" aria-labelledby="{uid}-title">
	<div class="photo">{#if hide.image}<Grey plate />{:else}<Grey label="Photo" />{/if}</div>
	<div class="text">
		<h2 id="{uid}-title" class="sr-only">{recipe.title}</h2>
		<div class="w-chips">
			{#if hide.tags || recipe.tags.length === 0}<span class="w-tag">Recipe</span>{:else}{#each recipe.tags as tag (tag)}<span class="w-tag">{tag}</span>{/each}{/if}
		</div>
		{#if recipe.description && !hide.description}<p class="desc">{recipe.description}</p>{/if}
		<ul class="w-facts">
			{#if times}<li>{times}</li>{/if}
			<li>{recipe.servings} servings</li>
			{#if host && !hide.source}<li><a class="source" href={recipe.sourceUrl} target="_blank" rel="noreferrer">Source: {host}<Icon name="external" size={14} /></a></li>{/if}
		</ul>
	</div>
</article>

{#if chrome}
	<div class="w-card bar">
		<div class="scale" role="group" aria-label="Scale recipe">
			<label for="{uid}-s">Scale to servings</label>
			<div class="stepper">
				<button type="button" class="w-icon" aria-label="Scale down"><Icon name="minus" /></button>
				<input id="{uid}-s" class="w-input" inputmode="numeric" value={shownField} aria-invalid={alert} aria-describedby={alert ? `${uid}-err` : undefined} />
				<button type="button" class="w-icon" aria-label="Scale up"><Icon name="plus" /></button>
			</div>
			{#if scaled !== recipe.servings && !alert}<button type="button" class="w-btn quiet s">Reset to {recipe.servings} servings</button>{/if}
		</div>
		<a class="w-btn primary plan" href={wire('overlays', worst)}>Add to plan<Icon name="arrow" /></a>
		{#if alert}<p class="w-error" id="{uid}-err" role="alert"><Icon name="alert" size={14} />Servings must be at least 1</p>{/if}
	</div>
{/if}

<div class="cols">
	<section class="w-card" aria-labelledby="{uid}-ing">
		<div class="w-card-head"><h2 id="{uid}-ing">Ingredients</h2><span class="w-note">for {scaled}</span></div>
		{#if hide.ingredients || recipe.ingredients.length === 0}
			<p class="w-hint">No ingredients yet.</p>
		{:else}
			{#each recipe.ingredients as section, i (i)}
				{#if section.title}<h3 class="ruled">{section.title}</h3>{/if}
				<ul class="lines">
					{#each section.lines as line, n (n)}<li>{scaleLine(line, recipe.servings, scaled)}</li>{/each}
				</ul>
			{/each}
		{/if}
	</section>

	<div class="right">
		<section class="w-card" aria-labelledby="{uid}-met">
			<div class="w-card-head"><h2 id="{uid}-met">Method</h2></div>
			{#if hide.steps || recipe.steps.length === 0}
				<p class="w-hint">No steps yet.</p>
			{:else}
				{#each recipe.steps as section, i (i)}
					{#if section.title}<h3 class="ruled">{section.title}</h3>{/if}
					<ol class="steps">
						{#each section.lines as line, n (n)}<li><span class="n" aria-hidden="true">{starts[i] + n + 1}</span><span>{line}</span></li>{/each}
					</ol>
				{/each}
			{/if}
		</section>
		{#if recipe.notes && !hide.notes}
			<section class="w-card" aria-labelledby="{uid}-notes">
				<div class="w-card-head"><h2 id="{uid}-notes">Notes</h2></div>
				<p class="notes">{recipe.notes}</p>
			</section>
		{/if}
	</div>
</div>

<style>
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.acts {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	@media (max-width: 767px) {
		.acts .w-btn {
			inline-size: max(var(--control-height-s), var(--target));
			padding: 0;
		}

		.acts .w-btn span {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}
	}

	.info {
		gap: var(--space-4);
	}

	.text {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		min-inline-size: 0;
	}

	.desc {
		color: var(--ink-secondary);
		max-inline-size: var(--measure);
		overflow-wrap: anywhere;
	}

	.w-facts {
		margin: 0;
		padding: 0;
		list-style: none;
		font-variant-numeric: var(--numeric-figures);
		overflow-wrap: anywhere;
	}

	.source {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--ink);
		overflow-wrap: anywhere;
		word-break: break-all;
	}

	.bar {
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
	}

	.scale {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-4);
	}

	.scale label {
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.stepper .w-input {
		inline-size: 4.5rem;
		text-align: center;
		font-variant-numeric: var(--numeric-figures);
	}

	.plan {
		inline-size: 100%;
	}

	.cols,
	.right {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		min-inline-size: 0;
	}

	.lines,
	.steps {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.lines li {
		padding-block-end: var(--space-2);
		border-block-end: var(--stroke-hairline) solid var(--hairline);
		overflow-wrap: anywhere;
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}

	.steps li {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		gap: var(--space-3);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		overflow-wrap: anywhere;
	}

	.steps .n {
		font-family: var(--font-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
		color: var(--ink-secondary);
	}

	.notes {
		overflow-wrap: anywhere;
	}

	@media (min-width: 768px) {
		.info {
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		}

		.bar {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.plan {
			inline-size: auto;
		}

		.bar .w-error {
			grid-column: 1 / -1;
		}

		.cols {
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		}
	}
</style>
