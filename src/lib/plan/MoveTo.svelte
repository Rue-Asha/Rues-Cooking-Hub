<script lang="ts">
	import { fly } from 'svelte/transition';
	import { reducedMotion } from '#lib/motion.ts';
	import { SLOTS, type IsoDate, type PlanEntry, type Slot } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import type { Place } from './dnd.ts';
	import Sheet from './Sheet.svelte';

	let {
		entry,
		days,
		today,
		onmove,
		onclose
	}: {
		entry: PlanEntry | null;
		days: IsoDate[];
		today: IsoDate;
		onmove: (to: Place) => void;
		onclose: () => void;
	} = $props();

	// the sheet keeps its title while it animates out, after the parent has cleared the entry
	let current = $state<PlanEntry | null>(null);
	let date = $state<IsoDate>('');
	let slot = $state<Slot>('dinner');

	$effect(() => {
		if (!entry) return;
		current = entry;
		date = days.includes(entry.date) ? entry.date : days[0];
		slot = entry.slot;
	});

	const title = $derived(current?.recipe?.title ?? current?.text ?? '');
	const day = (d: IsoDate, weekday: 'short' | 'long') =>
		new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { weekday, timeZone: 'UTC' });
	const where = $derived(`${day(date || days[0], 'long')} · ${SLOTS.find((s) => s.id === slot)?.label}`);
	const unchanged = $derived(current !== null && current.date === date && current.slot === slot);
	const start = $derived(entry && days.includes(entry.date) ? entry.date : days[0]);

	// the day the entry sits on takes the focus, so the arrow keys pick another one straight away
	function focus(node: HTMLInputElement, on: boolean) {
		if (!on) return;
		const frame = requestAnimationFrame(() => node.focus({ preventScroll: true }));
		return { destroy: () => cancelAnimationFrame(frame) };
	}
</script>

<Sheet open={entry !== null} kicker={title} title="Move to…" label="Move {title}" {onclose}>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			onmove({ date, slot });
		}}
	>
		<fieldset>
			<legend>Day</legend>
			<div class="days">
				{#each days as d (d)}
					<label class="chip day" class:today={d === today}>
						<input
							type="radio"
							name="date"
							value={d}
							aria-label="{day(d, 'long')} {Number(d.slice(8))}"
							bind:group={date}
							use:focus={d === start}
						/>
						<span aria-hidden="true">{day(d, 'short')}</span>
						<span class="sub figures" aria-hidden="true">{Number(d.slice(8))}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<fieldset>
			<legend>Meal</legend>
			<div class="slots">
				{#each SLOTS as s (s.id)}
					<label class="chip">
						<input type="radio" name="slot" value={s.id} bind:group={slot} />
						<span>{s.label}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<div class="foot">
			<p class="where" aria-live="polite">
				{#key where}
					<span in:fly={{ y: reducedMotion() ? 0 : 8, duration: reducedMotion() ? 0 : 220 }}>
						{unchanged ? 'To the end of' : 'Into'} <strong>{where}</strong>
					</span>
				{/key}
			</p>
			<div class="actions">
				<Button variant="quiet" onclick={onclose}>Cancel</Button>
				<Button type="submit" variant="primary">Move here</Button>
			</div>
		</div>
	</form>
</Sheet>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		border: 0;
		min-inline-size: 0;
	}

	legend {
		padding: 0;
		margin-block-end: var(--space-2);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		color: var(--ink);
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

	/* the native radio stays the click target and the focus, the chip is its face */
	.chip input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.foot {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-block-start: var(--space-3);
		box-shadow: var(--sheet-footer-rule);
	}

	.where {
		display: grid;
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		color: var(--ink-secondary);
	}

	.where > span {
		grid-area: 1 / 1;
	}

	.where strong {
		font-weight: var(--weight-semibold);
		color: var(--ink);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
	}

	@media (max-width: 479px) {
		.slots {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 768px) {
		.foot {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}
</style>
