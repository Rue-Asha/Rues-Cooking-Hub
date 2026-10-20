<script lang="ts" module>
	import type { IconName } from './Icon.svelte';

	export interface NavItem {
		href: string;
		label: string;
		icon: IconName;
	}
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		items,
		current,
		variant = 'top',
		compact = false,
		label = 'Main'
	}: { items: NavItem[]; current: string; variant?: 'top' | 'bar'; compact?: boolean; label?: string } = $props();

	let list = $state<HTMLUListElement>();
	let pill = $state<{ x: number; y: number; w: number; h: number }>();
	let glide = $state(false);

	function place(href: string) {
		const link = list?.querySelector<HTMLElement>(`a[href="${href}"]`);
		pill = link?.offsetWidth
			? { x: link.offsetLeft, y: link.offsetTop, w: link.offsetWidth, h: link.offsetHeight }
			: undefined;
	}

	$effect(() => place(current));

	$effect(() => {
		let frame = 0;
		// placements from a resize (first layout, fonts, the compact bar narrowing) follow the links
		// without a glide, so the pill never flies in on load or lags behind a shrinking bar
		const observer = new ResizeObserver(() => {
			glide = false;
			place(current);
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => (glide = true));
		});
		observer.observe(list!);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	});
</script>

<nav class="pill-nav {variant}" class:placed={pill} aria-label={label} data-compact={compact ? '' : undefined}>
	{#if pill}
		<span
			class="pill"
			class:glide
			style:inline-size="{pill.w}px"
			style:block-size="{pill.h}px"
			style:transform="translate({pill.x}px, {pill.y}px)"
			aria-hidden="true"
		></span>
	{/if}
	<ul bind:this={list}>
		{#each items as item (item.href)}
			<li>
				<a href={item.href} aria-current={item.href === current ? 'page' : undefined}>
					{#if variant === 'bar'}<Icon name={item.icon} size={22} />{/if}
					<span>{item.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.pill-nav {
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		border: 1px solid var(--glass-border);
		border-radius: var(--r-pill);
		box-shadow: var(--shadow-float);
		transition: transform var(--d-base) var(--ease-out);
		position: relative;
	}

	.pill {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		border-radius: var(--r-pill);
		background: var(--dark);
	}

	/* inline-size glides with the pill (design-system motion exception): one absolutely placed element, nothing else reflows */
	.pill.glide {
		transition:
			transform var(--d-slow) var(--ease-glide),
			inline-size var(--d-slow) var(--ease-glide);
	}

	ul {
		position: relative;
		display: flex;
		gap: 2px;
		padding: 5px;
	}

	a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		min-block-size: 44px;
		min-inline-size: 44px;
		padding: 0 var(--s-5);
		border-radius: var(--r-pill);
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
		-webkit-tap-highlight-color: transparent;
		transition:
			opacity var(--d-fast) var(--ease-out),
			transform var(--d-fast) var(--ease-out),
			color var(--d-fast) var(--ease-out);
	}

	a:hover:not([aria-current]) {
		opacity: 0.7;
	}

	a[aria-current='page'] {
		background: var(--dark);
		color: var(--on-dark);
		transition-delay: 0ms, 0ms, var(--d-fast);
	}

	.placed a[aria-current='page'] {
		background: transparent;
	}

	.top[data-compact] {
		transform: scale(0.94);
	}

	.bar ul {
		justify-content: space-between;
	}

	.bar li {
		flex: 1;
	}

	.bar a {
		flex-direction: column;
		gap: 2px;
		min-block-size: 54px;
		padding: 0 var(--s-2);
		font-size: 11px;
		letter-spacing: 0.02em;
	}

	.bar a > :global(svg) {
		transition: transform var(--d-base) var(--ease-out);
	}

	.bar a span {
		line-height: 16px;
		white-space: nowrap;
		transition:
			opacity var(--d-fast) var(--ease-out),
			transform var(--d-base) var(--ease-out);
	}

	/* icons only: the icon drops by half the label's line plus the gap, to the item's centre */
	.bar[data-compact] a > :global(svg) {
		transform: translateY(9px);
	}

	.bar[data-compact] a span {
		opacity: 0;
		transform: translateY(6px);
	}
</style>
