<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import Specimen from '../../overlays/Specimen.svelte';
	import Cell from '../Cell.svelte';
	import Picker from '../Picker.svelte';
	import { planFor, type PlanEntry } from '../data.ts';

	const view = $derived(planFor(new URL(page.url.href)));
	const recipe = (id: number, title: string, servings: number, image: string | null = null): PlanEntry => ({ id, title, servings, free: false, image });
	const free = (id: number, title: string): PlanEntry => ({ id, title, servings: null, free: true, image: null });
	const five = $derived<PlanEntry[]>(
		view.worst
			? view.days[0].slots.dinner
			: [
					recipe(1, 'Roasted pumpkin soup with sage brown butter', 4, '/mockups/pumpkin-soup.jpg'),
					recipe(2, 'Lemon ricotta pancakes', 2, '/mockups/ricotta-pancakes.jpg'),
					recipe(3, 'Village salad', 2, '/mockups/village-salad.jpg'),
					free(4, 'Pizza night'),
					recipe(5, 'Overnight sourdough', 6)
				]
	);
	const longText = $derived<PlanEntry>(view.worst ? view.days[0].slots.lunch[0] : free(6, 'Dinner at Oma’s: bring back the big salad bowl and pick up the jars on the way'));
	const deleted = $derived<PlanEntry>(view.days[3].slots.lunch.find((e) => e.deleted) ?? five[3]);
	const one = $derived<PlanEntry>(five[0].free ? recipe(7, 'Weeknight dal', 2) : five[0]);
	const text = $derived(free(8, 'Leftover lasagne'));
	const query = $derived(view.worst ? 'ꙮꙮ tomato and white bean stew with charred spring onions and preserved' : 'zzz');
	const menuFor = (e: PlanEntry) => ({ name: `Options for ${e.title}`, items: [{ label: e.free ? 'Edit text' : 'Change servings', focus: true }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger' as const, sep: true }] });
</script>

<svelte:head><title>Plan states · hi-fi</title></svelte:head>

<Frame area="plan" photo={view.photo}>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Meal plan</li><li>States</li></ul>
			<h1>Plan <em class="accent-word">states</em></h1>
			<p class="lede">Every state of a slot, a drag, an entry's options and the recipe picker, as the week draws them.</p>
		</div>
	</header>
	<div class="screen-body" data-settle>
		<section class="card panel" data-surface="solid" aria-labelledby="s-slot">
			<div class="card-head"><h2 id="s-slot">Slot contents</h2></div>
			<p class="card-note note">Desktop cells are about 12 rem wide; a stacked day gives a slot the full width. Titles wrap and hyphenate and the options button keeps its place.</p>
			<div class="grid">
				<Specimen label="Five entries · desktop width" note="Every entry and its “Options for …” control stays inside the column."><Cell label="Monday Dinner" entries={five} /></Specimen>
				<Specimen label="Five entries · stacked day" note="The same entries, with room: servings sit beside the picture."><Cell label="Monday Dinner" entries={five} width="22rem" /></Specimen>
				<Specimen label="Free text, up to 200 characters" note="Wraps in place; no picture, no servings."><Cell label="Monday Lunch" entries={[longText]} /></Specimen>
				<Specimen label="Entry of a deleted recipe" note="Reads as free text; its options offer “Edit text”."><Cell label="Thursday Lunch" entries={[deleted]} /></Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="s-drag">
			<div class="card-head"><h2 id="s-drag">Drag and drop · pointer only</h2></div>
			<p class="card-note note">Fine pointer only. Touch has no drag: every move goes through “Move to…”. The slot under the pointer is the drop target. A drop outside any slot returns the entry to where it came from and saves nothing.</p>
			<div class="grid">
				<Specimen label="A recipe is dragged from the picker" note="The slot shows “Drop to add” and the recipe lands with its own servings.">
					<div class="pair"><Picker recipes={view.recipes.slice(0, 3)} mode="dragging" scroll={false} /><Cell label="Tuesday Dinner" entries={[one]} target="add" /></div>
				</Specimen>
				<Specimen label="An entry is dragged to another slot" note="The origin dims; the slot shows “Move here”.">
					<div class="pair"><Cell label="Monday Dinner" entries={[one, text]} dragging={0} /><Cell label="Tuesday Dinner" entries={[]} target="move" /></div>
				</Specimen>
				<Specimen label="Dropping on an entry" note="The entry lands before the one it is dropped on; a line marks the place."><Cell label="Wednesday Dinner" entries={[one, text]} target="move" before={1} /></Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="s-menu">
			<div class="card-head"><h2 id="s-menu">Entry options</h2></div>
			<p class="card-note note">The “Options for …” button opens a menu with focus on its first item. Escape closes it and returns focus to the button. Delete is immediate.</p>
			<div class="grid">
				<Specimen label="Recipe entry · menu open"><Cell label="Wednesday Dinner" entries={[one]} width="22rem" menu={menuFor(one)} /></Specimen>
				<Specimen label="Free text entry · menu open"><Cell label="Monday Lunch" entries={[text]} width="22rem" menu={menuFor(text)} /></Specimen>
				<Specimen label="Change servings · form" note="Opens in place of the entry."><Cell label="Wednesday Dinner" entries={[one]} width="22rem" form="editing" /></Specimen>
				<Specimen label="Change servings · error"><Cell label="Wednesday Dinner" entries={[one]} width="22rem" form="error" /></Specimen>
				<Specimen label="Edit text · form"><Cell label="Monday Lunch" entries={[text]} width="22rem" form="editing" /></Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="s-picker">
			<div class="card-head"><h2 id="s-picker">Recipe picker</h2></div>
			<div class="grid">
				<Specimen label="Empty archive"><Picker recipes={[]} mode="empty" /></Specimen>
				<Specimen label="Search finds nothing"><Picker recipes={view.recipes} mode="nomatch" {query} /></Specimen>
				<Specimen label="Touch devices" note="The hint “Drag onto a day” is not shown where drag is absent, and the picker is not shown below 1024 px at all: adding goes through the add controls and the dialog's own search."><Picker recipes={view.recipes.slice(0, 3)} hint={false} scroll={false} /></Specimen>
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
	.pair {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-3);
		inline-size: 100%;
		justify-items: center;
	}
	@media (max-width: 767px) {
		.panel {
			padding: var(--space-4);
		}
	}
</style>
