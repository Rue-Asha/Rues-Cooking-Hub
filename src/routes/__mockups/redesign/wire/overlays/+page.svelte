<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { AISLES } from '../list/data.ts';
	import { planFor, servingsText, minutes } from '../plan/data.ts';
	import { mockData } from '../../fixtures.ts';
	import Button from './Button.svelte';
	import Choice from './Choice.svelte';
	import Dialog from './Dialog.svelte';
	import Field from './Field.svelte';
	import Icon from './Icon.svelte';
	import Menu from './Menu.svelte';
	import Notice from './Notice.svelte';
	import Specimen from './Specimen.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const view = $derived(planFor(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const recipeTitle = $derived(data.recipe.title);
	const entryTitle = $derived(worst ? view.days[0].slots.dinner[0].title : view.days[2].slots.dinner[0].title);
	const tag = $derived(worst ? data.tags[0] : data.tags.find((t) => t.name === 'Main Course')!);
	const pick = $derived(data.recipes[0]);
	const results = $derived(data.recipes.slice(0, 4));
	const freeText = $derived(worst ? view.days[0].slots.lunch[0].title : 'Pizza night');
	const dayLong = $derived(view.days.map((d) => ({ label: `${d.weekday} ${d.day}`, sub: undefined, checked: d.short === 'Fri' })));
	const dayAdd = $derived(view.days.map((d) => ({ label: `${d.weekday.slice(0, 3)} ${d.day}`, sub: 'Oct', checked: d.today })));
	const meals = (on: string) => ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((m) => ({ label: m, checked: m === on }));
	const planned = $derived(view.entries);
	const entries = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'entry' : 'entries'}`;
	const sourceCount = $derived(worst ? 61 : 14);
	const dateValue = $derived('2026-10-19');
</script>

<svelte:head><title>Dialogs and menus (wireframe)</title></svelte:head>

{#snippet cancel(label = 'Cancel')}<Button variant="quiet">{label}</Button>{/snippet}

{#snippet servings(value: string, error?: string)}
	<div class="servings" role="group" aria-label="Servings">
		<Button size="s" icon="minus" label="Fewer servings" />
		<div class="num"><Field label="Servings" {value} inputmode="numeric" {error} /></div>
		<Button size="s" icon="plus" label="More servings" />
	</div>
{/snippet}

<Frame area="plan" plus="hidden">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Mockups</li><li>Plan, List and recipe flows</li></ul>
			<h1>Dialogs and menus</h1>
		</div>
	</div>
	<div class="screen-body">
		<section class="card panel" aria-labelledby="g-how">
			<h2 id="g-how">How they behave</h2>
			<p class="card-note">Everything is drawn open. Dialogs are modal: focus moves in and is trapped, Escape, “Close” and a click outside close them, focus returns to the opener. Below 768 px a dialog is a bottom sheet, from 768 px a centred card. Menus: arrow keys move, Escape closes and returns focus. Delete confirmations focus “Cancel”; the verb is the danger button, never the primary.</p>
		</section>

		<section class="card panel" aria-labelledby="g-add-recipe">
			<h2 id="g-add-recipe">Add to plan · from the recipe page</h2>
			<div class="grid">
				<Specimen label="Pick a slot" note="Opens on today and Dinner. Earlier week and Later week step the shown week." sheet>
					<Dialog title="Add to plan" context={recipeTitle} wide>
						<div class="stepper" role="group" aria-label="Week">
							<Button size="s" icon="chev-left" label="Earlier week" />
							<span class="range">{view.range}</span>
							<Button size="s" icon="chev-right" label="Later week" />
						</div>
						<Choice legend="Day" options={dayAdd} columns={7} compact />
						<Choice legend="Meal" options={meals('Dinner')} columns={4} />
						{@render servings(String(data.recipe.servings))}
						{#snippet actions()}{@render cancel()}<Button variant="primary">Add to plan</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Servings below 1" note="Nothing is added." sheet>
					<Dialog title="Add to plan" context={recipeTitle} wide>
						<Choice legend="Meal" options={meals('Dinner')} columns={4} />
						{@render servings('0', 'Servings must be at least 1')}
						{#snippet actions()}{@render cancel()}<Button variant="primary">Add to plan</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Added" note="The dialog stays and says what happened." sheet>
					<Dialog title="Add to plan" context={recipeTitle} wide>
						<Notice>Added to Wednesday · Dinner</Notice>
						{#snippet actions()}<Button variant="quiet">Done</Button><Button variant="primary">Open the week</Button>{/snippet}
					</Dialog>
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="g-add-slot">
			<h2 id="g-add-slot">Add dialog · from a slot or the phone “+”</h2>
			<p class="card-note">Bound to one slot; no day or meal choice inside. A slot's add control opens it for that slot. The phone bar's “+” opens it for today's Dinner when the shown week holds today, otherwise Monday Dinner of the shown week. Search is focused on open only with a fine pointer.</p>
			<div class="grid">
				<Specimen label="Recipe · slot add control" note="Accessible name “Add to Wednesday Dinner”." sheet>
					<Dialog title="Wednesday · Dinner" context="Add to plan" label="Add to Wednesday Dinner" wide>
						<Choice legend="Add" options={[{ label: 'Recipe', checked: true }, { label: 'Free text' }]} columns={2} />
						<Field label="Search recipes" placeholder="Search recipes" type="search" />
						<ul class="results" aria-label="Recipes">
							{#each results as r (r.id)}
								<li class="res"><span class="rt">{r.title}</span><span class="rm">{servingsText(r.servings)}{minutes(r) ? ` · ${minutes(r)} min` : ''}</span></li>
							{/each}
						</ul>
						{#snippet actions()}{@render cancel()}<Button variant="primary" disabled>Add to plan</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Recipe · picked" note="Picking reveals Servings, prefilled with the recipe's." sheet>
					<Dialog title="Wednesday · Dinner" context="Add to plan" label="Add to Wednesday Dinner" wide>
						<Choice legend="Add" options={[{ label: 'Recipe', checked: true }, { label: 'Free text' }]} columns={2} />
						<ul class="results" aria-label="Recipes">
							<li class="res" aria-current="true"><span class="rt">{pick.title}</span><span class="rm">{servingsText(pick.servings)}</span></li>
						</ul>
						<Field label="Servings" value={String(pick.servings)} inputmode="numeric" />
						{#snippet actions()}{@render cancel()}<Button variant="primary">Add to plan</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Free text" sheet>
					<Dialog title="Wednesday · Dinner" context="Add to plan" label="Add to Wednesday Dinner" wide>
						<Choice legend="Add" options={[{ label: 'Recipe' }, { label: 'Free text', checked: true }]} columns={2} />
						<Field label="Text" placeholder="Pizza night, leftovers, eating out" value={freeText} />
						{#snippet actions()}{@render cancel()}<Button variant="primary">Add to plan</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Nothing entered" sheet>
					<Dialog title="Wednesday · Dinner" context="Add to plan" label="Add to Wednesday Dinner" wide>
						<Choice legend="Add" options={[{ label: 'Recipe' }, { label: 'Free text', checked: true }]} columns={2} />
						<Field label="Text" placeholder="Pizza night, leftovers, eating out" error="Enter a recipe or some text" />
						{#snippet actions()}{@render cancel()}<Button variant="primary">Add to plan</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Empty archive" sheet>
					<Dialog title="Wednesday · Dinner" context="Add to plan" label="Add to Wednesday Dinner" wide>
						<Choice legend="Add" options={[{ label: 'Recipe', checked: true }, { label: 'Free text' }]} columns={2} />
						<Field label="Search recipes" placeholder="Search recipes" type="search" />
						<p class="none">No recipes yet</p>
						{#snippet actions()}{@render cancel()}<Button variant="primary" disabled>Add to plan</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="“+” on another week" note="The shown week is not this one: bound to Monday Dinner." sheet>
					<Dialog title="Monday · Dinner" context="Add to plan" label="Add to Monday Dinner" wide>
						<Choice legend="Add" options={[{ label: 'Recipe', checked: true }, { label: 'Free text' }]} columns={2} />
						<Field label="Search recipes" placeholder="Search recipes" type="search" value={worst ? 'ꙮꙮ tomato and white bean stew with charred spring onions and preserved' : ''} />
						<p class="none">{worst ? 'No recipes match' : 'Type to search the archive'}</p>
						{#snippet actions()}{@render cancel()}<Button variant="primary" disabled>Add to plan</Button>{/snippet}
					</Dialog>
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="g-entry">
			<h2 id="g-entry">Entry options and Move to…</h2>
			<div class="grid">
				<Specimen label="Entry options · recipe" note="Opens with focus on the first item. Delete is immediate.">
					<Menu name="Options for {entryTitle}" items={[{ label: 'Change servings' }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger', sep: true }]} width="14rem" />
				</Specimen>
				<Specimen label="Entry options · free text or deleted recipe">
					<Menu name="Options for {freeText}" items={[{ label: 'Edit text' }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger', sep: true }]} width="14rem" />
				</Specimen>
				<Specimen label="Move to… · another slot" note="Opens on the entry's current day, focused. The line says where it lands." sheet>
					<Dialog title="Move to…" label="Move {entryTitle}" wide>
						<p class="what">{entryTitle}</p>
						<Choice legend="Day" options={dayLong} columns={4} />
						<Choice legend="Meal" options={meals('Lunch')} columns={4} />
						<p class="summary" aria-live="polite">Into Friday · Lunch</p>
						{#snippet actions()}{@render cancel()}<Button variant="primary">Move here</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Move to… · unchanged" sheet>
					<Dialog title="Move to…" label="Move {entryTitle}" wide>
						<p class="what">{entryTitle}</p>
						<Choice legend="Day" options={view.days.map((d) => ({ label: `${d.weekday} ${d.day}`, checked: d.short === (worst ? 'Mon' : 'Wed') }))} columns={4} />
						<Choice legend="Meal" options={meals('Dinner')} columns={4} />
						<p class="summary" aria-live="polite">To the end of {worst ? 'Monday' : 'Wednesday'} · Dinner</p>
						{#snippet actions()}{@render cancel()}<Button variant="primary">Move here</Button>{/snippet}
					</Dialog>
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="g-copy">
			<h2 id="g-copy">Copy week</h2>
			<div class="grid">
				<Specimen label="Step 1 · choose the source" note="Defaults to the week before; steps back up to 26 weeks." sheet>
					<Dialog title="Copy week" context="Meal plan">
						<div class="stepper" role="group" aria-label="Copy from">
							<Button size="s" icon="chev-left" label="Earlier week" />
							<span class="range">12 – 18 October<span class="sub">{entries(sourceCount)}</span></span>
							<Button size="s" icon="chev-right" label="Later week" disabled />
						</div>
						{#snippet actions()}{@render cancel()}<Button variant="primary">Copy {entries(sourceCount)}</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Step 1 · empty source" note="Reports “Nothing to copy” and changes nothing." sheet>
					<Dialog title="Copy week" context="Meal plan">
						<div class="stepper" role="group" aria-label="Copy from">
							<Button size="s" icon="chev-left" label="Earlier week" />
							<span class="range">5 – 11 October<span class="sub">No entries in this week</span></span>
							<Button size="s" icon="chev-right" label="Later week" />
						</div>
						<Notice kind="alert">Nothing to copy</Notice>
						{#snippet actions()}{@render cancel()}<Button variant="primary">Copy</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Step 2 · the week already has entries" note="Asks once before adding." sheet>
					<Dialog title="Copy week" context="Meal plan">
						<p class="confirm">This week already has {entries(planned)}. The copied entries are added after them.</p>
						{#snippet actions()}{@render cancel('Back')}<Button variant="primary">Add anyway</Button>{/snippet}
					</Dialog>
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="g-list">
			<h2 id="g-list">Add from plan · list</h2>
			<div class="grid">
				<Specimen label="Default range" note="The current Monday to Sunday." sheet>
					<Dialog title="Add from plan" context="Shopping list" wide>
						<p>Ingredients of every recipe planned in these days, scaled to their servings.</p>
						<Choice legend="Quick ranges" options={[{ label: 'This week', checked: true }, { label: 'Next week' }]} columns={2} />
						<div class="dates"><Field label="From" type="date" value={dateValue} /><Field label="To" type="date" value="2026-10-25" /></div>
						{#snippet actions()}{@render cancel()}<Button variant="primary">Add to list</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Working" sheet>
					<Dialog title="Add from plan" context="Shopping list" wide>
						<Choice legend="Quick ranges" options={[{ label: 'This week', checked: true }, { label: 'Next week' }]} columns={2} />
						<div class="dates"><Field label="From" type="date" value={dateValue} /><Field label="To" type="date" value="2026-10-25" /></div>
						{#snippet actions()}{@render cancel()}<Button variant="primary" disabled>Adding…</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Nothing planned" note="The list is unchanged." sheet>
					<Dialog title="Add from plan" context="Shopping list" wide>
						<Choice legend="Quick ranges" options={[{ label: 'This week' }, { label: 'Next week', checked: true }]} columns={2} />
						<div class="dates"><Field label="From" type="date" value="2026-10-26" /><Field label="To" type="date" value="2026-11-01" /></div>
						<Notice kind="alert">Nothing planned in this range</Notice>
						{#snippet actions()}{@render cancel()}<Button variant="primary">Add to list</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Dates missing" sheet>
					<Dialog title="Add from plan" context="Shopping list" wide>
						<div class="dates"><Field label="From" type="date" error="Choose a start and an end date" /><Field label="To" type="date" /></div>
						{#snippet actions()}{@render cancel()}<Button variant="primary">Add to list</Button>{/snippet}
					</Dialog>
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="g-del">
			<h2 id="g-del">Delete confirmations</h2>
			<p class="card-note">“Cancel” has focus on open. Escape and a click outside cancel.</p>
			<div class="grid">
				<Specimen label="Delete recipe · used in the plan" sheet>
					<Dialog title="Delete “{recipeTitle}”?" context="Delete recipe" alert>
						<p>It's used in 2 plan entries; they'll stay in the plan as text.</p>
						{#snippet actions()}{@render cancel()}<Button variant="danger">Delete</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Delete recipe · one entry" sheet>
					<Dialog title="Delete “{recipeTitle}”?" context="Delete recipe" alert>
						<p>It's used in 1 plan entry; it'll stay in the plan as text.</p>
						{#snippet actions()}{@render cancel()}<Button variant="danger">Delete</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Delete recipe · not planned" sheet>
					<Dialog title="Delete “{recipeTitle}”?" context="Delete recipe" alert>
						{#snippet actions()}{@render cancel()}<Button variant="danger">Delete</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Delete tag · used" sheet>
					<Dialog title="Delete tag “{tag.name}”?" context="Delete tag" alert>
						<p>It's used by {tag.count.toLocaleString('en-GB')} recipes.</p>
						{#snippet actions()}{@render cancel()}<Button variant="danger">Delete</Button>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Delete tag · unused" sheet>
					<Dialog title="Delete tag “{worst ? tag.name : 'Side'}”?" context="Delete tag" alert>
						{#snippet actions()}{@render cancel()}<Button variant="danger">Delete</Button>{/snippet}
					</Dialog>
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="g-menu">
			<h2 id="g-menu">Category menu and Discard changes?</h2>
			<div class="grid">
				<Specimen label="Category menu · pointer" note="Beside its button; the current aisle is checked and focused.">
					<Menu name="Move {worst ? tag.name : 'coconut milk'} to" radio items={AISLES.map((a) => ({ label: a, checked: a === 'Pantry' }))} width="14rem" />
				</Specimen>
				<Specimen label="Category menu · touch" note="A bottom sheet below 1024 px." sheet>
					<Menu name="Move {worst ? tag.name : 'coconut milk'} to" radio items={AISLES.map((a) => ({ label: a, checked: a === 'Pantry' }))} width="100%" />
				</Specimen>
				<Specimen label="Discard changes? · recipe form" note="Asked on any in-app navigation away with edits: bar, “+”, brand. Keep editing has focus." sheet>
					<Dialog title="Discard changes?" context="Recipe" alert>
						<p>What you changed on this recipe isn't saved yet.</p>
						{#snippet actions()}{@render cancel('Keep editing')}<Button variant="danger">Discard</Button>{/snippet}
					</Dialog>
				</Specimen>
			</div>
		</section>

		<section class="card panel" aria-labelledby="g-notice">
			<h2 id="g-notice">Status notices</h2>
			<p class="card-note">The existing notices on one shared style: raised surface, ink text, an icon, never colour alone. They sit at the bottom of the screen above the phone bar, one at a time, and announce politely. No new toast component, no new messages.</p>
			<div class="grid">
				<Specimen label="List"><Notice>Added 3 items from the plan</Notice></Specimen>
				<Specimen label="Tags"><Notice>Merged {worst ? tag.name : 'Side'} into {worst ? 'Dessert' : 'Dessert'}</Notice></Specimen>
				<Specimen label="Add to plan"><Notice>Added to Wednesday · Dinner</Notice></Specimen>
				<Specimen label="Import and form"><Notice>Restored your unsaved draft</Notice></Specimen>
				<Specimen label="Image · saved anyway"><Notice kind="alert">Saved without image: the image couldn't be downloaded.</Notice></Specimen>
				<Specimen label="Image · kept the old one"><Notice kind="alert">The new image couldn't be downloaded; the previous image was kept.</Notice></Specimen>
				<Specimen label="Image · wrong file"><Notice kind="alert">That file isn't an image</Notice></Specimen>
				<Specimen label="Image · too large"><Notice kind="alert">Images can be at most 15 MB</Notice></Specimen>
			</div>
		</section>
	</div>
</Frame>

<style>
	.panel { display: grid; gap: var(--space-4); padding: var(--space-6); min-inline-size: 0; }
	.panel h2 { font-size: var(--type-display-m-size); line-height: var(--type-display-m-line); letter-spacing: var(--type-display-m-tracking); overflow-wrap: anywhere; }
	.panel .card-note { margin: 0; max-inline-size: var(--measure); }
	.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: var(--space-5); align-items: start; }
	.stepper { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
	.range { display: grid; gap: var(--space-0-5); text-align: center; font-size: var(--type-label-size); font-weight: var(--weight-semibold); font-variant-numeric: var(--numeric-figures); }
	.sub { font-size: var(--type-caption-size); font-weight: var(--weight-regular); color: var(--ink-secondary); }
	.servings { display: flex; align-items: flex-end; gap: var(--space-2); }
	.num { flex: 1; min-inline-size: 0; }
	.results { display: grid; gap: var(--space-1); margin: 0; padding: 0; list-style: none; max-block-size: 14rem; overflow-y: auto; }
	.res { display: grid; gap: var(--space-0-5); min-block-size: var(--target-touch); padding: var(--space-1-5) var(--space-3); border-radius: var(--radius-item); background: var(--surface-sunken); }
	.res[aria-current] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.rt { font-size: var(--type-body-s-size); font-weight: var(--weight-medium); overflow-wrap: anywhere; }
	.rm { font-size: var(--type-caption-size); color: var(--ink-secondary); }
	.res[aria-current] .rm { color: var(--ink-on-inverse-secondary); }
	.none { padding: var(--space-5) var(--space-2); text-align: center; color: var(--ink-secondary); overflow-wrap: anywhere; }
	.what { font-weight: var(--weight-medium); overflow-wrap: anywhere; }
	.summary { padding: var(--space-2) var(--space-3); border-radius: var(--radius-item); background: var(--surface-sunken); font-size: var(--type-body-s-size); }
	.confirm { overflow-wrap: anywhere; }
	.dates { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
	@media (max-width: 767px) {
		.panel { padding: var(--space-4); }
		.dates { grid-template-columns: minmax(0, 1fr); }
	}
</style>
