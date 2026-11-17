<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import Button from '../shell/Button.svelte';
	import Field from '../form/Field.svelte';
	import Notice from '../form/Notice.svelte';
	import RecipeForm from '../form/RecipeForm.svelte';
	import { go } from '../recipes/util.ts';

	type State = 'initial' | 'reading' | 'recipe' | 'fallback' | 'invalid' | 'duplicate' | 'draft';
	type Props = { state?: State; link?: string; recipe?: MockRecipeFull | null; compact?: boolean; worst?: boolean; save?: 'bar' | 'inline' };
	let { state = 'initial', link = '', recipe = null, compact = false, worst = false, save = 'bar' }: Props = $props();

	const uid = $props.id();
	const value = $derived(state === 'invalid' ? 'recipe pie' : state === 'initial' ? link : link || 'https://www.bonappetit.com/recipe/roasted-pumpkin-soup');
	const host = $derived.by(() => {
		try {
			return new URL(value).host;
		} catch {
			return 'bonappetit.com';
		}
	});
	const previewed = $derived(state === 'recipe' || state === 'fallback');
	const fallback = $derived(recipe ? { ...recipe, ingredients: [], steps: [], description: null, notes: null, tags: [], prepMinutes: null, cookMinutes: null } : null);
</script>

{#if state !== 'draft'}
	<section class="card import" data-surface="solid" aria-label="Import by link">
		<form class="row" onsubmit={(e) => e.preventDefault()}>
			<Field
				label="Paste a link to a recipe page"
				type="url"
				inputmode="url"
				autocapitalize="off"
				autocorrect="off"
				placeholder="https://"
				{value}
				readonly={state === 'reading'}
				error={state === 'invalid' ? 'Enter a valid web address (http or https)' : undefined}
			/>
			{#if previewed}
				<Button type="submit">Read again</Button>
			{:else}
				<Button variant="primary" arrow type="submit" loading={state === 'reading'} loadingLabel="">{state === 'reading' ? 'Reading…' : 'Import'}</Button>
			{/if}
		</form>
		<p class="hint">Or <a href={go.form(worst)}>Start from scratch</a>.</p>
	</section>
{/if}

{#if state === 'reading'}
	<Notice tone="info" title="Reading the page…" />
{/if}

{#if state === 'duplicate'}
	<Notice tone="info" icon="alert" title="Already in your archive">
		<a href={go.recipe(worst)}>Lemon ricotta pancakes</a> has this link.
		{#snippet actions()}<Button size="s">Import anyway</Button>{/snippet}
	</Notice>
{/if}

{#if state === 'draft'}
	<Notice title="Restored your unsaved draft">
		{#snippet actions()}<Button size="s">Discard draft</Button>{/snippet}
	</Notice>
{/if}

{#if state === 'recipe'}
	<Notice title="Read from {host}">Everything stays editable. New tags are created when you save.</Notice>
{/if}

{#if state === 'fallback'}
	<Notice tone="alert" title="Couldn't read a recipe from this page">We kept the link, the title and the image link. Add ingredients and steps below.</Notice>
{/if}

{#if state === 'recipe' || state === 'fallback' || state === 'draft'}
	<section class="preview" aria-label="Recipe preview">
		<h2>{state === 'fallback' ? 'Fill in the rest' : 'Check and save'}</h2>
		<RecipeForm recipe={state === 'fallback' ? fallback : recipe} photo={state === 'fallback' ? 'link' : 'image'} limit={compact ? 2 : null} {save} newTags={state === 'recipe' && recipe ? recipe.tags.slice(-1) : []} {worst} />
	</section>
{/if}

<style>
	.import {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.row {
		display: grid;
		gap: var(--space-3);
		align-items: start;
		min-inline-size: 0;
	}
	.hint {
		font-size: var(--type-body-s-size);
		color: var(--ink-secondary);
	}
	.hint a {
		color: var(--ink);
		font-weight: var(--weight-semibold);
	}
	.preview {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.preview h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	@media (min-width: 768px) {
		.row {
			grid-template-columns: minmax(0, 1fr) auto;
		}
		.row > :global(.btn) {
			margin-block-start: calc(var(--type-label-size) * var(--type-label-line) + var(--space-1-5));
		}
	}
</style>
