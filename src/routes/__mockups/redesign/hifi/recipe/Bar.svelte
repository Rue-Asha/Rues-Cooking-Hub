<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import Button from '../shell/Button.svelte';
	import Ic from '../recipes/Ic.svelte';
	import { go, plural, timesLine } from '../recipes/util.ts';

	type Start = { servings?: number; field?: string; alert?: boolean };
	type Props = { recipe: MockRecipeFull; start?: Start; scaled?: number | null; worst?: boolean; times?: boolean };
	let { recipe, start = {}, scaled = $bindable(null), worst = false, times = true }: Props = $props();

	const uid = $props.id();
	let ui = $state<Start>({});
	const servings = $derived(ui.servings ?? start.servings ?? recipe.servings);
	const field = $derived(ui.field ?? start.field ?? String(servings));
	const alert = $derived(ui.alert ?? start.alert ?? false);
	const line = $derived(times ? timesLine(recipe.prepMinutes, recipe.cookMinutes) : null);

	$effect(() => {
		scaled = servings;
	});

	// whole numbers from 1: anything else keeps the previous scale and says so
	function type(text: string) {
		if (/^\d+$/.test(text.trim()) && Number(text) >= 1) ui = { servings: Number(text), field: text, alert: false };
		else ui = { ...ui, field: text, alert: true };
	}
	function step(by: number) {
		const next = Math.max(1, servings + by);
		ui = { servings: next, field: String(next), alert: false };
	}
</script>

<div class="seg-bar">
	<div class="seg" role="group" aria-label="Scale recipe">
		<Ic name="users" size={20} />
		<div class="seg-text">
			<label class="seg-label" for="{uid}-s">Scale to servings</label>
			<div class="stepper">
				<button type="button" class="step" data-press="round" aria-label="Scale down" disabled={servings <= 1 && !alert} onclick={() => step(-1)}><Ic name="minus" size={14} /></button>
				<input id="{uid}-s" class="num" inputmode="numeric" autocomplete="off" value={field} aria-invalid={alert} aria-describedby={alert ? `${uid}-err` : undefined} oninput={(e) => type(e.currentTarget.value)} />
				<button type="button" class="step" data-press="round" aria-label="Scale up" onclick={() => step(1)}><Ic name="plus" size={14} /></button>
				{#if servings !== recipe.servings && !alert}
					<Button variant="quiet" size="s" onclick={() => (ui = { servings: recipe.servings, field: String(recipe.servings), alert: false })}>Reset to {plural(recipe.servings, 'serving')}</Button>
				{/if}
			</div>
		</div>
	</div>
	{#if line}
		<div class="seg">
			<Ic name="clock" size={20} />
			<div class="seg-text">
				<span class="seg-label">Time</span>
				<span class="seg-value">{line}</span>
			</div>
		</div>
	{/if}
	<div class="seg-actions"><Button variant="primary" arrow href={go.overlays(worst)}>Add to plan</Button></div>
	{#if alert}<p class="alert" id="{uid}-err" role="alert"><Ic name="alert" size={14} />Servings must be at least 1</p>{/if}
</div>

<style>
	.stepper {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1);
	}
	.step {
		display: grid;
		place-items: center;
		inline-size: max(var(--control-height-xs), var(--target));
		block-size: max(var(--control-height-xs), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
	}
	.step:disabled {
		opacity: var(--disabled-opacity);
	}
	.num {
		inline-size: 3.2ch;
		min-inline-size: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: none;
		box-shadow: var(--rule-below-control);
		text-align: center;
		font-size: var(--type-body-size);
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}
	.num[aria-invalid='true'] {
		box-shadow: var(--ring-danger);
		border-radius: var(--radius-text);
	}
	.alert {
		flex-basis: 100%;
		padding: var(--space-1) var(--space-3);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-weight: var(--weight-semibold);
		color: var(--danger);
	}
	.alert :global(svg) {
		display: inline;
		vertical-align: -0.15em;
		margin-inline-end: var(--space-1);
	}
</style>
