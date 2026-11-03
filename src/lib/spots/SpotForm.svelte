<script lang="ts" module>
	import type { Id, Price, SpotStatus, Tag } from '#lib/types.ts';

	// What the form starts from: an empty spot or a stored one (score as text, "8.75").
	export interface SpotDraft {
		name: string;
		status: SpotStatus;
		score: string;
		price: Price | null;
		city: string;
		neighbourhood: string;
		address: string;
		website: string;
		notes: string;
		tagNames: string[];
		imageId?: Id | null;
	}

	export const emptySpot = (): SpotDraft => ({
		name: '',
		status: 'want',
		score: '',
		price: null,
		city: '',
		neighbourhood: '',
		address: '',
		website: '',
		notes: '',
		tagNames: []
	});
</script>

<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { tick } from 'svelte';
	import { rise } from '#lib/motion.ts';
	import DiscardDialog from '#lib/recipes/DiscardDialog.svelte';
	import ImageField from '#lib/recipes/ImageField.svelte';
	import TagInput from '#lib/recipes/TagInput.svelte';
	import { unsavedGuard } from '#lib/recipes/unsaved.ts';
	import Button from '#lib/ui/Button.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { PRICES } from './format.ts';
	import ScoreField from './ScoreField.svelte';

	let {
		draft,
		tags,
		errors = {},
		heading = 'Add spot',
		notice = null,
		cancelHref = '/eating-out'
	}: {
		draft: SpotDraft;
		tags: Tag[];
		errors?: Record<string, string>;
		heading?: string;
		notice?: string | null;
		cancelHref?: string;
	} = $props();

	// the form seeds its fields once; a draft never changes under a mounted form
	/* svelte-ignore state_referenced_locally */
	let name = $state(draft.name);
	/* svelte-ignore state_referenced_locally */
	let status = $state<SpotStatus>(draft.status);
	/* svelte-ignore state_referenced_locally */
	let score = $state(draft.score);
	/* svelte-ignore state_referenced_locally */
	let price = $state<Price | null>(draft.price);
	/* svelte-ignore state_referenced_locally */
	let city = $state(draft.city);
	/* svelte-ignore state_referenced_locally */
	let neighbourhood = $state(draft.neighbourhood);
	/* svelte-ignore state_referenced_locally */
	let address = $state(draft.address);
	/* svelte-ignore state_referenced_locally */
	let website = $state(draft.website);
	/* svelte-ignore state_referenced_locally */
	let notes = $state(draft.notes);
	let imageUrl = $state('');
	let imageRemoved = $state(false);
	let imagePicked = $state('');
	/* svelte-ignore state_referenced_locally */
	let tagNames = $state([...draft.tagNames]);
	let tagText = $state('');

	const snapshot = () =>
		JSON.stringify([
			name,
			status,
			score,
			price,
			city,
			neighbourhood,
			address,
			website,
			notes,
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

	const statuses: { id: SpotStatus; label: string }[] = [
		{ id: 'want', label: 'Want to go' },
		{ id: 'visited', label: 'Visited' }
	];
</script>

{#snippet saveButtons()}
	<Button variant="secondary" arrow={false} href={cancelHref}>Cancel</Button>
	<Button variant="olive" type="submit" arrow={false} disabled={saving}>{saving ? 'Saving…' : 'Save spot'}</Button>
{/snippet}

<form class="spot-form" method="POST" enctype="multipart/form-data" novalidate use:enhance={submit} bind:this={formEl}>
	{#if notice}
		<div class="banner fail" role="status" in:rise>
			<Icon name="alert" size={20} />
			<p>{notice}</p>
		</div>
	{/if}

	<div class="head enter" style="--i: 0">
		<div>
			<h2 data-section-heading>{heading}</h2>
			<p class="sub">Only the name is required; Visited asks for a score</p>
		</div>
		<div class="save top">{@render saveButtons()}</div>
	</div>

	<div class="form">
		<div class="card enter" style="--i: 1">
			<h3 class="col-title">The place</h3>

			<ImageField
				imageId={draft.imageId ?? null}
				bind:url={imageUrl}
				bind:removed={imageRemoved}
				bind:picked={imagePicked}
				error={shown.image}
				onchange={() => dismiss('image')}
			/>

			<div class="field">
				<label for="f-name">Name</label>
				<input
					id="f-name"
					name="name"
					bind:value={name}
					oninput={() => dismiss('name')}
					aria-invalid={shown.name ? 'true' : undefined}
					aria-describedby={shown.name ? 'e-name' : undefined}
					autocomplete="off"
				/>
				{#if shown.name}<p class="error" id="e-name" role="alert" transition:rise={{ y: 6 }}>{shown.name}</p>{/if}
			</div>

			<div class="field">
				<span class="label" id="status-label">Status</span>
				<div class="segment" role="group" aria-labelledby="status-label">
					{#each statuses as s (s.id)}
						<button type="button" aria-pressed={status === s.id} class:on={status === s.id} onclick={() => (status = s.id)}>
							{s.label}
						</button>
					{/each}
				</div>
				<input type="hidden" name="status" value={status} />
			</div>

			{#if status === 'visited'}
				<ScoreField bind:value={score} error={shown.score} oninput={() => dismiss('score')} />
			{/if}
		</div>

		<div class="card enter" style="--i: 2">
			<h3 class="col-title">Details</h3>

			<TagInput {tags} bind:selected={tagNames} bind:pending={tagText} />

			<div class="field">
				<span class="label" id="price-label">Price <i>optional</i></span>
				<div class="prices" role="group" aria-labelledby="price-label">
					{#each PRICES as p (p.id)}
						<Chip label={p.label} active={price === p.id} onclick={() => (price = p.id)} />
					{/each}
					{#if price !== null}
						<button type="button" class="clear" onclick={() => (price = null)}>Clear</button>
					{/if}
				</div>
				<input type="hidden" name="price" value={price ?? ''} />
			</div>

			<div class="pair">
				<div class="field">
					<label for="f-city">City <i>optional</i></label>
					<input id="f-city" name="city" bind:value={city} autocomplete="off" />
				</div>
				<div class="field">
					<label for="f-area">Neighbourhood <i>optional</i></label>
					<input id="f-area" name="neighbourhood" bind:value={neighbourhood} autocomplete="off" />
				</div>
			</div>

			<div class="field">
				<label for="f-address">Address <i>optional</i></label>
				<input id="f-address" name="address" bind:value={address} autocomplete="off" />
			</div>

			<div class="field">
				<label for="f-website">Website <i>optional</i></label>
				<input
					id="f-website"
					name="website"
					inputmode="url"
					autocapitalize="off"
					spellcheck="false"
					bind:value={website}
					oninput={() => dismiss('website')}
					aria-invalid={shown.website ? 'true' : undefined}
					aria-describedby={shown.website ? 'e-website' : undefined}
					autocomplete="off"
				/>
				{#if shown.website}<p class="error" id="e-website" role="alert" transition:rise={{ y: 6 }}>{shown.website}</p>{/if}
			</div>

			<div class="field">
				<label for="f-notes">Notes <i>optional</i></label>
				<textarea id="f-notes" name="notes" rows="3" bind:value={notes}></textarea>
			</div>
		</div>
	</div>

	<div class="save bottom">{@render saveButtons()}</div>

	{#if $leaving}<DiscardDialog onkeep={guard.keep} ondiscard={guard.discard} />{/if}
</form>

<style>
	.spot-form {
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

	.sub {
		margin-block-start: 4px;
		font-size: 14px;
		color: var(--ink-2);
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

	.card {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		min-inline-size: 0;
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

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
	}

	.field > label,
	.field > .label {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.field i {
		font-weight: 400;
		font-style: normal;
		color: var(--ink-2);
	}

	input:not([type='hidden']),
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

	input:focus-visible,
	textarea:focus-visible {
		border-color: var(--olive);
		box-shadow: 0 0 0 3px var(--olive-wash);
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

	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-3);
	}

	.segment {
		display: inline-flex;
		align-self: flex-start;
		gap: 4px;
		padding: 4px;
		border-radius: var(--r-pill);
		background: var(--ink-wash);
	}

	.segment button {
		min-block-size: 44px;
		padding: 0 var(--s-5);
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		font-size: 15px;
		font-weight: 500;
		white-space: nowrap;
		transition:
			background-color var(--d-fast) var(--ease-out),
			color var(--d-fast) var(--ease-out);
	}

	.segment .on {
		background: var(--dark);
		color: var(--on-dark);
		box-shadow: var(--shadow-card);
	}

	.prices {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}

	.clear {
		min-block-size: 44px;
		padding: 0 var(--s-2);
		border: 0;
		background: none;
		font-size: 14px;
		font-weight: 500;
		color: var(--brick);
		text-decoration: underline;
		text-underline-offset: 3px;
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
			gap: var(--s-4);
		}

		.card {
			padding: var(--s-5) var(--s-4);
		}

		.segment {
			display: flex;
			align-self: stretch;
		}

		.segment button {
			flex: 1;
		}

		input:not([type='hidden']),
		textarea {
			font-size: 16px;
		}
	}
</style>
