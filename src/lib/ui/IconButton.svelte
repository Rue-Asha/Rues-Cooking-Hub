<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		icon: IconName;
		label: string;
		href?: string;
		variant?: 'glass' | 'plain' | 'outline' | 'dark';
		pressed?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick'>;

	let { icon, label, href, variant = 'glass', pressed, onclick, class: cls = '', ...rest }: Props = $props();
</script>

{#if href}
	<a class="icon-btn {variant} {cls}" {href} aria-label={label} {...rest}><Icon name={icon} /></a>
{:else}
	<button
		type="button"
		class="icon-btn {variant} {cls}"
		class:pressed
		aria-label={label}
		aria-pressed={pressed}
		{onclick}
		{...rest}
	>
		<Icon name={icon} filled={pressed && icon === 'heart'} />
	</button>
{/if}

<style>
	.icon-btn {
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		background: transparent;
		color: var(--ink);
		transition: transform var(--d-fast) var(--ease-out);
	}

	.glass {
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		border-color: var(--glass-border);
	}

	.outline {
		border-color: var(--line);
	}

	.dark {
		background: var(--dark);
		color: var(--on-dark);
	}

	.pressed {
		color: var(--brick);
	}

	.icon-btn:hover {
		transform: scale(1.05);
	}
</style>
