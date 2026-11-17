<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import Icon, { type IconName } from '#lib/ui/Icon.svelte';

	type Props = { open: boolean; onchoose: (event: MouseEvent, href: string) => void; onclose: () => void };
	let { open = $bindable(), onchoose, onclose }: Props = $props();

	const choices: { label: string; note: string; href: string; icon: IconName }[] = [
		{ label: COPY.homeSheet.recipe, note: COPY.homeSheet.recipeHint, href: '/recipes/new', icon: 'book' },
		{ label: COPY.homeSheet.plan, note: COPY.homeSheet.planHint, href: '/plan?add=1', icon: 'calendar' },
		{ label: COPY.homeSheet.list, note: COPY.homeSheet.listHint, href: '/list?add=1', icon: 'basket' }
	];
</script>

<Sheet bind:open title={COPY.homeSheet.title} {onclose}>
	<ul class="choices">
		{#each choices as c (c.label)}
			<li>
				<a href={c.href} onclick={(event) => onchoose(event, c.href)}>
					<span class="ico"><Icon name={c.icon} size={20} stroke={1.75} /></span>
					<span class="txt"><strong>{c.label}</strong><small>{c.note}</small></span>
					<Icon name="arrow-right" size={18} stroke={1.75} />
				</a>
			</li>
		{/each}
	</ul>
</Sheet>

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
