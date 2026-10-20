<script lang="ts">
	import { addDays, weekStart } from '#lib/dates.ts';
	import AddToPlan from '#lib/recipes/AddToPlan.svelte';
	import DeleteRecipe from '#lib/recipes/DeleteRecipe.svelte';
	import FavouriteButton from '#lib/recipes/FavouriteButton.svelte';
	import Hero from '#lib/recipes/Hero.svelte';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';
	import { SLOTS, type IsoDate, type Slot } from '#lib/types.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const recipe = $derived(data.recipe);

	let deleting = $state(false);
	let planning = $state(false);

	const next = $derived(data.upcoming[0] ?? null);
	const fmt = (d: IsoDate, opts: Intl.DateTimeFormatOptions) =>
		new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
	const dayLabel = (d: IsoDate) =>
		d === data.today
			? 'Today'
			: d === addDays(data.today, 1)
				? 'Tomorrow'
				: d < addDays(data.today, 7)
					? fmt(d, { weekday: 'long' })
					: fmt(d, { weekday: 'short', day: 'numeric', month: 'short' });
	const slotName = (s: Slot) => SLOTS.find((x) => x.id === s)!.label.toLowerCase();

	// "Pumpkin soup with sage butter": the part from "with" on is the accent, as in the mockups
	const title = $derived.by(() => {
		const at = recipe.title.search(/ with /i);
		return at > 0 ? { head: recipe.title.slice(0, at), accent: recipe.title.slice(at + 1) } : { head: recipe.title, accent: '' };
	});

	const times = $derived(
		[
			recipe.prepMinutes !== null ? `Prep ${recipe.prepMinutes} min` : '',
			recipe.cookMinutes !== null ? `Cook ${recipe.cookMinutes} min` : '',
			recipe.prepMinutes !== null && recipe.cookMinutes !== null ? `${recipe.totalMinutes} min total` : ''
		]
			.filter(Boolean)
			.join(' · ')
	);

	const source = $derived.by(() => {
		if (!recipe.sourceUrl) return null;
		try {
			return new URL(recipe.sourceUrl).hostname.replace(/^www\./, '');
		} catch {
			return recipe.sourceUrl;
		}
	});

	// step numbers run on across sections
	const offsets = $derived(data.steps.map((_, i) => data.steps.slice(0, i).reduce((n, s) => n + s.lines.length, 0)));
	const stepNo = (s: number, j: number) => String(offsets[s] + j + 1).padStart(2, '0');
</script>

<svelte:head>
	<title>{recipe.title} · Rues Cooking Hub</title>
</svelte:head>

<div class="recipe">
	<Hero id={recipe.id} imageId={recipe.imageId}>
		<ArrowButton href="/recipes" variant="glass" direction="left" label="Back to recipes" />
	</Hero>

	<div class="column panel-row" data-column>
		<GlassPanel as="header" strong class="info enter" data-page-header data-recipe-info>
			<div class="info-top">
				<Kicker parts={recipe.tags.length > 0 ? recipe.tags.map((t) => t.name) : ['Recipe']} />
				<FavouriteButton id={recipe.id} title={recipe.title} favourite={recipe.favourite} variant="outline" />
			</div>
			<h1>{title.head}{#if title.accent}{' '}<em>{title.accent}</em>{/if}</h1>
			{#if recipe.description}<p class="desc">{recipe.description}</p>{/if}
			<p class="meta">
				{#if times}<span class="tnum" data-times><Icon name="clock" size={16} />{times}</span>{/if}
				<span class="tnum"><Icon name="users" size={16} />{recipe.servings} servings</span>
			</p>
			<div class="actions">
				<Button class="plan" onclick={() => (planning = true)}>Add to plan</Button>
				<Button variant="secondary" arrow={false} icon="edit" href="/recipes/{recipe.id}/edit">Edit</Button>
				<IconButton icon="trash" label="Delete recipe" variant="outline" class="delete" onclick={() => (deleting = true)} />
				{#if source}
					<a class="source" href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
						<span class="source-label">Source</span><span class="host">{source}</span><Icon name="arrow-up-right" size={16} />
					</a>
				{/if}
			</div>
		</GlassPanel>

		{#if next}
			<a class="planned enter" href="/plan?week={weekStart(next.date)}">
				<span class="planned-top">
					<span class="planned-kicker">Planned</span>
					<ArrowButton decorative variant="light" direction="up-right" />
				</span>
				<span class="planned-title">{dayLabel(next.date)} <em>{slotName(next.slot)}</em></span>
				<span class="planned-sub tnum">
					{fmt(next.date, { day: 'numeric', month: 'long' })}{data.upcoming.length > 1 ? ` · and ${data.upcoming.length - 1} more` : ''}
				</span>
			</a>
		{:else}
			<button type="button" class="planned enter" onclick={() => (planning = true)}>
				<span class="planned-top">
					<span class="planned-kicker">Not planned yet</span>
					<ArrowButton decorative variant="light" />
				</span>
				<span class="planned-title">Pick a <em>day</em></span>
				<span class="planned-sub">Put it on this week's table</span>
			</button>
		{/if}
	</div>

	<div class="column body" data-column>
		<section class="ingredients enter" aria-labelledby="ingredients-title">
			<div class="col-head">
				<h2 id="ingredients-title" data-section-heading>Ingredients</h2>
				<span class="for tnum">for {recipe.servings}</span>
			</div>
			{#if data.ingredients.length > 0}
				<div class="ing-card">
					{#each data.ingredients as section, s (s)}
						{#if section.title}<h3 class="sub">{section.title}</h3>{/if}
						<ul>
							{#each section.lines as line, j (j)}
								<li>{#if line.amount}<b class="tnum">{line.amount}</b>{' '}{/if}{line.rest}</li>
							{/each}
						</ul>
					{/each}
				</div>
			{:else}
				<p class="empty">No ingredients yet.</p>
			{/if}
		</section>

		<div class="method enter">
			<section aria-labelledby="method-title">
				<div class="col-head"><h2 id="method-title">Method</h2></div>
				{#each data.steps as section, s (s)}
					{#if section.title}<h3 class="sub">{section.title}</h3>{/if}
					<ol>
						{#each section.lines as line, j (j)}
							<li><span class="no tnum" aria-hidden="true">{stepNo(s, j)}</span><p>{@html line}</p></li>
						{/each}
					</ol>
				{:else}
					<p class="empty">No steps yet.</p>
				{/each}
			</section>

			{#if data.notes}
				<section class="notes" aria-labelledby="notes-title">
					<h3 id="notes-title" class="sub">Notes</h3>
					<div class="prose">{@html data.notes}</div>
				</section>
			{/if}
		</div>
	</div>
</div>

<AddToPlan
	open={planning}
	title={recipe.title}
	servings={recipe.servings}
	today={data.today}
	onclose={() => (planning = false)}
/>
<DeleteRecipe open={deleting} title={recipe.title} usage={data.usage} onclose={() => (deleting = false)} />

<style>
	/* the hero runs up under the floating nav (desktop) and to the top edge (phone) */
	.recipe {
		margin-block-start: calc(-1 * (14px + var(--nav-h) + var(--s-8)));
	}

	.panel-row {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 264px;
		gap: var(--s-4);
		align-items: end;
		margin-block-start: -240px;
	}

	/* The panels overlap the hero, whose shared-element layer would cover them while it moves; as their own
	   layer they stay on top. Only during a transition: a named element would cut the glass off from the photo. */
	:global(:root:active-view-transition) .panel-row {
		view-transition-name: recipe-panels;
	}

	/* the floating nav stays above the hero and the panels while they move */
	:global(::view-transition-group(app-topbar)),
	:global(::view-transition-group(app-tabbar)) {
		z-index: 1;
	}

	:global(::view-transition-new(recipe-panels)) {
		animation: var(--d-slow) var(--ease-out) 140ms both page-in;
	}

	:global(::view-transition-old(recipe-panels)) {
		animation: var(--d-fast) var(--ease-out) both page-out;
	}

	.panel-row :global(.info) {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-7);
	}

	.planned {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		min-block-size: 220px;
		padding: var(--s-6);
		border: 0;
		border-radius: var(--r-panel);
		background: var(--dark);
		color: var(--on-dark);
		font: inherit;
		text-align: start;
		box-shadow: var(--shadow-float);
		cursor: pointer;
		transition: transform var(--d-base) var(--ease-out);
	}

	.planned:hover {
		transform: translateY(-3px);
	}

	.planned:active {
		transform: scale(0.98);
	}

	.planned-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-block-end: auto;
	}

	.planned-kicker {
		padding-block-start: 12px;
		font-size: var(--t-kicker);
		font-weight: 500;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
	}

	.planned-title {
		font-family: var(--font-display);
		font-size: 30px;
		font-weight: 300;
		line-height: 1.05;
	}

	.planned-title em {
		color: var(--brick-soft);
	}

	.planned-sub {
		font-size: var(--t-small);
		opacity: 0.85;
	}

	.info-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		margin-block: -10px -6px;
	}

	h1 {
		font-size: 52px;
	}

	h1 em {
		color: var(--brick);
	}

	.desc {
		max-inline-size: 52ch;
		color: var(--ink);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2) var(--s-5);
		font-size: 14px;
		font-weight: 500;
		color: var(--ink-2);
	}

	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--s-2);
		margin-block-start: var(--s-2);
	}

	.actions :global(.delete) {
		color: var(--brick);
	}

	.source {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-block-size: 44px;
		margin-inline-start: auto;
		font-size: 14px;
		font-weight: 500;
	}

	.host {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.source-label {
		font-size: var(--t-kicker);
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.body {
		display: grid;
		grid-template-columns: 360px minmax(0, 1fr);
		gap: var(--s-9);
		margin-block-start: var(--s-9);
	}

	.ingredients {
		position: sticky;
		inset-block-start: 100px;
		align-self: start;
	}

	.col-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-block-end: var(--s-4);
	}

	.for {
		font-size: 14px;
		color: var(--ink-2);
	}

	.ing-card {
		padding: var(--s-3) var(--s-6) var(--s-5);
		border-radius: var(--r-card);
		background: var(--surface);
		box-shadow: var(--shadow-card);
	}

	.ing-card li {
		padding-block: 11px;
		border-block-end: 1px solid var(--line);
		font-size: 15px;
	}

	.ing-card li:last-child {
		border: 0;
	}

	.ing-card b {
		font-weight: 600;
	}

	.sub {
		margin-block: var(--s-5) var(--s-2);
		font-family: var(--font-display);
		font-size: 21px;
		font-weight: 400;
		font-style: italic;
		color: var(--olive);
	}

	.ing-card .sub {
		margin-block-start: var(--s-4);
	}

	.method ol li {
		display: grid;
		grid-template-columns: 56px minmax(0, 1fr);
		gap: var(--s-3);
		padding-block: var(--s-4);
		border-block-end: 1px solid var(--line);
	}

	.no {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 300;
		line-height: 1;
		color: var(--brick);
	}

	.method li p {
		max-inline-size: 62ch;
		line-height: 1.65;
		overflow-wrap: anywhere;
	}

	.empty {
		color: var(--ink-2);
	}

	.notes {
		margin-block-start: var(--s-8);
		padding: var(--s-5) var(--s-6) var(--s-6);
		border-radius: var(--r-card);
		background: var(--olive-soft);
	}

	.notes .sub {
		margin-block-start: 0;
	}

	/* ruled like a notebook: every block keeps to the 32 px line */
	.prose {
		line-height: 32px;
		overflow-wrap: anywhere;
		background: repeating-linear-gradient(180deg, transparent 0 31px, var(--olive-wash) 31px 32px);
	}

	.prose :global(:is(p, ul, ol, blockquote, pre, h1, h2, h3, h4, h5, h6)) {
		margin: 0 0 32px;
		font: inherit;
		line-height: 32px;
	}

	.prose :global(:is(p, ul, ol, blockquote, pre):last-child) {
		margin-block-end: 0;
	}

	.prose :global(:is(h1, h2, h3, h4, h5, h6)) {
		font-weight: 600;
	}

	.prose :global(ul) {
		padding-inline-start: 1.2em;
		list-style: disc;
	}

	.prose :global(ol) {
		padding-inline-start: 1.4em;
		list-style: decimal;
	}

	.prose :global(a) {
		text-decoration: underline;
		text-underline-offset: 3px;
		color: var(--olive);
	}

	.prose :global(code) {
		font-size: 0.92em;
	}

	.enter {
		animation: enter var(--d-slow) var(--ease-out) both;
	}

	.body > .enter:first-child {
		animation-delay: 90ms;
	}

	.body > .enter:last-child {
		animation-delay: 160ms;
	}

	@keyframes enter {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.enter {
			animation: none;
		}
	}

	@media (max-width: 1023px) {
		.recipe {
			margin-block-start: calc(-1 * var(--s-7));
		}

		.panel-row {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-3);
			margin-block-start: -120px;
		}

		.planned {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			min-block-size: 0;
			padding: var(--s-4) var(--s-4) var(--s-4) var(--s-5);
		}

		.planned-top {
			display: contents;
		}

		.planned-kicker {
			grid-row: 1;
			padding: 0;
		}

		.planned-top :global(:last-child) {
			grid-column: 2;
			grid-row: 1 / span 3;
		}

		.planned-title {
			font-size: 24px;
		}

		.panel-row :global(.info) {
			padding: var(--s-5);
			gap: var(--s-3);
		}

		h1 {
			font-size: 32px;
		}

		.desc {
			font-size: 15px;
		}

		.actions :global(.plan) {
			flex: 1;
		}

		.source {
			margin-inline-start: 0;
		}

		.body {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-8);
			margin-block-start: var(--s-8);
		}

		.ingredients {
			position: static;
		}

		.ing-card {
			padding-inline: var(--s-5);
		}

		.method ol li {
			grid-template-columns: 44px minmax(0, 1fr);
		}

		.no {
			font-size: 24px;
		}
	}
</style>
