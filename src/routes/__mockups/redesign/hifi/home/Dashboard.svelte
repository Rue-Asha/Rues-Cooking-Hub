<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Icon from '../shell/Icon.svelte';
	import { areaPath, link } from '../shell/links.ts';
	import type { MockData } from '../../fixtures.ts';
	import { entryCount, firstEntry, minutes, plural, type Dash } from './data.ts';

	type Part = 'hero' | 'week' | 'list' | 'favourite' | 'recent' | 'spots';
	type Props = { d: Dash; recipes: MockData['recipes']; parts?: Part[] };
	const all: Part[] = ['hero', 'week', 'list', 'favourite', 'recent', 'spots'];
	let { d, recipes, parts = all }: Props = $props();

	const full = $derived(parts.length === all.length);
	const has = (p: Part) => parts.includes(p);
	const worst = $derived(d.worst);
	const recipeHref = $derived(link('hifi/recipe', worst));
	const planHref = $derived(link(areaPath.plan, worst));
	const weekday = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
	const plate = (title: string) => (([...title].reduce((n, c) => n + c.codePointAt(0)!, 0) % 2) + 1) as 1 | 2;
	const initial = (title: string) => [...title.trim()][0] ?? '?';
</script>

{#snippet picture(title: string, image: string | null)}
	{#if image}
		<img class="pic" src={image} alt="" loading="lazy" />
	{:else}
		<span class="pic plate" data-plate={plate(title)} role="img" aria-label="No photo yet">{initial(title)}</span>
	{/if}
{/snippet}

<div class="dash" data-full={full || undefined}>
	{#if has('hero')}
		{#if d.hero}
			<article class="card hero" aria-label="Today's recipe" data-surface="solid">
				{@render picture(d.hero.recipe.title, d.hero.recipe.image)}
				<div class="copy">
					<p class="overline">{d.hero.label}</p>
					<h2 class="title clamp-3"><a href="{recipeHref}">{d.hero.recipe.title}</a></h2>
					<p class="meta">
						{#if minutes(d.hero.recipe)}<span>{minutes(d.hero.recipe)}</span>{/if}
						<span>Serves {d.hero.recipe.servings}</span>
						{#if d.hero.recipe.tags[0]}<span>{d.hero.recipe.tags[0]}</span>{/if}
					</p>
					{#if !d.hero.planned}<div class="act"><Button variant="primary" arrow href={planHref}>Plan your day</Button></div>{/if}
				</div>
			</article>
		{:else}
			<article class="card hero welcome" aria-label="Welcome" data-surface="solid">
				<span class="pic plate" data-plate="1" aria-hidden="true">R</span>
				<div class="copy">
					<p class="overline">Welcome</p>
					<h2 class="title">No recipes yet</h2>
					<p class="body">Add the first one to start the archive: import it from a web page or write it down.</p>
					<div class="act"><Button variant="primary" arrow href={link('hifi/import', worst)}>Add your first recipe</Button></div>
				</div>
			</article>
		{/if}
	{/if}

	{#if has('week')}
		<section class="card week" aria-label="This week" data-surface="solid">
			<div class="card-head">
				<h2>This week</h2>
				<a class="plain" href={planHref} data-hover>{d.weekRange}</a>
			</div>
			<ol class="days">
				{#each d.week as day (day.date)}
					{@const entry = firstEntry(day, recipes)}
					{@const n = entryCount(day)}
					<li aria-current={day.date === d.today ? 'date' : undefined}>
						<span class="dayhead">
							<span class="wd">{weekday(day.date)}</span>
							<span class="num">{day.day}</span>
						</span>
						{#if day.date === d.today}<span class="today">Today</span>{/if}
						{#if entry}
							{#if entry.image}<img class="thumb" src={entry.image} alt="" loading="lazy" />{:else}<span class="thumb plate" aria-hidden="true">{entry.initial}</span>{/if}
							<span class="t clamp-2">{entry.title}</span>
							{#if n > 1}<span class="more">+{n - 1}<span class="sr-only"> more</span></span>{/if}
						{:else}
							<span class="t none">Nothing planned</span>
						{/if}
					</li>
				{/each}
			</ol>
		</section>
	{/if}

	{#if has('list')}
		<a class="card side list" href={link(areaPath.list, worst)} aria-label="Shopping list" data-surface="solid" data-hover>
			<span class="card-head"><h2>Shopping list</h2><span class="card-note">{d.list.open.toLocaleString('en-GB')} open</span></span>
			{#if d.list.first.length}
				<ol class="first">
					{#each d.list.first as name (name)}<li class="clamp-2">{name}</li>{/each}
				</ol>
			{:else}
				<span class="empty"><strong>List is empty</strong><span>Add things as you notice them, or fill it from the plan.</span></span>
			{/if}
		</a>
	{/if}

	{#if has('favourite')}
		<a class="card side fav" href={d.favourite ? recipeHref : link(areaPath.recipes, worst)} aria-label="Favourite" data-surface="solid" data-hover>
			<span class="card-head"><h2>Favourite</h2><Icon name="heart" size={20} /></span>
			{#if d.favourite}
				<span class="fav-row">
					{#if d.favourite.image}<img class="thumb" src={d.favourite.image} alt="" loading="lazy" />{:else}<span class="thumb plate" aria-hidden="true">{initial(d.favourite.title)}</span>{/if}
					<span class="fav-body">
						<strong class="clamp-2">{d.favourite.title}</strong>
						<span class="meta">
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
				<a class="plain" href={link(areaPath.recipes, worst)} data-hover>All {plural(d.total, 'recipe', 'recipes')}<Icon name="arrow" size={16} /></a>
			</div>
			<ul class="cards">
				{#each d.recent as r (r.id)}
					<li class="card tile" data-surface="solid">
						{@render picture(r.title, r.image)}
						<h3 class="clamp-2"><a href={recipeHref}>{r.title}</a></h3>
						{#if r.description}<p class="desc clamp-2">{r.description}</p>{/if}
						{#if minutes(r)}<p class="meta"><span>{minutes(r)}</span></p>{/if}
						{#if r.tags.length}<ul class="tags">{#each r.tags.slice(0, 2) as t (t)}<li class="chip" lang={/[^\u0000-ɏ]/.test(t) ? 'und' : undefined}>{t}</li>{/each}</ul>{/if}
						<button type="button" class="heart" data-press="round" aria-pressed={r.favourite} aria-label="{r.favourite ? 'Remove' : 'Add'} {r.title} {r.favourite ? 'from' : 'to'} favourites"><Icon name="heart" size={20} /></button>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if has('spots') && d.spots.length}
		<section class="block" aria-label="Top spots">
			<div class="block-head">
				<h2>Top spots</h2>
				<a class="plain" href={link(areaPath['eating-out'], worst)} data-hover>All spots<Icon name="arrow" size={16} /></a>
			</div>
			<ul class="cards spots">
				{#each d.spots as s (s.id)}
					<li class="card tile" data-surface="solid">
						{@render picture(s.name, s.image)}
						<h3 class="clamp-2"><a href={link(areaPath['eating-out'], worst)}>{s.name}</a></h3>
						<p class="meta"><span>{[s.neighbourhood, s.city].filter(Boolean).join(', ')}</span><span class="score">{s.score}</span></p>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.dash {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		min-inline-size: 0;
	}
	.card {
		min-inline-size: 0;
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.clamp-2,
	.clamp-3 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
	}
	.clamp-2 {
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.clamp-3 {
		-webkit-line-clamp: 3;
		line-clamp: 3;
	}
	.overline {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-0-5) var(--space-3);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
		overflow-wrap: anywhere;
	}
	.body {
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		color: var(--ink-secondary);
	}
	.plain {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		min-block-size: var(--target);
		color: var(--ink);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
		text-decoration: none;
	}
	@media (hover: hover) {
		.plain:hover {
			text-decoration: underline;
			text-underline-offset: var(--space-1);
		}
	}

	/* a recipe or spot picture: a photo, or the plate with its initial; never a gradient */
	.pic {
		display: block;
		inline-size: 100%;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-panel);
		object-fit: cover;
	}
	.pic.plate {
		display: grid;
		place-items: center;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-l-size);
		line-height: 1;
		color: var(--ink);
		box-shadow: var(--ring-hairline);
	}
	.plate[data-plate='1'] {
		background: var(--surface-plate-1);
	}
	.plate[data-plate='2'] {
		background: var(--surface-plate-2);
	}

	.hero {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-3);
		position: relative;
	}
	.hero .copy {
		display: grid;
		gap: var(--space-2-5);
		align-content: start;
		padding: var(--space-1) var(--space-2) var(--space-2);
		min-inline-size: 0;
	}
	.title {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
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
		border-radius: var(--radius-card);
	}
	.act {
		position: relative;
		z-index: var(--z-raised);
		justify-self: start;
		max-inline-size: 100%;
		margin-block-start: var(--space-1);
	}

	.week {
		padding: var(--space-5);
		display: grid;
		gap: var(--space-4);
	}
	.days {
		display: grid;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.days > li {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		min-block-size: var(--target-touch);
		min-inline-size: 0;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}
	.days > li[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.dayhead {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		flex: none;
		inline-size: 4rem;
	}
	.wd {
		font-size: var(--type-overline-size);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
	}
	.num {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
	}
	.today {
		flex: none;
		padding-inline: var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse-tint-strong);
		font-size: var(--type-caption-size);
		line-height: var(--type-label-line);
	}
	.days .thumb {
		--thumb: var(--space-8);
	}
	.days .thumb.plate {
		font-size: var(--type-label-size);
	}
	.t {
		flex: 1;
		min-inline-size: 0;
	}
	.t.none {
		color: var(--ink-muted);
	}
	.days > li[aria-current] .t.none {
		color: var(--ink-on-inverse-muted);
	}
	.more {
		flex: none;
		font-size: var(--type-caption-size);
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}

	.side {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		padding: var(--space-5);
		color: var(--ink);
		text-decoration: none;
	}
	.side .card-head h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
	}
	@media (hover: hover) {
		.side:hover {
			background: var(--surface-raised);
		}
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
		--thumb: var(--space-14);
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
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.tile {
		position: relative;
		display: grid;
		gap: var(--space-2);
		align-content: start;
		padding: var(--space-3);
	}
	.tile .pic.plate {
		font-size: var(--type-display-m-size);
	}
	.tile h3 {
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--weight-semibold);
	}
	.tile h3 a {
		color: inherit;
		text-decoration: none;
	}
	.tile h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-card);
	}
	.tile h3 a:focus-visible::after {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.desc {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.score {
		font-weight: var(--weight-semibold);
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		max-inline-size: 100%;
		padding: var(--space-0-5) var(--space-2-5);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		overflow-wrap: anywhere;
	}
	.heart {
		position: absolute;
		inset-block-start: var(--space-5);
		inset-inline-end: var(--space-5);
		z-index: var(--z-raised);
		display: grid;
		place-items: center;
		inline-size: max(var(--control-height), var(--target));
		block-size: max(var(--control-height), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
	}
	@media (hover: hover) {
		.heart:hover {
			background: var(--surface-sunken);
		}
	}
	.heart[aria-pressed='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.heart[aria-pressed='true']:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}

	@media (min-width: 768px) {
		.hero {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: stretch;
		}
		.hero .pic {
			aspect-ratio: auto;
			min-block-size: 14rem;
			block-size: 100%;
		}
		.hero .copy {
			align-content: end;
			padding: var(--space-3);
		}
		.days {
			grid-template-columns: repeat(7, minmax(0, 1fr));
		}
		.days > li {
			display: grid;
			align-content: start;
			justify-items: start;
			padding: var(--space-3);
			min-block-size: 9rem;
			gap: var(--space-1-5);
		}
		.dayhead {
			inline-size: auto;
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
			grid-template-rows: auto 1fr;
			column-gap: var(--space-4);
		}
		.dash[data-full] > .week,
		.dash[data-full] > .block {
			grid-column: 1 / -1;
		}
		.dash[data-full] > .hero {
			grid-column: 1;
			grid-row: 1 / span 2;
			grid-template-columns: minmax(0, 1fr);
		}
		.dash[data-full] > .hero .pic {
			min-block-size: 16rem;
			block-size: auto;
			aspect-ratio: 2 / 1;
		}
		.dash[data-full] > .list {
			grid-column: 2;
			grid-row: 1;
		}
		.dash[data-full] > .fav {
			grid-column: 2;
			grid-row: 2;
		}
	}
</style>
