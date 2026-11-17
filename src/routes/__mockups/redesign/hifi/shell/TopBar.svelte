<script lang="ts">
	import type { Area } from '#lib/nav.ts';
	import { scrolled } from '#lib/components/scroll-cue/cue.ts';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { actions, areaPath, areas, link } from './links.ts';
	import { pill } from './pill.ts';

	type Props = { area: Area; worst?: boolean; label?: string; live?: boolean };
	let { area, worst = false, label = 'Main', live = false }: Props = $props();
	// specimens sit in a plain box, not a .frame, so only the real frame's bar watches the scroll
	const watch = (bar: HTMLElement) => (live ? scrolled(bar) : undefined);
	const act = $derived(actions(area));
</script>

<header class="app-bar top" use:watch>
	<a class="brand" href={link(areaPath.home, worst)}>
		<span class="brand-mark" aria-hidden="true">R</span>
		<span class="brand-name">Rues Cooking Hub</span>
	</a>
	<nav class="app-nav" aria-label={label}>
		<ul data-pill use:pill>
			{#each areas as a (a.area)}
				<li><a href={link(areaPath[a.area], worst)} aria-current={a.area === area ? 'page' : undefined}>{a.label}</a></li>
			{/each}
		</ul>
	</nav>
	<div class="app-actions">
		<Button variant="glass" icon label={act.search.label} href={link(act.search.path, worst)}><Icon name="search" /></Button>
		<Button variant="secondary" href={link(act.add.path, worst)}>{act.add.label}</Button>
	</div>
</header>
