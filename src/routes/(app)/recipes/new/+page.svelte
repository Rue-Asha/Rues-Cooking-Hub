<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { onMount, tick, untrack } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import { reducedMotion } from '#lib/motion.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import { loadDraft } from '#lib/recipes/draft.ts';
	import RecipeForm, { type FormDraft } from '#lib/recipes/RecipeForm.svelte';
	import Status from '#lib/ui/Status.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// the page settles in on a full page load only
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');

	// svelte-ignore state_referenced_locally
	let url = $state(form?.url ?? '');
	let reading = $state(false);

	// a message belongs to the link it answered; editing the link retires it until the next answer
	let edited = $state(false);
	$effect(() => {
		void form;
		edited = false;
		if (form?.invalid) document.getElementById('import-url')?.focus();
	});
	const invalid = $derived(form?.invalid && !edited);
	const duplicate = $derived(edited ? null : (form?.duplicate ?? null));

	// The preview outlives later answers: a failed save brings errors, not a new draft, and the form keeps what was typed.
	// svelte-ignore state_referenced_locally
	let preview = $state(form?.preview ?? null);
	let revealed = $state(0);
	let previewEl = $state<HTMLElement>();

	// a draft kept in this browser comes back as the preview, in place of the empty link field
	let restored = $state(false);
	let restoredFrom = $state<{ imported: boolean; host: string }>({ imported: false, host: '' });
	onMount(() => {
		const stored = preview ? null : loadDraft(localStorage);
		if (!stored) return;
		restored = true;
		restoredFrom = { imported: stored.imported, host: stored.host ?? '' };
	});
	const blank: FormDraft = {
		title: '',
		description: null,
		sourceUrl: null,
		servings: 2,
		prepMinutes: null,
		cookMinutes: null,
		tagNames: [],
		ingredients: [],
		steps: []
	};

	let reveal = $state(false);
	$effect(() => {
		const next = form?.preview;
		if (next && next !== untrack(() => preview)) {
			preview = next;
			restored = false;
			revealed = untrack(() => revealed) + 1;
			reveal = true;
		} else if (form?.invalid || form?.duplicate) preview = null;
	});

	// the preview scrolls into view once "Reading the page…" is gone; before, its place still moves after the scroll
	$effect(() => {
		if (!reveal || reading) return;
		reveal = false;
		tick().then(() => {
			if (!previewEl) return;
			// from the layout box, not scrollIntoView: the preview is still rising in (translateY), and the transformed box
			// would land its top, the alert, under the top edge
			let top = 0;
			for (let n: HTMLElement | null = previewEl; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
			const margin = parseFloat(getComputedStyle(previewEl).scrollMarginBlockStart) || 0;
			scrollTo({ top: top - margin, behavior: reducedMotion() ? 'auto' : 'smooth' });
		});
	});

	const site = $derived(preview ? new URL(preview.draft.sourceUrl).hostname.replace(/^www\./, '') : '');

	const kept = (draft: { title: string; imageUrl: string | null }) =>
		['the link', draft.title && 'the title', draft.imageUrl && 'the photo'].filter(Boolean).join(', ').replace(/, ([^,]*)$/, ' and $1');

	const read: SubmitFunction = () => {
		reading = true;
		return async ({ update }) => {
			await update({ reset: false });
			reading = false;
		};
	};
</script>

<svelte:head>
	<title>Import a recipe · Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker"><li>Recipes</li><li>New</li></ul>
		<h1>Bring a recipe <em class="accent-word">home</em></h1>
		<p class="lede">Paste the link to a recipe page and check what we found before it is saved.</p>
	</div>
</header>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	{#if !restored}
		<section class="card import" data-surface="solid" aria-label="Import from a link">
			<form method="POST" action="?/import" novalidate use:enhance={read}>
				<div class="row">
					<Field
						id="import-url"
						label="Paste a link to a recipe page"
						name="url"
						type="url"
						inputmode="url"
						autocomplete="off"
						autocapitalize="off"
						spellcheck={false}
						placeholder="https://"
						bind:value={url}
						oninput={() => (edited = true)}
						readonly={reading}
						error={invalid ? COPY.invalidUrl : undefined}
					/>
					<Button variant="primary" arrow type="submit" disabled={reading}>{reading ? 'Reading…' : 'Import'}</Button>
				</div>

				{#if reading}
					<Status>Reading the page…</Status>
				{:else if duplicate}
					<Status>
						{COPY.duplicate}: <a href="/recipes/{duplicate.id}">{duplicate.title}</a> has this link.
						<span class="act"><Button size="xs" type="submit" name="anyway" value="1">Import anyway</Button></span>
					</Status>
				{/if}

				<p class="hint">Or <a href="/recipes/new/form">Start from scratch</a>.</p>
			</form>
		</section>
	{/if}

	{#if preview || restored}
		{#key revealed}
			<section class="preview reveal" class:stale={reading} aria-label="Recipe preview" bind:this={previewEl}>
				{#if restored && restoredFrom.host}
					<Status>Read from {restoredFrom.host}. Everything stays editable. New tags are created when you save.</Status>
				{:else if preview}
					{#if preview.kind === 'recipe'}
						<Status>Read from {site}. Everything stays editable. New tags are created when you save.</Status>
					{:else}
						<Status kind="alert">{COPY.importFailed}. We kept {kept(preview.draft)}. Add ingredients and steps below.</Status>
					{/if}
				{/if}
				<RecipeForm
					draft={preview?.draft ?? blank}
					tags={data.tags}
					errors={form?.errors}
					action="?/save"
					heading={preview ? (preview.kind === 'recipe' ? 'Check and save' : 'Fill in the rest') : 'Check and save'}
					cancelHref="/recipes"
					keep
					imported={preview !== null || (restored && restoredFrom.imported)}
					host={preview?.kind === 'recipe' ? site : restored ? restoredFrom.host : ''}
					restore={restored}
					ondiscarddraft={() => (restored = false)}
				/>
			</section>
		{/key}
	{/if}
</div>

<style>
	.import {
		padding: var(--space-5);
		min-inline-size: 0;
	}
	form,
	.row {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.hint {
		font-size: var(--type-body-s-size);
		color: var(--ink-secondary);
	}
	.hint a,
	.import :global(.notice a) {
		color: var(--ink);
		font-weight: var(--weight-semibold);
		overflow-wrap: anywhere;
	}
	.act {
		display: block;
		margin-block-start: var(--space-2);
	}
	.preview {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
		/* clear of the sticky capsule from 1100 px (--sticky-block-start), with the same air as elsewhere */
		scroll-margin-block-start: calc(var(--sticky-block-start, 0px) + var(--space-8));
		transition: opacity var(--motion-quick) var(--ease-out);
	}
	.preview.stale {
		opacity: 0.45;
	}
	.reveal {
		animation: fp-settle var(--motion-settle) var(--ease-out) both;
	}
	@media (prefers-reduced-motion: reduce) {
		.reveal {
			animation: none;
		}
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
