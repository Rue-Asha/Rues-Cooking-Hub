<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Menu, { type MenuItem } from '#lib/components/menu/Menu.svelte';
	import { pop, reducedMotion, spotHeroName } from '#lib/motion.ts';
	import { clearOfBar } from '#lib/shell/clear.ts';
	import { useStage } from '#lib/shell/stage.svelte.ts';
	import DeleteSpot from '#lib/spots/DeleteSpot.svelte';
	import { locationText, priceText } from '#lib/spots/format.ts';
	import MarkVisited from '#lib/spots/MarkVisited.svelte';
	import { formatScore } from '#lib/spots/score.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const spot = $derived(data.spot);
	const location = $derived(locationText(spot.neighbourhood, spot.city));
	const host = $derived.by(() => {
		if (!spot.website) return '';
		try {
			return new URL(spot.website).hostname.replace(/^www\./, '');
		} catch {
			return spot.website;
		}
	});

	useStage(() => (spot.imageId !== null ? `/images/${spot.imageId}` : null));

	// the stage photo (or the plate) is the shared element of the list transition; the shell owns the image, so the name is set from here
	$effect(() => {
		if (spot.imageId === null || reducedMotion()) return;
		const app = document.querySelector<HTMLElement>('.app');
		app?.style.setProperty('--hero-name', spotHeroName(spot.id));
		return () => app?.style.removeProperty('--hero-name');
	});

	let deleting = $state(false);
	let visiting = $state(false);

	// a name that runs past ~100 characters is cut back to its last whole word; the accent is the last word shown
	const shown = $derived.by(() => {
		const title = spot.name.trim();
		if (title.length < 100 || !/\p{L}$/u.test(title) || !title.includes(' ')) return { text: title, cut: false };
		return { text: title.slice(0, title.lastIndexOf(' ')), cut: true };
	});
	const words = $derived(shown.text.split(/\s+/));
	const last = $derived(words.at(-1) ?? '');
	const before = $derived(words.slice(0, -1).join(' '));
	const initial = $derived([...spot.name.trim()][0] ?? '?');

	const lang = (text: string) => (/[^\u0000-ɏ]/.test(text) ? 'und' : undefined);
	const KICKER_TAGS = 3;
	const kickerTags = $derived(spot.tags.slice(0, KICKER_TAGS).map((t) => t.name));
	const moreTags = $derived(spot.tags.slice(KICKER_TAGS).map((t) => t.name));

	// the cards settle in on a full page load only, never on in-app navigation
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');

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
	const items: MenuItem[] = [{ label: 'Edit' }, { label: 'Delete spot', danger: true, separator: true }];

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
		if (item.label === 'Edit') void goto(`/eating-out/${spot.id}/edit`);
		else deleting = true;
	}
	function outside(event: PointerEvent) {
		if (menuOpen && !actionsEl?.contains(event.target as Node)) closeMenu();
	}
</script>

<svelte:head>
	<title>{spot.name} · Rues Cooking Hub</title>
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
		<Button variant="quiet" icon label="More spot actions" aria-haspopup="menu" aria-expanded={menuOpen} onclick={toggleMenu}>
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
		{#if spot.imageId === null}<span class="thumb plate" role="img" aria-label="No photo yet" style:--hero-name={spotHeroName(spot.id)}>{initial}</span>{/if}
		<ul class="kicker">
			<li>{spot.status === 'visited' ? 'Visited' : 'Want to go'}</li>
			{#each kickerTags as tag (tag)}<li lang={lang(tag)}>{tag}</li>{/each}
		</ul>
		<h1 data-long={spot.name.length > 60 ? '' : undefined} title={shown.cut ? spot.name : undefined}>{#if before}{before}{' '}{/if}<em class="accent-word">{last}</em>{shown.cut ? '…' : ''}</h1>
	</div>

	{#if spot.price || location || spot.status === 'want'}
		<div class="seg-bar">
			{#if spot.price}
				<div class="seg">
					<Icon name="fork" size={20} />
					<div class="seg-text">
						<span class="seg-label">Price</span>
						<span class="seg-value">{priceText(spot.price)}</span>
					</div>
				</div>
			{/if}
			{#if location}
				<div class="seg">
					<Icon name="pin" size={20} />
					<div class="seg-text">
						<span class="seg-label">Where</span>
						<span class="seg-value where">{location}</span>
					</div>
				</div>
			{/if}
			{#if spot.status === 'want'}
				<div class="seg-actions"><Button variant="primary" arrow onclick={() => (visiting = true)}>Mark visited</Button></div>
			{/if}
		</div>
	{/if}
</header>

<!-- neither first nor last in the template: Svelte removes a page from its first to its last node, which must both stay in <main> -->
<div class="rail" role="group" aria-label="Spot actions" data-wait {@attach toFrame}>
	<Button variant="quiet" icon label="Back to Eating Out" href="/eating-out"><Icon name="arrow-left" size={20} /></Button>
</div>

<div class="screen-body">
	<div class="cols">
		<div class="col" data-settle={settle ? '' : undefined}>
			<aside class="card facts" data-surface="inverse" aria-label="Score">
				<p class="overline">Score</p>
				<p class="big">
					{#if spot.scoreHundredths !== null}
						<span class="figure">{formatScore(spot.scoreHundredths)}</span><span class="unit">out of 10</span>
					{:else}
						<span class="figure">–</span><span class="unit">not visited yet</span>
					{/if}
				</p>
				{#if moreTags.length}
					<ul class="tags" aria-label="More tags">
						{#each moreTags as tag (tag)}<li lang={lang(tag)}>{tag}</li>{/each}
					</ul>
				{/if}
			</aside>
		</div>

		<div class="col" data-settle={settle ? '' : undefined}>
			{#if spot.address || spot.website}
				<section class="card details" data-surface="solid" aria-labelledby="details-title">
					<div class="card-head"><h2 id="details-title">Details</h2></div>
					{#if spot.address}
						<div class="row">
							<div class="row-main">
								<p class="label">Address</p>
								<p class="value" data-prose>{spot.address}</p>
							</div>
							{#if data.maps}
								<Button size="s" href={data.maps} target="_blank" rel="noopener noreferrer">
									Open in Maps<span class="sr-only"> (opens in a new tab)</span><Icon name="arrow-up-right" size={16} />
								</Button>
							{/if}
						</div>
					{/if}
					{#if spot.website}
						<div class="row">
							<div class="row-main">
								<p class="label">Website</p>
								<p class="value">{host}</p>
							</div>
							<Button size="s" href={spot.website} target="_blank" rel="noopener noreferrer">
								Visit<span class="sr-only"> (opens in a new tab)</span><Icon name="arrow-up-right" size={16} />
							</Button>
						</div>
					{/if}
				</section>
			{/if}

			{#if data.notes}
				<section class="card" data-surface="solid" aria-labelledby="notes-title">
					<div class="card-head"><h2 id="notes-title">Notes</h2></div>
					<div class="notes" data-notes data-prose>{@html data.notes}</div>
				</section>
			{/if}
		</div>
	</div>
</div>

{#if spot.status === 'want'}
	<MarkVisited open={visiting} name={spot.name} onclose={() => (visiting = false)} />
{/if}
<DeleteSpot open={deleting} name={spot.name} onclose={() => (deleting = false)} />

<style>
	/* a tag with no break point wraps inside the kicker instead of widening the page */
	.kicker li {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}

	@media (prefers-reduced-motion: no-preference) {
		:global(.stage-photo),
		.plate {
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

	.where {
		overflow-wrap: anywhere;
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
	.details {
		gap: var(--space-2);
	}
	.details .card-head {
		margin-block-end: var(--space-1);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding-block: var(--space-3);
		box-shadow: var(--rule-below);
	}
	.row-main {
		min-inline-size: 0;
	}
	.label {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
	.value {
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		overflow-wrap: anywhere;
	}
	.notes {
		min-inline-size: 0;
		overflow-wrap: anywhere;
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

	@media (min-width: 768px) {
		.cols {
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		}
	}
</style>
