<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { tick, untrack } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import { reducedMotion, rise } from '#lib/motion.ts';
	import RecipeForm from '#lib/recipes/RecipeForm.svelte';
	import Button from '#lib/ui/Button.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';
	import { fade } from 'svelte/transition';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let url = $state(form?.url ?? '');
	let reading = $state(false);
	let input: HTMLInputElement;

	// a message belongs to the link it answered; editing the link retires it until the next answer
	let edited = $state(false);
	$effect(() => {
		void form;
		edited = false;
		if (form?.invalid) input.focus();
	});
	const invalid = $derived(form?.invalid && !edited);
	const duplicate = $derived(edited ? null : (form?.duplicate ?? null));

	// The preview outlives later answers: a failed save brings errors, not a new draft, and the form keeps what was typed.
	// svelte-ignore state_referenced_locally
	let preview = $state(form?.preview ?? null);
	let revealed = $state(0);
	let previewEl = $state<HTMLElement>();

	$effect(() => {
		const next = form?.preview;
		if (next && next !== untrack(() => preview)) {
			preview = next;
			revealed = untrack(() => revealed) + 1;
			tick().then(() =>
				previewEl?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
			);
		} else if (form?.invalid || form?.duplicate) preview = null;
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

<div class="column page" data-column>
	<header class="enter" data-page-header>
		<Kicker parts={['Recipes', 'New']} />
		<h1>Bring a recipe <em>home</em></h1>
	</header>

	<section class="band enter" class:busy={reading} style="--i: 1" aria-label="Import from a link">
		<img src="/mockups/penne-arrabbiata.jpg" alt="" />
		<GlassPanel as="div" strong class="import">
			<form method="POST" action="?/import" novalidate use:enhance={read}>
				<label class="url-label" for="url">Paste a link to a recipe page</label>
				<div class="url-row">
					<div class="url-field" class:bad={invalid}>
						<Icon name="link" size={18} />
						<input
							id="url"
							name="url"
							inputmode="url"
							autocomplete="off"
							autocapitalize="off"
							spellcheck="false"
							placeholder="https://"
							bind:this={input}
							bind:value={url}
							oninput={() => (edited = true)}
							readonly={reading}
							aria-invalid={invalid ? 'true' : undefined}
							aria-describedby={invalid ? 'url-error' : undefined}
						/>
						{#if reading}<span class="sweep" data-reading-sweep aria-hidden="true"></span>{/if}
					</div>
					<Button type="submit" disabled={reading}>{reading ? 'Reading…' : 'Import'}</Button>
				</div>

				{#if invalid}
					<p class="error" id="url-error" role="alert" transition:rise={{ y: 6 }}>{COPY.invalidUrl}</p>
				{/if}

				{#if reading}
					<p class="reading" role="status" in:rise={{ y: 8 }} out:fade={{ duration: 160 }}>
						<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
						Reading the page…
					</p>
				{:else if duplicate}
					<div class="known" role="status" in:rise={{ y: 8 }}>
						<Icon name="alert" size={20} />
						<div>
							<p class="known-title">{COPY.duplicate}</p>
							<p><a href="/recipes/{duplicate.id}">{duplicate.title}</a> has this link.</p>
						</div>
						<button class="anyway" type="submit" name="anyway" value="1">Import anyway</button>
					</div>
				{/if}

				<p class="url-help">
					Works with most recipe sites. Nothing to import?
					<a href="/recipes/new/form">Start from scratch <Icon name="arrow-right" size={14} /></a>
				</p>
			</form>
		</GlassPanel>
	</section>

	{#if preview}
		{#key revealed}
			<section class="preview reveal" class:stale={reading} aria-label="Recipe preview" bind:this={previewEl}>
				{#if preview.kind === 'recipe'}
					<div class="banner ok" role="status">
						<Icon name="check" size={20} />
						<div>
							<p class="banner-title">Read from {site}</p>
							<p>Everything stays editable. New tags are created when you save.</p>
						</div>
					</div>
				{:else}
					<div class="banner fail" role="alert">
						<Icon name="alert" size={20} />
						<div>
							<p class="banner-title">{COPY.importFailed}</p>
							<p>We kept {kept(preview.draft)}. Add ingredients and steps below.</p>
						</div>
					</div>
				{/if}

				<RecipeForm
					draft={preview.draft}
					tags={data.tags}
					errors={form?.errors}
					action="?/save"
					heading={preview.kind === 'recipe' ? 'Check and save' : 'Fill in the rest'}
					cancelHref="/recipes"
				/>
			</section>
		{/key}
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-7);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
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

	.band {
		position: relative;
		display: grid;
		place-items: center;
		min-block-size: 300px;
		padding: var(--s-8) var(--s-6);
		border-radius: var(--r-frame);
		background: linear-gradient(135deg, var(--sand), var(--olive-soft));
		overflow: hidden;
		isolation: isolate;
	}

	.band > img {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		z-index: -1;
		transition: transform var(--d-ambient) var(--ease-linear);
	}

	.band.busy > img {
		transform: scale(1.06);
	}

	.band :global(.import) {
		inline-size: min(100%, 720px);
		padding: var(--s-6) var(--s-7);
		transition: transform var(--d-base) var(--ease-out);
	}

	.band.busy :global(.import) {
		transform: translateY(-3px);
	}

	.url-label {
		display: block;
		margin-block-end: var(--s-3);
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 360;
	}

	.url-row {
		display: flex;
		gap: var(--s-2);
	}

	.url-field {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		min-inline-size: 0;
		min-block-size: 52px;
		padding: 0 var(--s-5);
		border-radius: var(--r-pill);
		background: var(--white);
		border: 1px solid var(--line);
		overflow: hidden;
		transition:
			border-color var(--d-fast) var(--ease-out),
			box-shadow var(--d-fast) var(--ease-out);
	}

	.url-field:focus-within {
		border-color: var(--olive);
		box-shadow: 0 0 0 3px var(--olive-wash);
	}

	.url-field.bad {
		border-color: var(--brick);
		box-shadow: 0 0 0 3px var(--brick-wash);
	}

	.url-field input {
		flex: 1;
		min-inline-size: 0;
		min-block-size: 50px;
		border: 0;
		background: none;
		font-size: 15px;
		outline: none;
	}

	.sweep {
		position: absolute;
		inset-inline: 0;
		inset-block-end: 0;
		block-size: 3px;
		background: linear-gradient(90deg, transparent, var(--olive) 50%, transparent);
		inline-size: 40%;
		animation: sweep var(--d-sweep) var(--ease-out) infinite;
	}

	@keyframes sweep {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(250%);
		}
	}

	.url-row :global(.btn) {
		min-block-size: 52px;
	}

	.error {
		margin-block-start: var(--s-2);
		padding-inline: var(--s-5);
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--brick);
	}

	.reading,
	.known {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		margin-block-start: var(--s-4);
		padding: var(--s-3) var(--s-5);
		border-radius: var(--r-md);
		font-size: 14px;
	}

	.reading {
		background: var(--olive-soft);
		font-weight: 600;
		color: var(--ink);
	}

	.dots {
		display: inline-flex;
		gap: 5px;
	}

	.dots i {
		inline-size: 7px;
		block-size: 7px;
		border-radius: 50%;
		background: var(--olive);
		animation: dot var(--d-loop) var(--ease-in-out) infinite;
	}

	.dots i:nth-child(2) {
		animation-delay: 0.15s;
	}

	.dots i:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes dot {
		0%,
		70%,
		100% {
			transform: translateY(0);
			opacity: 0.45;
		}
		35% {
			transform: translateY(-5px);
			opacity: 1;
		}
	}

	.known {
		flex-wrap: wrap;
		background: var(--brick-soft);
	}

	.known > :global(.icon) {
		color: var(--brick);
		flex: none;
	}

	.known > div {
		flex: 1;
		min-inline-size: 160px;
	}

	.known-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--brick);
	}

	.known a {
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.anyway {
		min-block-size: 44px;
		padding: 0 var(--s-5);
		border-radius: var(--r-pill);
		border: 1px solid var(--ink);
		background: transparent;
		font-size: 15px;
		font-weight: 500;
		white-space: nowrap;
		transition: transform var(--d-fast) var(--ease-out);
	}

	.anyway:hover {
		transform: translateY(-1px);
	}

	.url-help {
		margin-block-start: var(--s-3);
		font-size: 14px;
		color: var(--ink);
	}

	.url-help a {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-block-size: 32px;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.preview {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
		scroll-margin-block-start: calc(var(--nav-h) + var(--s-8));
		transition: opacity var(--d-base) var(--ease-out);
	}

	.preview.stale {
		opacity: 0.45;
	}

	.reveal {
		animation: reveal var(--d-slow) var(--ease-out) both;
	}

	@keyframes reveal {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
	}

	.banner {
		display: flex;
		align-items: flex-start;
		gap: var(--s-3);
		padding: var(--s-4) var(--s-5);
		border-radius: var(--r-md);
		font-size: 14px;
	}

	.banner-title {
		font-size: 15px;
		font-weight: 600;
	}

	.ok {
		background: var(--olive-soft);
	}

	.ok :global(.icon) {
		color: var(--olive);
		flex: none;
	}

	.fail {
		background: var(--brick-soft);
		animation: banner-in var(--d-slow) var(--ease-out) 140ms both;
	}

	.fail .banner-title,
	.fail :global(.icon) {
		color: var(--brick);
		flex: none;
	}

	.fail :global(.icon) {
		animation: nudge var(--d-nudge) var(--ease-out) 380ms both;
	}

	@keyframes banner-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
	}

	@keyframes nudge {
		30% {
			transform: rotate(-14deg) scale(1.15);
		}
		60% {
			transform: rotate(9deg) scale(1.08);
		}
	}

	@media (max-width: 1023px) {
		.band {
			min-block-size: 0;
			padding: var(--s-4);
			margin-inline: calc(-1 * var(--gutter));
			border-radius: 0;
		}

		.band :global(.import) {
			padding: var(--s-5);
		}

		.url-label {
			font-size: 20px;
		}

		.url-row {
			flex-direction: column;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.enter,
		.reveal,
		.fail,
		.fail :global(.icon),
		.sweep,
		.dots i {
			animation: none;
		}

		.band > img,
		.band :global(.import) {
			transition: none;
		}

		.band.busy > img,
		.band.busy :global(.import) {
			transform: none;
		}
	}
</style>
