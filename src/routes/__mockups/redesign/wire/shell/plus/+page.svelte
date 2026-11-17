<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import Device from '../Device.svelte';
	import HomeSheet from '../HomeSheet.svelte';
	import Mini from '../Mini.svelte';
	import PhoneBar from '../PhoneBar.svelte';
	import PhoneTop from '../PhoneTop.svelte';
	import Specimen from '../Specimen.svelte';

	const worst = $derived(page.url.searchParams.get('data') === 'worst');
</script>

<svelte:head><title>Round plus · wireframe</title></svelte:head>

<Frame area="home" plus="hidden">
	<div class="w-page">
		<header class="w-head">
			<p class="w-kicker">Shell</p>
			<h1>The round plus</h1>
			<p class="w-lede">One round button next to the pill group, acting for the area you are in. A recipe page counts as Recipes, a spot page as Spots.</p>
		</header>

		<div class="w-states">
			<h2>Per area</h2>
			<div class="grid">
				<Specimen label="Home" note="Opens the choice sheet: Recipe, Plan entry, List item.">
					<Device width={375} label="Home plus" height={460}>
						<Mini title="What's cooking, Rue?" lines={2} />
						<div class="scrim" aria-hidden="true"></div>
						<div class="sheet-slot"><HomeSheet {worst} /></div>
						{#snippet bar()}<PhoneBar area="home" {worst} label="Phone bar specimen, Home plus" />{/snippet}
					</Device>
				</Specimen>
				<Specimen label="Recipes" note="Goes to Add recipe (the link field). Same on a recipe page and on Manage tags.">
					<Device width={375} label="Recipes plus" height={460}>
						<Mini title="Recipes" />
						<div class="go">Opens <strong>Add recipe</strong></div>
						{#snippet bar()}<PhoneBar area="recipes" {worst} label="Phone bar specimen, Recipes plus" />{/snippet}
					</Device>
				</Specimen>
				<Specimen label="Plan" note="Opens the Add dialog for today's Dinner; when today is not in the shown week, for Monday Dinner. No day or meal choice inside.">
					<Device width={375} label="Plan plus" height={460}>
						<Mini title="Plan" lines={2} />
						<div class="dialog">
							<p class="w-note">Add to plan</p>
							<h3>Wednesday · Dinner</h3>
							<div class="seg"><span class="on">Recipe</span><span>Free text</span></div>
							<div class="field">Search recipes</div>
						</div>
						{#snippet bar()}<PhoneBar area="plan" {worst} label="Phone bar specimen, Plan plus" />{/snippet}
					</Device>
				</Specimen>
				<Specimen label="List" note="Focuses the Add an item field in the same tap, so the keyboard opens; the bar hides while the field has focus.">
					<Device width={375} label="List plus" height={460}>
						<Mini title="Shopping list">
							<div class="field on">Add an item</div>
							<div class="w-ph line"></div>
							<div class="w-ph line"></div>
						</Mini>
						{#snippet bar()}<PhoneBar area="list" {worst} label="Phone bar specimen, List plus" />{/snippet}
					</Device>
				</Specimen>
				<Specimen label="Spots" note="Goes to Add spot. Same on a spot page.">
					<Device width={375} label="Spots plus" height={460}>
						<Mini title="Eating Out" />
						<div class="go">Opens <strong>Add spot</strong></div>
						{#snippet bar()}<PhoneBar area="eating-out" {worst} label="Phone bar specimen, Spots plus" />{/snippet}
					</Device>
				</Specimen>
				<Specimen label="Recipe form: plus hidden" note="/recipes/new, /recipes/new/form and a recipe's edit page: no round plus, the five pills stay. Every way out asks Discard changes? first.">
					<Device width={375} label="Recipe form" height={460}>
						<Mini title="Write it down" lines={4} />
						{#snippet bar()}<PhoneBar area="recipes" plus="hidden" {worst} label="Phone bar specimen, form" />{/snippet}
					</Device>
				</Specimen>
			</div>

			<h2>Home choice sheet</h2>
			<Specimen label="Sheet at 320 px" note="A modal dialog: Escape, the Close button, a tap outside and the browser's back all close it and return focus to the plus. Each row is at least 44 px tall.">
				<Device width={320} label="Sheet 320" height={420}>
					<Mini title="What's cooking, Rue?" lines={1} />
					<div class="sheet-slot"><HomeSheet {worst} /></div>
				</Device>
			</Specimen>
			<Specimen label="Where the strip sits" note="With the sheet open the strip above and the bar below sit under the scrim; nothing else is reachable.">
				<Device width={375} label="Sheet with strip" height={420}>
					{#snippet top()}<PhoneTop area="home" placement="a" {worst} />{/snippet}
					<div class="scrim" aria-hidden="true"></div>
					<div class="sheet-slot"><HomeSheet {worst} /></div>
				</Device>
			</Specimen>
		</div>
	</div>
</Frame>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 25.5rem), 1fr));
		gap: var(--space-8) var(--space-6);
		align-items: start;
	}
	.scrim {
		min-block-size: var(--space-12);
		border-radius: var(--radius-item);
		background: var(--surface-tint);
	}
	.sheet-slot {
		margin-block-start: var(--space-2);
	}
	.go {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-item);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		font-size: var(--type-body-s-size);
	}
	.dialog {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-4);
		border-radius: var(--radius-card-s);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.dialog h3 {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
	}
	.seg {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-1);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		font-size: var(--type-label-size);
	}
	.seg span {
		flex: 1;
		display: grid;
		place-items: center;
		min-block-size: var(--control-height-xs);
		border-radius: var(--radius-pill);
	}
	.seg .on {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.field {
		display: flex;
		align-items: center;
		min-block-size: var(--target-touch);
		padding-inline: var(--space-4);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-muted);
		font-size: var(--type-body-s-size);
	}
	.field.on {
		outline: var(--focus-width) solid var(--ink);
		outline-offset: calc(-1 * var(--focus-width));
	}
	.line {
		block-size: var(--space-4);
		border-radius: var(--radius-pill);
	}
</style>
