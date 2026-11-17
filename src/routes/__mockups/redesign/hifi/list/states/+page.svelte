<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import Menu from '../../overlays/Menu.svelte';
	import Notice from '../../overlays/Notice.svelte';
	import Specimen from '../../overlays/Specimen.svelte';
	import { AISLES, listFor, type ListItem } from '../data.ts';
	import Row from '../Row.svelte';

	const view = $derived(listFor(new URL(page.url.href)));
	const open = $derived(view.items.filter((i) => !i.checked));
	const base = $derived(open.find((i) => !i.plan && i.amount && !i.merged) ?? open[0]);
	const planned = $derived(open.find((i) => i.plan && i.amount) ?? open[0]);
	const merged = $derived<ListItem>(open.find((i) => i.merged) ?? { ...base, id: 9001, name: 'lemons', amount: '3', plan: true, merged: '1' });
	const bare = $derived<ListItem>(open.find((i) => !i.amount && !i.plan) ?? { ...base, id: 9002, name: 'baking powder', amount: '' });
	const done = $derived<ListItem>({ ...(view.items.find((i) => i.checked) ?? base), id: 9003, checked: true });
	const long = $derived<ListItem>({ ...base, id: 9004, name: view.worst ? base.name : 'Hokkaido pumpkin, about 1.2 kg, organic if they have it', amount: '1 cup + 200 g + 3 tbsp + 2 pinches', plan: true });
	const count = $derived(view.worst ? 1093 : 3);
	const aisles = $derived(AISLES.map((a) => ({ label: a, checked: a === 'Pantry', focus: a === 'Pantry' })));
</script>

<svelte:head><title>List states · hi-fi</title></svelte:head>

<Frame area="list" photo={view.photo}>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Shopping list</li><li>States</li></ul>
			<h1>List <em class="accent-word">states</em></h1>
			<p class="lede">Item rows, the editor, the category menu and the status notices. The add field sits under the title; the round “+” in the phone bar focuses it.</p>
		</div>
	</header>
	<div class="screen-body" data-settle>
		<section class="card panel" data-surface="solid" aria-labelledby="s-rows">
			<div class="card-head"><h2 id="s-rows">Item rows</h2></div>
			<p class="card-note note">The tick, the name (it opens the editor) and the category control are each at least 44 × 44 px on touch. Ticking moves the row to Checked at once. Deleting and “Clear checked” are immediate.</p>
			<div class="grid">
				<Specimen label="Typed item"><ul class="rows"><Row item={base} /></ul></Specimen>
				<Specimen label="From the plan" note="Marked as such."><ul class="rows"><Row item={planned} /></ul></Specimen>
				<Specimen label="Typed and planned" note="Combined amount, with the plan's share named."><ul class="rows"><Row item={merged} /></ul></Specimen>
				<Specimen label="No amount"><ul class="rows"><Row item={bare} /></ul></Specimen>
				<Specimen label="Long name and amount" note="Wraps inside the row, down to 320 px."><ul class="rows"><Row item={long} /></ul></Specimen>
				<Specimen label="Checked" note="Lives on the charcoal card."><div class="dark card" data-surface="inverse"><ul class="rows"><Row item={done} /></ul></div></Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="s-edit">
			<div class="card-head"><h2 id="s-edit">Item editor</h2></div>
			<p class="card-note note">Opens in place of the row when its name is activated. Escape closes it. A typed amount such as “1 cup + 200 g” is allowed.</p>
			<div class="grid">
				<Specimen label="Editing"><ul class="rows"><Row item={base} mode="editing" /></ul></Specimen>
				<Specimen label="Typed and planned" note="Only the typed part is edited; the plan's part is shown."><ul class="rows"><Row item={{ ...merged, merged: '500 ml' }} mode="editing" /></ul></Specimen>
				<Specimen label="Unreadable amount" note="The previous amount is kept."><ul class="rows"><Row item={base} mode="error" /></ul></Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="s-menu">
			<div class="card-head"><h2 id="s-menu">Category menu</h2></div>
			<p class="card-note note">Nine radio items in aisle order; the current one is checked and focused. Choosing moves the item and remembers the choice for that name. On touch it is a bottom sheet; with a pointer it opens beside its button.</p>
			<div class="grid">
				<Specimen label="Pointer · beside the button"><div class="menu-box"><Menu name="Move {base.name} to" radio items={aisles} /></div></Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="s-status">
			<div class="card-head"><h2 id="s-status">Status notices</h2></div>
			<div class="grid">
				<Specimen label="After Add from plan" note="Announced politely; clears itself after about 6 seconds."><Notice>Added {count.toLocaleString('en-GB')} items from the plan</Notice></Specimen>
				<Specimen label="Singular"><Notice>Added 1 item from the plan</Notice></Specimen>
			</div>
		</section>
	</div>
</Frame>

<style>
	.panel {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.note {
		max-inline-size: var(--measure);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: var(--space-5);
		align-items: start;
	}
	.rows {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
		inline-size: min(100%, 26rem);
		padding-inline: var(--space-2);
		border-radius: var(--radius-panel);
		background: var(--surface-card);
	}
	.dark {
		inline-size: min(100%, 26rem);
		padding: var(--space-2) var(--space-3);
	}
	.dark .rows {
		background: none;
		padding-inline: 0;
	}
	.menu-box {
		inline-size: min(100%, 16rem);
	}
	@media (max-width: 767px) {
		.panel {
			padding: var(--space-4);
		}
	}
</style>
