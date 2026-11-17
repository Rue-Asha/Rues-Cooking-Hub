<!-- The Add dialog, bound to one slot: a recipe (search, pick, servings) or free text. No day or meal choice inside. -->
<script lang="ts">
	import Button from '../shell/Button.svelte';
	import type { MockRecipe } from '../../fixtures.ts';
	import Choice from './Choice.svelte';
	import Field from './Field.svelte';
	import Overlay from './Overlay.svelte';

	type State = 'search' | 'picked' | 'free' | 'error' | 'empty' | 'other-week';
	type Props = { live?: boolean; open?: boolean; where: string; recipes: MockRecipe[]; variant?: State; freeText?: string; worst?: boolean; onadd?: () => void };
	let { live = false, open = $bindable(false), where, recipes, variant = 'search', freeText = 'Pizza night', worst = false, onadd }: Props = $props();

	const [weekday, meal] = $derived(where.split(' · '));
	const seed = () => ({
		mode: variant === 'free' || variant === 'error' ? 'Free text' : 'Recipe',
		query: variant === 'other-week' && worst ? 'ꙮꙮ tomato and white bean stew with charred spring onions and preserved' : '',
		picked: variant === 'picked' ? (recipes[0]?.id ?? null) : null,
		servings: String(recipes[0]?.servings ?? 2),
		text: variant === 'free' ? freeText : '',
		touched: variant === 'error'
	});
	let mode = $state(seed().mode);
	let query = $state(seed().query);
	let picked = $state<number | null>(seed().picked);
	let servings = $state(seed().servings);
	let text = $state(seed().text);
	let touched = $state(seed().touched);
	$effect(() => {
		if (open) {
			mode = variant === 'free' || variant === 'error' ? 'Free text' : 'Recipe';
			picked = null;
			text = '';
			touched = false;
		}
	});

	const pool = $derived(variant === 'empty' ? [] : recipes);
	const shown = $derived(pool.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5));
	const minutes = (r: MockRecipe) => (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0);
	const meta = (r: MockRecipe) => `${r.servings.toLocaleString('en-GB')} ${r.servings === 1 ? 'serving' : 'servings'}${minutes(r) ? ` · ${minutes(r)} min` : ''}`;
	const pick = $derived(pool.find((r) => r.id === picked));
	const ready = $derived(mode === 'Recipe' ? !!pick && Number.parseInt(servings, 10) >= 1 : text.trim().length > 0);
	const error = $derived(touched && mode === 'Free text' && !text.trim() ? 'Enter a recipe or some text' : undefined);
	const servingsError = $derived(touched && pick && !(Number.parseInt(servings, 10) >= 1) ? 'Servings must be at least 1' : undefined);
	const add = () => {
		touched = true;
		if (ready) {
			open = false;
			onadd?.();
		}
	};
</script>

{#snippet content()}
	<Choice legend="Add" options={[{ label: 'Recipe' }, { label: 'Free text' }]} bind:value={mode} columns={2} />
	{#if mode === 'Recipe'}
		{#if !pick}
			<Field label="Search recipes" type="search" icon="search" placeholder="Search recipes" bind:value={query} />
			{#if pool.length === 0}
				<p class="none">No recipes yet</p>
			{:else if shown.length === 0}
				<p class="none" role="status">No recipes match</p>
			{:else}
				<ul class="results" aria-label="Recipes">
					{#each shown as r (r.id)}
						<li><button type="button" class="res" onclick={() => (picked = r.id)}><span class="rt">{r.title}</span><span class="rm">{meta(r)}</span></button></li>
					{/each}
				</ul>
			{/if}
		{:else}
			<ul class="results" aria-label="Recipes">
				<li><button type="button" class="res" aria-pressed="true" onclick={() => (picked = null)}><span class="rt">{pick.title}</span><span class="rm">{meta(pick)}</span></button></li>
			</ul>
			<Field label="Servings" bind:value={servings} inputmode="numeric" error={servingsError} />
		{/if}
	{:else}
		<Field label="Text" placeholder="Pizza night, leftovers, eating out" bind:value={text} {error} />
	{/if}
{/snippet}
{#snippet buttons()}
	<Button variant="quiet" onclick={() => (open = false)}>Cancel</Button>
	<Button variant="primary" disabled={!ready && !(mode === 'Free text')} onclick={add}>Add to plan</Button>
{/snippet}

<Overlay {live} bind:open title={where} kicker="Add to plan" label="Add to {weekday} {meal}" children={content} actions={buttons} />

<style>
	.results {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
		max-block-size: 15rem;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.res {
		display: grid;
		gap: var(--space-0-5);
		inline-size: 100%;
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1-5) var(--space-4);
		border: 0;
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
		color: var(--ink);
		text-align: start;
	}
	.res[aria-pressed='true'] {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}
	.rt {
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
	}
	.rm {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
	@media (hover: hover) {
		.res:not([aria-pressed='true']):hover {
			background: var(--surface-control-solid-hover);
		}
	}
	.none {
		padding: var(--space-5) var(--space-2);
		text-align: center;
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}
</style>
