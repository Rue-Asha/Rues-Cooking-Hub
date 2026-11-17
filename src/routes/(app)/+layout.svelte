<script lang="ts">
	import '#lib/styles/fingerprint/tokens.css';
	import '#lib/styles/fingerprint/fonts.css';
	import '#lib/styles/fingerprint/base.css';
	import '#lib/styles/fingerprint/motion.css';
	import '#lib/styles/fingerprint/layout.css';
	import type { Snippet } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { viewTransition } from '#lib/motion.ts';
	import { activeArea } from '#lib/nav.ts';
	import Shell from '#lib/shell/Shell.svelte';

	let { children }: { children: Snippet } = $props();

	const heroPage = (id: string | null) => id === '/(app)/recipes/[id]' || id === '/(app)/eating-out/[id]';

	// filter and sort changes inside an area animate their own content (FLIP), not the whole page;
	// to and from a recipe or spot page the transition carries the card's photo into the hero and back
	onNavigate((navigation) => {
		if (!navigation.from || !navigation.to) return;
		const sameArea = activeArea(navigation.from.url.pathname) === activeArea(navigation.to.url.pathname);
		if (sameArea && !heroPage(navigation.from.route.id) && !heroPage(navigation.to.route.id)) return;
		return viewTransition(navigation);
	});
</script>

<Shell>
	{@render children()}
</Shell>

<style>
	/* long recipe and spot names break anywhere but never at a hyphenation point */
	:global(:is(h1, h2, .type-display-xl, .type-display-l, .type-display-m)) {
		hyphens: manual;
		overflow-wrap: anywhere;
	}

	/* the I-beam promises an edit: chrome and reading text show the arrow, only fields keep the text cursor.
	   Nothing on the screen starts a selection or the long-press callout, like a native app; fields and what the user
	   wrote themselves (the recipe's ingredients, method and notes, a spot's notes and address: [data-prose]) opt back in. */
	:global(html) {
		cursor: default;
		-webkit-user-select: none;
		user-select: none;
		-webkit-touch-callout: none;
	}

	:global(:is(input:not([type='checkbox'], [type='radio'], [type='range'], [type='button'], [type='submit'], [type='file']), textarea, [contenteditable='true'], [contenteditable=''])) {
		cursor: text;
	}

	/* Safari won't let you type into an unselectable field */
	:global(:is(input, textarea, select, [contenteditable='true'], [contenteditable=''], [data-prose])) {
		-webkit-user-select: text;
		user-select: text;
		-webkit-touch-callout: default;
	}

	:global(::view-transition-old(root)) {
		animation: var(--motion-quick) var(--ease-out) both page-out;
	}

	:global(::view-transition-new(root)) {
		animation: var(--motion-settle) var(--ease-out) both page-in;
		animation-delay: var(--motion-stagger);
	}

	:global(::view-transition-group(*.recipe-hero)) {
		animation-duration: var(--motion-settle);
		animation-timing-function: var(--ease-out);
	}

	/* card (5:4) and hero (wide) differ in shape: both snapshots fill the moving frame instead of stretching */
	:global(::view-transition-old(*.recipe-hero)),
	:global(::view-transition-new(*.recipe-hero)) {
		block-size: 100%;
		object-fit: cover;
		animation-duration: var(--motion-settle);
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
