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
	import { onMount, tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import Status from '#lib/ui/Status.svelte';
	import ImageField from './ImageField.svelte';
	import DiscardDialog from './DiscardDialog.svelte';
	import SectionsEditor, { plain, toEditor } from './SectionsEditor.svelte';
	import TagInput from './TagInput.svelte';
	import Area from './Area.svelte';
	import { clearDraft, isDraftWorthKeeping, loadDraft, saveDraft, type RecipeFormDraft } from './draft.ts';
	import { unsavedGuard } from './unsaved.ts';

	let {
		draft,
		tags,
		errors = {},
		action = '',
		heading = 'Recipe',
		notice = null,
		cancelHref = '/recipes',
		keep = false,
		imported = false,
		host = '',
		restore = false,
		untitled = '',
		ondiscarddraft
	}: {
		draft: FormDraft;
		errors?: Record<string, string>;
		tags: Tag[];
		action?: string;
		heading?: string;
		notice?: string | null;
		cancelHref?: string;
		// new and imported recipes keep a local draft; a stored recipe being edited has none
		keep?: boolean;
		imported?: boolean;
		host?: string;
		// open with the stored draft, if there is one
		restore?: boolean;
		// the plate's letter while the title is empty: "New recipe" on a blank new form; an edited or imported recipe stays neutral
		untitled?: string;
		ondiscarddraft?: () => void;
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
	let ingredients = $state(toEditor(draft.ingredients, 1));
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
	// the draft keeps neither a chosen photo file nor half-typed tag text, and none at all when storage is blocked
	let kept = true;
	const guard = unsavedGuard(() => snapshot() !== initial, { unload: () => !keep || !kept || imagePicked !== '' || tagText.trim() !== '' });
	const leaving = guard.pending;

	const uid = $props.id();

	const formDraft = (): RecipeFormDraft => ({
		title,
		description,
		servings,
		prepMinutes,
		cookMinutes,
		sourceUrl,
		notes,
		tagNames: [...tagNames],
		ingredients: plain(ingredients).map(([t, lines]) => ({ title: t || null, lines: [...lines] })),
		steps: plain(steps).map(([t, lines]) => ({ title: t || null, lines: [...lines] })),
		imageUrl
	});
	const start = formDraft();

	// the draft is written only after the stored one was read, or the blank form would erase it
	let ready = $state(false);
	let restored = $state(false);
	onMount(() => {
		const stored = restore ? loadDraft(localStorage) : null;
		if (stored) {
			const f = stored.form;
			title = f.title;
			description = f.description;
			servings = f.servings;
			prepMinutes = f.prepMinutes;
			cookMinutes = f.cookMinutes;
			sourceUrl = f.sourceUrl;
			notes = f.notes;
			tagNames = [...f.tagNames];
			ingredients = toEditor(f.ingredients, 1);
			steps = toEditor(f.steps, 1);
			imageUrl = f.imageUrl;
			restored = true;
		}
		ready = true;
	});
	$effect(() => {
		if (!keep || !ready) return;
		const now = formDraft();
		if (isDraftWorthKeeping(now, start)) kept = saveDraft(localStorage, { v: 1, imported, ...(host && { host }), form: now });
		else clearDraft(localStorage);
	});

	function discardDraft() {
		clearDraft(localStorage);
		ready = false;
		title = start.title;
		description = start.description;
		servings = start.servings;
		prepMinutes = start.prepMinutes;
		cookMinutes = start.cookMinutes;
		sourceUrl = start.sourceUrl;
		notes = start.notes;
		tagNames = [...start.tagNames];
		ingredients = toEditor(start.ingredients, 1);
		steps = toEditor(start.steps, 1);
		imageUrl = start.imageUrl;
		restored = false;
		ready = true;
		ondiscarddraft?.();
	}
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
			if (result.type === 'redirect') {
				ready = false;
				if (keep) clearDraft(localStorage);
				guard.allow();
			}
			await update({ reset: false });
			saving = false;
		};
	};

	// the dialog has to clear the Save bar, which is on <body> (see portal)
	function toBody(node: HTMLElement) {
		// moving a node drops the focus inside it, and the dialog takes focus before this runs
		const focused = node.contains(document.activeElement) ? (document.activeElement as HTMLElement) : null;
		document.body.appendChild(node);
		focused?.focus();
		return { destroy: () => node.remove() };
	}

	// The one Save sits in a bar fixed to the viewport; it moves to <body> because inside .frame a fixed box would follow
	// the frame's backdrop-filter, not the viewport. Focused fields scroll clear of it (base.css reads --sticky-block-end).
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		document.documentElement.style.setProperty('--sticky-block-end', 'var(--form-clearance)');
		return {
			destroy() {
				node.remove();
				document.documentElement.style.removeProperty('--sticky-block-end');
			}
		};
	}
</script>

{#if notice}
	<div class="notice"><Status kind="alert">{notice}</Status></div>
{/if}

{#if restored}
	<div class="notice">
		<Status>
			Restored your unsaved draft
			<span class="act"><Button size="xs" onclick={discardDraft}>Discard draft</Button></span>
		</Status>
	</div>
{/if}

<form
	id="{uid}-form"
	class="form"
	method="POST"
	{action}
	enctype="multipart/form-data"
	novalidate
	use:enhance={submit}
	bind:this={formEl}
>
	<div class="main-lead">
		<section class="card" data-surface="solid" aria-labelledby="{uid}-basics">
			<div class="card-head"><h2 id="{uid}-basics">{heading}</h2></div>
			<Field
				label="Title"
				name="title"
				bind:value={title}
				oninput={() => dismiss('title')}
				error={shown.title}
				autocomplete="off"
			/>
			<Area label="Description (optional)" name="description" rows={3} bind:value={description} />
			<div class="trio">
				<Field
					label="Servings"
					name="servings"
					inputmode="numeric"
					autocomplete="off"
					bind:value={servings}
					oninput={() => dismiss('servings')}
					error={shown.servings}
				/>
				<Field
					label="Prep, min"
					name="prepMinutes"
					inputmode="numeric"
					autocomplete="off"
					bind:value={prepMinutes}
					oninput={() => dismiss('prepMinutes')}
					error={shown.prepMinutes}
				/>
				<Field
					label="Cook, min"
					name="cookMinutes"
					inputmode="numeric"
					autocomplete="off"
					bind:value={cookMinutes}
					oninput={() => dismiss('cookMinutes')}
					error={shown.cookMinutes}
				/>
			</div>
			<Field label="Source (optional)" name="sourceUrl" type="url" inputmode="url" autocapitalize="off" autocomplete="off" bind:value={sourceUrl} />
		</section>
	</div>

	<aside class="side">
		<section class="card" data-surface="solid" aria-labelledby="{uid}-photo">
			<div class="card-head"><h2 id="{uid}-photo">Photo</h2></div>
			<ImageField
				imageId={draft.imageId ?? null}
				bind:url={imageUrl}
				bind:removed={imageRemoved}
				bind:picked={imagePicked}
				error={shown.image}
				{title}
				{untitled}
				onchange={() => dismiss('image')}
			/>
		</section>

		<section class="card" data-surface="solid" aria-labelledby="{uid}-tags">
			<div class="card-head">
				<h2 id="{uid}-tags">Tags</h2>
				<span class="card-note">{tagNames.length}</span>
			</div>
			<TagInput {tags} bind:selected={tagNames} bind:pending={tagText} />
		</section>
	</aside>

	<div class="main-rest">
		<section class="card" data-surface="solid" aria-labelledby="{uid}-ing">
			<div class="card-head"><h2 id="{uid}-ing">Ingredients</h2></div>
			<SectionsEditor kind="ingredients" bind:sections={ingredients} />
		</section>

		<section class="card" data-surface="solid" aria-labelledby="{uid}-met">
			<div class="card-head"><h2 id="{uid}-met">Method</h2></div>
			<SectionsEditor kind="steps" bind:sections={steps} />
		</section>

		<section class="card" data-surface="solid">
			<div class="card-head"><h2 id="{uid}-notes">Notes</h2></div>
			<Area label="Notes" hideLabel name="notes" rows={4} bind:value={notes} placeholder="Tips, variations, storage. Markdown works." />
		</section>
	</div>

	<div class="savebar" use:portal>
		<div class="capsule" role="group" aria-label="Save">
			<Button variant="quiet" href={cancelHref}>Cancel</Button>
			<Button variant="primary" arrow type="submit" form="{uid}-form" loading={saving} disabled={saving} loadingLabel="">{saving ? 'Saving…' : 'Save recipe'}</Button>
		</div>
	</div>

	{#if $leaving}
		<div class="dialog-host" use:toBody><DiscardDialog
				onkeep={guard.keep}
				ondiscard={() => {
					if (keep) clearDraft(localStorage);
					guard.discard();
				}}
			/></div>
	{/if}
</form>

<style>
	.form {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.notice {
		margin-block-end: var(--space-4);
	}
	.main-lead,
	.main-rest,
	.side {
		display: grid;
		gap: var(--space-4);
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
	.card-head h2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
	}
	.trio {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.act {
		display: block;
		margin-block-start: var(--space-2);
	}
	.dialog-host {
		display: contents;
	}
	/* Below 1024 px the Save capsule floats a small gap above the phone bar, lifted by the bar's measured height
	   (--dock-block-size, PhoneBar) over the bar's own offset from the bottom edge; a focused field clears both. */
	:global(:root) {
		--savebar-lift: calc(max(var(--space-3), env(safe-area-inset-bottom)) + var(--dock-block-size, var(--space-16)) + var(--space-2-5));
		--form-clearance: calc(var(--savebar-lift) + var(--space-16));
	}
	.savebar {
		position: fixed;
		inset-inline: var(--space-2);
		inset-block-end: var(--savebar-lift);
		z-index: var(--z-rail);
		display: flex;
		justify-content: center;
		pointer-events: none;
	}
	.capsule {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		inline-size: min(100%, 32rem);
		padding: var(--space-1-5);
		border-radius: var(--radius-pill);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		pointer-events: auto;
	}
	@media (min-width: 768px) {
		.form {
			grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
			grid-template-rows: auto 1fr;
			align-items: start;
		}
		.main-lead {
			grid-area: 1 / 1;
		}
		.main-rest {
			grid-area: 2 / 1;
		}
		.side {
			grid-area: 1 / 2 / span 2;
		}
	}
	@media (min-width: 1024px) {
		:global(:root) {
			--form-clearance: calc(var(--space-16) + var(--space-4));
		}
		.savebar {
			inset-block-end: max(var(--space-4), env(safe-area-inset-bottom));
		}
		.capsule {
			inline-size: auto;
			justify-content: flex-end;
		}
	}
</style>
