<script lang="ts" module>
	import { addDays } from '#lib/dates.ts';
	import type { IsoDate } from '#lib/types.ts';

	const label = (date: string, options: Intl.DateTimeFormatOptions) =>
		new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...options });

	// ISO week: the one that holds the Thursday
	export function weekNumber(monday: IsoDate): number {
		const thursday = new Date(`${addDays(monday, 3)}T00:00:00Z`);
		const jan1 = Date.UTC(thursday.getUTCFullYear(), 0, 1);
		return Math.ceil(((thursday.getTime() - jan1) / 864e5 + 1) / 7);
	}

	// "19 – 25 October", "28 September – 4 October"; the year only when it differs from today's
	export function weekRange(monday: IsoDate, today: IsoDate): string {
		const sunday = addDays(monday, 6);
		const day = (d: IsoDate) => Number(d.slice(8));
		const month = (d: IsoDate) => label(d, { month: 'long' });
		const year = sunday.slice(0, 4) === today.slice(0, 4) ? '' : ` ${sunday.slice(0, 4)}`;
		return month(monday) === month(sunday)
			? `${day(monday)} – ${day(sunday)} ${month(sunday)}${year}`
			: `${day(monday)} ${month(monday)} – ${day(sunday)} ${month(sunday)}${year}`;
	}
</script>

<script lang="ts">
	import { SLOTS, type PlanEntry, type Slot } from '#lib/types.ts';
	import SlotView from './Slot.svelte';

	let {
		days,
		today,
		entries,
		onadd
	}: {
		days: IsoDate[];
		today: IsoDate;
		entries: PlanEntry[];
		onadd: (date: IsoDate, slot: Slot) => void;
	} = $props();

	const inSlot = (date: IsoDate, slot: Slot) => entries.filter((e) => e.date === date && e.slot === slot);
</script>

<div class="week">
	{#each days as date, i (date)}
		{@const long = label(date, { weekday: 'long' })}
		<section
			class="day"
			class:today={date === today}
			data-day={date}
			data-today={date === today ? '' : undefined}
			aria-labelledby="day-{date}"
			style:grid-column={i + 1}
		>
			<div class="day-head">
				<h2 id="day-{date}">
					<span class="short" aria-hidden="true">{label(date, { weekday: 'short' })}</span>
					<span class="long">{long}</span>
				</h2>
				<span class="num tnum">{Number(date.slice(8))}<span class="month">{label(date, { month: 'short' })}</span></span>
				{#if date === today}<span class="today-chip">Today</span>{/if}
			</div>
			<div class="slots">
				{#each SLOTS as slot, s (slot.id)}
					<SlotView {date} dayName={long} {slot} index={s} entries={inSlot(date, slot.id)} {onadd} />
				{/each}
			</div>
		</section>
	{/each}
	{#each SLOTS as slot, s (slot.id)}
		<p class="slot-label" style:grid-row={s * 2 + 2} aria-hidden="true"><span>{slot.label}</span></p>
	{/each}
</div>

<style>
	.week {
		display: flex;
		flex-direction: column;
		gap: var(--s-6);
	}

	.slot-label {
		display: none;
	}

	.day-head {
		display: flex;
		align-items: baseline;
		gap: var(--s-3);
		margin-block-end: var(--s-3);
	}

	h2 {
		font-size: var(--t-display-3);
	}

	.short {
		display: none;
	}

	.num {
		font-size: 14px;
		color: var(--ink-2);
	}

	.month {
		margin-inline-start: 0.3em;
	}

	.today-chip {
		margin-inline-start: auto;
		padding: 4px 12px;
		border-radius: var(--r-pill);
		background: var(--brick);
		color: var(--white);
		font-size: 12px;
		font-weight: 600;
		animation: chip-in var(--d-slow) var(--ease-spring) both;
	}

	.slots {
		position: relative;
		padding: 4px var(--s-4);
		border-radius: var(--r-card);
		background: var(--surface);
		box-shadow: var(--shadow-card);
	}

	/* the ring fades in on its own layer: a box-shadow keyframe would animate paint, not opacity */
	.today .slots::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: 0 0 0 2px var(--brick);
		pointer-events: none;
		animation: ring-in var(--d-slow) var(--ease-out) both;
	}

	@keyframes chip-in {
		from {
			opacity: 0;
			transform: scale(0.6);
		}
	}

	@keyframes ring-in {
		from {
			opacity: 0;
		}
	}

	@media (min-width: 1024px) {
		.week {
			position: relative;
			isolation: isolate;
			display: grid;
			grid-template-columns: repeat(7, minmax(0, 1fr));
			grid-template-rows: auto repeat(4, auto auto);
			gap: 0 8px;
			padding: var(--s-3) var(--s-3) var(--s-4);
			border-radius: var(--r-panel);
			background: var(--surface);
			box-shadow: var(--shadow-card);
		}

		.day {
			position: relative;
			grid-row: 1 / span 9;
			display: grid;
			grid-template-rows: subgrid;
			min-inline-size: 0;
		}

		.day.today::before {
			content: '';
			position: absolute;
			inset: -4px -4px -8px;
			z-index: -1;
			border-radius: var(--r-md);
			background: var(--brick-soft);
			transform-origin: top;
			animation: band-in var(--d-slow) var(--ease-out) both;
		}

		.day-head {
			grid-row: 1;
			justify-content: space-between;
			align-items: center;
			margin: 0;
			padding: 6px 8px 10px;
		}

		h2 {
			font-family: var(--font-text);
			font-size: 11px;
			font-weight: 600;
			letter-spacing: 0.14em;
			text-transform: uppercase;
			color: var(--ink-2);
		}

		.today h2 {
			color: var(--brick);
		}

		.short {
			display: inline;
		}

		.long {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}

		.num {
			display: grid;
			place-items: center;
			inline-size: 32px;
			block-size: 32px;
			border-radius: var(--r-pill);
			font-family: var(--font-display);
			font-size: 18px;
			color: var(--ink);
		}

		.month,
		.today-chip {
			display: none;
		}

		.today .num {
			background: var(--brick);
			color: var(--white);
			animation: num-in var(--d-slow) var(--ease-spring) 120ms both;
		}

		.slots {
			display: contents;
		}

		.today .slots::after {
			content: none;
		}

		.slot-label {
			grid-column: 1 / -1;
			display: flex;
			align-items: center;
			gap: 10px;
			margin: 10px 4px 6px;
			font-size: 10px;
			font-weight: 600;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			color: var(--ink-2);
			pointer-events: none;
		}

		.slot-label::after {
			content: '';
			flex: 1;
			block-size: 1px;
			background: var(--line);
		}

		@keyframes band-in {
			from {
				opacity: 0;
				transform: scaleY(0.94);
			}
		}

		@keyframes num-in {
			from {
				opacity: 0;
				transform: scale(0.5);
			}
		}
	}
</style>
