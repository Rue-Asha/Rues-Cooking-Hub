<script lang="ts">
	import { page } from '$app/state';
	import Button from '../shell/Button.svelte';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { AISLES } from '../list/data.ts';
	import { entriesText, planFor } from '../plan/data.ts';
	import AddFromPlan from './AddFromPlan.svelte';
	import AddSlot from './AddSlot.svelte';
	import AddToPlan from './AddToPlan.svelte';
	import CopyWeek from './CopyWeek.svelte';
	import Confirm from './Confirm.svelte';
	import Dialog from './Dialog.svelte';
	import Menu from './Menu.svelte';
	import MenuButton from './MenuButton.svelte';
	import MoveTo from './MoveTo.svelte';
	import Notice from './Notice.svelte';
	import NoticeHost from './NoticeHost.svelte';
	import { notify } from './notice.svelte.ts';
	import Icon from './Icon.svelte';
	import Specimen from './Specimen.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const view = $derived(planFor(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const recipeTitle = $derived(data.recipe.title);
	const entryTitle = $derived(worst ? view.days[0].slots.dinner[0].title : view.days[2].slots.dinner[0].title);
	const freeText = $derived(worst ? view.days[0].slots.lunch[0].title : 'Pizza night');
	const tag = $derived(worst ? data.tags[0] : data.tags.find((t) => t.name === 'Main Course')!);
	const unusedTag = $derived(worst ? tag.name : 'Side');
	const itemName = $derived(worst ? data.list[0].items[0].name : 'coconut milk');
	const days = $derived(view.days.map((d) => ({ short: d.short, weekday: d.weekday, day: d.day })));
	const slots = $derived(data.recipes.slice(0, 8));
	const aisles = $derived(AISLES.map((a) => ({ label: a, checked: a === 'Pantry' })));
	const sourceCount = $derived(worst ? 61 : 14);

	let live = $state({ add: false, move: false, copy: false, afp: false, recipe: false, discard: false, plan: false });
</script>

<svelte:head><title>Dialogs and menus · hi-fi</title></svelte:head>

<Frame area="plan" plus="hidden" photo="spaghetti-pomodoro">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Mockups</li><li>Plan, List and recipe flows</li></ul>
			<h1>Dialogs, menus and <em class="accent-word">notices</em></h1>
			<p class="lede">Everything is drawn open below. Dialogs are modal: focus moves in and is trapped, Escape, Close and a click outside close them, focus returns to the opener. A centred card from 768 px, a bottom sheet below. The ringed control in a specimen has focus.</p>
		</div>
		<ul class="screen-facts" data-surface="inverse" aria-label="On this page">
			<li class="facts-caption" aria-hidden="true">On this page</li>
			<li><span class="n">9</span>Dialogs</li>
			<li><span class="n">4</span>Menus</li>
			<li><span class="n">8</span>Notices</li>
		</ul>
	</header>

	<div class="screen-body" data-settle>
		<section class="card panel" data-surface="solid" aria-labelledby="g-live">
			<div class="card-head"><h2 id="g-live">Try them</h2><span class="card-note">The real sheet and menus</span></div>
			<div class="tries">
				<Button size="s" onclick={() => (live.plan = true)}>Add to plan</Button>
				<Button size="s" onclick={() => (live.add = true)}>Add to Wednesday Dinner</Button>
				<Button size="s" onclick={() => (live.move = true)}>Move to…</Button>
				<Button size="s" onclick={() => (live.copy = true)}>Copy week</Button>
				<Button size="s" onclick={() => (live.afp = true)}>Add from plan</Button>
				<Button size="s" onclick={() => (live.recipe = true)}>Delete recipe</Button>
				<Button size="s" onclick={() => (live.discard = true)}>Discard changes?</Button>
				<span class="try-menu">
					<MenuButton label="Options for {entryTitle}" name="Options for {entryTitle}" items={[{ label: 'Change servings' }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger', sep: true }]} onpick={(i) => i.label === 'Move to…' && (live.move = true)}><Icon name="more" /></MenuButton>
					<span class="caption">Entry options</span>
				</span>
				<span class="try-menu">
					<MenuButton label="Move {itemName} to another category" name="Move {itemName} to" radio items={aisles} sheet="Move {itemName} to"><Icon name="tag" /></MenuButton>
					<span class="caption">Category menu</span>
				</span>
				<Button size="s" onclick={() => notify('Added 3 items from the plan')}>Show a notice</Button>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-add-recipe">
			<div class="card-head"><h2 id="g-add-recipe">Add to plan · from the recipe page</h2></div>
			<div class="grid">
				<Specimen label="Pick a day and a meal" note="Opens on today and Dinner. Earlier week and Later week step the shown week." sheet>
					<AddToPlan recipe={recipeTitle} servings={data.recipe.servings} range={view.range} {days} todayShort="Wed" />
				</Specimen>
				<Specimen label="Servings below 1" note="Nothing is added." sheet>
					<AddToPlan recipe={recipeTitle} servings={data.recipe.servings} range={view.range} {days} todayShort="Wed" variant="error" />
				</Specimen>
				<Specimen label="Added" note="The dialog stays and says what happened." sheet>
					<AddToPlan recipe={recipeTitle} servings={data.recipe.servings} range={view.range} {days} todayShort="Wed" variant="added" />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-add-slot">
			<div class="card-head"><h2 id="g-add-slot">Add dialog · from a slot or the phone “+”</h2></div>
			<p class="card-note lede-note">Bound to one slot, no day or meal choice inside. A slot's add control opens it for that slot; the phone bar's “+” opens it for today's Dinner when the shown week holds today, otherwise Monday Dinner of the shown week. Search takes focus on open with a fine pointer only.</p>
			<div class="grid">
				<Specimen label="Recipe · slot add control" note="Accessible name “Add to Wednesday Dinner”." sheet>
					<AddSlot where="Wednesday · Dinner" recipes={slots} />
				</Specimen>
				<Specimen label="Recipe · picked" note="Picking reveals Servings, prefilled with the recipe's." sheet>
					<AddSlot where="Wednesday · Dinner" recipes={slots} variant="picked" />
				</Specimen>
				<Specimen label="Free text" sheet>
					<AddSlot where="Wednesday · Dinner" recipes={slots} variant="free" {freeText} />
				</Specimen>
				<Specimen label="Nothing entered" sheet>
					<AddSlot where="Wednesday · Dinner" recipes={slots} variant="error" />
				</Specimen>
				<Specimen label="Empty archive" sheet>
					<AddSlot where="Wednesday · Dinner" recipes={slots} variant="empty" />
				</Specimen>
				<Specimen label="“+” on another week" note="The shown week is not this one: bound to Monday Dinner." sheet>
					<AddSlot where="Monday · Dinner" recipes={slots} variant={worst ? 'other-week' : 'search'} {worst} />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-entry">
			<div class="card-head"><h2 id="g-entry">Entry options and Move to…</h2></div>
			<div class="grid">
				<Specimen label="Entry options · recipe" note="Opens with focus on the first item. Delete is immediate.">
					<div class="menu-box"><Menu name="Options for {entryTitle}" items={[{ label: 'Change servings', focus: true }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger', sep: true }]} /></div>
				</Specimen>
				<Specimen label="Entry options · free text or deleted recipe">
					<div class="menu-box"><Menu name="Options for {freeText}" items={[{ label: 'Edit text', focus: true }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger', sep: true }]} /></div>
				</Specimen>
				<Specimen label="Move to… · another slot" note="Opens on the entry's current day. The line says where it lands." sheet>
					<MoveTo entry={entryTitle} {days} currentDay="Wed" currentMeal="Dinner" startDay="Fri" startMeal="Lunch" />
				</Specimen>
				<Specimen label="Move to… · unchanged" sheet>
					<MoveTo entry={entryTitle} {days} currentDay={worst ? 'Mon' : 'Wed'} currentMeal="Dinner" />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-copy">
			<div class="card-head"><h2 id="g-copy">Copy week</h2></div>
			<div class="grid">
				<Specimen label="Step 1 · choose the source" note="Defaults to the week before; steps back up to 26 weeks." sheet>
					<CopyWeek sourceRange="12 – 18 October" {sourceCount} shownCount={view.entries} />
				</Specimen>
				<Specimen label="Step 1 · empty source" note="Reports “Nothing to copy” and changes nothing." sheet>
					<CopyWeek variant="empty" sourceRange="5 – 11 October" sourceCount={0} shownCount={view.entries} />
				</Specimen>
				<Specimen label="Step 2 · the week already has entries" note="Asks once before adding." sheet>
					<CopyWeek variant="confirm" sourceRange="12 – 18 October" {sourceCount} shownCount={view.entries} />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-list">
			<div class="card-head"><h2 id="g-list">Add from plan · list</h2></div>
			<div class="grid">
				<Specimen label="Default range" note="The current Monday to Sunday." sheet><AddFromPlan /></Specimen>
				<Specimen label="Working" sheet><div class="still"><AddFromPlan variant="working" /></div></Specimen>
				<Specimen label="Nothing planned" note="The list is unchanged." sheet><AddFromPlan variant="nothing" /></Specimen>
				<Specimen label="Dates missing" sheet><AddFromPlan variant="dates" /></Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-del">
			<div class="card-head"><h2 id="g-del">Delete confirmations</h2></div>
			<p class="card-note lede-note">Cancel has focus on open. Escape and a click outside cancel. The verb is the danger pill with a trash icon, never the primary.</p>
			<div class="grid">
				<Specimen label="Delete recipe · used in the plan" sheet>
					<Confirm title="Delete “{recipeTitle}”?" kicker="Delete recipe" body="It's used in 2 plan entries; they'll stay in the plan as text." verb="Delete" />
				</Specimen>
				<Specimen label="Delete recipe · one entry" sheet>
					<Confirm title="Delete “{recipeTitle}”?" kicker="Delete recipe" body="It's used in 1 plan entry; it'll stay in the plan as text." verb="Delete" />
				</Specimen>
				<Specimen label="Delete recipe · not planned" sheet>
					<Confirm title="Delete “{recipeTitle}”?" kicker="Delete recipe" verb="Delete" />
				</Specimen>
				<Specimen label="Delete tag · used" sheet>
					<Confirm title="Delete tag “{tag.name}”?" kicker="Delete tag" body="It's used by {tag.count.toLocaleString('en-GB')} recipes." verb="Delete" />
				</Specimen>
				<Specimen label="Delete tag · unused" sheet>
					<Confirm title="Delete tag “{unusedTag}”?" kicker="Delete tag" verb="Delete" />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-menu">
			<div class="card-head"><h2 id="g-menu">Category menu and Discard changes?</h2></div>
			<div class="grid">
				<Specimen label="Category menu · pointer" note="Beside its button; the current aisle is checked and focused.">
					<div class="menu-box"><Menu name="Move {itemName} to" radio items={aisles.map((a) => ({ ...a, focus: a.checked }))} /></div>
				</Specimen>
				<Specimen label="Category menu · touch" note="A bottom sheet on a coarse pointer." sheet>
					<Dialog title="Move {itemName} to">
						<Menu name="Move {itemName} to" radio items={aisles.map((a) => ({ ...a, focus: a.checked }))} />
					</Dialog>
				</Specimen>
				<Specimen label="Discard changes? · recipe form" note="Asked on any in-app way out with edits: bar, “+”, brand. Keep editing has focus." sheet>
					<Confirm title="Discard changes?" kicker="Recipe" body="What you changed on this recipe isn't saved yet." verb="Discard" cancel="Keep editing" />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-notice">
			<div class="card-head"><h2 id="g-notice">Status notices</h2></div>
			<p class="card-note lede-note">The existing notices on one shared style: a raised card, ink text, an icon, never colour alone. They sit at the bottom of the screen above the phone bar, one at a time, announce politely and clear after about six seconds. No new toast component, no new messages.</p>
			<div class="grid">
				<Specimen label="List"><Notice>Added 3 items from the plan</Notice></Specimen>
				<Specimen label="List · one item"><Notice>Added 1 item from the plan</Notice></Specimen>
				<Specimen label="Tags"><Notice>Merged {worst ? tag.name : 'Side'} into Dessert</Notice></Specimen>
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

<AddToPlan live bind:open={live.plan} recipe={recipeTitle} servings={data.recipe.servings} range={view.range} {days} todayShort="Wed" />
<AddSlot live bind:open={live.add} where="Wednesday · Dinner" recipes={slots} {freeText} />
<MoveTo live bind:open={live.move} entry={entryTitle} {days} currentDay="Wed" currentMeal="Dinner" />
<CopyWeek live bind:open={live.copy} sourceRange="12 – 18 October" {sourceCount} shownCount={view.entries} />
<AddFromPlan live bind:open={live.afp} onadd={() => notify('Added 3 items from the plan')} />
<Confirm live bind:open={live.recipe} title="Delete “{recipeTitle}”?" kicker="Delete recipe" body="It's used in 2 plan entries; they'll stay in the plan as text." verb="Delete" />
<Confirm live bind:open={live.discard} title="Discard changes?" kicker="Recipe" body="What you changed on this recipe isn't saved yet." verb="Discard" cancel="Keep editing" />
<NoticeHost />

<style>
	.panel {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.panel h2 {
		overflow-wrap: anywhere;
	}
	.lede-note {
		max-inline-size: var(--measure);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-5);
		align-items: start;
	}
	.tries {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-3);
	}
	.try-menu {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
	}
	/* the specimen holds the spinner still: a drawn state, not a running one */
	.still {
		display: contents;
	}
	.still :global(.spinner) {
		animation-play-state: paused;
	}
	.caption {
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
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
