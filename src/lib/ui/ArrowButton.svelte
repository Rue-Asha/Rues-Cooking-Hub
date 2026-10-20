<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';

	type Props = {
		label?: string;
		href?: string;
		variant?: 'dark' | 'light' | 'glass' | 'olive' | 'outline';
		direction?: 'right' | 'up-right' | 'left';
		size?: 'sm' | 'md' | 'lg';
		// decorative: the circle sits inside a larger link or button and is not a control itself
		decorative?: boolean;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick'>;

	let {
		label,
		href,
		variant = 'dark',
		direction = 'right',
		size = 'md',
		decorative = false,
		disabled = false,
		onclick,
		class: cls = '',
		...rest
	}: Props = $props();

	const icon = $derived(direction === 'up-right' ? 'arrow-up-right' : direction === 'left' ? 'arrow-left' : 'arrow-right');
	const iconSize = $derived(size === 'lg' ? 22 : size === 'sm' ? 16 : 20);
</script>

{#if decorative}
	<span class="arrow {variant} {size} {cls}" aria-hidden="true" {...rest}><Icon name={icon} size={iconSize} /></span>
{:else if href}
	<a class="arrow {variant} {size} {cls}" {href} aria-label={label} {...rest}><Icon name={icon} size={iconSize} /></a>
{:else}
	<button class="arrow {variant} {size} {cls}" type="button" aria-label={label} {disabled} {onclick} {...rest}>
		<Icon name={icon} size={iconSize} />
	</button>
{/if}

<style>
	.arrow {
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		transition:
			transform var(--d-fast) var(--ease-out),
			opacity var(--d-fast) var(--ease-out);
	}

	.sm {
		inline-size: 32px;
		block-size: 32px;
	}

	.lg {
		inline-size: 52px;
		block-size: 52px;
	}

	.dark {
		background: var(--dark);
		color: var(--on-dark);
	}

	.light {
		background: var(--white);
		color: var(--ink);
	}

	.glass {
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		border-color: var(--glass-border);
		color: var(--ink);
	}

	.olive {
		background: var(--olive);
		color: var(--white);
	}

	.outline {
		background: transparent;
		border-color: currentColor;
		color: inherit;
	}

	a.arrow:hover,
	button.arrow:hover:not(:disabled) {
		transform: translateX(2px);
	}

	button.arrow:disabled {
		opacity: 0.35;
		cursor: default;
	}
</style>
