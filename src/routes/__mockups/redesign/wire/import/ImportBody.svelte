<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import RecipeForm from '../form/RecipeForm.svelte';
	import Icon from '../recipes/Icon.svelte';
	import { wire } from '../recipes/util.ts';

	type State = 'initial' | 'reading' | 'recipe' | 'fallback' | 'invalid' | 'duplicate' | 'draft';
	type Props = { state?: State; link?: string; recipe?: MockRecipeFull | null; compact?: boolean; worst?: boolean };
	let { state = 'initial', link = '', recipe = null, compact = false, worst = false }: Props = $props();

	const uid = $props.id();
	const value = $derived(state === 'invalid' ? 'recipe pie' : state === 'initial' ? link : link || 'https://www.bonappetit.com/recipe/roasted-pumpkin-soup');
	const host = $derived.by(() => {
		try {
			return new URL(value).host;
		} catch {
			return 'bonappetit.com';
		}
	});
	const fallback = $derived(recipe ? { ...recipe, ingredients: [], steps: [], description: null, notes: null, tags: [], prepMinutes: null, cookMinutes: null } : null);
	const parts = $derived(compact ? (['basics', 'ing', 'actions'] as ('basics' | 'ing' | 'actions')[]) : null);
</script>

{#if state !== 'draft'}
	<section class="w-card" aria-label="Import by link">
		<div class="w-field">
			<label for="{uid}-url">Paste a link to a recipe page</label>
			<div class="row">
				<input id="{uid}-url" class="w-input" type="url" inputmode="url" autocapitalize="off" autocorrect="off" placeholder="https://" value={value} readonly={state === 'reading'} aria-invalid={state === 'invalid'} aria-describedby={state === 'invalid' ? `${uid}-err` : undefined} />
				<button type="button" class="w-btn primary" disabled={state === 'reading'} aria-disabled={state === 'reading'}>{state === 'reading' ? 'Reading…' : 'Import'}</button>
			</div>
			{#if state === 'invalid'}<p class="w-error" id="{uid}-err" role="alert"><Icon name="alert" size={14} />Enter a valid web address (http or https)</p>{/if}
		</div>
		<p class="w-hint">Or <a href={wire('form', worst)}>Start from scratch</a>.</p>
	</section>
{/if}

{#if state === 'reading'}
	<div class="w-status" role="status"><Icon name="search" /><div><strong>Reading the page…</strong></div></div>
{/if}

{#if state === 'duplicate'}
	<div class="w-status" role="status">
		<Icon name="alert" />
		<div>
			<strong>Already in your archive</strong>
			<span><a href={wire('recipe', worst)}>Lemon ricotta pancakes</a> has this link.</span>
			<div class="w-status-actions"><button type="button" class="w-btn s">Import anyway</button></div>
		</div>
	</div>
{/if}

{#if state === 'draft'}
	<div class="w-status" role="status">
		<Icon name="check" />
		<div>
			<strong>Restored your unsaved draft</strong>
			<div class="w-status-actions"><button type="button" class="w-btn s">Discard draft</button></div>
		</div>
	</div>
{/if}

{#if state === 'recipe'}
	<div class="w-status" role="status">
		<Icon name="check" />
		<div><strong>Read from {host}</strong><span>Everything stays editable. New tags are created when you save.</span></div>
	</div>
{/if}

{#if state === 'fallback'}
	<div class="w-status alert" role="alert">
		<Icon name="alert" />
		<div><strong>Couldn't read a recipe from this page</strong><span>We kept the link, the title and the image link. Add ingredients and steps below.</span></div>
	</div>
{/if}

{#if state === 'recipe' || state === 'fallback' || state === 'draft'}
	<section class="preview" aria-label="Recipe preview">
		<h2 class="preview-h">{state === 'fallback' ? 'Fill in the rest' : 'Check and save'}</h2>
		<RecipeForm recipe={state === 'fallback' ? fallback : recipe} photo={state === 'fallback' ? 'link' : 'image'} {parts} limit={compact ? 2 : null} cancelTo="recipes" {worst} newTags={state === 'recipe' && recipe ? recipe.tags.slice(-1) : []} />
	</section>
{/if}

<style>
	.row {
		display: grid;
		gap: var(--space-2);
	}

	.row .w-input {
		min-inline-size: 0;
		text-overflow: ellipsis;
	}

	.w-hint a {
		color: var(--ink);
	}

	.preview {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	.preview-h {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
	}

	@media (min-width: 768px) {
		.row {
			grid-template-columns: minmax(0, 1fr) auto;
		}
	}
</style>
