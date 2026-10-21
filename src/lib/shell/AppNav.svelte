<script lang="ts">
	import { page } from '$app/state';
	import { activeArea, areas } from '#lib/nav.ts';
	import Button from '#lib/ui/Button.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import PillNav from '#lib/ui/PillNav.svelte';

	const current = $derived(areas.find((a) => a.area === activeArea(page.url.pathname))!.href);

	let scrollY = $state(0);
	const compact = $derived(scrollY > 48);
</script>

<svelte:window bind:scrollY />

<header class="topbar" class:compact data-nav="top">
	<div class="column bar">
		<a class="brand" href="/">
			<span class="mark" aria-hidden="true">r</span>
			<span class="word">Rues <em>Cooking</em> Hub</span>
		</a>
		<PillNav items={areas} {current} {compact} />
		<div class="actions">
			<IconButton icon="search" label="Search recipes" href="/recipes" />
			<Button href="/recipes/new">Add recipe</Button>
		</div>
	</div>
</header>

<div class="tabbar" class:compact data-nav="bar">
	<PillNav items={areas} {current} variant="bar" {compact} />
</div>

<style>
	.topbar {
		position: fixed;
		inset-block-start: 14px;
		inset-inline: 0;
		z-index: 20;
		pointer-events: none;
		transition: transform var(--d-base) var(--ease-out);
	}

	.topbar.compact {
		transform: translateY(-6px);
	}

	.bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
	}

	.bar > :global(*) {
		pointer-events: auto;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		justify-self: start;
		min-block-size: 44px;
		padding: 4px 16px 4px 4px;
		border-radius: var(--r-pill);
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		border: 1px solid var(--glass-border);
		transform-origin: left center;
		transition: transform var(--d-base) var(--ease-out);
	}

	.mark {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--r-pill);
		background: var(--olive);
		color: var(--white);
		font-family: var(--font-display);
		font-style: italic;
		font-size: 24px;
		line-height: 1;
		padding-block-end: 4px;
	}

	.word {
		font-family: var(--font-display);
		font-size: 19px;
		font-weight: 400;
		letter-spacing: -0.01em;
	}

	.word em {
		color: var(--brick);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: end;
		transform-origin: right center;
		transition: transform var(--d-base) var(--ease-out);
	}

	.compact .brand,
	.compact .actions {
		transform: scale(0.94);
	}

	.tabbar {
		display: none;
	}

	@media (max-width: 1023px) {
		.topbar {
			display: none;
		}

		.tabbar {
			display: block;
			position: fixed;
			inset-inline: var(--s-3);
			inset-block-end: max(12px, env(safe-area-inset-bottom));
			z-index: 20;
			inline-size: min(100% - 2 * var(--s-3), 520px);
			margin-inline: auto;
			transition: inline-size var(--d-base) var(--ease-out);
		}

		/* icons only: four 44 px targets plus the pill's breathing room */
		.tabbar.compact {
			inline-size: 248px;
		}
	}

	/* Page transitions: the nav sits out the page fade, live, so its own pill glide plays through it. */
	.topbar {
		view-transition-name: app-topbar;
	}

	.tabbar {
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
