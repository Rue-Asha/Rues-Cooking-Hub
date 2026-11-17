<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto, pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { activeArea, headerActions, plusHidden } from '#lib/nav.ts';
	import HomeSheet from './HomeSheet.svelte';
	import PhoneBar from './PhoneBar.svelte';
	import PhoneStrip from './PhoneStrip.svelte';
	import TopBar from './TopBar.svelte';
	import { stage } from './stage.svelte.ts';
	import { tick } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const area = $derived(activeArea(page.url.pathname));
	const actions = $derived(headerActions(area));
	const hidePlus = $derived(plusHidden(page.url.pathname));

	let scrollY = $state(0);
	const compact = $derived(scrollY > 48);

	// "Search recipes" lands on the archive with its search field focused, also when the archive is already open
	async function searchRecipes(event: MouseEvent) {
		if (actions.search.href !== '/recipes') return;
		if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		const focus = () => document.querySelector<HTMLInputElement>('main input[type="search"]')?.focus();
		if (page.url.pathname !== '/recipes') {
			await goto('/recipes');
			await tick();
		}
		focus();
	}

	// scroll-padding keeps scrolled-to controls clear of the sticky bars, but the browser only scrolls to focus what is
	// fully out of view; one already half under a bar is nudged out with the same padding
	function keepClear(event: FocusEvent) {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const bars = [...document.querySelectorAll<HTMLElement>('[data-bar]')].filter((bar) => getComputedStyle(bar).display !== 'none');
		if (bars.some((bar) => bar.contains(target))) return;
		const r = target.getBoundingClientRect();
		const covered = bars.some((bar) => {
			const b = bar.getBoundingClientRect();
			return b.top > 0 && b.bottom < innerHeight + 1 && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
		});
		if (covered) target.scrollIntoView({ block: 'nearest' });
	}

	// the Home choice sheet is a history entry (shallow routing), so the browser's back closes it
	const sheetOpen = $derived(page.state.addSheet === true);
	let leaving = $state(false);
	$effect(() => {
		if (sheetOpen) leaving = false;
	});
	function openSheet() {
		leaving = false;
		pushState('', { addSheet: true });
	}
	// a second close before the browser has popped the entry would go back past `/`
	let backing = false;
	$effect(() => {
		if (!sheetOpen) backing = false;
	});
	function closeSheet() {
		if (!sheetOpen || backing) return;
		backing = true;
		history.back();
	}
	// a choice takes the sheet's place in history, so Back from it lands on `/`, not on the open sheet
	function choose(event: MouseEvent, href: string) {
		if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		leaving = true;
		void goto(href, { replaceState: true });
	}
</script>

<svelte:window bind:scrollY />
<!-- iOS Safari only applies :active press states once the page listens for touches -->
<svelte:document onfocusin={keepClear} ontouchstart={() => {}} />

<div class="app" data-photo={stage.photo} style:--photo={stage.photo ? `url("${stage.photo}")` : undefined}>
	<div class="frame">
		{#if stage.photo}
			<figure class="stage" aria-hidden="true"><img class="stage-photo" src={stage.photo} alt="" /></figure>
		{/if}
		<TopBar {area} {actions} {compact} onsearch={searchRecipes} />
		<PhoneStrip {actions} onsearch={searchRecipes} />
		<main id="main" class="screen">
			{@render children()}
		</main>
	</div>
	<PhoneBar {area} {compact} plusHidden={hidePlus} onhome={openSheet} />
</div>

{#if !leaving}
	<HomeSheet
		bind:open={() => sheetOpen, (open) => open || closeSheet()}
		onchoose={choose}
		onclose={() => document.querySelector<HTMLElement>('.dock-add')?.focus()}
	/>
{/if}

<style>
	.app {
		min-block-size: 100dvh;
	}

	/* the phone bar follows the frame; on a short page the frame takes the spare height, so the bar sits at the bottom.
	   The rows keep their own height and the spare room stays below them: stretched, they pushed the head down the frame */
	@media (max-width: 1023px) {
		.app {
			display: flex;
			flex-direction: column;
		}
		.frame {
			flex-grow: 1;
			align-content: start;
			inline-size: 100%;
		}
	}

	/* every page is on the screen subgrid now (layout.css .screen); the head's haze bleeds to the frame edge, which
	   clips it */
	main {
		min-inline-size: 0;
	}

	/* base.css turns these into scroll-padding: the sticky bars never cover a focused control scrolled into view */
	@media (max-width: 1023px) {
		:global(:root) {
			--sticky-block-end: calc(var(--space-16) + var(--space-8));
		}
	}

	@media (min-width: 1100px) {
		:global(:root) {
			--sticky-block-start: calc(var(--space-16) + var(--space-4));
		}
	}

	/* the nav sits out the page fade, live, so its own pill glide plays through it. The top bar only from 1100 px, where
	   it is a sticky capsule: below that it scrolls away, and a named bar would drop in from where it was scrolled to. */
	@media (min-width: 1100px) {
		:global([data-bar='top']) {
			view-transition-name: app-topbar;
		}
	}

	:global([data-bar='phone']) {
		view-transition-name: app-tabbar;
	}

	:global(::view-transition-old(app-topbar)),
	:global(::view-transition-old(app-tabbar)) {
		display: none;
	}

	:global(::view-transition-new(app-topbar)),
	:global(::view-transition-new(app-tabbar)) {
		animation: none;
	}
</style>
