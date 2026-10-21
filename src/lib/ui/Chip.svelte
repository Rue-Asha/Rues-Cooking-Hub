<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		label: string;
		active?: boolean;
		count?: number;
		icon?: IconName;
		// static chips (tags on a card) are not controls
		static?: boolean;
		size?: 'md' | 'sm';
		tone?: 'default' | 'light' | 'brick';
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick'>;

	let {
		label,
		active = false,
		count,
		icon,
		static: isStatic = false,
		size = 'md',
		tone = 'default',
		onclick,
		class: cls = '',
		...rest
	}: Props = $props();
</script>

{#snippet inner()}
	{#if icon}<Icon name={icon} size={size === 'sm' ? 13 : 16} filled={active && icon === 'heart'} />{/if}
	<span>{label}</span>
	{#if count !== undefined}<span class="count tnum">{count}</span>{/if}
{/snippet}

{#if isStatic}
	<span class="chip {size} {tone} {cls}" class:active {...rest}>{@render inner()}</span>
{:else}
	<button type="button" class="chip {size} {tone} {cls}" class:active aria-pressed={active} {onclick} {...rest}>
		{@render inner()}
	</button>
{/if}

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		min-block-size: 40px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: transparent;
		color: var(--ink);
		font-size: 14px;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
		transition:
			transform var(--d-fast) var(--ease-out),
			opacity var(--d-fast) var(--ease-out);
	}

	button.chip:hover {
		transform: translateY(-1px);
	}

	.active {
		background: var(--olive);
		border-color: var(--olive);
		color: var(--white);
	}

	.count {
		font-size: 12px;
		color: var(--ink-2);
	}

	.active .count {
		color: var(--olive-soft);
	}

	.sm {
		min-block-size: 24px;
		padding: 0 10px;
		font-size: 12px;
		gap: 4px;
	}

	.light {
		border-color: var(--line-on-photo);
		color: var(--white);
	}

	.brick {
		border-color: var(--brick);
		color: var(--brick);
	}

	@media (max-width: 1023px) {
		button.chip {
			min-block-size: 44px;
		}
	}
</style>
