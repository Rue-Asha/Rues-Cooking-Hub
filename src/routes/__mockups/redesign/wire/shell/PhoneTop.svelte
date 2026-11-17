<script lang="ts">
	import type { Area } from '#lib/nav.ts';
	import Icon from './Icon.svelte';
	import { actions, link } from './links.ts';

	type Props = { area: Area; placement: 'a' | 'b'; worst?: boolean; open?: boolean };
	let { area, placement, worst = false, open = $bindable(false) }: Props = $props();
	const act = $derived(actions(area));
</script>

<header class="strip" data-placement={placement}>
	<a class="brand" href={link('wire/home', worst)} aria-label="Rues Cooking Hub"><span class="mark" aria-hidden="true">R</span><span class="name">Rues Cooking Hub</span></a>
	{#if placement === 'a'}
		<div class="acts">
			<a class="btn" href={link(act.search.path, worst)} aria-label={act.search.label}><Icon name="search" size={20} /></a>
			<a class="btn primary" href={link(act.add.path, worst)}><Icon name="plus" size={18} /><span>{act.add.label}</span></a>
		</div>
	{:else}
		<div class="more">
			<button type="button" class="btn" aria-label="More actions" aria-haspopup="true" aria-expanded={open} onclick={() => (open = !open)}><Icon name={open ? 'close' : 'more'} size={20} /></button>
			{#if open}
				<ul class="menu">
					<li><a href={link(act.search.path, worst)}><Icon name="search" size={18} />{act.search.label}</a></li>
					<li><a href={link(act.add.path, worst)}><Icon name="plus" size={18} />{act.add.label}</a></li>
				</ul>
			{/if}
		</div>
	{/if}
</header>

<style>
	.strip {
		container-type: inline-size;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		min-inline-size: 0;
		z-index: var(--z-menu);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2-5);
		min-inline-size: 0;
		min-block-size: var(--target-touch);
		color: var(--ink);
		text-decoration: none;
	}
	.mark {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--target-touch);
		block-size: var(--target-touch);
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
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.acts,
	.more {
		display: flex;
		align-items: center;
		gap: var(--space-1-5);
		flex: none;
	}
	.more {
		position: relative;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-block-size: var(--target-touch);
		min-inline-size: var(--target-touch);
		padding-inline: var(--space-3);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		color: var(--ink);
		box-shadow: var(--ring-control);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-decoration: none;
		white-space: nowrap;
	}
	.btn.primary {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		box-shadow: none;
		padding-inline: var(--space-4);
	}
	.menu {
		position: absolute;
		inset-block-start: calc(100% + var(--space-1-5));
		inset-inline-end: 0;
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 13rem;
		margin: 0;
		padding: var(--space-1-5);
		list-style: none;
		border-radius: var(--radius-item);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.menu a {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-block-size: var(--target-touch);
		padding-inline: var(--space-3);
		border-radius: var(--radius-text);
		color: var(--ink);
		font-size: var(--type-label-size);
		text-decoration: none;
	}
	@container (max-width: 359px) {
		.name {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			clip-path: inset(50%);
		}
	}
</style>
