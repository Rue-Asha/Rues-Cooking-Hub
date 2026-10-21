<script lang="ts">
	import { detail } from '#lib/mockups/fixtures.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

	const r = detail.recipe;
	const amount = /^((?:\d+[,.]?\d*|[½¼¾])(?:\s?(?:g|kg|ml|l|tbsp|tsp|cloves?|bunch|slices?|thumb of))?)\s(.*)$/;
	const split = (line: string) => {
		const m = line.match(amount);
		return m ? { amount: m[1], rest: m[2] } : { amount: '', rest: line };
	};
	const offsets = detail.steps.map((_, i) => detail.steps.slice(0, i).reduce((n, sec) => n + sec.lines.length, 0));
	const stepNo = (s: number, j: number) => String(offsets[s] + j + 1).padStart(2, '0');
</script>

<div class="hero">
	<img src={r.image} alt="" style="view-transition-name: recipe-hero-{r.id}" />
	<div class="hero-controls column">
		<ArrowButton href="/__mockups/recipes" variant="glass" direction="left" label="Back to recipes" />
		<IconButton icon="heart" label="Remove from favourites" pressed />
	</div>
</div>

<div class="column panel-row" data-column>
	<GlassPanel as="header" strong class="info" data-page-header>
		<Kicker parts={r.tags} />
		<h1>Roasted pumpkin soup <em>with sage brown butter</em></h1>
		<p class="desc">{r.description}</p>
		<div class="actions">
			<Button>Add to plan</Button>
			<Button variant="secondary" arrow={false} icon="edit">Edit</Button>
			<IconButton icon="trash" label="Delete recipe" variant="outline" class="delete" />
			<a class="source" href={r.sourceUrl}>bonappetit.com <Icon name="arrow-up-right" size={16} /></a>
		</div>
	</GlassPanel>
	<GlassPanel strong class="stats-card">
		<dl class="stats">
			<div><dt><Icon name="clock" size={18} /> Prep</dt><dd class="tnum">15 <span>min</span></dd></div>
			<div><dt><Icon name="clock" size={18} /> Cook</dt><dd class="tnum">40 <span>min</span></dd></div>
			<div><dt><Icon name="sparkle" size={18} /> Total</dt><dd class="tnum">55 <span>min</span></dd></div>
			<div><dt><Icon name="users" size={18} /> Serves</dt><dd class="tnum">4</dd></div>
		</dl>
	</GlassPanel>
	<a class="planned" href="/__mockups/plan">
		<span class="planned-top">
			<span class="planned-kicker">Planned</span>
			<ArrowButton decorative variant="light" direction="up-right" />
		</span>
		<span class="planned-title">Wednesday <em>dinner</em></span>
		<span class="planned-sub">and Thursday lunch · 2 entries</span>
	</a>
</div>

<div class="column body" data-column>
	<aside class="ingredients">
		<div class="col-head">
			<h2 data-section-heading>Ingredients</h2>
			<span class="for">for 4</span>
		</div>
		<div class="ing-card">
			{#each detail.ingredients as section, s (s)}
				{#if section.title}<h3 class="sub">{section.title}</h3>{/if}
				<ul>
					{#each section.lines as line (line)}
						{@const p = split(line)}
						<li>{#if p.amount}<b class="tnum">{p.amount}</b>{' '}{/if}{p.rest}</li>
					{/each}
				</ul>
			{/each}
		</div>
	</aside>

	<div class="method">
		<div class="col-head"><h2>Method</h2></div>
		{#each detail.steps as section, s (s)}
			{#if section.title}<h3 class="sub">{section.title}</h3>{/if}
			<ol>
				{#each section.lines as line, j (line)}
					<li><span class="no tnum">{stepNo(s, j)}</span><p>{line}</p></li>
				{/each}
			</ol>
		{/each}

		<section class="notes" aria-labelledby="notes-title">
			<h3 id="notes-title" class="sub">Notes</h3>
			<p>
				Doubles well — freeze half <strong>before</strong> adding the coconut milk. Butternut works too, but needs
				peeling. Rue’s tweak: a pinch of <em>smoked paprika</em> in the croutons.
			</p>
		</section>
	</div>
</div>

<style>
	.hero {
		position: relative;
		block-size: clamp(420px, 62vh, 560px);
		overflow: hidden;
		border-end-start-radius: var(--r-frame);
		border-end-end-radius: var(--r-frame);
	}

	.hero img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		transform: scale(1.04);
	}

	.hero-controls {
		display: none;
	}

	.panel-row {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: 1fr 300px 264px;
		gap: var(--s-4);
		align-items: end;
		margin-block-start: -240px;
	}

	.panel-row > :global(:not(.info)) {
		block-size: 236px;
	}

	.panel-row :global(.info) {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-7);
	}

	.panel-row :global(.stats-card) {
		padding: var(--s-6);
	}

	.planned {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		min-block-size: 220px;
		padding: var(--s-6);
		border-radius: var(--r-panel);
		background: var(--dark);
		color: var(--on-dark);
		box-shadow: var(--shadow-float);
	}

	.planned-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-block-end: auto;
	}

	.planned-kicker {
		font-size: var(--t-kicker);
		font-weight: 500;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		padding-block-start: 12px;
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

	h1 {
		font-size: 52px;
	}

	h1 em {
		color: var(--brick);
	}

	.desc {
		max-inline-size: 52ch;
		font-size: 16px;
		color: var(--ink);
	}

	.stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin: 0;
	}

	.stats div {
		padding: var(--s-4) var(--s-4) var(--s-4) 0;
	}

	.stats div:nth-child(even) {
		padding-inline-start: var(--s-5);
		border-inline-start: 1px solid var(--line);
	}

	.stats div:nth-child(n + 3) {
		border-block-start: 1px solid var(--line);
	}

	dt {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink);
	}

	dd {
		margin: 6px 0 0;
		font-family: var(--font-display);
		font-size: 34px;
		font-weight: 300;
		line-height: 1;
	}

	dd span {
		font-family: var(--font-text);
		font-size: 14px;
		font-weight: 500;
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
		gap: 4px;
		min-block-size: 44px;
		margin-inline-start: auto;
		font-size: 14px;
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.body {
		display: grid;
		grid-template-columns: 360px 1fr;
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

	h2 {
		font-size: var(--t-display-3);
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

	.ing-card ul li {
		padding-block: 11px;
		border-block-end: 1px solid var(--line);
		font-size: 15px;
	}

	.ing-card ul li:last-child {
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
		grid-template-columns: 56px 1fr;
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

	.method p {
		max-inline-size: 62ch;
		font-size: 16px;
		line-height: 1.65;
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

	.notes p {
		line-height: 32px;
		font-size: 16px;
		background: repeating-linear-gradient(180deg, transparent 0 31px, var(--olive-wash) 31px 32px);
	}

	@media (max-width: 1023px) {
		.hero {
			block-size: 440px;
			border-radius: 0;
		}

		.hero-controls {
			position: absolute;
			inset-block-start: var(--s-4);
			inset-inline: 0;
			display: flex;
			justify-content: space-between;
		}

		.hero-controls :global(.pressed) {
			background: var(--glass);
		}

		.panel-row {
			grid-template-columns: 1fr 1fr;
			gap: var(--s-3);
			margin-block-start: -120px;
		}

		.panel-row :global(.info) {
			grid-column: 1 / -1;
		}

		.panel-row > :global(:not(.info)) {
			block-size: auto;
		}

		.panel-row :global(.stats-card) {
			padding: var(--s-2) var(--s-4);
			align-self: stretch;
		}

		.planned {
			min-block-size: 0;
			padding: var(--s-4);
		}

		.planned-title {
			font-size: 22px;
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

		.stats div {
			padding-block: var(--s-3);
		}

		.stats div:nth-child(even) {
			padding-inline-start: var(--s-3);
		}

		dt {
			font-size: 10px;
			letter-spacing: 0.08em;
		}

		dt :global(.icon) {
			display: none;
		}

		dd {
			font-size: 24px;
		}

		dd span {
			font-size: 12px;
		}

		.actions :global(.btn:first-child) {
			flex: 1;
		}

		.source {
			margin-inline-start: 0;
		}

		.body {
			grid-template-columns: 1fr;
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
			grid-template-columns: 44px 1fr;
		}

		.no {
			font-size: 24px;
		}
	}
</style>
