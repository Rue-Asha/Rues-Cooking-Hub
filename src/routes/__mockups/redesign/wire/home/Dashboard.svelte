<script lang="ts">
	import Icon from '../shell/Icon.svelte';
	import { link } from '../shell/links.ts';
	import type { MockData, MockRecipe } from '../../fixtures.ts';
	import { entryCount, firstEntry, minutes, plural, type Dash } from './data.ts';

	type Part = 'head' | 'hero' | 'week' | 'list' | 'favourite' | 'recent' | 'spots';
	type Props = { d: Dash; recipes: MockData['recipes']; parts?: Part[] };
	const all: Part[] = ['head', 'hero', 'week', 'list', 'favourite', 'recent', 'spots'];
	let { d, recipes, parts = all }: Props = $props();

	const full = $derived(parts.length === all.length);
	const has = (p: Part) => parts.includes(p);
	const worst = $derived(d.worst);
	const recipeHref = (_: MockRecipe) => link('wire/recipe', worst);
	const weekday = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
</script>

<div class="dash" data-full={full || undefined}>
	{#if has('head')}
		<header class="head">
			<div class="lead">
				<p class="w-kicker">{d.kicker.join(' · ')}</p>
				<h1>What's cooking, Rue?</h1>
			</div>
			<div class="side">
				<p class="sum">{d.summary}</p>
				<a class="w-btn touch" href={link('wire/plan', worst)}>Open the plan</a>
			</div>
		</header>
	{/if}

	{#if has('hero')}
		{#if d.hero}
			<article class="w-card hero" aria-label="Today's recipe">
				<div class="w-ph photo">Photo</div>
				<div class="copy">
					<p class="w-kicker">{d.hero.label}</p>
					<h2 class="title w-clamp-3"><a href={recipeHref(d.hero.recipe)}>{d.hero.recipe.title}</a></h2>
					<p class="w-meta">
						{#if minutes(d.hero.recipe)}<span>{minutes(d.hero.recipe)}</span>{/if}
						<span>Serves {d.hero.recipe.servings}</span>
						{#if d.hero.recipe.tags[0]}<span>{d.hero.recipe.tags[0]}</span>{/if}
					</p>
					{#if !d.hero.planned}<a class="w-btn primary touch plan" href={link('wire/plan', worst)}>Plan your day</a>{/if}
				</div>
			</article>
		{:else}
			<article class="w-card hero welcome" aria-label="Welcome">
				<div class="w-ph photo">Your kitchen</div>
				<div class="copy">
					<p class="w-kicker">Welcome</p>
					<h2 class="title">Every recipe worth keeping, in one place</h2>
					<p class="w-lede">Import one from any web page or write down the one you know by heart. It will wait for you here.</p>
					<a class="w-btn primary touch plan" href={link('wire/import', worst)}>Add your first recipe</a>
				</div>
			</article>
		{/if}
	{/if}

	{#if has('week')}
		<section class="w-card week" aria-label="This week">
			<div class="w-card-head">
				<h2>This week</h2>
				<a class="w-link" href={link('wire/plan', worst)}>{d.weekRange}</a>
			</div>
			<ol class="days">
				{#each d.week as day (day.date)}
					{@const entry = firstEntry(day, recipes)}
					{@const n = entryCount(day)}
					<li aria-current={day.date === d.today ? 'date' : undefined} data-today={day.date === d.today || undefined}>
						<span class="wd">{weekday(day.date)}</span>
						<span class="num">{day.day}</span>
						{#if day.date === d.today}<span class="today">Today</span>{/if}
						{#if entry}
							<span class="w-ph thumb" class:disc={!entry.photo}>{entry.photo ? '' : entry.initial}</span>
							<span class="t w-clamp-2">{entry.title}</span>
							{#if n > 1}<span class="more">+{n - 1}</span>{/if}
						{:else}
							<span class="t none">Nothing planned</span>
						{/if}
					</li>
				{/each}
			</ol>
		</section>
	{/if}

	{#if has('list')}
		<a class="w-card list" href={link('wire/list', worst)} aria-label="Shopping list">
			<span class="w-card-head"><h2>Shopping list</h2><span class="w-note">{d.list.open.toLocaleString('en-GB')} open</span></span>
			{#if d.list.first.length}
				<ol class="first">
					{#each d.list.first as name (name)}<li class="w-clamp-2">{name}</li>{/each}
				</ol>
			{:else}
				<span class="empty"><strong>List is empty</strong><span>Add things as you notice them, or fill it from the plan.</span></span>
			{/if}
		</a>
	{/if}

	{#if has('favourite')}
		<a class="w-card fav" href={d.favourite ? recipeHref(d.favourite) : link('wire/recipes', worst)} aria-label="Favourite">
			<span class="w-card-head"><h2>Favourite</h2><Icon name="heart" size={20} /></span>
			{#if d.favourite}
				<span class="fav-row">
					<span class="w-ph thumb">Photo</span>
					<span class="fav-body">
						<strong class="w-clamp-2">{d.favourite.title}</strong>
						<span class="w-meta">
							{#if minutes(d.favourite)}<span>{minutes(d.favourite)}</span>{/if}
							{#if d.favourite.tags[0]}<span>{d.favourite.tags[0]}</span>{/if}
						</span>
					</span>
				</span>
			{:else}
				<span class="empty"><strong>Tap the heart on a recipe to keep it here</strong></span>
			{/if}
		</a>
	{/if}

	{#if has('recent') && d.recent.length}
		<section class="block" aria-label="Recently added">
			<div class="block-head">
				<h2>Recently added</h2>
				<a class="w-link" href={link('wire/recipes', worst)}>All {plural(d.total, 'recipe', 'recipes')}<Icon name="arrow" size={16} /></a>
			</div>
			<ul class="cards">
				{#each d.recent as r (r.id)}
					<li class="w-card tile">
						<div class="w-ph photo">{r.image ? 'Photo' : 'No photo yet'}</div>
						<h3 class="w-clamp-2"><a href={recipeHref(r)}>{r.title}</a></h3>
						{#if r.description}<p class="desc w-clamp-2">{r.description}</p>{/if}
						<p class="w-meta">{#if minutes(r)}<span>{minutes(r)}</span>{/if}</p>
						{#if r.tags.length}<ul class="w-tags">{#each r.tags.slice(0, 2) as t (t)}<li class="w-chip">{t}</li>{/each}</ul>{/if}
						<button type="button" class="heart" aria-pressed={r.favourite} aria-label={`${r.favourite ? 'Remove' : 'Add'} ${r.title} ${r.favourite ? 'from' : 'to'} favourites`}><Icon name="heart" size={20} /></button>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if has('spots') && d.spots.length}
		<section class="block" aria-label="Top spots">
			<div class="block-head">
				<h2>Top spots</h2>
				<a class="w-link" href={link('wire/shell/eating-out', worst)}>All spots<Icon name="arrow" size={16} /></a>
			</div>
			<ul class="cards spots">
				{#each d.spots as s (s.id)}
					<li class="w-card tile">
						<div class="w-ph photo">{s.image ? 'Photo' : 'No photo yet'}</div>
						<h3 class="w-clamp-2"><a href={link('wire/shell/eating-out', worst)}>{s.name}</a></h3>
						<p class="w-meta"><span>{[s.neighbourhood, s.city].filter(Boolean).join(', ')}</span><span>{s.score}</span></p>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.dash {
		display: grid;
		gap: var(--space-6);
		min-inline-size: 0;
	}
	.head {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.lead {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	h1 {
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
		overflow-wrap: anywhere;
	}
	.side {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3) var(--space-5);
		min-inline-size: 0;
	}
	.sum {
		max-inline-size: 30ch;
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
		overflow-wrap: anywhere;
	}

	.hero {
		position: relative;
		padding: var(--space-3);
		gap: var(--space-4);
	}
	.photo {
		min-block-size: 9rem;
		aspect-ratio: 16 / 10;
		border-radius: var(--radius-item);
	}
	.copy {
		display: grid;
		gap: var(--space-2-5);
		align-content: start;
		padding: var(--space-1) var(--space-2) var(--space-2);
		min-inline-size: 0;
	}
	.title {
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
	}
	.title a {
		color: inherit;
		text-decoration: none;
	}
	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	.plan {
		position: relative;
		z-index: var(--z-raised);
		justify-self: start;
	}

	.week {
		padding: var(--space-4);
	}
	.days {
		display: grid;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.days li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: var(--target-touch);
		min-inline-size: 0;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}
	.days li[data-today] {
		outline: var(--focus-width) solid var(--ink);
		outline-offset: calc(-1 * var(--focus-width));
	}
	.wd {
		flex: none;
		inline-size: 2.25rem;
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
	}
	.num {
		flex: none;
		inline-size: 1.5rem;
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}
	.today {
		padding-inline: var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		font-size: var(--type-caption-size);
		line-height: var(--type-label-line);
	}
	.thumb {
		flex: none;
		inline-size: var(--space-8);
		block-size: var(--space-8);
		border-radius: var(--radius-round);
	}
	.thumb.disc {
		font-weight: var(--weight-semibold);
	}
	.t {
		flex: 1;
		min-inline-size: 0;
	}
	.t.none {
		color: var(--ink-muted);
	}
	.more {
		flex: none;
		font-size: var(--type-caption-size);
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}

	.list,
	.fav {
		color: var(--ink);
		text-decoration: none;
	}
	.list .w-card-head h2,
	.fav .w-card-head h2 {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
	}
	.first {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding-inline-start: var(--space-5);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}
	.empty {
		display: grid;
		gap: var(--space-1);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		color: var(--ink-secondary);
	}
	.empty strong {
		color: var(--ink);
		font-weight: var(--weight-semibold);
		overflow-wrap: anywhere;
	}
	.fav-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.fav-row .thumb {
		flex: none;
		inline-size: var(--space-12);
		block-size: var(--space-12);
		border-radius: var(--radius-item);
	}
	.fav-body {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}

	.block {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.block-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-1) var(--space-4);
	}
	.block-head h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 9.5rem), 1fr));
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.tile {
		position: relative;
		padding: var(--space-3);
		gap: var(--space-2);
	}
	.tile .photo {
		min-block-size: 0;
		aspect-ratio: 4 / 3;
	}
	.tile h3 {
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--weight-semibold);
		padding-inline-end: var(--space-10);
	}
	.tile h3 a {
		color: inherit;
		text-decoration: none;
	}
	.tile h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	.desc {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.heart {
		position: absolute;
		inset-block-end: var(--space-2);
		inset-inline-end: var(--space-2);
		z-index: var(--z-raised);
		display: grid;
		place-items: center;
		inline-size: var(--target-touch);
		block-size: var(--target-touch);
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-tint);
		color: var(--ink);
	}
	.heart[aria-pressed='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	@media (min-width: 768px) {
		.head {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
		}
		.side {
			justify-content: flex-end;
			flex-wrap: nowrap;
		}
		.hero {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: stretch;
		}
		.hero .photo {
			aspect-ratio: auto;
			min-block-size: 14rem;
		}
		.copy {
			align-content: end;
			padding: var(--space-3);
		}
		.days {
			grid-template-columns: repeat(7, minmax(0, 1fr));
		}
		.days li {
			display: grid;
			grid-template-columns: 1fr auto;
			align-content: start;
			align-items: start;
			padding: var(--space-3);
			min-block-size: 9rem;
			gap: var(--space-1-5);
		}
		.days li .wd {
			inline-size: auto;
		}
		.days li .num {
			inline-size: auto;
			text-align: end;
		}
		.days li .today,
		.days li .thumb,
		.days li .t,
		.days li .more {
			grid-column: 1 / -1;
		}
		.cards {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.cards.spots {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	@media (min-width: 1100px) {
		.dash[data-full] {
			grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
			column-gap: var(--space-5);
		}
		.dash[data-full] > .head,
		.dash[data-full] > .week,
		.dash[data-full] > .block {
			grid-column: 1 / -1;
		}
		.dash[data-full] > .hero {
			grid-column: 1;
			grid-row: 2 / span 2;
			grid-template-columns: minmax(0, 1fr);
		}
		.dash[data-full] > .hero .photo {
			min-block-size: 18rem;
		}
		.dash[data-full] > .list {
			grid-column: 2;
			grid-row: 2;
		}
		.dash[data-full] > .fav {
			grid-column: 2;
			grid-row: 3;
		}
	}
</style>
