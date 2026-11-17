<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { addDays, weekDays, weekStart } from '#lib/dates.ts';
	import { reducedMotion, rise } from '#lib/motion.ts';
	import Sheet from '#lib/plan/Sheet.svelte';
	import { SLOTS, type IsoDate, type Slot } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let {
		open,
		title,
		servings: recipeServings,
		today,
		onclose
	}: { open: boolean; title: string; servings: number; today: IsoDate; onclose: () => void } = $props();

	let monday = $state('');
	let date = $state('');
	let slot = $state<Slot>('dinner');
	let servings = $state('2');
	let error = $state('');
	let submitting = $state(false);
	let added = $state<{ date: IsoDate; slot: Slot } | null>(null);
	let direction = $state(1);

	// only opening resets the form; the reload after adding passes a fresh recipe, which must not
	$effect(() => {
		if (!open) return;
		untrack(() => {
			monday = weekStart(today);
			date = today;
			slot = 'dinner';
			servings = String(recipeServings);
			error = '';
			submitting = false;
			added = null;
		});
	});

	const utc = (d: IsoDate) => new Date(`${d}T00:00:00Z`);
	const fmt = (d: IsoDate, opts: Intl.DateTimeFormatOptions) => utc(d).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
	const days = $derived(monday ? weekDays(monday) : []);
	// "19 – 25 October", or "27 October – 2 November" across a month
	const range = $derived(
		!days.length
			? ''
			: days[0].slice(0, 7) === days[6].slice(0, 7)
				? `${fmt(days[0], { day: 'numeric' })} – ${fmt(days[6], { day: 'numeric', month: 'long' })}`
				: `${fmt(days[0], { day: 'numeric', month: 'long' })} – ${fmt(days[6], { day: 'numeric', month: 'long' })}`
	);
	const count = $derived(Number.parseInt(servings, 10) || 0);
	const formId = $props.id();
	const slotLabel = (id: Slot) => SLOTS.find((s) => s.id === id)?.label ?? '';

	// the same weekday in the next or previous week
	function step(by: number) {
		direction = by;
		monday = addDays(monday, 7 * by);
		date = addDays(date, 7 * by);
	}

	const submit: SubmitFunction = () => {
		submitting = true;
		error = '';
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'failure') {
				error = Object.values((result.data as { errors?: Record<string, string> } | undefined)?.errors ?? {})[0] ?? '';
				return;
			}
			if (result.type === 'success') added = { date, slot };
			await update({ reset: false });
		};
	};
</script>

{#snippet buttons()}
	{#if added}
		<Button variant="quiet" onclick={onclose}>Done</Button>
		<Button variant="primary" arrow href="/plan?week={weekStart(added.date)}">Open the week</Button>
	{:else}
		<Button variant="quiet" onclick={onclose}>Cancel</Button>
		<Button type="submit" form={formId} variant="primary" disabled={submitting}>Add to plan</Button>
	{/if}
{/snippet}

<Sheet {open} kicker={title} title="Add to plan" {onclose} actions={buttons}>
	{#if added}
		<div class="done" in:rise={{ y: 10 }}>
			<span class="tick" aria-hidden="true"><Icon name="check" size={22} /></span>
			<p class="done-text" role="status">
				Added to <strong>{fmt(added.date, { weekday: 'long' })} · {slotLabel(added.slot)}</strong>
			</p>
		</div>
	{:else}
		<form id={formId} method="POST" action="?/plan" use:enhance={submit}>
			<fieldset>
				<legend class="sr-only">Day</legend>
				<div class="week">
					<Button variant="secondary" size="s" icon label="Earlier week" onclick={() => step(-1)}><Icon name="chevron-left" size={18} /></Button>
					{#key monday}
						<span class="range figures" in:fly={{ x: reducedMotion() ? 0 : direction * 14, duration: reducedMotion() ? 0 : 240 }}>{range}</span>
					{/key}
					<Button variant="secondary" size="s" icon label="Later week" onclick={() => step(1)}><Icon name="chevron-right" size={18} /></Button>
				</div>
				{#key monday}
					<div class="days" in:fly={{ x: reducedMotion() ? 0 : direction * 24, duration: reducedMotion() ? 0 : 280 }}>
						{#each days as d (d)}
							<label class="chip day" class:today={d === today}>
								<input
									
									type="radio"
									name="date"
									value={d}
									bind:group={date}
									aria-label={fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}
								/>
								<span class="mark" aria-hidden="true"><Icon name="check" size={12} /></span>
								<span>{fmt(d, { weekday: 'short' })}</span>
								<span class="sub figures">{fmt(d, { day: 'numeric' })}</span>
							</label>
						{/each}
					</div>
				{/key}
			</fieldset>

			<fieldset>
				<legend class="sr-only">Meal</legend>
				<div class="slots">
					{#each SLOTS as s (s.id)}
						<label class="chip">
							<input type="radio" name="slot" value={s.id} bind:group={slot} />
							<span class="mark" aria-hidden="true"><Icon name="check" size={12} /></span>
							<span>{s.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>

			{#if error}<p class="error" role="alert" in:rise={{ y: 6 }}>{error}</p>{/if}

			<div class="servings">
				<Button size="s" icon label="Fewer servings" disabled={count <= 1} onclick={() => (servings = String(Math.max(1, count - 1)))}>
					<Icon name="minus" size={16} />
				</Button>
				<div class="num">
					<label for="plan-servings">Servings</label>
					<input id="plan-servings" name="servings" inputmode="numeric" autocomplete="off" class="figures" bind:value={servings} />
				</div>
				<Button size="s" icon label="More servings" onclick={() => (servings = String(count + 1))}><Icon name="plus" size={16} /></Button>
			</div>
		</form>
	{/if}
</Sheet>

<style>
	form,
	.done {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	/* the week is one capsule: round steps either side of the range */
	.week {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-1-5);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.week :global(.btn.icon) {
		background: var(--surface-sunken);
		box-shadow: none;
	}

	.range {
		flex: 1;
		min-inline-size: 0;
		text-align: center;
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--weight-semibold);
		overflow-wrap: anywhere;
	}

	/* a chip label never breaks inside a word: on a narrow sheet the days take two rows, the meals two columns */
	fieldset {
		container-type: inline-size;
	}
	.days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: var(--space-1-5);
	}

	.slots {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-1-5);
	}

	.slots .chip {
		padding-inline: var(--space-2);
		overflow-wrap: normal;
		hyphens: none;
	}

	.chip {
		position: relative;
		display: grid;
		justify-items: center;
		align-content: center;
		gap: var(--space-0-5);
		min-block-size: max(var(--control-height), var(--target));
		min-inline-size: 0;
		padding: var(--space-1-5) var(--space-0-5);
		border-radius: var(--radius-control);
		background: var(--surface-control-solid);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-align: center;
		cursor: pointer;
		transition:
			background-color var(--motion-quick) var(--ease-out),
			transform var(--motion-quick) var(--ease-out);
	}
	.chip input {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		margin: 0;
		opacity: 0;
		pointer-events: none;
	}
	.chip:active {
		transform: scale(0.97);
	}
	.chip:has(:checked) {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}
	.chip:has(:focus-visible) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	@media (hover: hover) {
		.chip:not(:has(:checked)):hover {
			background: var(--surface-control-solid-hover);
		}
	}
	/* the chosen chip carries a small charcoal check on its corner */
	.mark {
		position: absolute;
		inset-block-start: calc(-1 * var(--space-1-5));
		inset-inline-end: calc(-1 * var(--space-0-5));
		display: none;
		place-items: center;
		inline-size: var(--space-4);
		block-size: var(--space-4);
		border-radius: var(--radius-round);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.chip:has(:checked) .mark {
		display: grid;
	}
	@container (max-width: 22rem) {
		.days {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.slots {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.chip .sub {
		font-size: var(--type-caption-size);
		font-weight: var(--weight-regular);
		color: var(--ink-secondary);
	}
	.chip.today .sub::after {
		content: '';
		display: block;
		inline-size: var(--space-1);
		block-size: var(--space-1);
		margin: var(--space-0-5) auto 0;
		border-radius: var(--radius-round);
		background: var(--ink);
	}

	.error {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-item);
		background: var(--danger-soft);
		color: var(--danger);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--type-label-weight);
	}

	/* − [Servings] +, the steps level with the field under its label */
	.servings {
		display: flex;
		align-items: flex-end;
		gap: var(--space-2);
	}
	.servings :global(.btn.icon) {
		margin-block-end: var(--space-0-5);
	}

	.num {
		display: grid;
		flex: 1;
		gap: var(--space-1-5);
		min-inline-size: 0;
	}

	.num label {
		padding-inline-start: var(--space-4);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}

	.num input {
		min-block-size: max(var(--control-height), var(--target));
		min-inline-size: 0;
		padding-inline: var(--space-4);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		font-size: var(--type-body-size);
	}
	.num input:focus-visible {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	.tick {
		display: grid;
		place-items: center;
		inline-size: var(--space-12);
		block-size: var(--space-12);
		border-radius: var(--radius-round);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.done-text {
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}

</style>
