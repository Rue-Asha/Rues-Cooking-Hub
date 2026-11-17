<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Menu, { type MenuItem } from '#lib/components/menu/Menu.svelte';
	import { canonicalUnit, parseIngredient } from '#lib/ingredients/parse.ts';
	import { scaleIngredient } from '#lib/ingredients/scale.ts';
	import { heroName, pop, reducedMotion } from '#lib/motion.ts';
	import AddToPlan from '#lib/recipes/AddToPlan.svelte';
	import DeleteRecipe from '#lib/recipes/DeleteRecipe.svelte';
	import FavouriteButton from '#lib/recipes/FavouriteButton.svelte';
	import { keepAwake } from '#lib/recipes/wake-lock.ts';
	import { clearOfBar } from '#lib/shell/clear.ts';
	import { useStage } from '#lib/shell/stage.svelte.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const recipe = $derived(data.recipe);

	useStage(() => (recipe.imageId !== null ? `/images/${recipe.imageId}` : null));

	// the stage photo is the shared element of the archive transition; the shell owns the image, so the name is set from here
	$effect(() => {
		if (recipe.imageId === null || reducedMotion()) return;
		const app = document.querySelector<HTMLElement>('.app');
		app?.style.setProperty('--hero-name', heroName(recipe.id));
		return () => app?.style.removeProperty('--hero-name');
	});

	$effect(keepAwake);

	let deleting = $state(false);
	let planning = $state(false);

	// a title that runs past ~100 characters is cut back to its last whole word; the accent is the last word shown
	const shown = $derived.by(() => {
		const title = recipe.title.trim();
		if (title.length < 100 || !/\p{L}$/u.test(title) || !title.includes(' ')) return { text: title, cut: false };
		return { text: title.slice(0, title.lastIndexOf(' ')), cut: true };
	});
	const words = $derived(shown.text.split(/\s+/));
	const last = $derived(words.at(-1) ?? '');
	const before = $derived(words.slice(0, -1).join(' '));
	const initial = $derived([...recipe.title.trim()][0] ?? '?');

	const lang = (text: string) => (/[^\u0000-ɏ]/.test(text) ? 'und' : undefined);
	const KICKER_TAGS = 3;
	const kickerTags = $derived(recipe.tags.slice(0, KICKER_TAGS).map((t) => t.name));
	const moreTags = $derived(recipe.tags.slice(KICKER_TAGS).map((t) => t.name));

	// the lede on the photo stops at three lines; the full text is one tap away
	let more = $state(false);
	let clamped = $state(false);
	function measure(el: HTMLElement) {
		const check = () => {
			if (!more) clamped = el.scrollHeight > el.clientHeight + 1;
		};
		const observer = new ResizeObserver(check);
		observer.observe(el);
		return () => observer.disconnect();
	}

	const total = $derived(
		recipe.prepMinutes === null && recipe.cookMinutes === null ? null : (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)
	);
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

	const ingredientCount = $derived(data.ingredients.reduce((n, s) => n + s.lines.length, 0));
	const stepCount = $derived(data.steps.reduce((n, s) => n + s.lines.length, 0));
	const plural = (n: number, one: string) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : `${one}s`}`;

	// step numbers run on across sections
	const offsets = $derived(data.steps.map((_, i) => data.steps.slice(0, i).reduce((n, s) => n + s.lines.length, 0)));
	const stepNo = (s: number, j: number) => offsets[s] + j + 1;

	// scaling is a view only: whole servings from 1, anything else keeps the last scale and says so
	const uid = $props.id();
	let ui = $state<{ servings: number; field: string; alert: boolean } | null>(null);
	const servings = $derived(ui?.servings ?? recipe.servings);
	const field = $derived(ui?.field ?? String(servings));
	const alert = $derived(ui?.alert ?? false);
	const own = $derived(servings === recipe.servings);

	function type(text: string) {
		if (/^\d+$/.test(text.trim()) && Number(text) >= 1) ui = { servings: Number(text), field: text, alert: false };
		else ui = { servings, field: text, alert: true };
	}
	function step(by: number) {
		const next = Math.max(1, servings + by);
		ui = { servings: next, field: String(next), alert: false };
	}

	// the leading amount ("800 ml", "0.75 tsp", "3–4.5 cloves") is set in bold, as the server does for the written lines
	function splitAmount(text: string): { amount: string; rest: string } {
		const words = text.split(' ');
		let n = 0;
		while (n < words.length && /^[\d½¼¾⅓⅔.,/–-]+$/.test(words[n]) && /[\d½¼¾⅓⅔]/.test(words[n])) n++;
		if (n === 0) return { amount: '', rest: text };
		if (n < words.length - 1 && canonicalUnit(words[n]) !== null) n++;
		return { amount: words.slice(0, n).join(' '), rest: words.slice(n).join(' ') };
	}
	function line(s: number, j: number) {
		const written = data.ingredients[s].lines[j];
		if (own) return { ...written, scaled: false };
		const text = recipe.ingredients[s].lines[j].text;
		const out = scaleIngredient(parseIngredient(text), recipe.servings, servings);
		return out === text ? { ...written, scaled: false } : { ...splitAmount(out), scaled: true };
	}

	// the rail belongs to the frame's grid, beside the head; the shell has no rail slot, so it moves up once mounted
	function toFrame(node: HTMLElement) {
		const frame = node.closest('.frame');
		const screen = frame?.querySelector(':scope > main.screen');
		if (!frame || !screen) return;
		frame.insertBefore(node, screen);
		node.removeAttribute('data-wait');
		return () => node.remove();
	}

	let menuOpen = $state(false);
	let actionsEl = $state<HTMLElement>();
	let popover = $state<HTMLElement>();
	const items: MenuItem[] = [{ label: 'Edit' }, { label: 'Delete recipe', danger: true, separator: true }];

	async function toggleMenu() {
		menuOpen = !menuOpen;
		if (!menuOpen) return;
		await tick();
		popover?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
	}
	function closeMenu(refocus = false) {
		menuOpen = false;
		if (refocus) actionsEl?.querySelector<HTMLElement>('.btn')?.focus();
	}
	function pick(item: MenuItem) {
		closeMenu(true);
		if (item.label === 'Edit') void goto(`/recipes/${recipe.id}/edit`);
		else deleting = true;
	}
	function outside(event: PointerEvent) {
		if (menuOpen && !actionsEl?.contains(event.target as Node)) closeMenu();
	}

	// the cards settle in on a full page load only, never on in-app navigation
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');
</script>

<svelte:head>
	<title>{recipe.title} · Rues Cooking Hub</title>
</svelte:head>

<svelte:window onpointerdown={outside} />

<header class="screen-head">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="detail-actions"
		bind:this={actionsEl}
		onkeydown={(e) => e.key === 'Escape' && menuOpen && closeMenu(true)}
		onfocusout={(e) => menuOpen && !actionsEl?.contains(e.relatedTarget as Node) && closeMenu()}
	>
		<Button variant="quiet" icon label="More recipe actions" aria-haspopup="menu" aria-expanded={menuOpen} onclick={toggleMenu}>
			<Icon name="dots" size={20} />
		</Button>
		{#if menuOpen}
			<div class="popover" bind:this={popover} use:clearOfBar in:pop out:pop onoutrostart={(e) => e.currentTarget.setAttribute('aria-hidden', 'true')}>
				<Menu name="More actions" {items} onselect={pick}>
					{#snippet icon(item)}<Icon name={item.label === 'Edit' ? 'edit' : 'trash'} size={16} />{/snippet}
				</Menu>
			</div>
		{/if}
	</div>

	<div class="screen-lead">
		{#if recipe.imageId === null}<span class="thumb plate" role="img" aria-label="No photo yet">{initial}</span>{/if}
		<ul class="kicker">
			<li>Recipe</li>
			{#each kickerTags as tag (tag)}<li lang={lang(tag)}>{tag}</li>{/each}
		</ul>
		<h1 data-long={recipe.title.length > 60 ? '' : undefined} title={shown.cut ? recipe.title : undefined}>{#if before}{before}{' '}{/if}<em class="accent-word">{last}</em>{shown.cut ? '…' : ''}</h1>
		{#if recipe.description}
			<p class="lede" class:clamp={!more} {@attach measure}>{recipe.description}</p>
			{#if clamped || more}
				<Button variant="quiet" size="s" aria-expanded={more} onclick={() => (more = !more)}>{more ? 'Less' : 'More'}</Button>
			{/if}
		{/if}
	</div>

	<div class="seg-bar">
		<div class="seg" role="group" aria-label="Scale recipe">
			<Icon name="users" size={20} />
			<div class="seg-text">
				<label class="seg-label" for="{uid}-s">Scale to servings</label>
				<div class="stepper">
					<button type="button" class="step" data-press="round" aria-label="Scale down" disabled={servings <= 1 && !alert} onclick={() => step(-1)}><Icon name="minus" size={14} /></button>
					<input id="{uid}-s" class="num" inputmode="numeric" autocomplete="off" value={field} aria-invalid={alert} aria-describedby={alert ? `${uid}-err` : undefined} oninput={(e) => type(e.currentTarget.value)} />
					<button type="button" class="step" data-press="round" aria-label="Scale up" onclick={() => step(1)}><Icon name="plus" size={14} /></button>
					{#if !own && !alert}
						<Button variant="quiet" size="s" onclick={() => (ui = null)}>Reset to {plural(recipe.servings, 'serving')}</Button>
					{/if}
				</div>
			</div>
		</div>
		{#if times}
			<div class="seg">
				<Icon name="clock" size={20} />
				<div class="seg-text">
					<span class="seg-label">Time</span>
					<span class="seg-value" data-times>{times}</span>
				</div>
			</div>
		{/if}
		<div class="seg-actions"><Button variant="primary" arrow onclick={() => (planning = true)}>Add to plan</Button></div>
		{#if alert}<p class="alert" id="{uid}-err" role="alert"><Icon name="alert" size={14} />Servings must be at least 1</p>{/if}
	</div>
</header>

<!-- neither first nor last in the template: Svelte removes a page from its first to its last node, which must both stay in <main> -->
<div class="rail" role="group" aria-label="Recipe actions" data-wait {@attach toFrame}>
	<Button variant="quiet" icon label="Back to recipes" href="/recipes"><Icon name="arrow-left" size={20} /></Button>
	<FavouriteButton id={recipe.id} title={recipe.title} favourite={recipe.favourite} variant="plain" />
</div>

<div class="screen-body">
	<div class="cols">
		<div class="col" data-settle={settle ? '' : undefined}>
			<section class="card ingredients" data-surface="solid" aria-labelledby="{uid}-ing">
				<div class="card-head">
					<h2 id="{uid}-ing">Ingredients</h2>
					<span class="card-note">for {servings}</span>
				</div>
				{#if ingredientCount === 0}
					<p class="hint">No ingredients yet.</p>
				{:else}
					{#each data.ingredients as section, s (s)}
						{#if section.title}<h3 class="ruled">{section.title}</h3>{/if}
						<ul class="lines" data-prose>
							{#each section.lines as _, j (j)}
								{@const l = line(s, j)}
								<li data-scaled={l.scaled && l.amount !== '' ? '' : undefined}>
									<span class="amt">{l.amount}</span>
									<span class="what">{l.rest}</span>
								</li>
							{/each}
						</ul>
					{/each}
				{/if}
			</section>

			<aside class="card facts" data-surface="inverse" aria-label="At a glance">
				<p class="overline">At a glance</p>
				<p class="big">
					{#if total !== null}
						<span class="figure">{total.toLocaleString('en-GB')}</span><span class="unit">min in total</span>
					{:else}
						<span class="figure">{recipe.servings}</span><span class="unit">{recipe.servings === 1 ? 'serving' : 'servings'}</span>
					{/if}
				</p>
				<ul class="rules">
					{#if total !== null}<li>Serves {recipe.servings}</li>{/if}
					<li>{plural(ingredientCount, 'ingredient')}</li>
					<li>{plural(stepCount, 'step')}</li>
				</ul>
				{#if moreTags.length}
					<ul class="tags" aria-label="More tags">
						{#each moreTags as tag (tag)}<li lang={lang(tag)}>{tag}</li>{/each}
					</ul>
				{/if}
				{#if source}
					<a class="source" href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" data-hover>
						<span class="source-text"><span class="label">Source</span> {source}<span class="sr-only"> (opens in a new tab)</span></span>
						<span class="circle" aria-hidden="true"><span data-nudge="out"><Icon name="arrow-up-right" size={16} /></span></span>
					</a>
				{/if}
			</aside>
		</div>

		<div class="col" data-settle={settle ? '' : undefined}>
			<section class="card" data-surface="solid" aria-labelledby="{uid}-met">
				<div class="card-head"><h2 id="{uid}-met">Method</h2></div>
				{#each data.steps as section, s (s)}
					{#if section.title}<h3 class="ruled">{section.title}</h3>{/if}
					<ol class="steps" data-prose>
						{#each section.lines as text, j (j)}
							<li><span class="n" aria-hidden="true">{stepNo(s, j)}</span><span class="step-text">{@html text}</span></li>
						{/each}
					</ol>
				{:else}
					<p class="hint">No steps yet.</p>
				{/each}
			</section>

			{#if data.notes}
				<section class="card" data-surface="solid" aria-labelledby="{uid}-notes">
					<div class="card-head"><h2 id="{uid}-notes">Notes</h2></div>
					<div class="notes" data-prose>{@html data.notes}</div>
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
	/* a tag with no break point wraps inside the kicker instead of widening the page */
	.kicker li {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}

	@media (prefers-reduced-motion: no-preference) {
		:global(.stage-photo) {
			view-transition-name: var(--hero-name, none);
			view-transition-class: recipe-hero;
		}
	}

	.rail[data-wait] {
		position: absolute;
		visibility: hidden;
	}

	/* a long screen title steps down one role, and the lead's width replaces the 9em cap */
	h1[data-long] {
		max-inline-size: none;
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
		text-wrap: pretty;
	}

	.thumb {
		--thumb: var(--space-14);
	}

	.lede.clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}

	.detail-actions {
		position: absolute;
		inset-block-start: var(--space-4);
		inset-inline-end: 0;
		z-index: var(--z-rail);
	}

	.popover {
		position: absolute;
		inset-block-start: calc(100% + var(--space-2));
		inset-inline-end: 0;
		z-index: var(--z-menu);
		inline-size: max-content;
		max-inline-size: calc(100vw - var(--space-8));
		/* it grows out of the ··· button above its right edge */
		transform-origin: top right;
	}

	/* scrolled low on a short screen: it opens upwards, clear of the phone bar */
	.popover:global([data-side='above']) {
		inset-block-start: auto;
		inset-block-end: calc(100% + var(--space-2));
		transform-origin: bottom right;
	}

	.screen-lead {
		padding-inline-end: var(--space-12);
	}

	.stepper {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1);
	}
	.step {
		display: grid;
		place-items: center;
		inline-size: max(var(--control-height-xs), var(--target));
		block-size: max(var(--control-height-xs), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
	}
	.step:disabled {
		opacity: var(--disabled-opacity);
	}
	.num {
		inline-size: max(3.2ch, var(--target));
		min-block-size: var(--target);
		min-inline-size: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: none;
		box-shadow: var(--rule-below-control);
		text-align: center;
		font-size: var(--type-body-size);
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}
	.num[aria-invalid='true'] {
		box-shadow: var(--ring-danger);
		border-radius: var(--radius-text);
	}
	.alert {
		flex-basis: 100%;
		padding: var(--space-1) var(--space-3);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-weight: var(--weight-semibold);
		color: var(--danger);
	}
	.alert :global(svg) {
		display: inline;
		vertical-align: -0.15em;
		margin-inline-end: var(--space-1);
	}

	.cols,
	.col {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		align-content: start;
		min-inline-size: 0;
	}
	.card {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.ingredients {
		gap: var(--space-3);
	}
	.hint {
		color: var(--ink-secondary);
	}
	.lines,
	.steps {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.lines {
		grid-template-columns: fit-content(45%) minmax(0, 1fr);
		column-gap: var(--space-3);
	}
	.lines li {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
		padding-block: var(--space-2);
		box-shadow: var(--rule-below);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}
	.amt {
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
		overflow-wrap: anywhere;
	}
	.lines li[data-scaled] .amt {
		color: var(--accent-text);
	}
	.lines li:has(.amt:empty) .what {
		grid-column: 1 / -1;
	}
	.lines li:has(.amt:empty) .amt {
		display: none;
	}
	.what {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.steps {
		gap: var(--space-4);
	}
	.steps li {
		display: grid;
		grid-template-columns: var(--space-8) minmax(0, 1fr);
		gap: var(--space-3);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}
	.steps .n {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
	.step-text,
	.notes {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.notes {
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}
	.notes :global(:is(p, ul, ol, blockquote, pre)) {
		margin-block: 0 var(--space-3);
	}
	.notes :global(:is(p, ul, ol, blockquote, pre):last-child) {
		margin-block-end: 0;
	}
	.notes :global(ul) {
		padding-inline-start: 1.2em;
		list-style: disc;
	}
	.notes :global(ol) {
		padding-inline-start: 1.4em;
		list-style: decimal;
	}
	.notes :global(a) {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.facts {
		gap: var(--space-4);
	}
	.overline {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-on-inverse-secondary);
	}
	.big {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-2-5);
	}
	.figure {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-l-size);
		line-height: 1;
		letter-spacing: var(--type-display-l-tracking);
		font-variant-numeric: var(--numeric-figures);
	}
	.unit {
		font-size: var(--type-body-s-size);
		color: var(--ink-on-inverse-secondary);
	}
	.rules {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.rules li {
		padding: var(--space-0-5) 0 var(--space-0-5) var(--space-3-5);
		box-shadow: var(--rule-start-on-inverse);
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--weight-medium);
		text-transform: uppercase;
		font-variant-numeric: var(--numeric-figures);
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.tags li {
		max-inline-size: 100%;
		padding: var(--space-0-5) var(--space-2-5);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse-tint-strong);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		overflow-wrap: anywhere;
	}
	.source {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1) var(--space-1) var(--space-1) var(--space-4);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse-tint);
		box-shadow: var(--ring-on-inverse);
		color: var(--ink-on-inverse);
		font-size: var(--type-body-s-size);
		line-height: 1.3;
		text-decoration: none;
	}
	.source-text {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.label {
		color: var(--ink-on-inverse-secondary);
	}
	.circle {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-9);
		block-size: var(--space-9);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		color: var(--ink);
	}
	.circle > span {
		display: grid;
	}
	@media (hover: hover) {
		.source:hover {
			background: var(--surface-inverse-tint-strong);
		}
	}

	@media (min-width: 768px) {
		.cols {
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		}
	}
	/* on the phone the two columns dissolve: ingredients, method, notes, then the facts */
	@media (max-width: 767px) {
		.col {
			display: contents;
		}
		.col:first-child > :global(.facts) {
			order: 3;
		}
		.col:last-child > :global(*) {
			order: 2;
		}
	}
</style>
