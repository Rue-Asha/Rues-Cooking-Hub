<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import type { HeaderActions } from '#lib/nav.ts';

	type Props = { actions: HeaderActions; onsearch: (event: MouseEvent) => void };
	let { actions, onsearch }: Props = $props();
</script>

<header class="app-bar strip" data-bar="strip">
	<a class="brand" href="/">
		<span class="brand-mark" aria-hidden="true">R</span>
		<span class="brand-name">Rues Cooking Hub</span>
	</a>
	<div class="app-actions">
		<Button variant="glass" icon label={actions.search.label} href={actions.search.href} onclick={onsearch}><Icon name="search" stroke={1.75} /></Button>
		<Button variant="secondary" href={actions.add.href}>{actions.add.label}</Button>
	</div>
</header>

<style>
	.strip {
		z-index: var(--z-rail);
		container-type: inline-size;
		grid-template-columns: minmax(0, 1fr) auto;
	}

	/* the mark alone is 40 px wide once the name hides; the link keeps a full touch target */
	.brand {
		min-inline-size: var(--target-touch);
	}

	@media (min-width: 1024px) {
		.strip {
			display: none;
		}
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
