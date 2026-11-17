<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';
	import { link } from './links.ts';

	let { worst = false }: { worst?: boolean } = $props();

	// proposed COPY.homeSheet
	const choices: { label: string; note: string; path: string; icon: IconName }[] = [
		{ label: 'Recipe', note: 'Paste a link or write one by hand', path: 'hifi/import', icon: 'book' },
		{ label: 'Plan entry', note: 'Put a recipe or a note on a day', path: 'hifi/plan?add=1', icon: 'calendar' },
		{ label: 'List item', note: 'Add a line to the shopping list', path: 'hifi/list?add=1', icon: 'basket' }
	];
	const href = (path: string) => {
		const [p, q] = path.split('?');
		const params = new URLSearchParams(q ?? '');
		if (worst) params.set('data', 'worst');
		const s = params.toString();
		return `${link(p)}${s ? `?${s}` : ''}`;
	};
</script>

<ul class="choices">
	{#each choices as c (c.label)}
		<li>
			<a href={href(c.path)} data-hover>
				<span class="ico"><Icon name={c.icon} size={20} /></span>
				<span class="txt"><strong>{c.label}</strong><small>{c.note}</small></span>
				<Icon name="arrow" size={18} />
			</a>
		</li>
	{/each}
</ul>

<style>
	.choices {
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
		padding: var(--space-2) var(--space-4) var(--space-2) var(--space-2);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		color: var(--ink);
		text-decoration: none;
	}
	@media (hover: hover) {
		a:hover {
			background: var(--surface-tint-strong);
		}
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
