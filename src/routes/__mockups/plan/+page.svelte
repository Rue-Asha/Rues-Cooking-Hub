<script lang="ts">
	import { byId, recipes, slots, today, totalMinutes, week, type MockEntry } from '#lib/mockups/fixtures.ts';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';
	import RoundNav from '#lib/ui/RoundNav.svelte';

	const todayIndex = week.findIndex((d) => d.date === today);
	// mockup motion state: a rail recipe being dragged onto Thursday breakfast
	const dropDay = '2026-10-22';
	const dropSlot = 'breakfast';
	const dragging = 11;

	const view = (e: MockEntry) => {
		const r = e.recipe ? byId(e.recipe) : null;
		return { title: r?.title ?? e.text ?? '', image: r ? r.image : undefined, servings: e.servings, text: !r };
	};
</script>

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={['Week 43', '19 – 25 October']} />
			<h1>This <em>week</em></h1>
		</div>
		<div class="controls">
			<Button variant="ghost" arrow={false} icon="copy">Copy week</Button>
			<Button variant="secondary" arrow={false}>This week</Button>
			<RoundNav prevLabel="Previous week" nextLabel="Next week" />
		</div>
	</header>

	<div class="board">
		<aside class="rail" aria-labelledby="rail-title">
			<h2 id="rail-title" data-section-heading>Recipes</h2>
			<p class="rail-help">Drag onto a day</p>
			<label class="rail-search">
				<Icon name="search" size={16} />
				<span class="visually-hidden">Find a recipe</span>
				<input type="search" placeholder="Find a recipe" />
			</label>
			<ul class="rail-list">
				{#each recipes.slice(0, 8) as r (r.id)}
					<li class:dragging={r.id === dragging} draggable="true">
						<span class="rail-thumb">{#if r.image}<img src={r.image} alt="" />{:else}<ImagePlaceholder size="thumb" />{/if}</span>
						<span class="rail-text">
							<span class="rail-title">{r.title}</span>
							{#if totalMinutes(r)}<span class="rail-meta tnum">{totalMinutes(r)} min</span>{/if}
						</span>
						<Icon name="grip" size={16} />
					</li>
				{/each}
			</ul>
		</aside>

		<div class="week" style="--today: {todayIndex + 1}">
			<span class="today-band" aria-hidden="true"></span>
			{#each week as d, i (d.date)}
				<div class="day-head" class:today={d.date === today} style="grid-column: {i + 1}" data-today={d.date === today ? '' : undefined}>
					<span class="wd">{d.short}</span>
					<span class="num tnum">{d.day}</span>
				</div>
			{/each}
			{#each slots as slot, s (slot.id)}
				<p class="slot-label" style="grid-row: {s * 2 + 2}">{slot.label}</p>
				{#each week as d, i (d.date)}
					{@const entries = d.entries[slot.id] ?? []}
					<div
						class="cell"
						style="grid-column: {i + 1}; grid-row: {s * 2 + 3}"
						data-drop-target={d.date === dropDay && slot.id === dropSlot ? '' : undefined}
					>
						{#each entries as e, j (j)}
							{@const v = view(e)}
							<div class="entry" class:text={v.text}>
								{#if !v.text}
									<span class="thumb">{#if v.image}<img src={v.image} alt="" />{:else}<ImagePlaceholder size="thumb" />{/if}</span>
								{/if}
								<span class="entry-title">{v.title}</span>
								{#if v.servings}<span class="serv tnum">×{v.servings}</span>{/if}
							</div>
						{/each}
						{#if d.date === dropDay && slot.id === dropSlot}
							<span class="drop">Drop to add</span>
						{:else if entries.length === 0}
							<button type="button" class="add" aria-label="Add to {d.weekday} {slot.label}"><Icon name="plus" size={16} /></button>
						{/if}
					</div>
				{/each}
			{/each}
		</div>
	</div>

	<div class="days">
		{#each week as d (d.date)}
			<section class="day" class:today={d.date === today} aria-labelledby="d-{d.date}">
				<div class="day-title">
					<h2 id="d-{d.date}" data-section-heading>{d.weekday}</h2>
					<span class="date tnum">{d.day} Oct</span>
					{#if d.date === today}<span class="today-chip">Today</span>{/if}
				</div>
				<div class="day-card">
					{#each slots as slot (slot.id)}
						{@const entries = d.entries[slot.id] ?? []}
						<div class="slot-row">
							<p class="slot-name">{slot.label}</p>
							<div class="slot-entries">
								{#each entries as e, j (j)}
									{@const v = view(e)}
									<div class="p-entry" class:text={v.text}>
										{#if !v.text}
											<span class="thumb">{#if v.image}<img src={v.image} alt="" />{:else}<ImagePlaceholder size="thumb" />{/if}</span>
										{/if}
										<span class="p-title">{v.title}</span>
										{#if v.servings}<span class="serv tnum">×{v.servings}</span>{/if}
										<button type="button" class="more" aria-label="Move to…"><Icon name="dots" size={18} /></button>
									</div>
								{/each}
								{#if entries.length === 0}
									<button type="button" class="p-add"><Icon name="plus" size={16} /> Add</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-7);
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-4);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--s-2);
	}

	.board {
		display: grid;
		grid-template-columns: 248px 1fr;
		gap: var(--s-4);
		align-items: start;
	}

	.rail {
		position: sticky;
		inset-block-start: 100px;
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
	}

	.rail h2 {
		font-size: var(--t-display-3);
	}

	.rail-help {
		margin-block-start: -8px;
		font-size: var(--t-small);
		color: var(--ink-2);
	}

	.rail-search {
		display: flex;
		align-items: center;
		gap: 8px;
		min-block-size: 40px;
		padding: 0 14px;
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink-2);
	}

	.rail-search input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: none;
		font-size: 14px;
	}

	.rail-search input::placeholder {
		color: var(--ink-2);
	}

	.rail-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 6px;
		border-radius: var(--r-card);
		background: var(--surface);
		box-shadow: var(--shadow-card);
	}

	.rail-list li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 8px 6px 6px;
		border-radius: var(--r-sm);
		color: var(--stone);
		cursor: grab;
		transition: transform var(--d-base) var(--ease-spring);
	}

	.rail-list li.dragging {
		background: var(--white);
		box-shadow: var(--shadow-lift);
		transform: translateX(26px) rotate(-3deg);
		position: relative;
		z-index: 5;
	}

	.rail-thumb {
		flex: none;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--r-pill);
		overflow: hidden;
	}

	.rail-thumb img,
	.thumb img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.rail-text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-inline-size: 0;
	}

	.rail-title {
		font-size: 13px;
		font-weight: 600;
		line-height: 1.25;
		color: var(--ink);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.rail-meta {
		font-size: 12px;
		color: var(--ink-2);
	}

	.week {
		position: relative;
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		column-gap: 8px;
		padding: var(--s-3) var(--s-3) var(--s-4);
		border-radius: var(--r-panel);
		background: var(--surface);
		box-shadow: var(--shadow-card);
	}

	.today-band {
		grid-column: var(--today);
		grid-row: 1 / span 9;
		margin: -4px -4px -8px;
		border-radius: var(--r-md);
		background: var(--brick-soft);
	}

	.day-head {
		grid-row: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 8px 10px;
		position: relative;
	}

	.wd {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.num {
		display: grid;
		place-items: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--r-pill);
		font-family: var(--font-display);
		font-size: 18px;
	}

	.today .num {
		background: var(--brick);
		color: var(--white);
	}

	.today .wd {
		color: var(--brick);
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
		position: relative;
	}

	.slot-label::after {
		content: '';
		flex: 1;
		block-size: 1px;
		background: var(--line);
	}

	.cell {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-block-size: 56px;
		border-radius: var(--r-sm);
	}

	.cell[data-drop-target] {
		outline: 1.5px dashed var(--olive);
		outline-offset: 2px;
		background: var(--olive-wash);
	}

	.drop {
		display: grid;
		place-items: center;
		flex: 1;
		font-size: 12px;
		font-weight: 600;
		color: var(--olive);
	}

	.entry {
		display: grid;
		grid-template-columns: 32px 1fr;
		gap: 6px;
		align-items: start;
		padding: 6px;
		border-radius: var(--r-sm);
		background: var(--white);
		box-shadow: var(--shadow-card);
	}

	.entry.text {
		grid-template-columns: 1fr;
		background: var(--sand);
		box-shadow: none;
	}

	.thumb {
		display: block;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--r-pill);
		overflow: hidden;
	}

	.entry-title {
		font-size: 13px;
		font-weight: 500;
		line-height: 1.25;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.text .entry-title,
	.text .p-title {
		font-style: italic;
		color: var(--ink);
	}

	.entry .serv {
		grid-column: 2;
		font-size: 11px;
		color: var(--ink-2);
	}

	.add {
		display: grid;
		place-items: center;
		flex: 1;
		min-block-size: 56px;
		border-radius: var(--r-sm);
		border: 1px dashed var(--line);
		background: transparent;
		color: var(--stone);
	}

	.days {
		display: none;
	}

	@media (max-width: 1023px) {
		.head {
			flex-direction: column;
			align-items: stretch;
		}

		.controls {
			justify-content: space-between;
		}

		.controls :global(.round-nav) {
			order: -1;
		}

		.board {
			display: none;
		}

		.days {
			display: flex;
			flex-direction: column;
			gap: var(--s-6);
		}

		.day-title {
			display: flex;
			align-items: baseline;
			gap: var(--s-3);
			margin-block-end: var(--s-3);
		}

		.day-title h2 {
			font-size: var(--t-display-3);
		}

		.date {
			font-size: 14px;
			color: var(--ink-2);
		}

		.today-chip {
			margin-inline-start: auto;
			padding: 4px 12px;
			border-radius: var(--r-pill);
			background: var(--brick);
			color: var(--white);
			font-size: 12px;
			font-weight: 600;
		}

		.day-card {
			padding: 4px var(--s-4);
			border-radius: var(--r-card);
			background: var(--surface);
			box-shadow: var(--shadow-card);
		}

		.today .day-card {
			box-shadow:
				0 0 0 2px var(--brick),
				var(--shadow-card);
		}

		.slot-row {
			display: grid;
			grid-template-columns: 84px 1fr;
			gap: var(--s-3);
			align-items: center;
			padding-block: 8px;
			border-block-end: 1px solid var(--line);
		}

		.slot-row:last-child {
			border: 0;
		}

		.slot-name {
			font-size: 11px;
			font-weight: 600;
			letter-spacing: 0.14em;
			text-transform: uppercase;
			color: var(--ink-2);
		}

		.slot-entries {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		.p-entry {
			display: flex;
			align-items: center;
			gap: 10px;
			min-inline-size: 0;
		}

		.p-entry .thumb {
			flex: none;
			inline-size: 36px;
			block-size: 36px;
		}

		.p-title {
			flex: 1;
			min-inline-size: 0;
			font-size: 14px;
			font-weight: 500;
			line-height: 1.25;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.p-entry .serv {
			font-size: 12px;
			color: var(--ink-2);
		}

		.more {
			display: grid;
			place-items: center;
			flex: none;
			inline-size: 44px;
			block-size: 44px;
			margin-inline-end: -10px;
			border: 0;
			border-radius: var(--r-pill);
			background: none;
			color: var(--ink-2);
		}

		.p-add {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			align-self: flex-start;
			min-block-size: 44px;
			padding: 0 14px;
			border-radius: var(--r-pill);
			border: 1px dashed var(--line);
			background: none;
			font-size: 13px;
			font-weight: 500;
			color: var(--ink-2);
		}
	}
</style>
