<script lang="ts">
	import type { Area } from '#lib/nav.ts';
	import Icon from './Icon.svelte';
	import { actions, areas, link } from './links.ts';

	type Props = { area: Area; worst?: boolean; label?: string; iconActions?: boolean };
	let { area, worst = false, label = 'Main', iconActions = false }: Props = $props();
	const act = $derived(actions(area));
</script>

<header class="top">
	<a class="brand" href={link('wire/home', worst)}><span class="mark" aria-hidden="true">R</span><span class="name">Rues Cooking Hub</span></a>
	<nav aria-label={label}>
		<ul>
			{#each areas as a (a.area)}
				<li class:split={a.area === 'eating-out'}><a href={link(a.area === 'home' ? 'wire/home' : a.area === 'eating-out' ? 'wire/shell/eating-out' : `wire/${a.area}`, worst)} aria-current={a.area === area ? 'page' : undefined}>{a.label}</a></li>
			{/each}
		</ul>
	</nav>
	<div class="acts" class:icons={iconActions}>
		<a class="act" href={link(act.search.path, worst)} aria-label={iconActions ? act.search.label : undefined}><Icon name="search" size={18} /><span>{act.search.label}</span></a>
		<a class="act primary" href={link(act.add.path, worst)} aria-label={iconActions ? act.add.label : undefined}><Icon name="plus" size={18} /><span>{act.add.label}</span></a>
	</div>
</header>

<style>
	.top {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		min-inline-size: 0;
		padding: var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-3);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2-5);
		flex: none;
		color: var(--ink);
		text-decoration: none;
	}
	.mark {
		display: grid;
		place-items: center;
		inline-size: var(--control-height-s);
		block-size: var(--control-height-s);
		border-radius: var(--radius-round);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		font-family: var(--font-display);
		font-size: var(--type-body-size);
	}
	.name {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--weight-semibold);
		white-space: nowrap;
	}
	nav {
		flex: 1 0 auto;
		display: flex;
		justify-content: center;
	}
	ul {
		display: flex;
		align-items: center;
		gap: var(--space-0-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li a {
		display: grid;
		place-items: center;
		min-block-size: var(--control-height-s);
		padding-inline: var(--space-3-5);
		border-radius: var(--radius-pill);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-decoration: none;
		white-space: nowrap;
	}
	li a[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	li.split {
		margin-inline-start: var(--space-2);
		padding-inline-start: var(--space-2);
		box-shadow: var(--rule-beside);
	}
	.acts {
		display: flex;
		align-items: center;
		gap: var(--space-1-5);
		flex: none;
	}
	.act {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: var(--control-height-s);
		padding-inline: var(--space-3-5);
		border-radius: var(--radius-pill);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-decoration: none;
		white-space: nowrap;
		box-shadow: var(--ring-control);
	}
	.act.primary {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		box-shadow: none;
	}
	.acts.icons .act {
		padding-inline: 0;
		inline-size: var(--control-height-s);
		justify-content: center;
	}
	.acts.icons .act span {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
