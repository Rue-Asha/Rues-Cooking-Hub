<!-- Where a live notice appears: the bottom of the screen, above the phone bar. Portalled to body, because fixed inside .frame follows the frame. -->
<script lang="ts">
	import Notice from './Notice.svelte';
	import { notices } from './notice.svelte.ts';

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}
</script>

<div class="host" use:portal>
	{#each notices as n (n.id)}
		<Notice kind={n.kind}>{n.text}</Notice>
	{/each}
</div>

<style>
	.host {
		position: fixed;
		z-index: var(--z-toast);
		inset-inline: var(--space-4);
		inset-block-end: calc(var(--space-16) + var(--space-6) + env(safe-area-inset-bottom));
		display: grid;
		justify-items: center;
		pointer-events: none;
	}
	.host > :global(*) {
		pointer-events: auto;
	}
	@media (min-width: 1024px) {
		.host {
			inset-block-end: calc(var(--space-6) + env(safe-area-inset-bottom));
		}
	}
</style>
