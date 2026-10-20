<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		children: Snippet;
		as?: 'div' | 'section' | 'aside' | 'header' | 'form';
		strong?: boolean;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'>;

	let { children, as = 'div', strong = false, class: cls = '', ...rest }: Props = $props();
</script>

<svelte:element this={as} class="glass {cls}" class:strong {...rest}>{@render children()}</svelte:element>

<style>
	.glass {
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		border: 1px solid var(--glass-border);
		border-radius: var(--r-panel);
		box-shadow: var(--shadow-float);
		color: var(--ink);
	}

	.strong {
		background: var(--glass-strong);
	}
</style>
