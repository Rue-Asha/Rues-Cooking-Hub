<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Button from '#lib/ui/Button.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import PillNav, { type NavItem } from '#lib/ui/PillNav.svelte';

	let { children }: { children: Snippet } = $props();

	const items: NavItem[] = [
		{ href: '/__mockups/home', label: 'Home', icon: 'home' },
		{ href: '/__mockups/recipes', label: 'Recipes', icon: 'book' },
		{ href: '/__mockups/plan', label: 'Plan', icon: 'calendar' },
		{ href: '/__mockups/list', label: 'List', icon: 'basket' }
	];

	const screen = $derived(page.url.pathname.split('/')[2] ?? 'home');
	const area = $derived(['recipe', 'import', 'import-fallback'].includes(screen) ? 'recipes' : screen);
	// the recipe page's hero runs under the floating nav; every other screen starts below it
	const bleed = $derived(screen === 'recipe');
</script>

<svelte:head>
	<title>Mockup · {screen} · Rues Cooking Hub</title>
</svelte:head>

<header class="topbar">
	<div class="column bar">
		<a class="brand" href="/__mockups/home">
			<span class="mark" aria-hidden="true">r</span>
			<span class="word">Rues <em>Cooking</em> Hub</span>
		</a>
		<PillNav {items} current="/__mockups/{area}" />
		<div class="actions">
			<IconButton icon="search" label="Search recipes" href="/__mockups/recipes" />
			<Button href="/__mockups/import">Add recipe</Button>
		</div>
	</div>
</header>

<main class:bleed>
	{@render children()}
</main>

<div class="tabbar" data-shot-bottom>
	<PillNav {items} current="/__mockups/{area}" variant="bar" />
</div>

<style>
	.topbar {
		position: fixed;
		inset-block-start: 14px;
		inset-inline: 0;
		z-index: 20;
		pointer-events: none;
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
	}

	main {
		overflow-x: clip;
		padding-block: calc(14px + var(--nav-h) + var(--s-8)) var(--s-11);
	}

	main.bleed {
		padding-block-start: 0;
	}

	.tabbar {
		display: none;
	}

	@media (max-width: 1023px) {
		.topbar {
			display: none;
		}

		main {
			padding-block: var(--s-7) calc(var(--tabbar-h) + 40px);
		}

		.tabbar {
			display: block;
			position: fixed;
			inset-inline: var(--s-3);
			inset-block-end: max(12px, env(safe-area-inset-bottom));
			z-index: 20;
		}
	}
</style>
