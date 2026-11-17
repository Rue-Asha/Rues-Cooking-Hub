<script lang="ts">
	import type { Area } from '#lib/nav.ts';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { actions, areaPath, link } from './links.ts';

	type Props = { area: Area; worst?: boolean };
	let { area, worst = false }: Props = $props();
	const act = $derived(actions(area));
</script>

<header class="app-bar strip">
	<a class="brand" href={link(areaPath.home, worst)}>
		<span class="brand-mark" aria-hidden="true">R</span>
		<span class="brand-name">Rues Cooking Hub</span>
	</a>
	<div class="app-actions">
		<Button variant="glass" icon label={act.search.label} href={link(act.search.path, worst)}><Icon name="search" /></Button>
		<Button variant="secondary" href={link(act.add.path, worst)}>{act.add.label}</Button>
	</div>
</header>

<style>
	.strip {
		container-type: inline-size;
		grid-template-columns: minmax(0, 1fr) auto;
	}
	@container (max-width: 520px) {
		.brand-name {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
		.app-actions {
			gap: var(--space-2);
		}
	}
</style>
