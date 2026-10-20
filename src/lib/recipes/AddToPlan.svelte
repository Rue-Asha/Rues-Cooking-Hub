<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { addDays, weekDays, weekStart } from '#lib/dates.ts';
	import { reducedMotion, rise } from '#lib/motion.ts';
	import Sheet from '#lib/plan/Sheet.svelte';
	import { SLOTS, type IsoDate, type Slot } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
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
	let servings = $state(2);
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
			servings = recipeServings;
			error = '';
			submitting = false;
			added = null;
		});
	});

	const utc = (d: IsoDate) => new Date(`${d}T00:00:00Z`);
	const fmt = (d: IsoDate, opts: Intl.DateTimeFormatOptions) => utc(d).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
	const days = $derived(monday ? weekDays(monday) : []);
	const range = $derived(
		days.length ? `${fmt(days[0], { day: 'numeric', month: 'short' })} – ${fmt(days[6], { day: 'numeric', month: 'short' })}` : ''
	);
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

<Sheet {open} kicker={title} title="Add to plan" {onclose}>
	{#if added}
		<div class="done" in:rise={{ y: 10 }}>
			<span class="tick" aria-hidden="true"><Icon name="check" size={22} /></span>
			<p class="done-text" role="status">
				Added to <strong>{fmt(added.date, { weekday: 'long' })} · {slotLabel(added.slot)}</strong>
			</p>
			<div class="foot">
				<Button variant="secondary" arrow={false} onclick={onclose}>Done</Button>
				<Button href="/plan?week={weekStart(added.date)}">Open the week</Button>
			</div>
		</div>
	{:else}
		<form method="POST" action="?/plan" use:enhance={submit}>
			<fieldset>
				<legend>Day</legend>
				<div class="week">
					<ArrowButton variant="outline" size="sm" direction="left" label="Earlier week" onclick={() => step(-1)} />
					{#key monday}
						<span class="range tnum" in:fly={{ x: reducedMotion() ? 0 : direction * 14, duration: reducedMotion() ? 0 : 240 }}>{range}</span>
					{/key}
					<ArrowButton variant="dark" size="sm" label="Later week" onclick={() => step(1)} />
				</div>
				{#key monday}
					<div class="days" in:fly={{ x: reducedMotion() ? 0 : direction * 24, duration: reducedMotion() ? 0 : 280 }}>
						{#each days as d (d)}
							<label class="day" class:today={d === today}>
								<input
									class="visually-hidden"
									type="radio"
									name="date"
									value={d}
									bind:group={date}
									aria-label={fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}
								/>
								<span class="dow">{fmt(d, { weekday: 'short' })}</span>
								<span class="dom tnum">{fmt(d, { day: 'numeric' })}</span>
							</label>
						{/each}
					</div>
				{/key}
			</fieldset>

			<fieldset>
				<legend>Meal</legend>
				<div class="slots">
					{#each SLOTS as s (s.id)}
						<label class="slot">
							<input class="visually-hidden" type="radio" name="slot" value={s.id} bind:group={slot} />
							<span>{s.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>

			{#if error}<p class="error" role="alert" in:rise={{ y: 6 }}>{error}</p>{/if}

			<div class="foot">
				<div class="servings">
					<label for="plan-servings">Servings</label>
					<div class="stepper">
						<button type="button" aria-label="Fewer servings" disabled={servings <= 1} onclick={() => (servings = Math.max(1, servings - 1))}>
							<Icon name="minus" size={16} />
						</button>
						<input id="plan-servings" type="number" name="servings" inputmode="numeric" class="tnum" bind:value={servings} />
						<button type="button" aria-label="More servings" onclick={() => (servings = (servings || 0) + 1)}>
							<Icon name="plus" size={16} />
						</button>
					</div>
				</div>
				<Button type="submit" disabled={submitting}>Add to plan</Button>
			</div>
		</form>
	{/if}
</Sheet>

<style>
	form,
	.done {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	legend {
		margin-block-end: var(--s-2);
		padding: 0;
		font-size: var(--t-kicker);
		font-weight: 500;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.week {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
	}

	.range {
		font-family: var(--font-display);
		font-size: 19px;
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 6px;
	}

	.day {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding-block: 10px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--white);
		cursor: pointer;
		transition:
			background-color var(--d-fast) var(--ease-out),
			color var(--d-fast) var(--ease-out),
			border-color var(--d-fast) var(--ease-out),
			transform var(--d-fast) var(--ease-out);
	}

	.day:active,
	.slot:active {
		transform: scale(0.95);
	}

	.dow {
		font-size: 12px;
		font-weight: 500;
		color: var(--ink-2);
	}

	.dom {
		font-family: var(--font-display);
		font-size: 20px;
		line-height: 1.1;
	}

	.day.today::after {
		content: '';
		position: absolute;
		inset-block-end: 5px;
		inline-size: 4px;
		block-size: 4px;
		border-radius: var(--r-pill);
		background: var(--brick);
	}

	.day:has(:checked) {
		border-color: var(--dark);
		background: var(--dark);
		color: var(--on-dark);
	}

	.day:has(:checked) .dow {
		color: var(--on-dark);
	}

	.day:has(:checked)::after {
		background: var(--on-dark);
	}

	.slots {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.slot {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		padding: 0 18px;
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color var(--d-fast) var(--ease-out),
			color var(--d-fast) var(--ease-out),
			border-color var(--d-fast) var(--ease-out),
			transform var(--d-fast) var(--ease-out);
	}

	.slot:has(:checked) {
		border-color: var(--olive);
		background: var(--olive);
		color: var(--on-dark);
	}

	.day:has(:focus-visible),
	.slot:has(:focus-visible) {
		box-shadow: var(--focus-ring);
	}

	.error {
		padding: var(--s-3) var(--s-4);
		border-radius: var(--r-sm);
		background: var(--brick-soft);
		color: var(--brick);
		font-size: 14px;
		font-weight: 500;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		padding-block-start: var(--s-4);
		border-block-start: 1px solid var(--line);
	}

	.servings {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	.servings label {
		font-size: 13px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.stepper {
		display: flex;
		align-items: center;
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: var(--white);
	}

	.stepper button {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 44px;
		border: 0;
		background: none;
		color: var(--ink);
	}

	.stepper button:disabled {
		color: var(--stone);
	}

	.stepper input {
		inline-size: 3ch;
		border: 0;
		background: none;
		font-size: 16px;
		font-weight: 600;
		text-align: center;
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.stepper input::-webkit-inner-spin-button,
	.stepper input::-webkit-outer-spin-button {
		appearance: none;
		margin: 0;
	}

	.tick {
		display: grid;
		place-items: center;
		inline-size: 48px;
		block-size: 48px;
		border-radius: var(--r-pill);
		background: var(--olive);
		color: var(--on-dark);
		animation: tick var(--d-slow) var(--ease-spring) both;
	}

	.done-text {
		font-size: 17px;
	}

	@keyframes tick {
		from {
			transform: scale(0.4);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tick {
			animation: none;
		}
	}
</style>
