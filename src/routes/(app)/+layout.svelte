<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { viewTransition } from '#lib/motion.ts';
	import { activeArea } from '#lib/nav.ts';
	import AppNav from '#lib/shell/AppNav.svelte';

	let { children }: { children: Snippet } = $props();

	const recipePage = (id: string | null) => id === '/(app)/recipes/[id]';

	// filter and sort changes inside an area animate their own content (FLIP), not the whole page;
	// to and from a recipe page the transition carries the card's photo into the hero and back
	onNavigate((navigation) => {
		if (!navigation.from || !navigation.to) return;
		const sameArea = activeArea(navigation.from.url.pathname) === activeArea(navigation.to.url.pathname);
		if (sameArea && !recipePage(navigation.from.route.id) && !recipePage(navigation.to.route.id)) return;
		return viewTransition(navigation);
	});
</script>

<AppNav />

<main>
	{@render children()}
</main>

<style>
	main {
		overflow-x: clip;
		padding-block: calc(14px + var(--nav-h) + var(--s-8)) var(--s-11);
	}

	@media (max-width: 1023px) {
		main {
			padding-block: var(--s-7) calc(var(--tabbar-h) + max(12px, env(safe-area-inset-bottom)) + var(--s-7));
		}
	}

	:global(::view-transition-old(root)) {
		animation: var(--d-fast) var(--ease-out) both page-out;
	}

	:global(::view-transition-new(root)) {
		animation: var(--d-slow) var(--ease-out) 60ms both page-in;
	}

	:global(::view-transition-group(*.recipe-hero)) {
		animation-duration: 520ms;
		animation-timing-function: var(--ease-out);
	}

	/* card (5:4) and hero (wide) differ in shape: both snapshots fill the moving frame instead of stretching */
	:global(::view-transition-old(*.recipe-hero)),
	:global(::view-transition-new(*.recipe-hero)) {
		block-size: 100%;
		object-fit: cover;
		animation-duration: 520ms;
	}

	@keyframes -global-page-out {
		to {
			opacity: 0;
		}
	}

	@keyframes -global-page-in {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}
</style>
