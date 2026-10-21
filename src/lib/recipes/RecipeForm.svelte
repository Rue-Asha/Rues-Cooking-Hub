<script lang="ts" module>
	import type { Id, Section, Tag } from '#lib/types.ts';

	// What the form starts from: a fresh recipe, an import (RecipeDraft fits) or a stored recipe.
	export interface FormDraft {
		title: string;
		description: string | null;
		sourceUrl: string | null;
		servings: number;
		prepMinutes: number | null;
		cookMinutes: number | null;
		notes?: string | null;
		tagNames: string[];
		imageId?: Id | null;
		imageUrl?: string | null;
		ingredients: Section<string>[];
		steps: Section<string>[];
	}
</script>

<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { tick } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import { rise } from '#lib/motion.ts';
	import ImageField from './ImageField.svelte';
	import DiscardDialog from './DiscardDialog.svelte';
	import SectionsEditor, { plain, toEditor } from './SectionsEditor.svelte';
	import TagInput from './TagInput.svelte';
	import { unsavedGuard } from './unsaved.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let {
		draft,
		tags,
		errors = {},
		action = '',
		heading = 'Recipe',
		notice = null,
		cancelHref = '/recipes'
	}: {
		draft: FormDraft;
		errors?: Record<string, string>;
		tags: Tag[];
		action?: string;
		heading?: string;
		notice?: string | null;
		cancelHref?: string;
	} = $props();

	// the form seeds its fields once; a draft never changes under a mounted form
	/* svelte-ignore state_referenced_locally */
	let title = $state(draft.title);
	/* svelte-ignore state_referenced_locally */
	let description = $state(draft.description ?? '');
	/* svelte-ignore state_referenced_locally */
	let sourceUrl = $state(draft.sourceUrl ?? '');
	/* svelte-ignore state_referenced_locally */
	let servings = $state(String(draft.servings));
	/* svelte-ignore state_referenced_locally */
	let prepMinutes = $state(draft.prepMinutes === null ? '' : String(draft.prepMinutes));
	/* svelte-ignore state_referenced_locally */
	let cookMinutes = $state(draft.cookMinutes === null ? '' : String(draft.cookMinutes));
	/* svelte-ignore state_referenced_locally */
	let notes = $state(draft.notes ?? '');
	/* svelte-ignore state_referenced_locally */
	let imageUrl = $state(draft.imageUrl ?? '');
	let imageRemoved = $state(false);
	let imagePicked = $state('');
	/* svelte-ignore state_referenced_locally */
	let tagNames = $state([...draft.tagNames]);
	let tagText = $state('');
	/* svelte-ignore state_referenced_locally */
	let ingredients = $state(toEditor(draft.ingredients, 3));
	/* svelte-ignore state_referenced_locally */
	let steps = $state(toEditor(draft.steps, 1));

	const snapshot = () =>
		JSON.stringify([
			title,
			description,
			sourceUrl,
			servings,
			prepMinutes,
			cookMinutes,
			notes,
			plain(ingredients),
			plain(steps),
			tagNames,
			tagText,
			imageUrl,
			imageRemoved,
			imagePicked
		]);
	const initial = snapshot();
	const guard = unsavedGuard(() => snapshot() !== initial);
	const leaving = guard.pending;

	let formEl: HTMLFormElement;
	let saving = $state(false);

	// a message goes away as soon as its field is edited, and comes back with the next server answer
	let dismissed = $state<string[]>([]);
	const shown = $derived(Object.fromEntries(Object.entries(errors).filter(([key]) => !dismissed.includes(key))));
	const dismiss = (key: string) => {
		if (!dismissed.includes(key)) dismissed.push(key);
	};

	$effect(() => {
		dismissed = [];
		if (Object.keys(errors).length === 0) return;
		tick().then(() => formEl.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
	});

	const submit: SubmitFunction = () => {
		saving = true;
		return async ({ result, update }) => {
			if (result.type === 'redirect') guard.allow();
			await update({ reset: false });
			saving = false;
		};
	};
</script>

{#snippet saveButtons()}
	<Button variant="secondary" arrow={false} href={cancelHref}>Cancel</Button>
	<Button variant="olive" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save recipe'}</Button>
{/snippet}

<form class="recipe-form" method="POST" {action} enctype="multipart/form-data" novalidate use:enhance={submit} bind:this={formEl}>
	{#if notice}
		<div class="banner fail" role="status" in:rise>
			<Icon name="alert" size={20} />
			<p>{notice}</p>
		</div>
	{/if}

	<div class="head enter" style="--i: 0">
		<h2 data-section-heading>{heading}</h2>
		<div class="save top">{@render saveButtons()}</div>
	</div>

	<div class="form">
		<div class="meta enter" style="--i: 1">
			<h3 class="col-title">Details</h3>

			<ImageField
				imageId={draft.imageId ?? null}
				bind:url={imageUrl}
				bind:removed={imageRemoved}
				bind:picked={imagePicked}
				error={shown.image}
				onchange={() => dismiss('image')}
			/>

			<div class="field">
				<label for="f-title">Title</label>
				<input
					id="f-title"
					name="title"
					bind:value={title}
					oninput={() => dismiss('title')}
					aria-invalid={shown.title ? 'true' : undefined}
					aria-describedby={shown.title ? 'e-title' : undefined}
					autocomplete="off"
				/>
				{#if shown.title}<p class="error" id="e-title" role="alert" transition:rise={{ y: 6 }}>{shown.title}</p>{/if}
			</div>

			<div class="field">
				<label for="f-description">Description <i>optional</i></label>
				<textarea id="f-description" name="description" rows="3" bind:value={description}></textarea>
			</div>

			<div class="trio">
				<div class="field">
					<label for="f-servings">Servings</label>
					<input
						id="f-servings"
						class="tnum"
						name="servings"
						inputmode="numeric"
						bind:value={servings}
						oninput={() => dismiss('servings')}
						aria-invalid={shown.servings ? 'true' : undefined}
						aria-describedby={shown.servings ? 'e-servings' : undefined}
					/>
				</div>
				<div class="field">
					<label for="f-prep">Prep, min</label>
					<input
						id="f-prep"
						class="tnum"
						name="prepMinutes"
						inputmode="numeric"
						bind:value={prepMinutes}
						oninput={() => dismiss('prepMinutes')}
						aria-invalid={shown.prepMinutes ? 'true' : undefined}
						aria-describedby={shown.prepMinutes ? 'e-prep' : undefined}
					/>
				</div>
				<div class="field">
					<label for="f-cook">Cook, min</label>
					<input
						id="f-cook"
						class="tnum"
						name="cookMinutes"
						inputmode="numeric"
						bind:value={cookMinutes}
						oninput={() => dismiss('cookMinutes')}
						aria-invalid={shown.cookMinutes ? 'true' : undefined}
						aria-describedby={shown.cookMinutes ? 'e-cook' : undefined}
					/>
				</div>
			</div>
			{#if shown.servings}<p class="error" id="e-servings" role="alert" transition:rise={{ y: 6 }}>{shown.servings}</p>{/if}
			{#if shown.prepMinutes}<p class="error" id="e-prep" role="alert" transition:rise={{ y: 6 }}>{shown.prepMinutes}</p>{/if}
			{#if shown.cookMinutes}<p class="error" id="e-cook" role="alert" transition:rise={{ y: 6 }}>{shown.cookMinutes}</p>{/if}

			<TagInput {tags} bind:selected={tagNames} bind:pending={tagText} />

			<div class="field">
				<label for="f-source">Source <i>optional</i></label>
				<input id="f-source" name="sourceUrl" type="url" bind:value={sourceUrl} autocomplete="off" />
			</div>
		</div>

		<div class="lines enter" style="--i: 2">
			<h3 class="col-title">Ingredients</h3>
			<SectionsEditor kind="ingredients" bind:sections={ingredients} />

			<h3 class="col-title steps-title">Method</h3>
			<SectionsEditor kind="steps" bind:sections={steps} />

			<h3 class="col-title steps-title">Notes</h3>
			<div class="field">
				<label class="visually-hidden" for="f-notes">Notes</label>
				<textarea
					id="f-notes"
					name="notes"
					rows="3"
					bind:value={notes}
					placeholder="Tips, variations, storage. Markdown works."
				></textarea>
			</div>
		</div>
	</div>

	<div class="save bottom">{@render saveButtons()}</div>

	{#if $leaving}<DiscardDialog onkeep={guard.keep} ondiscard={guard.discard} />{/if}
</form>

<style>
	.recipe-form {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	.enter {
		animation: enter var(--d-slow) var(--ease-out) both;
		animation-delay: calc(var(--i, 0) * 60ms);
	}

	@keyframes enter {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.enter {
			animation: none;
		}
	}

	.banner {
		display: flex;
		align-items: flex-start;
		gap: var(--s-3);
		padding: var(--s-4) var(--s-5);
		border-radius: var(--r-md);
		font-size: 14px;
		font-weight: 500;
	}

	.fail {
		background: var(--brick-soft);
	}

	.fail :global(.icon) {
		color: var(--brick);
		flex: none;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.save {
		display: flex;
		gap: var(--s-2);
	}

	.save.bottom {
		display: none;
	}

	.form {
		display: grid;
		grid-template-columns: 420px 1fr;
		gap: var(--s-6);
		align-items: start;
	}

	.form > * {
		min-inline-size: 0;
	}

	.meta,
	.lines {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-6);
		border-radius: var(--r-panel);
		background: var(--surface);
		box-shadow: var(--shadow-card);
	}

	.col-title {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 360;
	}

	.steps-title {
		margin-block-start: var(--s-4);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
	}

	.field > label {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.field i {
		font-weight: 400;
		font-style: normal;
		color: var(--ink-2);
	}

	input,
	textarea {
		inline-size: 100%;
		min-block-size: 46px;
		padding: 11px 14px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--white);
		font-size: 15px;
		line-height: 1.45;
		transition: border-color var(--d-fast) var(--ease-out);
	}

	textarea {
		resize: vertical;
		field-sizing: content;
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--ink-2);
	}

	input:focus-visible,
	textarea:focus-visible {
		border-color: var(--olive);
		box-shadow: 0 0 0 3px var(--olive-wash);
		border-radius: var(--r-sm);
	}

	input[aria-invalid='true'] {
		border-color: var(--brick);
		box-shadow: 0 0 0 3px var(--brick-wash);
	}

	.error {
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--brick);
	}

	.trio {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--s-3);
	}

	@media (max-width: 1023px) {
		.head .save {
			display: none;
		}

		.save.bottom {
			display: flex;
		}

		.save.bottom :global(.btn:last-child) {
			flex: 1;
		}

		.form {
			grid-template-columns: 1fr;
		}

		.meta,
		.lines {
			padding: var(--s-5) var(--s-4);
		}
	}
</style>
