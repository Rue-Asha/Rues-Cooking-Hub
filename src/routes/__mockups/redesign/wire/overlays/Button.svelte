<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		variant?: 'default' | 'primary' | 'quiet' | 'danger';
		size?: 'm' | 's';
		icon?: IconName;
		label?: string;
		disabled?: boolean;
		pressed?: boolean;
		expanded?: boolean;
		href?: string;
		grow?: boolean;
		children?: Snippet;
	};
	let { variant = 'default', size = 'm', icon, label, disabled = false, pressed, expanded, href, grow = false, children }: Props = $props();
	const round = $derived(icon !== undefined && !children);
	const glyph = $derived(icon ?? (variant === 'danger' ? 'trash' : undefined));
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	class="btn {variant} {size}"
	class:round
	class:grow
	{href}
	type={href ? undefined : 'button'}
	{disabled}
	aria-label={label}
	aria-pressed={pressed}
	aria-expanded={expanded}
>
	{#if glyph}<Icon name={glyph} />{/if}
	{#if children}<span class="t">{@render children()}</span>{/if}
</svelte:element>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-block-size: var(--control-height);
		max-inline-size: 100%;
		padding-inline: var(--space-5);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-control-solid);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-decoration: none;
		text-align: center;
	}
	.btn.s { min-block-size: var(--control-height-s); padding-inline: var(--space-4); }
	.btn.primary { background: var(--surface-inverse); color: var(--ink-on-inverse); box-shadow: none; }
	.btn.quiet { background: transparent; box-shadow: none; }
	.btn.danger { font-weight: var(--weight-semibold); }
	.btn.round { padding: 0; inline-size: max(var(--control-height-s), var(--target)); min-block-size: max(var(--control-height-s), var(--target)); border-radius: var(--radius-round); }
	.btn.s.round { inline-size: max(var(--control-height-xs), var(--target)); min-block-size: max(var(--control-height-xs), var(--target)); }
	.btn.grow { flex: 1 1 auto; }
	.btn[aria-pressed='true'] { background: var(--surface-inverse); color: var(--ink-on-inverse); box-shadow: none; }
	.btn:disabled { background: var(--surface-tint); color: var(--ink-secondary); box-shadow: none; opacity: var(--disabled-opacity); }
	.t { min-inline-size: 0; overflow-wrap: anywhere; }
</style>
