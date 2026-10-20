<script lang="ts">
	import { fly } from 'svelte/transition';
	import { reducedMotion } from '#lib/motion.ts';
	import { SLOTS, type IsoDate, type PlanEntry, type Slot } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
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
					<label class="choice day" class:today={d === today}>
						<input
							type="radio"
							name="date"
							value={d}
							aria-label="{day(d, 'long')} {Number(d.slice(8))}"
							bind:group={date}
							use:focus={d === start}
						/>
						<span class="wd" aria-hidden="true">{day(d, 'short')}</span>
						<span class="num tnum" aria-hidden="true">{Number(d.slice(8))}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<fieldset>
			<legend>Meal</legend>
			<div class="slots">
				{#each SLOTS as s (s.id)}
					<label class="choice">
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
				<Button variant="secondary" arrow={false} onclick={onclose}>Cancel</Button>
				<Button type="submit">Move here</Button>
			</div>
		</div>
	</form>
</Sheet>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		margin: 0;
		padding: 0;
		border: 0;
		min-inline-size: 0;
	}

	legend {
		padding: 0;
		margin-block-end: var(--s-2);
		font-size: var(--t-kicker);
		font-weight: 600;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 6px;
	}

	.slots {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 6px;
	}

	.choice {
		position: relative;
		isolation: isolate;
		display: grid;
		place-items: center;
		align-content: center;
		min-block-size: 48px;
		padding: 6px 4px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
		cursor: pointer;
		transition:
			color var(--d-fast) var(--ease-out),
			border-color var(--d-fast) var(--ease-out),
			transform var(--d-fast) var(--ease-out);
	}

	/* the fill grows out of the chip when it is picked */
	.choice::before {
		content: '';
		position: absolute;
		inset: -1px;
		z-index: -1;
		border-radius: inherit;
		background: var(--olive);
		opacity: 0;
		transform: scale(0.6);
		transition:
			opacity var(--d-fast) var(--ease-out),
			transform var(--d-base) var(--ease-spring);
	}

	.choice:hover {
		transform: translateY(-1px);
	}

	.choice:has(:checked) {
		border-color: var(--olive);
		color: var(--white);
	}

	.choice:has(:checked)::before {
		opacity: 1;
		transform: none;
	}

	.choice:has(:focus-visible) {
		box-shadow: var(--focus-ring);
	}

	/* the native radio stays the click target and the focus, the chip is its face */
	.choice input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.day {
		min-block-size: 60px;
		gap: 2px;
	}

	.wd {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-2);
		transition: color var(--d-fast) var(--ease-out);
	}

	.day.today .wd {
		color: var(--brick);
	}

	.day:has(:checked) .wd {
		color: var(--olive-soft);
	}

	.num {
		font-family: var(--font-display);
		font-size: 20px;
		line-height: 1;
	}

	.foot {
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		padding-block-start: var(--s-3);
		border-block-start: 1px solid var(--line);
	}

	.where {
		display: grid;
		font-size: 14px;
		color: var(--ink-2);
	}

	.where > span {
		grid-area: 1 / 1;
	}

	.where strong {
		font-weight: 600;
		color: var(--ink);
	}

	.actions {
		display: flex;
		justify-content: space-between;
		gap: var(--s-3);
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

		.actions {
			justify-content: flex-end;
		}
	}
</style>
