<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type { Area } from '#lib/nav.ts';
	import HomeSheet from './wire/shell/HomeSheet.svelte';
	import PhoneBar from './wire/shell/PhoneBar.svelte';
	import PhoneTop from './wire/shell/PhoneTop.svelte';
	import TopBar from './wire/shell/TopBar.svelte';
	import { base, link } from './wire/shell/links.ts';
	import './wire/shell/wire.css';
	import HifiHomeChoices from './hifi/shell/HomeChoices.svelte';
	import HifiPhoneBar from './hifi/shell/PhoneBar.svelte';
	import HifiPhoneStrip from './hifi/shell/PhoneStrip.svelte';
	import HifiSheet from './hifi/shell/Sheet.svelte';
	import HifiTopBar from './hifi/shell/TopBar.svelte';
	import { areaPath as hifiPath, link as hifiLink } from './hifi/shell/links.ts';

	// One frame for both looks, picked by the path: /wire/ is the gate 4 greyscale frame, /hifi/ the gate 5 fingerprint frame.
	// Both have the top bar from 1024 px and the phone strip + dock below (the posture switch, the fingerprint's).
	type Props = { area: Area; children: Snippet; plus?: 'hidden' | 'shown'; photo?: string; photoName?: string };
	let { area, children, plus = 'shown', photo, photoName }: Props = $props();

	const hifi = $derived(page.url.pathname.includes('/hifi/'));
	const stagePhoto = $derived(`/mockups/${photo ?? photoName ?? 'spaghetti-pomodoro'}.jpg`);
	const plusHref = $derived(
		area === 'home'
			? undefined
			: area === 'plan' || area === 'list'
				? `${hifiLink(hifiPath[area])}?add=1${page.url.searchParams.get('data') === 'worst' ? '&data=worst' : ''}`
				: hifiLink(area === 'recipes' ? 'hifi/import' : hifiPath['eating-out'], page.url.searchParams.get('data') === 'worst')
	);
	let hifiSheet = $state(false);
	const worst = $derived(page.url.searchParams.get('data') === 'worst');
	const placement = $derived<'a' | 'b'>(page.url.searchParams.get('placement') === 'b' ? 'b' : 'a');
	const query = (data: 'normal' | 'worst', place: 'a' | 'b') => {
		const q = new URLSearchParams();
		if (data === 'worst') q.set('data', 'worst');
		if (place === 'b') q.set('placement', 'b');
		const s = q.toString();
		return `${page.url.pathname}${s ? `?${s}` : ''}`;
	};

	let sheet = $state<HTMLDialogElement>();
	let sheetOpen = $state(false);
	let plusButton = $state<HTMLElement | null>(null);
	function openSheet(event: Event) {
		plusButton = event.currentTarget as HTMLElement;
		sheet?.showModal();
		sheetOpen = true;
	}
	function closeSheet() {
		sheet?.close();
	}
	function closed() {
		sheetOpen = false;
		plusButton?.focus();
	}
	function outside(event: MouseEvent) {
		if (event.target === sheet) closeSheet();
	}
</script>

{#if hifi}
	<div class="app hf-app" data-photo={stagePhoto} style:--photo={`url("${stagePhoto}")`} data-data={worst ? 'worst' : 'normal'}>
		<div class="frame hf-frame">
			<figure class="stage" aria-hidden="true"><img class="stage-photo" src={stagePhoto} alt="" /></figure>
			<HifiTopBar {area} {worst} live />
			<HifiPhoneStrip {area} {worst} />
			<main class="screen" id="main">
				{@render children()}
			</main>
		</div>
		{#if area === 'home' && plus === 'shown'}
			<HifiSheet bind:open={hifiSheet} title="Add to your kitchen">
				<HifiHomeChoices {worst} />
			</HifiSheet>
		{/if}
		<HifiPhoneBar {area} {worst} {plus} plusHref={plusHref} onplus={area === 'home' ? () => (hifiSheet = true) : undefined} />
	</div>
{:else}
<div class="app wire" data-data={worst ? 'worst' : 'normal'}>
	<nav class="wire-strip" aria-label="Wireframe controls">
		<span>Wireframe, gate 4</span>
		<a href={query('normal', placement)} aria-current={worst ? undefined : 'true'}>Normal data</a>
		<a href={query('worst', placement)} aria-current={worst ? 'true' : undefined}>Worst-case data</a>
		<a href={query(worst ? 'worst' : 'normal', 'a')} aria-current={placement === 'a' ? 'true' : undefined}>Phone placement A</a>
		<a href={query(worst ? 'worst' : 'normal', 'b')} aria-current={placement === 'b' ? 'true' : undefined}>Phone placement B</a>
		<a href={base}>All screens</a>
	</nav>
	<div class="frame wire-frame">
		<div class="slot-top"><TopBar {area} {worst} /></div>
		<div class="slot-strip"><PhoneTop {area} {placement} {worst} /></div>
		<main class="w-main" id="main">
			{@render children()}
		</main>
		<div class="slot-bar">
			<PhoneBar
				{area}
				{worst}
				{plus}
				onplus={area === 'home' ? openSheet : undefined}
				plusHref={area === 'home' ? undefined : link('wire/shell/plus', worst) + `#${area}`}
			/>
		</div>
	</div>
	{#if area === 'home'}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<dialog bind:this={sheet} class="sheet-dialog" aria-label="Add to your kitchen" onclose={closed} onclick={outside}>
			{#if sheetOpen}<HomeSheet {worst} onclose={closeSheet} />{/if}
		</dialog>
	{/if}
</div>
{/if}

<style>
	/* hi-fi: the vendored frame plus the posture switch. Below 1024 px the phone strip replaces the top bar and the vendored dock
	   (the last child of .app) is the nav; from 1024 px the top bar. */
	.hf-app {
		min-block-size: 100dvh;
	}
	.hf-frame > :global(.top) {
		display: none;
	}
	.hf-frame {
		--sticky-block-end: calc(var(--space-16) + var(--space-4));
	}
	.hf-frame :global(main.screen) {
		min-inline-size: 0;
	}
	@media (min-width: 1024px) {
		.hf-frame > :global(.top) {
			display: grid;
		}
		.hf-frame > :global(.strip) {
			display: none;
		}
		.hf-frame {
			--sticky-block-end: 0;
		}
	}
	.app.wire {
		min-block-size: 100dvh;
		padding: var(--space-2);
	}
	.app.wire::before {
		background: var(--surface-page);
		filter: none;
	}
	.app.wire::after {
		content: none;
	}
	.wire-strip {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-3);
		margin-block-end: var(--space-2);
		padding-inline: var(--space-2);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-muted);
	}
	.wire-strip span {
		font-weight: var(--weight-semibold);
		color: var(--ink-secondary);
	}
	.wire-strip a {
		display: inline-flex;
		align-items: center;
		min-block-size: var(--target);
		color: var(--ink-secondary);
	}
	.wire-strip a[aria-current] {
		color: var(--ink);
		font-weight: var(--weight-semibold);
		text-decoration: underline;
		text-underline-offset: var(--space-1);
	}
	.wire-frame {
		--pad-block: var(--space-3);
		--pad-inline: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-block-size: calc(100dvh - 2 * var(--space-2) - var(--space-12));
		padding: var(--pad-block) var(--pad-inline) var(--space-3);
		border-radius: var(--radius-frame-compact);
		background: var(--surface-sunken);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
		box-shadow: none;
	}
	.slot-top {
		display: none;
	}
	.w-main {
		flex: 1;
		min-inline-size: 0;
	}
	.slot-bar {
		position: sticky;
		inset-block-end: max(var(--space-2), env(safe-area-inset-bottom));
		z-index: var(--z-rail);
		padding-block-start: var(--space-3);
	}
	@media (max-width: 767px) {
		.slot-bar {
			margin-inline: calc(-1 * var(--pad-inline));
		}
	}
	@media (min-width: 768px) {
		.app.wire {
			padding: var(--space-4);
		}
		.wire-frame {
			--pad-block: var(--space-5);
			--pad-inline: var(--space-5);
			border-radius: var(--radius-frame);
		}
	}
	@media (min-width: 1024px) {
		.slot-top {
			display: block;
		}
		.slot-strip,
		.slot-bar {
			display: none;
		}
		.wire-frame {
			--pad-block: var(--space-5);
			--pad-inline: var(--space-6);
			max-inline-size: var(--frame-max-width);
			margin-inline: auto;
		}
	}
	.sheet-dialog {
		inline-size: 100%;
		max-inline-size: 32rem;
		margin: auto auto 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--ink);
		overflow: visible;
	}
	.sheet-dialog::backdrop {
		background: var(--scrim);
		opacity: 0.6;
	}
</style>
