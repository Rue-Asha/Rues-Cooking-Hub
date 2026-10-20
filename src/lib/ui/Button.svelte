<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import ArrowButton from './ArrowButton.svelte';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		children: Snippet;
		href?: string;
		variant?: 'primary' | 'olive' | 'secondary' | 'ghost' | 'danger';
		// primary and olive end in an arrow circle unless arrow is false
		arrow?: boolean;
		icon?: IconName;
		type?: 'button' | 'submit';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick' | 'children'>;

	let {
		children,
		href,
		variant = 'primary',
		arrow,
		icon,
		type = 'button',
		disabled = false,
		onclick,
		class: cls = '',
		...rest
	}: Props = $props();

	const withArrow = $derived(arrow ?? (variant === 'primary' || variant === 'olive'));
</script>

{#snippet inner()}
	{#if icon}<Icon name={icon} size={18} />{/if}
	<span class="label">{@render children()}</span>
	{#if withArrow}<ArrowButton decorative variant="light" size="sm" />{/if}
{/snippet}

{#if href}
	<a class="btn {variant} {cls}" class:has-arrow={withArrow} {href} {...rest}>{@render inner()}</a>
{:else}
	<button class="btn {variant} {cls}" class:has-arrow={withArrow} {type} {disabled} {onclick} {...rest}>
		{@render inner()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-2);
		min-block-size: 48px;
		padding: 0 var(--s-5);
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		font-size: 15px;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
		transition:
			transform var(--d-fast) var(--ease-out),
			opacity var(--d-fast) var(--ease-out);
	}

	.has-arrow {
		padding-inline-end: 8px;
		gap: var(--s-4);
	}

	.primary {
		background: var(--dark);
		color: var(--on-dark);
		box-shadow: var(--shadow-card);
	}

	.olive {
		background: var(--olive);
		color: var(--white);
		box-shadow: var(--shadow-card);
	}

	.secondary {
		background: transparent;
		border-color: var(--ink);
		color: var(--ink);
	}

	.ghost {
		background: var(--ink-wash);
		color: var(--ink);
	}

	.danger {
		background: transparent;
		border-color: var(--line);
		color: var(--brick);
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.btn :global(.icon) {
		margin-inline-start: -2px;
	}
</style>
