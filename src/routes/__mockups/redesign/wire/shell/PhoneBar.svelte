<script lang="ts">
	import type { Area } from '#lib/nav.ts';
	import Icon, { type IconName } from './Icon.svelte';
	import { areaPath, areas, link, plusLabel } from './links.ts';

	type Props = {
		area: Area;
		worst?: boolean;
		label?: string;
		plus?: 'shown' | 'hidden';
		iconOnly?: boolean;
		typing?: boolean;
		onplus?: (event: Event) => void;
		plusHref?: string;
	};
	let { area, worst = false, label = 'Main', plus = 'shown', iconOnly = false, typing = false, onplus, plusHref }: Props = $props();

	const icons: Record<Area, IconName> = { home: 'home', recipes: 'book', plan: 'calendar', list: 'basket', 'eating-out': 'pin' };
</script>

<div class="wrap" data-typing={typing || undefined} inert={typing}>
	<div class="bar">
		<nav aria-label={label}>
			<ul>
				{#each areas as a (a.area)}
					<li>
						<a href={link(areaPath[a.area], worst)} aria-current={a.area === area ? 'page' : undefined} class:icon={iconOnly}>
							{#if iconOnly}<Icon name={icons[a.area]} size={22} />{/if}
							<span class:sr={iconOnly}>{a.phone}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		{#if plus === 'shown'}
			{#if plusHref}
				<a class="plus" href={plusHref} aria-label={plusLabel[area]}><Icon name="plus" size={22} /></a>
			{:else}
				<button type="button" class="plus" aria-label={plusLabel[area]} onclick={onplus}><Icon name="plus" size={22} /></button>
			{/if}
		{/if}
	</div>
</div>

<style>
	.bar {
		--plus: calc(var(--target-touch) + var(--space-2));
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-inline-size: 0;
	}
	.wrap {
		container-type: inline-size;
		min-inline-size: 0;
	}
	.wrap[data-typing] {
		display: none;
	}
	nav {
		flex: 1;
		min-inline-size: 0;
	}
	ul {
		display: flex;
		gap: var(--space-0-5);
		margin: 0;
		padding: var(--space-1);
		list-style: none;
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	li {
		flex: 1 1 0;
		min-inline-size: 0;
	}
	li a {
		display: grid;
		place-items: center;
		min-block-size: var(--target-touch);
		padding-inline: var(--space-0-5);
		border-radius: var(--radius-pill);
		color: var(--ink);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-weight: var(--type-label-weight);
		text-decoration: none;
	}
	li a[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@container (max-width: 330px) {
		.bar {
			--plus: var(--target-touch);
			gap: var(--space-1);
		}
		ul {
			gap: 0;
		}
		li a {
			padding-inline: 0;
		}
	}
	.plus {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--plus);
		block-size: var(--plus);
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
</style>
