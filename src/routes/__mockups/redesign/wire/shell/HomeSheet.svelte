<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';
	import { link } from './links.ts';

	let { worst = false, onclose }: { worst?: boolean; onclose?: () => void } = $props();

	const choices: { label: string; note: string; path: string; icon: IconName }[] = [
		{ label: 'Recipe', note: 'Paste a link or write one by hand', path: 'wire/import', icon: 'book' },
		{ label: 'Plan entry', note: 'Put a recipe or a note on a day', path: 'wire/plan', icon: 'calendar' },
		{ label: 'List item', note: 'Add a line to the shopping list', path: 'wire/list', icon: 'basket' }
	];
</script>

<div class="sheet">
	<header>
		<h2>Add to your kitchen</h2>
		<button type="button" class="close" aria-label="Close" onclick={onclose}><Icon name="close" size={20} /></button>
	</header>
	<ul>
		{#each choices as c (c.label)}
			<li>
				<a href={link(c.path, worst)}>
					<span class="ico"><Icon name={c.icon} size={20} /></span>
					<span class="txt"><strong>{c.label}</strong><small>{c.note}</small></span>
					<Icon name="arrow" size={18} />
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.sheet {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-4) var(--space-5);
		border-radius: var(--radius-card) var(--radius-card) 0 0;
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		min-inline-size: 0;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}
	h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.close {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--target-touch);
		block-size: var(--target-touch);
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-tint);
		color: var(--ink);
	}
	ul {
		display: grid;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	a {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-block-size: calc(var(--target-touch) + var(--space-4));
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
		color: var(--ink);
		text-decoration: none;
	}
	.ico {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--target-touch);
		block-size: var(--target-touch);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.txt {
		display: grid;
		flex: 1;
		min-inline-size: 0;
	}
	strong {
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--weight-semibold);
	}
	small {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
</style>
