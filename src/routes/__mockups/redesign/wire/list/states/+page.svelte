<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import Menu from '../../overlays/Menu.svelte';
	import Notice from '../../overlays/Notice.svelte';
	import Specimen from '../../overlays/Specimen.svelte';
	import { AISLES, listFor, type ListItem } from '../data.ts';
	import Reach from '../Reach.svelte';
	import Row from '../Row.svelte';

	const view = $derived(listFor(new URL(page.url.href)));
	const all = $derived(view.groups.flatMap((g) => g.items));
	const plain = $derived<ListItem>(all.find((i) => !i.plan && i.amount && !i.merged) ?? all[0]);
	const fromPlan = $derived<ListItem>(all.find((i) => i.plan && i.amount) ?? all[0]);
	const merged = $derived<ListItem>(all.find((i) => i.merged) ?? { name: 'lemons', amount: '3', plan: true, merged: '1', checked: false });
	const bare = $derived<ListItem>(all.find((i) => !i.amount && !i.plan) ?? { name: 'baking powder', amount: '', plan: false, checked: false });
	const done = $derived<ListItem>({ ...(view.checked[0] ?? plain), checked: true });
	const long = $derived<ListItem>(
		view.worst
			? { name: all[0].name, amount: '1 cup + 200 g + 3 tbsp + 2 pinches', plan: true, checked: false }
			: { name: 'Hokkaido pumpkin, about 1.2 kg, organic if they have it', amount: '1 cup + 200 g + 3 tbsp + 2 pinches', plan: true, checked: false }
	);
	const mergedFrom = $derived<ListItem>({ ...merged, merged: '500 ml' });
	const count = $derived(view.worst ? 1093 : 3);
</script>

<svelte:head><title>List states (wireframe)</title></svelte:head>

<Frame area="list">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Shopping list</li><li>States</li></ul>
			<h1>List states</h1>
		</div>
	</div>
	<div class="screen-body">
		<section class="card panel" aria-labelledby="s-rows">
			<h2 id="s-rows">Item rows</h2>
			<p class="card-note">Checkbox, name (opens the editor) and category control are each at least 44 × 44 px on touch. Checking moves the row to Checked at once. Deleting and “Clear checked” are immediate.</p>
			<div class="grid">
				<Specimen label="Typed item"><ul class="rows"><Row item={plain} /></ul></Specimen>
				<Specimen label="From the plan" note="Marked as such."><ul class="rows"><Row item={fromPlan} /></ul></Specimen>
				<Specimen label="Typed and planned" note="Combined amount, with the plan's share named."><ul class="rows"><Row item={merged} /></ul></Specimen>
				<Specimen label="No amount"><ul class="rows"><Row item={bare} /></ul></Specimen>
				<Specimen label="Checked"><ul class="rows"><Row item={done} /></ul></Specimen>
				<Specimen label="Long name and amount" note="Wraps inside the row, down to 320 px."><ul class="rows"><Row item={long} /></ul></Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="s-edit">
			<h2 id="s-edit">Item editor</h2>
			<p class="card-note">Opens in place of the row when its name is activated. Name takes focus and is selected; Escape closes it. A typed amount free text such as “1 cup + 200 g” is allowed.</p>
			<div class="grid">
				<Specimen label="Editing"><ul class="rows"><Row item={plain} state="editing" /></ul></Specimen>
				<Specimen label="Typed and planned" note="Only the typed part is edited; the plan's part is shown."><ul class="rows"><Row item={mergedFrom} state="editing" /></ul></Specimen>
				<Specimen label="Unreadable amount" note="The previous amount is kept."><ul class="rows"><Row item={plain} state="editing" error="Enter an amount like 200 g" /></ul></Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="s-menu">
			<h2 id="s-menu">Category menu</h2>
			<p class="card-note">Nine radio items in aisle order; the current one is checked and focused when the menu opens. Choosing moves the item and remembers the choice for that name. On touch it is a bottom sheet, with a pointer it opens beside its button.</p>
			<div class="grid">
				<Specimen label="Pointer · beside the button">
					<ul class="rows">
						<Row item={plain} state="moving">
							{#snippet below()}
								<Menu name="Move {plain.name} to" radio items={AISLES.map((a) => ({ label: a, checked: a === 'Pantry' }))} width="14rem" />
							{/snippet}
						</Row>
					</ul>
				</Specimen>
				<Specimen label="Touch · bottom sheet" sheet>
					<Menu name="Move {plain.name} to" radio items={AISLES.map((a) => ({ label: a, checked: a === 'Pantry' }))} width="100%" />
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="s-status">
			<h2 id="s-status">Status notices</h2>
			<div class="grid">
				<Specimen label="After Add from plan" note="Announced politely; clears itself after about 6 seconds.">
					<Notice>Added {count} items from the plan</Notice>
				</Specimen>
				<Specimen label="Singular">
					<Notice>Added 1 item from the plan</Notice>
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="s-reach">
			<h2 id="s-reach">Thumb reach at 375 px</h2>
			<p class="card-note">Two candidates for the add field. A (today): at the top, under the title; the phone bar's “+” focuses it and the bar hides while the keyboard is up. B: docked above the phone bar, in easy reach, at the cost of a second bar at the bottom of the screen.</p>
			<div class="grid">
				<Specimen label="A · add field under the title" note="/__mockups/redesign/wire/list"><Reach /></Specimen>
				<Specimen label="B · add field docked" note="/__mockups/redesign/wire/list/dock"><Reach dock /></Specimen>
			</div>
		</section>
	</div>
</Frame>

<style>
	.panel { display: grid; gap: var(--space-4); padding: var(--space-6); min-inline-size: 0; }
	.panel h2 { font-size: var(--type-display-m-size); line-height: var(--type-display-m-line); letter-spacing: var(--type-display-m-tracking); }
	.panel .card-note { margin: 0; max-inline-size: var(--measure); }
	.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: var(--space-5); align-items: start; }
	.rows { display: grid; gap: var(--space-1); margin: 0; padding: 0; list-style: none; inline-size: min(100%, 24rem); }
	@media (max-width: 767px) {
		.panel { padding: var(--space-4); }
	}
</style>
