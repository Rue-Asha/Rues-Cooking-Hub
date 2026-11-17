<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import Button from '../../overlays/Button.svelte';
	import Field from '../../overlays/Field.svelte';
	import Menu from '../../overlays/Menu.svelte';
	import Specimen from '../../overlays/Specimen.svelte';
	import Cell from '../Cell.svelte';
	import Picker from '../Picker.svelte';
	import { planFor, type PlanEntry } from '../data.ts';

	const view = $derived(planFor(new URL(page.url.href)));
	const recipeEntry = (title: string, servings: number): PlanEntry => ({ title, servings, free: false });
	const five = $derived<PlanEntry[]>(
		view.worst
			? view.days[0].slots.dinner
			: [
					recipeEntry('Roasted pumpkin soup with sage brown butter', 4),
					recipeEntry('Lemon ricotta pancakes', 2),
					recipeEntry('Village salad', 2),
					{ title: 'Pizza night', servings: null, free: true },
					recipeEntry('Overnight sourdough', 6)
				]
	);
	const longText = $derived<PlanEntry>(view.worst ? view.days[0].slots.lunch[0] : { title: 'Dinner at Oma’s: bring back the big salad bowl and pick up the jars on the way', servings: null, free: true });
	const deleted = $derived<PlanEntry>(view.days[3].slots.lunch.find((e) => e.deleted) ?? five[3]);
	const one = $derived<PlanEntry>(five[0].free ? recipeEntry('Weeknight dal', 2) : five[0]);
	const free = $derived<PlanEntry>({ title: 'Leftover lasagne', servings: null, free: true });
	const query = $derived(view.worst ? 'ꙮꙮ tomato and white bean stew with charred spring onions and preserved' : 'zzz');
</script>

<svelte:head><title>Plan states (wireframe)</title></svelte:head>

<Frame area="plan">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Meal plan</li><li>States</li></ul>
			<h1>Plan states</h1>
		</div>
	</div>
	<div class="screen-body">
		<section class="card panel" aria-labelledby="s-slot">
			<h2 id="s-slot">Slot contents</h2>
			<p class="card-note">Desktop cells are about 12 rem wide. The thumbnail only appears once a cell is 13 rem or wider. Titles wrap and hyphenate; the options button keeps its place.</p>
			<div class="grid">
				<Specimen label="Slot with five entries · desktop width" note="Every entry and its “Options for …” control stays inside the column.">
					<Cell label="Monday Dinner" entries={five} />
				</Specimen>
				<Specimen label="Slot with five entries · phone width" note="Same entries in a stacked day: thumbnails show.">
					<Cell label="Monday Dinner" entries={five} width="22rem" />
				</Specimen>
				<Specimen label="Free text, up to 200 characters" note="Wraps in place; no thumbnail, no servings.">
					<Cell label="Monday Lunch" entries={[longText]} />
				</Specimen>
				<Specimen label="Entry of a deleted recipe" note="Reads as free text. Its options offer “Edit text” instead of “Change servings”.">
					<Cell label="Thursday Lunch" entries={[deleted]} />
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="s-drag">
			<h2 id="s-drag">Drag and drop · pointer only</h2>
			<p class="card-note">Fine pointer only. Touch has no drag; every move goes through “Move to…”. The slot under the pointer is the drop target. A drop outside any slot returns the entry to where it came from and saves nothing.</p>
			<div class="grid">
				<Specimen label="A recipe is dragged from the picker" note="The slot shows “Drop to add”. The recipe is added with its own servings.">
					<div class="pair">
						<Picker recipes={view.recipes.slice(0, 3)} state="dragging" scroll={false} hint />
						<Cell label="Tuesday Dinner" entries={[one]} target="add" />
					</div>
				</Specimen>
				<Specimen label="An entry is dragged to another slot" note="The origin dims; the slot shows “Move here”.">
					<div class="pair single">
						<Cell label="Monday Dinner" entries={[one, free]} dragging={0} />
						<Cell label="Tuesday Dinner" entries={[]} target="move" />
					</div>
				</Specimen>
				<Specimen label="Dropping on an entry" note="The entry lands before the one it is dropped on: a line marks the place.">
					<Cell label="Wednesday Dinner" entries={[one, free]} target="move" before={1} />
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="s-menu">
			<h2 id="s-menu">Entry options</h2>
			<p class="card-note">The “Options for …” button opens a menu with focus on its first item. Escape closes it and returns focus to the button. Delete is immediate.</p>
			<div class="grid">
				<Specimen label="Recipe entry · menu open">
					<Cell label="Wednesday Dinner" entries={[one]} open={0} width="22rem">
						{#snippet below()}
							<Menu name="Options for {one.title}" items={[{ label: 'Change servings' }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger', sep: true }]} width="14rem" />
						{/snippet}
					</Cell>
				</Specimen>
				<Specimen label="Free text entry · menu open">
					<Cell label="Monday Lunch" entries={[free]} open={0} width="22rem">
						{#snippet below()}
							<Menu name="Options for {free.title}" items={[{ label: 'Edit text' }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger', sep: true }]} width="14rem" />
						{/snippet}
					</Cell>
				</Specimen>
				<Specimen label="Change servings · form" note="Opens in place of the menu, anchored to the entry.">
					<Cell label="Wednesday Dinner" entries={[one]} open={0} width="22rem">
						{#snippet below()}
							<form class="edit">
								<Field label="Servings" value="4" inputmode="numeric" />
								<div class="row"><Button size="s" variant="quiet">Cancel</Button><Button size="s" variant="primary">Save</Button></div>
							</form>
						{/snippet}
					</Cell>
				</Specimen>
				<Specimen label="Change servings · error" note="Also the Add dialog's servings field.">
					<Cell label="Wednesday Dinner" entries={[one]} open={0} width="22rem">
						{#snippet below()}
							<form class="edit">
								<Field label="Servings" value="0" inputmode="numeric" error="Servings must be at least 1" />
								<div class="row"><Button size="s" variant="quiet">Cancel</Button><Button size="s" variant="primary">Save</Button></div>
							</form>
						{/snippet}
					</Cell>
				</Specimen>
				<Specimen label="Edit text · form">
					<Cell label="Monday Lunch" entries={[free]} open={0} width="22rem">
						{#snippet below()}
							<form class="edit">
								<Field label="Text" value={free.title} />
								<div class="row"><Button size="s" variant="quiet">Cancel</Button><Button size="s" variant="primary">Save</Button></div>
							</form>
						{/snippet}
					</Cell>
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="s-picker">
			<h2 id="s-picker">Recipe picker</h2>
			<div class="grid">
				<Specimen label="Empty archive">
					<Picker recipes={[]} state="empty" />
				</Specimen>
				<Specimen label="Search finds nothing">
					<Picker recipes={view.recipes} state="nomatch" {query} />
				</Specimen>
				<Specimen label="Touch devices" note="The hint “Drag onto a day” is not shown where drag is absent; the picker is not shown below 1024 px at all. Adding goes through the add controls and the dialog's own search.">
					<Picker recipes={view.recipes.slice(0, 3)} hint={false} scroll={false} />
				</Specimen>
			</div>
		</section>
	</div>
</Frame>

<style>
	.panel { display: grid; gap: var(--space-4); padding: var(--space-6); min-inline-size: 0; }
	.panel h2 { font-size: var(--type-display-m-size); line-height: var(--type-display-m-line); letter-spacing: var(--type-display-m-tracking); }
	.panel .card-note { margin: 0; max-inline-size: var(--measure); }
	.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: var(--space-5); align-items: start; }
	.pair { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-3); inline-size: 100%; justify-items: center; }
	.edit { display: grid; gap: var(--space-3); padding: var(--space-3); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); inline-size: 100%; }
	.row { display: flex; justify-content: flex-end; gap: var(--space-2); }
	@media (max-width: 767px) {
		.panel { padding: var(--space-4); }
	}
</style>
