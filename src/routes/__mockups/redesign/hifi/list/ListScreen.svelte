<script lang="ts">
	import { page } from '$app/state';
	import Button from '../shell/Button.svelte';
	import Frame from '../../Frame.svelte';
	import AddFromPlan from '../overlays/AddFromPlan.svelte';
	import Field from '../overlays/Field.svelte';
	import NoticeHost from '../overlays/NoticeHost.svelte';
	import { notify } from '../overlays/notice.svelte.ts';
	import { AISLES, itemsText, listFor, type ListItem, type ListView } from './data.ts';
	import Row from './Row.svelte';

	type Props = { kind?: ListView['kind'] };
	let { kind = 'list' }: Props = $props();
	const view = $derived(listFor(new URL(page.url.href), kind));

	const seed = () => $state.snapshot(view.items);
	let items = $state<ListItem[]>(seed());
	$effect(() => {
		items = $state.snapshot(view.items);
	});
	let draft = $state('');
	let afp = $state(false);
	let nextId = 10_000;

	const open = $derived(items.filter((i) => !i.checked));
	const checked = $derived(items.filter((i) => i.checked));
	const groups = $derived(
		AISLES.map((category) => ({ category, items: open.filter((i) => i.category === category) })).filter((g) => g.items.length)
	);
	const pad = (n: number) => n.toLocaleString('en-GB');

	// the "+" in the phone bar lands here with ?add=1 and focuses the field
	$effect(() => {
		if (page.url.searchParams.get('add') === '1') document.getElementById('add-item')?.focus();
	});

	function add(event: SubmitEvent) {
		event.preventDefault();
		const line = draft.trim();
		if (!line) return;
		const m = line.match(/^(\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l|x|×)?)\s+(.+)$/i);
		items.push({ id: nextId++, name: m ? m[2] : line, amount: m ? m[1] : '', plan: false, checked: false, category: 'Other' });
		draft = '';
	}
	const find = (id: number) => items.find((i) => i.id === id)!;
	const remove = (id: number) => items.splice(items.findIndex((i) => i.id === id), 1);
</script>

<Frame area="list" photo={view.photo}>
	<header class="screen-head list-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Shopping list</li><li>{pad(open.length)} open</li></ul>
			<h1>Things to <em class="accent-word">buy</em></h1>
		</div>
		<form class="seg-bar list-bar" onsubmit={add}>
			<div class="seg add-item"><Field id="add-item" label="Add an item" hideLabel icon="plus" placeholder="Add an item, e.g. 2 l oat milk" enterkeyhint="done" autocomplete="off" bind:value={draft} /></div>
			<div class="seg-actions"><Button variant="primary" arrow onclick={() => (afp = true)}>Add from plan</Button></div>
		</form>
		{#if groups.length > 2}
			<ul class="screen-facts" aria-label="Open per aisle">
				<li class="facts-caption" aria-hidden="true">Open per aisle</li>
				{#each groups as g (g.category)}<li><span class="n">{pad(g.items.length)}</span>{g.category}</li>{/each}
			</ul>
		{/if}
	</header>

	<div class="screen-body" data-settle>
		<div class="layout">
			<section class="to-buy card" data-surface="solid" aria-labelledby="to-buy-title">
				<div class="card-head"><h2 id="to-buy-title">To buy</h2><p class="card-note">By aisle</p></div>
				{#if groups.length}
					<div class="aisles">
						{#each groups as g (g.category)}
							<section class="aisle" aria-label={g.category}>
								<div class="aisle-head"><h3 class="ruled">{g.category}</h3><span class="card-note">{itemsText(g.items.length)}</span></div>
								<ul class="items">
									{#each g.items as item (item.id)}
										<Row {item} ontick={(c) => (find(item.id).checked = c)} onmove={(cat) => (find(item.id).category = cat)} onsave={(n, a) => Object.assign(find(item.id), { name: n, amount: a })} ondelete={() => remove(item.id)} />
									{/each}
								</ul>
							</section>
						{/each}
					</div>
				{:else}
					<div class="empty">
						<h3>Nothing to buy</h3>
						<p>Type an item above, or add the ingredients of the meals you planned.</p>
					</div>
				{/if}
			</section>

			<section class="checked card" data-surface="inverse" aria-labelledby="checked-title">
				<h2 class="checked-head" id="checked-title"><span class="ruled">Checked</span> <span class="checked-n">{pad(checked.length)}</span></h2>
				{#if checked.length}
					<ul class="items" aria-label="Checked items">
						{#each checked as item (item.id)}
							<Row {item} ontick={(c) => (find(item.id).checked = c)} />
						{/each}
					</ul>
				{:else}
					<p class="checked-empty">Tick things off as you shop; they gather here.</p>
				{/if}
				<Button size="s" class="clear" disabled={!checked.length} onclick={() => (items = items.filter((i) => !i.checked))}>Clear checked</Button>
			</section>
		</div>
	</div>
</Frame>

<AddFromPlan live bind:open={afp} onadd={() => notify('Added 3 items from the plan')} />
<NoticeHost />

<style>
	/* the aisle counts read on a solid card, never on glass over the photo; the Checked card is the screen's one charcoal */
	.list-head :global(.screen-facts:not([data-surface='inverse'])) {
		background: var(--surface-card);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}
	.list-bar {
		inline-size: min(100%, 40rem);
		background: var(--surface-card);
	}
	.add-item {
		flex: 1;
		min-inline-size: 0;
		padding-inline-start: var(--space-1);
	}
	.add-item :global(.field) {
		flex: 1;
	}
	.layout {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		min-inline-size: 0;
	}
	.to-buy {
		display: grid;
		gap: var(--space-5);
		min-inline-size: 0;
		padding: var(--space-5) var(--space-4);
	}
	.aisles {
		columns: 1;
	}
	.aisle {
		break-inside: avoid;
		margin-block-end: var(--space-6);
	}
	.aisle-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		margin-block-end: var(--space-1);
	}
	.items {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.empty {
		display: grid;
		gap: var(--space-2);
		justify-items: start;
		max-inline-size: var(--measure);
		padding: var(--space-6) var(--space-2) var(--space-2);
	}
	.empty h3 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.empty p {
		color: var(--ink-secondary);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}
	.checked {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		min-inline-size: 0;
		padding: var(--space-5);
	}
	.checked-head {
		display: flex;
		align-items: baseline;
		gap: var(--space-4);
		font-family: var(--font-ui);
	}
	.checked-head .ruled {
		color: var(--ink-on-inverse-secondary);
	}
	.checked-n {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-l-size);
		line-height: 1;
		letter-spacing: var(--type-display-l-tracking);
		font-variant-numeric: var(--numeric-figures);
	}
	.checked-empty {
		max-inline-size: 30ch;
		font-size: var(--type-body-s-size);
		color: var(--ink-on-inverse-secondary);
	}
	.checked :global(.clear) {
		justify-self: start;
		background: var(--surface-inverse-tint);
		box-shadow: var(--ring-control-on-inverse);
		color: var(--ink-on-inverse);
	}
	.checked :global(.clear:disabled) {
		color: var(--ink-on-inverse-secondary);
	}
	@media (hover: hover) {
		.checked :global(.clear:not(:disabled):hover) {
			background: var(--surface-inverse-tint-strong);
		}
	}
	@media (min-width: 768px) {
		.to-buy {
			padding: var(--space-6) var(--space-7);
		}
		.aisles {
			columns: 2 18rem;
			column-gap: var(--space-9);
		}
	}
	@media (min-width: 1100px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 18.75rem;
		}
	}
</style>
