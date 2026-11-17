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
	import DiscardDialog from '#lib/recipes/DiscardDialog.svelte';
	import ImageField from '#lib/recipes/ImageField.svelte';
	import TagInput from '#lib/recipes/TagInput.svelte';
	import { unsavedGuard } from '#lib/recipes/unsaved.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import { pill } from '#lib/shell/pill.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { PRICES } from './format.ts';
	import ScoreField from './ScoreField.svelte';

	let {
		draft,
		tags,
		errors = {},
		notice = null,
		cancelHref = '/eating-out'
	}: {
		draft: SpotDraft;
		tags: Tag[];
		errors?: Record<string, string>;
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

	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');

	const statuses: { id: SpotStatus; label: string }[] = [
		{ id: 'want', label: 'Want to go' },
		{ id: 'visited', label: 'Visited' }
	];
</script>

<form class="spot-form" method="POST" enctype="multipart/form-data" novalidate use:enhance={submit} bind:this={formEl}>
	{#if notice}
		<div class="notice" role="status">
			<Icon name="alert" size={20} />
			<p>{notice}</p>
		</div>
	{/if}

	<div class="cols" data-settle={settle ? '' : undefined}>
		<section class="card" data-surface="solid" aria-labelledby="place-title">
			<div class="card-head"><h2 id="place-title">The place</h2></div>

			<ImageField
				imageId={draft.imageId ?? null}
				bind:url={imageUrl}
				bind:removed={imageRemoved}
				bind:picked={imagePicked}
				error={shown.image}
				onchange={() => dismiss('image')}
			/>

			<Field id="f-name" label="Name" name="name" bind:value={name} oninput={() => dismiss('name')} error={shown.name} autocomplete="off" />

			<div class="group">
				<span class="label" id="status-label">Status</span>
				<div class="seg-host">
					<div class="segment" role="group" aria-labelledby="status-label" data-pill use:pill>
						{#each statuses as s (s.id)}
							<button type="button" aria-pressed={status === s.id} onclick={() => (status = s.id)}>{s.label}</button>
						{/each}
					</div>
				</div>
				<input type="hidden" name="status" value={status} />
			</div>

			{#if status === 'visited'}
				<ScoreField bind:value={score} error={shown.score} oninput={() => dismiss('score')} />
			{/if}
		</section>

		<section class="card" data-surface="solid" aria-labelledby="details-title">
			<div class="card-head"><h2 id="details-title">Details</h2></div>

			<TagInput {tags} bind:selected={tagNames} bind:pending={tagText} />

			<div class="group">
				<span class="label" id="price-label">Price</span>
				<div class="prices" role="group" aria-labelledby="price-label">
					{#each PRICES as p (p.id)}
						<button type="button" class="chip" aria-pressed={price === p.id} data-press onclick={() => (price = p.id)}>
							{#if price === p.id}<Icon name="check" size={16} stroke={1.75} />{/if}{p.label}
						</button>
					{/each}
					{#if price !== null}<Button variant="quiet" size="s" onclick={() => (price = null)}>Clear</Button>{/if}
				</div>
				<input type="hidden" name="price" value={price ?? ''} />
			</div>

			<div class="pair">
				<Field id="f-city" label="City" name="city" bind:value={city} autocomplete="off" />
				<Field id="f-area" label="Neighbourhood" name="neighbourhood" bind:value={neighbourhood} autocomplete="off" />
			</div>

			<Field id="f-address" label="Address" name="address" bind:value={address} autocomplete="off" />

			<Field
				id="f-website"
				label="Website"
				name="website"
				inputmode="url"
				autocapitalize="off"
				spellcheck={false}
				bind:value={website}
				oninput={() => dismiss('website')}
				error={shown.website}
				autocomplete="off"
			/>

			<div class="area">
				<label for="f-notes">Notes</label>
				<textarea id="f-notes" name="notes" rows="3" bind:value={notes}></textarea>
			</div>
		</section>
	</div>

	<div class="actions">
		<Button variant="secondary" href={cancelHref}>Cancel</Button>
		<Button variant="primary" arrow type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save spot'}</Button>
	</div>

	{#if $leaving}<DiscardDialog onkeep={guard.keep} ondiscard={guard.discard} />{/if}
</form>

<style>
	.spot-form {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.notice {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-5);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--weight-medium);
	}
	.notice :global(svg) {
		flex: none;
	}
	.cols {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		min-inline-size: 0;
	}
	.card {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.group {
		display: grid;
		gap: var(--space-1-5);
		min-inline-size: 0;
	}
	.label,
	.area label {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}
	.pair {
		display: grid;
		gap: var(--space-4);
	}
	.pair > :global(*) {
		min-inline-size: 0;
	}
	.seg-host {
		justify-self: start;
		max-inline-size: 100%;
		border-radius: var(--radius-pill);
		background: var(--surface-sunken);
	}
	.segment {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-1);
		border-radius: var(--radius-pill);
	}
	.segment button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-5);
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		white-space: nowrap;
	}
	.segment button[aria-pressed='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.prices {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		min-block-size: max(var(--control-height-s), var(--target));
		min-inline-size: max(var(--control-height-s), var(--target));
		justify-content: center;
		padding-inline: var(--space-3-5);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}
	.chip[aria-pressed='true'] {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}
	@media (hover: hover) {
		.chip:not([aria-pressed='true']):hover {
			background: var(--surface-sunken);
		}
	}
	.area {
		display: grid;
		gap: var(--space-1-5);
	}
	textarea {
		inline-size: 100%;
		min-block-size: calc(var(--space-12) * 2);
		padding: var(--space-3) var(--space-4);
		border: 0;
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		resize: vertical;
		field-sizing: content;
	}
	textarea:focus-visible {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	@media (min-width: 768px) {
		.cols {
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		}
		.pair {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 767px) {
		.seg-host {
			justify-self: stretch;
		}
		.segment button {
			flex: 1;
		}
		.actions :global(.btn) {
			flex: 1;
		}
	}
</style>
