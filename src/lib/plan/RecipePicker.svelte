<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { flip } from 'svelte/animate';
	import { COPY } from '#lib/copy.ts';
	import { flipOptions, rise } from '#lib/motion.ts';
	import { SLOTS, type IsoDate, type Slot } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import { matches, type PlanRecipe } from './RecipeRail.svelte';
	import Sheet from './Sheet.svelte';

	let {
		target,
		recipes,
		onclose
	}: { target: { date: IsoDate; slot: Slot } | null; recipes: PlanRecipe[]; onclose: () => void } = $props();

	// the sheet keeps its title while it animates out, after the parent has cleared the target
	let current = $state<{ date: IsoDate; slot: Slot } | null>(null);
	let mode = $state<'recipe' | 'text'>('recipe');
	let query = $state('');
	let selected = $state<PlanRecipe | null>(null);
	let servings = $state(2);
	let text = $state('');
	let error = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (!target) return;
		current = target;
		mode = 'recipe';
		query = '';
		selected = null;
		text = '';
		error = '';
		submitting = false;
	});

	const dayName = $derived(
		current ? new Date(`${current.date}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }) : ''
	);
	const slotLabel = $derived(SLOTS.find((s) => s.id === current?.slot)?.label ?? '');
	const shown = $derived(recipes.filter((r) => matches(r, query)));

	const pick = (r: PlanRecipe) => {
		selected = r;
		servings = r.servings;
		error = '';
	};

	const setMode = (next: 'recipe' | 'text') => {
		mode = next;
		error = '';
	};

	// a phone's keyboard would cover the sheet, so only a fine pointer gets the focus
	function focus(node: HTMLInputElement) {
		if (!matchMedia('(pointer: fine)').matches) return;
		const frame = requestAnimationFrame(() => node.focus({ preventScroll: true }));
		return { destroy: () => cancelAnimationFrame(frame) };
	}

	const submit: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'failure') {
				error = Object.values((result.data as { errors?: Record<string, string> } | undefined)?.errors ?? {})[0] ?? '';
				return;
			}
			await update({ reset: false });
			if (result.type === 'success') onclose();
		};
	};
</script>

<Sheet open={target !== null} kicker="Add to plan" title="{dayName} · {slotLabel}" label="Add to {dayName} {slotLabel}" {onclose}>
	<form method="POST" action="?/add" use:enhance={submit}>
		<input type="hidden" name="date" value={current?.date ?? ''} />
		<input type="hidden" name="slot" value={current?.slot ?? ''} />
		<input type="hidden" name="kind" value={mode} />
		{#if selected && mode === 'recipe'}<input type="hidden" name="recipeId" value={selected.id} />{/if}

		<div class="modes">
			<Chip label="Recipe" active={mode === 'recipe'} onclick={() => setMode('recipe')} />
			<Chip label="Free text" active={mode === 'text'} onclick={() => setMode('text')} />
		</div>

		{#if mode === 'recipe'}
			<label class="field">
				<Icon name="search" size={16} />
				<span class="visually-hidden">Search recipes</span>
				<input type="search" placeholder="Search recipes" bind:value={query} use:focus />
			</label>
			<div class="results">
				{#if shown.length > 0}
					<ul>
						{#each shown as r (r.id)}
							<li animate:flip={flipOptions()}>
								<button type="button" class="row" class:picked={selected?.id === r.id} aria-pressed={selected?.id === r.id} onclick={() => pick(r)}>
									<span class="thumb" aria-hidden="true">
										{#if r.imageId !== null}<img src="/images/{r.imageId}" alt="" loading="lazy" />{:else}<ImagePlaceholder size="thumb" />{/if}
									</span>
									<span class="text">
										<span class="name">{r.title}</span>
										<span class="meta tnum">{r.servings} servings{r.totalMinutes ? ` · ${r.totalMinutes} min` : ''}</span>
									</span>
									{#if selected?.id === r.id}<Icon name="check" size={18} />{/if}
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="empty">{recipes.length === 0 ? 'No recipes yet' : COPY.noMatch}</p>
				{/if}
			</div>
		{:else}
			<label class="field text-field">
				<span class="label">Text</span>
				<input type="text" name="text" placeholder="Pizza night, leftovers, eating out" autocomplete="off" bind:value={text} use:focus />
			</label>
		{/if}

		{#if error}<p class="error" role="alert" in:rise={{ y: 6 }}>{error}</p>{/if}

		{#if mode === 'text' || selected}
			<div class="foot" in:rise={{ y: 10 }}>
				{#if mode === 'recipe'}
					<label class="servings">
						<span>Servings</span>
						<input type="number" name="servings" inputmode="numeric" bind:value={servings} />
					</label>
				{/if}
				<Button type="submit" disabled={submitting}>Add to plan</Button>
			</div>
		{/if}
	</form>
</Sheet>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		flex: 1;
		min-block-size: 0;
	}

	.modes {
		display: flex;
		gap: var(--s-2);
	}

	.field {
		display: flex;
		align-items: center;
		gap: 8px;
		min-block-size: 48px;
		padding: 0 16px;
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: var(--white);
		color: var(--ink-2);
	}

	.field:focus-within {
		box-shadow: var(--focus-ring);
	}

	.field input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: none;
		font-size: 16px;
		color: var(--ink);
	}

	.field input:focus {
		outline: none;
		box-shadow: none;
	}

	.text-field .label {
		font-size: 13px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.results {
		flex: 1;
		min-block-size: 120px;
		overflow-y: auto;
		overscroll-behavior: contain;
		margin-inline: -8px;
		padding-inline: 8px;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		inline-size: 100%;
		min-block-size: 56px;
		padding: 6px 12px 6px 6px;
		border: 0;
		border-radius: var(--r-sm);
		background: transparent;
		text-align: start;
		transition:
			background-color var(--d-fast) var(--ease-out),
			transform var(--d-fast) var(--ease-out);
	}

	.row:hover {
		background: var(--ink-wash);
	}

	.row:active {
		transform: scale(0.99);
	}

	.row.picked {
		background: var(--olive-soft);
		color: var(--olive);
	}

	.thumb {
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--r-pill);
		overflow: hidden;
	}

	.thumb img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-inline-size: 0;
	}

	.name {
		font-size: 15px;
		font-weight: 600;
		line-height: 1.25;
		color: var(--ink);
	}

	.meta {
		font-size: 13px;
		color: var(--ink-2);
	}

	.empty {
		padding: var(--s-5) var(--s-2);
		color: var(--ink-2);
	}

	.error {
		color: var(--brick);
		font-size: 14px;
		font-weight: 500;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
		padding-block-start: var(--s-3);
		border-block-start: 1px solid var(--line);
	}

	.servings {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		font-size: 14px;
		font-weight: 500;
	}

	.servings input {
		inline-size: 72px;
		min-block-size: 44px;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: var(--r-pill);
		background: var(--white);
		font-size: 16px;
		text-align: center;
	}
</style>
