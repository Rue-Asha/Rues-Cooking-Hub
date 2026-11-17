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
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { arriveInPlace } from '#lib/motion.ts';
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
	const none = (date: IsoDate) => !entries.some((e) => e.date === date);

	// A day's last entry fades out in the day's full layout; only once it is gone does the day turn compact, and its add
	// chips settle into their new places. Marked before the DOM updates: the outro only reports its start a frame later.
	// Under reduced motion the outro ends at once and the day turns compact before the next paint.
	const fading = new SvelteSet<IsoDate>();
	let before = untrack(() => entries);
	$effect.pre(() => {
		const now = entries;
		for (const date of untrack(() => days)) if (before.some((e) => e.date === date) && !now.some((e) => e.date === date)) fading.add(date);
		before = now;
	});
	const compact = (date: IsoDate) => none(date) && !fading.has(date);

	function chips(day: HTMLElement, empty: boolean) {
		let was = empty;
		return {
			update(now: boolean) {
				if (now && !was) arriveInPlace([...day.querySelectorAll('.slot-add')]);
				was = now;
			}
		};
	}

	// below the posture switch the stacked week opens on today; a week without it starts at Monday. Only a newly shown
	// week scrolls: an add or a move hands in a new `days` array for the same week and must leave the page where it is.
	let shown = '';
	$effect(() => {
		const monday = days[0];
		if (!monday || monday === shown) return;
		shown = monday;
		if (!matchMedia('(max-width: 1023px)').matches || location.search.includes('add=1')) return;
		document.querySelector('.day[aria-current="date"]')?.scrollIntoView({ block: 'start' });
	});
</script>

<nav class="jump" aria-label="Jump to a day">
	{#each days as date (date)}
		<a
			href="#day-{date}"
			class="chip"
			aria-current={date === today ? 'date' : undefined}
			aria-label="{label(date, { weekday: 'long' })} {Number(date.slice(8))}"
			data-press="round"
		>
			<span class="wd">{label(date, { weekday: 'short' })}</span><span class="n">{Number(date.slice(8))}</span>
		</a>
	{/each}
</nav>

<div class="week card">
	<div class="cols" aria-hidden="true">
		<span></span>
		{#each SLOTS as slot (slot.id)}<span class="ruled">{slot.label}</span>{/each}
	</div>
	<div class="days">
		{#each days as date (date)}
			{@const long = label(date, { weekday: 'long' })}
			<section
				class="day"
				id="day-{date}"
				aria-labelledby="day-name-{date}"
				aria-current={date === today ? 'date' : undefined}
				data-day={date}
				data-today={date === today ? '' : undefined}
				data-surface={date === today ? 'inverse' : undefined}
				data-empty={compact(date) ? '' : undefined}
				use:chips={compact(date)}
			>
				<div class="day-head">
					<h2 id="day-name-{date}" class="day-name">
						<span class="wd" aria-hidden="true">{label(date, { weekday: 'short' })}</span>
						<span class="sr-only">{long}</span>
					</h2>
					<span class="dn">{Number(date.slice(8))}</span>
					{#if date === today}<span class="today-tag">Today</span>{/if}
				</div>
				{#each SLOTS as slot (slot.id)}
					<SlotView {date} dayName={long} {slot} entries={inSlot(date, slot.id)} {onadd} ongone={() => fading.delete(date)} />
				{/each}
			</section>
		{/each}
	</div>
</div>

<style>
	.jump {
		position: sticky;
		inset-block-start: var(--space-3);
		z-index: var(--z-rail);
		display: flex;
		justify-content: space-between;
		gap: var(--space-0-5);
		margin-block-end: var(--space-3);
		padding: var(--space-1);
		border-radius: var(--radius-pill);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
	}

	.chip {
		display: grid;
		justify-items: center;
		align-content: center;
		flex: 1 1 0;
		/* seven day chips share 276 px at 320: they may go below the touch size, never below the AA floor */
		min-inline-size: var(--target-min);
		min-block-size: var(--target-touch);
		padding: var(--space-0-5) 0;
		border-radius: var(--radius-pill);
		color: var(--ink);
		font-size: var(--type-overline-size);
		line-height: 1.15;
		text-decoration: none;
	}

	.chip .wd {
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
	}

	.chip .n {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-title-size);
		font-variant-numeric: var(--numeric-figures);
	}

	.chip[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.chip:focus-visible[aria-current] {
		outline-color: var(--focus-ring-on-inverse);
	}

	.week {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
		padding: 0;
		background: none;
		box-shadow: none;
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}

	.cols {
		display: none;
	}

	.days {
		display: grid;
		gap: var(--space-3);
		grid-template-columns: minmax(0, 1fr);
	}

	.day {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
		padding: var(--space-4) var(--space-3) var(--space-3);
		border-radius: var(--radius-card-s);
		background: var(--surface-card);
		box-shadow: var(--elevation-card);
		scroll-margin-block-start: calc(var(--target-touch) + var(--space-8));
	}

	.day[data-surface='inverse'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.day-head {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		padding: 0 var(--space-1) var(--space-1);
		font-family: var(--font-ui);
	}

	/* the weekday is an overline in the UI face, not a display heading */
	.day-name {
		font-family: var(--font-ui);
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
	}

	.day-name .wd {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}

	.dn {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
		font-variant-numeric: var(--numeric-figures);
	}

	.today-tag {
		margin-inline-start: auto;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-on-inverse-secondary);
	}

	[data-surface='inverse'] .day-name .wd {
		color: var(--ink-on-inverse-secondary);
	}

	.day > :global(.slot + .slot) {
		padding-block-start: var(--space-1);
	}

	/* a day with nothing in it is compact: four labelled add controls in two rows, no slot names */
	.day[data-empty] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.day[data-empty] .day-head {
		grid-column: 1 / -1;
	}

	.day[data-empty] > :global(.slot) {
		display: contents;
	}

	.day[data-empty] :global(.slot-name) {
		display: none;
	}

	.day[data-empty] :global(.slot-add) {
		grid-area: auto;
		inline-size: auto;
		justify-content: flex-start;
		padding-inline: var(--space-3);
	}

	.day[data-empty] :global(.add-text) {
		display: inline;
	}

	/* the posture switch: from 1024 px the week is a table, a day per row */
	@media (min-width: 1024px) {
		.jump {
			display: none;
		}

		.week {
			gap: var(--space-2);
			padding: var(--space-4) var(--space-3) var(--space-3);
			background: var(--surface-card);
			box-shadow: var(--elevation-card);
			-webkit-backdrop-filter: var(--glass-filter);
			backdrop-filter: var(--glass-filter);
		}

		.cols,
		.day,
		.day[data-empty] {
			display: grid;
			grid-template-columns: 3.5rem repeat(4, minmax(0, 1fr));
			column-gap: var(--space-2);
		}

		/* the slot names stay in view while the week scrolls, below the sticky capsule (--sticky-block-start, 1100 px up) */
		.cols {
			position: sticky;
			inset-block-start: calc(var(--sticky-block-start, 0px) + var(--space-2));
			z-index: var(--z-raised);
			padding: var(--space-2);
			border-radius: var(--radius-item);
			/* the card's own surface: no band at rest, and still covers the days once it sticks */
			background: var(--surface-card);
		}

		.cols .ruled {
			color: var(--ink);
		}

		.days {
			gap: 0;
		}

		.day,
		.day[data-empty] {
			align-items: start;
			padding: var(--space-2-5) var(--space-2);
			border-radius: 0;
			background: none;
			box-shadow: var(--rule-below);
			scroll-margin-block-start: var(--space-4);
		}

		.day:last-child {
			box-shadow: none;
		}

		.day[data-surface='inverse'] {
			background: var(--surface-inverse);
			border-radius: var(--radius-panel);
			box-shadow: none;
		}

		.day:has(+ .day[data-surface='inverse']) {
			box-shadow: none;
		}

		.day-head,
		.day[data-empty] .day-head {
			grid-column: auto;
			display: grid;
			justify-items: start;
			align-content: start;
			gap: var(--space-0-5);
			padding: var(--space-1) 0 0;
		}

		.today-tag {
			margin-inline-start: 0;
		}

		.day > :global(.slot),
		.day[data-empty] > :global(.slot) {
			display: grid;
		}

		.day[data-empty] :global(.slot-name) {
			display: block;
		}

		.day[data-empty] :global(.slot-add) {
			justify-self: start;
		}

		.day :global(.add-text),
		.day[data-empty] :global(.add-text) {
			display: none;
		}

		.day > :global(.slot + .slot) {
			padding-block-start: 0;
		}
	}
</style>
