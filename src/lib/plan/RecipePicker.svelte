<script lang="ts">
	import { page } from '$app/state';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { flip } from 'svelte/animate';
	import { COPY } from '#lib/copy.ts';
	import { flipOptions, rise } from '#lib/motion.ts';
	import { SLOTS, type IsoDate, type Slot } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { initialOf, plateOf } from '#lib/recipes/Picture.svelte';
	import { matches, type PlanRecipe } from './RecipeRail.svelte';
	import Sheet from './Sheet.svelte';

	let {
		target,
		recipes,
		onclose
	}: { target: { date: IsoDate; slot: Slot } | null; recipes: PlanRecipe[]; onclose: () => void } = $props();

	// the sheet keeps its title while it animates out, after the parent has cleared the target
	// a form posts to the page's own URL minus its query; the week stays in view only when it is named again
	const keep = $derived(page.url.searchParams.has('week') ? `&week=${page.url.searchParams.get('week')}` : '');

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
	<form method="POST" action="?/add{keep}" use:enhance={submit}>
		<input type="hidden" name="date" value={current?.date ?? ''} />
		<input type="hidden" name="slot" value={current?.slot ?? ''} />
		<input type="hidden" name="kind" value={mode} />
		{#if selected && mode === 'recipe'}<input type="hidden" name="recipeId" value={selected.id} />{/if}

		<div class="modes">
			<button type="button" class="mode" aria-pressed={mode === 'recipe'} onclick={() => setMode('recipe')}>Recipe</button>
			<button type="button" class="mode" aria-pressed={mode === 'text'} onclick={() => setMode('text')}>Free text</button>
		</div>

		{#if mode === 'recipe'}
			<label class="field">
				<Icon name="search" size={16} />
				<span class="sr-only">Search recipes</span>
				<input type="search" placeholder="Search recipes" bind:value={query} use:focus />
			</label>
			<div class="results">
				{#if shown.length > 0}
					<ul>
						{#each shown as r (r.id)}
							<li animate:flip={flipOptions()}>
								<button type="button" class="row" class:picked={selected?.id === r.id} aria-pressed={selected?.id === r.id} onclick={() => pick(r)}>
									{#if r.imageId !== null}
										<span class="pic" aria-hidden="true"><img src="/images/{r.imageId}" alt="" loading="lazy" /></span>
									{:else}
										<span class="pic thumb plate" data-plate={plateOf(r.title)} aria-hidden="true">{initialOf(r.title)}</span>
									{/if}
									<span class="text">
										<span class="name">{r.title}</span>
										<span class="meta figures">{r.servings} servings{r.totalMinutes ? ` · ${r.totalMinutes} min` : ''}</span>
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
				<Button type="submit" variant="primary" disabled={submitting}>Add to plan</Button>
			</div>
		{/if}
	</form>
</Sheet>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		flex: 1;
		min-block-size: 0;
	}

	.modes {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.mode {
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-4);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-control-solid);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		transition:
			background-color var(--motion-quick) var(--ease-out),
			transform var(--motion-quick) var(--ease-out);
	}

	.mode:active {
		transform: scale(0.97);
	}

	.mode[aria-pressed='true'] {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}

	.field {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-4);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-secondary);
	}

	.field:has(input:focus-visible) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	.field input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: none;
		font-size: var(--type-body-s-size);
		color: var(--ink);
	}

	.field input:focus-visible {
		outline: none;
	}

	.text-field {
		flex-wrap: wrap;
	}

	.text-field .label {
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
		color: var(--ink);
	}

	.results {
		flex: 1;
		min-block-size: 120px;
		overflow-y: auto;
		overscroll-behavior: contain;
		margin-inline: calc(-1 * var(--space-2));
		padding-inline: var(--space-2);
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		inline-size: 100%;
		min-block-size: var(--space-14);
		padding: var(--space-1-5) var(--space-3) var(--space-1-5) var(--space-1-5);
		border: 0;
		border-radius: var(--radius-item);
		background: transparent;
		color: var(--ink);
		text-align: start;
		transition:
			background-color var(--motion-quick) var(--ease-out),
			transform var(--motion-quick) var(--ease-out);
	}

	@media (hover: hover) {
		.row:hover {
			background: var(--surface-sunken);
		}
	}

	.row:active {
		transform: scale(0.99);
	}

	.row.picked {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}

	.pic {
		flex: none;
		inline-size: var(--space-10);
		block-size: var(--space-10);
		border-radius: var(--radius-round);
		overflow: hidden;
	}

	.pic.plate {
		--thumb: var(--space-10);
		box-shadow: var(--ring-hairline);
	}

	.plate[data-plate='1'] {
		background: var(--surface-plate-1);
	}

	.plate[data-plate='2'] {
		background: var(--surface-plate-2);
	}

	.pic img {
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
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--type-label-weight);
		color: var(--ink);
	}

	.meta {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	.empty {
		padding: var(--space-5) var(--space-2);
		color: var(--ink-secondary);
	}

	.error {
		color: var(--danger);
		font-size: var(--type-body-s-size);
		font-weight: var(--type-label-weight);
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding-block-start: var(--space-3);
		box-shadow: var(--sheet-footer-rule);
	}

	.servings {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}

	.servings input {
		inline-size: var(--space-16);
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-3);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		font-size: var(--type-body-s-size);
		text-align: center;
	}
</style>
