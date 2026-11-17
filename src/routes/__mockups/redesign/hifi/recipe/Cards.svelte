<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import { scaleLine, splitLine } from './data.ts';
	import Facts from './Facts.svelte';

	type Hide = Partial<Record<'times' | 'source' | 'notes' | 'ingredients' | 'steps' | 'tags', boolean>>;
	type Props = { recipe: MockRecipeFull; scaled?: number; hide?: Hide };
	let { recipe, scaled = 1, hide = {} }: Props = $props();

	const uid = $props.id();
	const own = $derived(scaled === recipe.servings);
	const starts = $derived(recipe.steps.map((_, i) => recipe.steps.slice(0, i).reduce((sum, section) => sum + section.lines.length, 0)));
	const noIngredients = $derived(hide.ingredients || recipe.ingredients.length === 0);
	const noSteps = $derived(hide.steps || recipe.steps.length === 0);
</script>

<div class="cols">
	<div class="col" data-settle>
		<section class="card ingredients" data-surface="solid" aria-labelledby="{uid}-ing">
			<div class="card-head">
				<h2 id="{uid}-ing">Ingredients</h2>
				<span class="card-note">for {scaled}</span>
			</div>
			{#if noIngredients}
				<p class="hint">No ingredients yet.</p>
			{:else}
				{#each recipe.ingredients as section, i (i)}
					{#if section.title}<h3 class="ruled">{section.title}</h3>{/if}
					<ul class="lines">
						{#each section.lines as line, n (n)}
							{@const { amount, rest } = splitLine(scaleLine(line, recipe.servings, scaled))}
							<li data-scaled={!own && amount !== '' ? '' : undefined}>
								<span class="amt">{amount}</span>
								<span class="what">{rest}</span>
							</li>
						{/each}
					</ul>
				{/each}
			{/if}
		</section>
		<Facts {recipe} {hide} />
	</div>

	<div class="col" data-settle>
		<section class="card" data-surface="solid" aria-labelledby="{uid}-met">
			<div class="card-head"><h2 id="{uid}-met">Method</h2></div>
			{#if noSteps}
				<p class="hint">No steps yet.</p>
			{:else}
				{#each recipe.steps as section, i (i)}
					{#if section.title}<h3 class="ruled">{section.title}</h3>{/if}
					<ol class="steps">
						{#each section.lines as line, n (n)}
							<li><span class="n" aria-hidden="true">{starts[i] + n + 1}</span><span class="step-text">{line}</span></li>
						{/each}
					</ol>
				{/each}
			{/if}
		</section>
		{#if recipe.notes && !hide.notes}
			<section class="card" data-surface="solid" aria-labelledby="{uid}-notes">
				<div class="card-head"><h2 id="{uid}-notes">Notes</h2></div>
				<p class="notes">{recipe.notes}</p>
			</section>
		{/if}
	</div>
</div>

<style>
	.cols,
	.col {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		align-content: start;
		min-inline-size: 0;
	}
	.card {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.ingredients {
		gap: var(--space-3);
	}
	.hint {
		color: var(--ink-secondary);
	}
	.lines,
	.steps {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.lines {
		grid-template-columns: fit-content(45%) minmax(0, 1fr);
		column-gap: var(--space-3);
	}
	.lines li {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
		padding-block: var(--space-2);
		box-shadow: var(--rule-below);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}
	.amt {
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
		overflow-wrap: anywhere;
	}
	.lines li[data-scaled] .amt {
		color: var(--accent-text);
	}
	.lines li:has(.amt:empty) .what {
		grid-column: 1 / -1;
	}
	.lines li:has(.amt:empty) .amt {
		display: none;
	}
	.what {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.steps {
		gap: var(--space-4);
	}
	.steps li {
		display: grid;
		grid-template-columns: var(--space-8) minmax(0, 1fr);
		gap: var(--space-3);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}
	.steps .n {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
	.step-text,
	.notes {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.notes {
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}
	@media (min-width: 768px) {
		.cols {
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
			gap: var(--space-4);
		}
	}
	@media (max-width: 767px) {
		.cols {
			grid-auto-flow: row;
		}
		.col {
			display: contents;
		}
		.col:first-child > :global(.facts) {
			order: 3;
		}
		.col:last-child > :global(*) {
			order: 2;
		}
	}
</style>
