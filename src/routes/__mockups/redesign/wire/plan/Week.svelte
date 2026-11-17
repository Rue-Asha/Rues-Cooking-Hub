<script lang="ts">
	import Icon from '../overlays/Icon.svelte';
	import Entry from './Entry.svelte';
	import { SLOTS, type PlanView } from './data.ts';

	let { view }: { view: PlanView } = $props();

	$effect(() => {
		if (!matchMedia('(max-width: 1023px)').matches) return;
		document.querySelector('[aria-current="date"].day')?.scrollIntoView({ block: 'start' });
	});
</script>

<nav class="jump" aria-label="Jump to a day">
	{#each view.days as d (d.short)}
		<a href="#day-{d.short.toLowerCase()}" class="chip" aria-current={d.today ? 'date' : undefined}>
			<span>{d.short}</span><span class="n">{d.day}</span>
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
		{#each view.days as d (d.short)}
			<li class="day" id="day-{d.short.toLowerCase()}" aria-current={d.today ? 'date' : undefined} data-empty={d.empty || undefined}>
				<h3 class="day-name">
					<span class="wd">{d.short}<span class="sr-only">{d.weekday.slice(3)}</span></span>
					<span class="dn">{d.day}</span>
					{#if d.today}<span class="today">Today</span>{/if}
				</h3>
				{#each SLOTS as s (s.id)}
					{@const entries = d.slots[s.id]}
					<div class="slot" role="group" aria-label="{d.weekday} {s.label}" data-filled={entries.length > 0 || undefined}>
						<h4 class="slot-name">{s.label}</h4>
						{#if entries.length}
							<ul class="entries">
								{#each entries as e, i (i)}<Entry entry={e} />{/each}
							</ul>
						{/if}
						<button type="button" class="add" aria-label="Add to {d.weekday} {s.label}">
							<Icon name="plus" /><span class="add-text">{s.label}</span>
						</button>
					</div>
				{/each}
			</li>
		{/each}
	</ol>
</section>

<style>
	.jump { display: flex; justify-content: space-between; gap: var(--space-1); padding: var(--space-1); border-radius: var(--radius-pill); background: var(--surface-raised); box-shadow: var(--ring-hairline); overflow-x: auto; }
	.chip {
		display: grid;
		justify-items: center;
		flex: 1 0 auto;
		min-inline-size: var(--target-touch);
		min-block-size: var(--target-touch);
		padding: var(--space-1) var(--space-1-5);
		border-radius: var(--radius-pill);
		color: var(--ink);
		font-size: var(--type-caption-size);
		line-height: 1.2;
		text-decoration: none;
	}
	.chip .n { font-weight: var(--weight-semibold); font-variant-numeric: var(--numeric-figures); }
	.chip[aria-current] { background: var(--surface-inverse); color: var(--ink-on-inverse); }

	.week { display: grid; gap: var(--space-3); padding: var(--space-4); min-inline-size: 0; }
	.cols { display: none; }
	.days { display: grid; gap: var(--space-3); margin: 0; padding: 0; list-style: none; }
	.day {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		scroll-margin-block-start: var(--space-4);
		min-inline-size: 0;
	}
	.day-name { display: flex; align-items: baseline; gap: var(--space-2); font-family: var(--font-ui); font-size: var(--type-title-size); line-height: var(--type-title-line); font-weight: var(--type-title-weight); }
	.dn { font-variant-numeric: var(--numeric-figures); }
	.today { padding: var(--space-0-5) var(--space-2-5); border-radius: var(--radius-pill); background: var(--surface-inverse); color: var(--ink-on-inverse); font-size: var(--type-caption-size); font-weight: var(--weight-medium); }
	.slot {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas: 'name add' 'entries entries';
		align-items: center;
		gap: var(--space-1-5) var(--space-2);
		min-inline-size: 0;
		container-type: inline-size;
	}
	.slot-name {
		grid-area: name;
		font-family: var(--font-ui);
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
		padding-inline-start: var(--space-3);
		box-shadow: var(--rule-start);
	}
	.slot:not([data-filled]) .slot-name { box-shadow: none; }
	.entries { grid-area: entries; display: grid; gap: var(--space-1); margin: 0; padding: 0; list-style: none; }
	.add {
		grid-area: add;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1-5);
		inline-size: var(--target-touch);
		min-block-size: var(--target-touch);
		padding: 0;
		border: var(--stroke-hairline) dashed var(--edge-control);
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
	}
	.add :global(svg) { inline-size: 18px; block-size: 18px; }
	.add-text { display: none; }

	/* a day with nothing in it is compact: the four add controls in two rows, no slot names */
	.day[data-empty] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	.day[data-empty] .slot { display: contents; }
	.day[data-empty] .slot-name { display: none; }
	.day[data-empty] .day-name { grid-column: 1 / -1; }
	.day[data-empty] .add { grid-area: auto; inline-size: auto; border-radius: var(--radius-panel); border-style: solid; border-color: var(--hairline); padding-inline: var(--space-3); }
	.day[data-empty] .add-text { display: inline; }
	.day[aria-current] { box-shadow: var(--ring-control); }
	.day[aria-current] .day-name .wd, .day[aria-current] .dn { font-weight: var(--weight-bold); }

	@media (min-width: 1024px) {
		.jump { display: none; }
		.week { gap: var(--space-2); padding: var(--space-5); }
		.cols, .day, .day[data-empty] { display: grid; grid-template-columns: 5.5rem repeat(4, minmax(0, 1fr)); gap: var(--space-3); }
		.cols { padding-inline: var(--space-3); }
		.cols .ruled { box-shadow: var(--rule-start); }
		.days { gap: var(--space-2); }
		.day { align-items: start; }
		.day-name, .day[data-empty] .day-name { grid-column: auto; flex-direction: column; align-items: flex-start; gap: var(--space-1); padding-block-start: var(--space-1-5); }
		.today { align-self: flex-start; }
		.slot-name, .day[data-empty] .slot-name { display: block; position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
		.slot, .day[data-empty] .slot { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-areas: none; align-content: start; }
		.entries, .add, .day[data-empty] .add { grid-area: auto; }
		.add, .day[data-empty] .add { grid-area: auto; inline-size: auto; min-block-size: var(--control-height-s); border-radius: var(--radius-panel); border-style: dashed; border-color: var(--edge-control); }
		.slot[data-filled] .add { min-block-size: var(--control-height-xs); }
		.add-text, .day[data-empty] .add-text { display: none; }
	}
</style>
