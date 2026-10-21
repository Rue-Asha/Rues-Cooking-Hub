<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		children: Snippet;
		tone?: 'light' | 'photo' | 'brick' | 'olive' | 'dark' | 'sand';
		href?: string;
		image?: string;
		imageAlt?: string;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'>;

	let { children, tone = 'light', href, image, imageAlt = '', class: cls = '', ...rest }: Props = $props();
</script>

<svelte:element this={href ? 'a' : 'div'} {href} class="tile {tone} {cls}" {...rest}>
	{#if image}
		<img class="bg" src={image} alt={imageAlt} />
		<span class="scrim" aria-hidden="true"></span>
	{/if}
	<div class="content">{@render children()}</div>
</svelte:element>

<style>
	.tile {
		position: relative;
		display: block;
		overflow: hidden;
		border-radius: var(--r-panel);
		padding: var(--s-6);
		isolation: isolate;
		transition: transform var(--d-base) var(--ease-out);
	}

	a.tile:hover {
		transform: translateY(-2px);
	}

	.content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.light {
		background: var(--surface);
		color: var(--ink);
		box-shadow: var(--shadow-card);
	}

	.sand {
		background: var(--sand);
		color: var(--ink);
	}

	.photo {
		color: var(--white);
		background: var(--dark);
	}

	.brick {
		background: var(--brick);
		color: var(--on-dark);
	}

	.olive {
		background: var(--olive);
		color: var(--on-dark);
	}

	.dark {
		background: var(--dark);
		color: var(--on-dark);
	}

	.bg {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		z-index: -1;
		transition: transform var(--d-slow) var(--ease-out);
	}

	a.tile:hover .bg {
		transform: scale(1.03);
	}

	.scrim {
		position: absolute;
		inset: 0;
		background: var(--scrim);
		z-index: -1;
	}
</style>
