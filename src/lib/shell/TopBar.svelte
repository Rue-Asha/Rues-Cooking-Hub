<script lang="ts">
	import { scrolled } from '#lib/components/scroll-cue/cue.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { areas, type Area, type HeaderActions } from '#lib/nav.ts';
	import { pill } from './pill.ts';

	type Props = { area: Area; actions: HeaderActions; compact: boolean; onsearch: (event: MouseEvent) => void };
	let { area, actions, compact, onsearch }: Props = $props();
</script>

<header class="app-bar" data-bar="top" data-nav="top" use:scrolled>
	<a class="brand" href="/">
		<span class="brand-mark" aria-hidden="true">R</span>
		<span class="brand-name">Rues Cooking Hub</span>
	</a>
	<nav class="app-nav" aria-label="Main" data-compact={compact ? '' : undefined}>
		<ul data-pill use:pill={areas.find((a) => a.area === area)?.href}>
			{#each areas as a (a.area)}
				<li><a href={a.href} aria-current={a.area === area ? 'page' : undefined}>{a.label}</a></li>
			{/each}
		</ul>
	</nav>
	<div class="app-actions">
		<Button variant="glass" icon label={actions.search.label} href={actions.search.href} onclick={onsearch}><Icon name="search" stroke={1.75} /></Button>
		<Button variant="secondary" href={actions.add.href}>{actions.add.label}</Button>
	</div>
</header>

<style>
	/* above the page's own layers: a page may pull its photo up under the bar */
	.app-bar {
		z-index: var(--z-rail);
	}

	@media (max-width: 1023px) {
		.app-bar {
			display: none;
		}
	}
</style>
