<script lang="ts">
	import { page } from '$app/state';
	import Button from '../shell/Button.svelte';
	import AddSlot from '../overlays/AddSlot.svelte';
	import Icon from '../overlays/Icon.svelte';
	import MoveTo from '../overlays/MoveTo.svelte';
	import Entry from './Entry.svelte';
	import { SLOTS, type PlanEntry, type PlanView } from './data.ts';

	let { view }: { view: PlanView } = $props();

	// the week is live: entries can be deleted, edited and moved; nothing is saved
	const seed = () => $state.snapshot(view.days);
	let days = $state(seed());
	$effect(() => {
		days = $state.snapshot(view.days);
	});

	let addOpen = $state(false);
	let moveOpen = $state(false);
	let target = $state({ day: 0, slot: 2 });
	let moving = $state<{ day: number; slot: number; at: number } | null>(null);
	const slotName = (d: number, s: number) => `${days[d].weekday} · ${SLOTS[s].label}`;
	const days7 = $derived(days.map((d) => ({ short: d.short, weekday: d.weekday, day: d.day })));
	const todayIndex = $derived(days.findIndex((d) => d.today));
	const shown = $derived(page.url.searchParams.get('week'));

	// the phone "+" opens the Add dialog for today's Dinner, else Monday Dinner of the shown week
	$effect(() => {
		if (page.url.searchParams.get('add') === '1') {
			target = { day: todayIndex === -1 ? 0 : todayIndex, slot: 2 };
			addOpen = true;
		}
	});

	// below the posture switch the stacked week opens on today
	$effect(() => {
		if (!matchMedia('(max-width: 1023px)').matches || page.url.searchParams.get('add') === '1') return;
		document.querySelector('.day[aria-current="date"]')?.scrollIntoView({ block: 'start' });
	});

	function openAdd(d: number, s: number) {
		target = { day: d, slot: s };
		addOpen = true;
	}
	function drop(d: number, s: number, at: number) {
		days[d].slots[SLOTS[s].id].splice(at, 1);
	}
	function movedTo(dayShort: string, meal: string) {
		if (!moving) return;
		const from = days[moving.day].slots[SLOTS[moving.slot].id];
		const [entry] = from.splice(moving.at, 1);
		const di = days.findIndex((d) => d.short === dayShort);
		const sid = SLOTS.find((s) => s.label === meal)!.id;
		days[di].slots[sid].push(entry);
		moving = null;
	}
	const movingEntry = $derived<PlanEntry | undefined>(moving ? days[moving.day].slots[SLOTS[moving.slot].id][moving.at] : undefined);
	const empty = (d: (typeof days)[number]) => SLOTS.every((s) => d.slots[s.id].length === 0);
	const dayLabel = (d: (typeof days)[number]) => `${d.weekday} ${d.day}`;
</script>

<nav class="jump" aria-label="Jump to a day" data-shown={shown}>
	{#each days as d (d.short)}
		<a href="#day-{d.short.toLowerCase()}" class="chip" aria-current={d.today ? 'date' : undefined} aria-label={dayLabel(d)} data-press="round">
			<span class="wd">{d.short}</span><span class="n">{d.day}</span>
		</a>
	{/each}
</nav>

<section class="week card" aria-labelledby="week-title" data-week={view.kind}>
	<h2 class="sr-only" id="week-title">Week {view.weekNumber}, {view.range}</h2>
	<div class="cols" aria-hidden="true">
		<span></span>
		{#each SLOTS as s (s.id)}<span class="ruled">{s.label}</span>{/each}
	</div>
	<ol class="days">
		{#each days as d, di (d.short)}
			<li class="day" id="day-{d.short.toLowerCase()}" aria-current={d.today ? 'date' : undefined} data-surface={d.today ? 'inverse' : undefined} data-empty={empty(d) || undefined}>
				<h3 class="day-name">
					<span class="wd">{d.short}<span class="sr-only">{d.weekday.slice(3)}</span></span>
					<span class="dn">{d.day}</span>
					{#if d.today}<span class="today-tag">Today</span>{/if}
				</h3>
				{#each SLOTS as s, si (s.id)}
					{@const entries = d.slots[s.id]}
					<div class="slot" role="group" aria-label="{d.weekday} {s.label}" data-filled={entries.length > 0 || undefined}>
						<h4 class="slot-name ruled">{s.label}</h4>
						{#if entries.length}
							<ul class="entries">
								{#each entries as e, i (e.id)}
									<Entry
										entry={e}
										onmove={() => {
											moving = { day: di, slot: si, at: i };
											moveOpen = true;
										}}
										ondelete={() => drop(di, si, i)}
									/>
								{/each}
							</ul>
						{/if}
						<Button variant="quiet" size="s" class="slot-add" label="Add to {d.weekday} {s.label}" onclick={() => openAdd(di, si)}>
							<Icon name="plus" /><span class="add-text">{s.label}</span>
						</Button>
					</div>
				{/each}
			</li>
		{/each}
	</ol>
</section>

<AddSlot live bind:open={addOpen} where={slotName(target.day, target.slot)} recipes={view.recipes.slice(0, 12)} />
{#if movingEntry && moving}
	<MoveTo live bind:open={moveOpen} entry={movingEntry.title} days={days7} currentDay={days[moving.day].short} currentMeal={SLOTS[moving.slot].label} onmove={movedTo} />
{/if}

<style>
	.jump {
		position: sticky;
		inset-block-start: var(--space-3);
		z-index: var(--z-rail);
		display: flex;
		justify-content: space-between;
		gap: var(--space-0-5);
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
		min-inline-size: var(--target-touch);
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
		box-shadow: var(--focus-halo);
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
		margin: 0;
		padding: 0;
		list-style: none;
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
		box-shadow: var(--shadow-lift);
	}
	.day-name {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		padding: 0 var(--space-1) var(--space-1);
		font-family: var(--font-ui);
	}
	.day-name .wd {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
	.day-name .dn {
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
	.slot {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas: 'name add' 'list list';
		align-items: center;
		gap: var(--space-1) var(--space-2);
		min-inline-size: 0;
		padding-inline-start: var(--space-1);
		container: slot / inline-size;
	}
	.slot + .slot {
		padding-block-start: var(--space-1);
	}
	.slot-name {
		grid-area: name;
		color: var(--ink-secondary);
		min-inline-size: 0;
	}
	[data-surface='inverse'] .slot-name {
		color: var(--ink-on-inverse-secondary);
	}
	.slot[data-filled] .slot-name {
		color: var(--ink);
	}
	[data-surface='inverse'] .slot[data-filled] .slot-name {
		color: var(--ink-on-inverse);
	}
	.entries {
		grid-area: list;
		display: grid;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0 0 var(--space-1-5);
		list-style: none;
	}
	.slot :global(.slot-add) {
		grid-area: add;
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
	}
	[data-surface='inverse'] .slot :global(.slot-add) {
		box-shadow: var(--ring-on-inverse);
		color: var(--ink-on-inverse-secondary);
	}
	.add-text {
		display: none;
	}
	/* a day with nothing in it is compact: four labelled add controls in two rows, no slot names */
	.day[data-empty] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.day[data-empty] .day-name {
		grid-column: 1 / -1;
	}
	.day[data-empty] .slot {
		display: contents;
	}
	.day[data-empty] .slot-name {
		display: none;
	}
	.day[data-empty] .slot :global(.slot-add) {
		grid-area: auto;
		inline-size: auto;
		justify-content: flex-start;
		padding-inline: var(--space-3);
	}
	.day[data-empty] .add-text {
		display: inline;
	}

	@media (min-width: 768px) {
		.days {
			grid-template-columns: minmax(0, 1fr);
		}
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
		.cols {
			padding: 0 var(--space-2) var(--space-2);
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
		.day-name,
		.day[data-empty] .day-name {
			grid-column: auto;
			display: grid;
			align-content: start;
			gap: var(--space-0-5);
			padding: var(--space-1) 0 0;
		}
		.today-tag {
			margin-inline-start: 0;
		}
		.slot,
		.day[data-empty] .slot {
			display: grid;
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas: none;
			align-content: start;
			gap: var(--space-1-5);
			padding: 0;
		}
		.slot + .slot {
			padding-block-start: 0;
		}
		.slot-name,
		.day[data-empty] .slot-name {
			display: block;
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
		.entries,
		.slot :global(.slot-add) {
			grid-area: auto;
		}
		.entries {
			padding: 0;
		}
		.slot :global(.slot-add),
		.day[data-empty] .slot :global(.slot-add) {
			justify-self: start;
			inline-size: auto;
			padding-inline: var(--space-3);
		}
		.add-text,
		.day[data-empty] .add-text {
			display: none;
		}
	}
</style>
