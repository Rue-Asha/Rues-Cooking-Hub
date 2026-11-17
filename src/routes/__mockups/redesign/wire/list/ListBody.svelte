<script lang="ts">
	import Button from '../overlays/Button.svelte';
	import Row from './Row.svelte';
	import { itemsText, type ListView } from './data.ts';

	let { view }: { view: ListView } = $props();
</script>

<section class="card panel" aria-labelledby="to-buy">
	<div class="card-head">
		<h2 id="to-buy">To buy</h2>
		<span class="card-note">By aisle</span>
	</div>
	{#if view.groups.length}
		{#each view.groups as g (g.category)}
			<div class="group" role="group" aria-label={g.category}>
				<div class="group-head"><h3 class="ruled">{g.category}</h3><span class="card-note">{itemsText(g.items.length)}</span></div>
				<ul class="items">
					{#each g.items as item, i (i)}<Row {item} />{/each}
				</ul>
			</div>
		{/each}
	{:else}
		<div class="none">
			<p class="none-title">Nothing to buy</p>
			<p class="card-note">Type an item above, or add the ingredients of the meals you planned.</p>
		</div>
	{/if}
</section>

<section class="card panel" aria-labelledby="checked">
	<div class="card-head">
		<h2 id="checked">Checked {view.checked.length}</h2>
		<Button variant="default" size="s" disabled={view.checked.length === 0}>Clear checked</Button>
	</div>
	{#if view.checked.length}
		<ul class="items" aria-label="Checked items">
			{#each view.checked as item, i (i)}<Row item={{ ...item, checked: true }} />{/each}
		</ul>
	{:else}
		<p class="card-note">Tick things off as you shop; they gather here.</p>
	{/if}
</section>

<style>
	.panel { display: grid; gap: var(--space-4); padding: var(--space-5); min-inline-size: 0; }
	.group { display: grid; gap: var(--space-2); min-inline-size: 0; }
	.group-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--space-1) var(--space-3); }
	.items { display: grid; gap: var(--space-1); margin: 0; padding: 0; list-style: none; }
	.none { display: grid; gap: var(--space-1-5); padding: var(--space-6) var(--space-2); justify-items: center; text-align: center; }
	.none-title { font-family: var(--font-display); font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); }
	@media (min-width: 1024px) {
		.items { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	}
	@media (max-width: 767px) {
		.panel { padding: var(--space-4) var(--space-3); }
	}
</style>
