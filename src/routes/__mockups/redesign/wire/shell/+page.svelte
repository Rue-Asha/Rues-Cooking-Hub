<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import Device from './Device.svelte';
	import Mini from './Mini.svelte';
	import PhoneBar from './PhoneBar.svelte';
	import Specimen from './Specimen.svelte';
	import TopBar from './TopBar.svelte';
	import type { Area } from '#lib/nav.ts';
	import { areas } from './links.ts';

	const worst = $derived(page.url.searchParams.get('data') === 'worst');
	// the bar inside the frame is the window width minus the app (16) and frame (2 × 24) padding
	const barWidth = (viewport: number) => viewport - 80 + 24;
</script>

<svelte:head><title>Shell · wireframe</title></svelte:head>

<Frame area="home" plus="hidden">
	<div class="w-page">
		<header class="w-head">
			<p class="w-kicker">Shell</p>
			<h1>Top bar and phone bar</h1>
			<p class="w-lede">Both bars on every screen. The frame around this page shows the real posture for the window you are in: top bar from 1024 px, phone strip and bar below.</p>
		</header>

		<div class="w-states">
			<h2>Desktop top bar</h2>
			<Specimen label="Recipe actions, 1280 px window" note="Brand, five areas with Eating Out last after a divider, Search recipes, Add recipe. The current area is the charcoal pill; sub-routes keep it.">
				<TopBar area="recipes" {worst} label="Top bar specimen" />
			</Specimen>
			<Specimen label="Spot actions on Eating Out, 1280 px window" note="Search spots and Add spot take the recipe actions' place; the brand stays.">
				<TopBar area="eating-out" {worst} label="Top bar specimen, Eating Out" />
			</Specimen>
			<Specimen label="1152 px window, both action sets" width={barWidth(1152)}>
				<TopBar area="plan" {worst} label="Top bar specimen, 1152 Plan" />
				<TopBar area="eating-out" {worst} label="Top bar specimen, 1152 Eating Out" />
			</Specimen>
			<Specimen label="1024 px window, both action sets" note="The narrowest top bar. Everything stays on one line here." width={barWidth(1024)}>
				<TopBar area="list" {worst} label="Top bar specimen, 1024 List" />
				<TopBar area="eating-out" {worst} label="Top bar specimen, 1024 Eating Out" />
			</Specimen>

			<h2>Where the posture switches</h2>
			<Specimen label="768 px window with the top bar" note="Today's switch is 1024 px. Held to the top bar at 768 the actions have to give way: first icon only, and the bar is still wider than the window." width={barWidth(768)}>
				<TopBar area="recipes" {worst} label="Top bar specimen, 768" />
				<TopBar area="recipes" {worst} iconActions label="Top bar specimen, 768 icons" />
			</Specimen>
				<Specimen label="768 px window, phone posture" note="Pills and round plus stay comfortable at tablet width; the strip carries the brand and the actions.">
				<Device width={720} label="768 phone posture" height={300}>
					{#snippet top()}
						<div class="strip">
							<span class="w-btn quiet">Rues Cooking Hub</span>
							<span class="w-btn">Search</span>
							<span class="w-btn primary">Add recipe</span>
						</div>
					{/snippet}
					<Mini title="Recipes" lines={2} />
					{#snippet bar()}<PhoneBar area="recipes" {worst} label="Phone bar specimen, 768" />{/snippet}
				</Device>
			</Specimen>
			<Specimen label="1024 px window, phone posture" note="Not recommended: a wide window with a phone bar wastes the pointer. Keep the switch at 1024.">
				<Device width={968} label="1024 phone posture" height={240}>
					<Mini title="Recipes" lines={1} />
					{#snippet bar()}<PhoneBar area="recipes" {worst} label="Phone bar specimen, 1024" />{/snippet}
				</Device>
			</Specimen>

			<h2>Phone bar at 320 px first</h2>
			<Specimen label="320 px: labelled pills and the icon-only fallback" note="Five pills and the round plus, each at least 44 px, 8 px from the window edges. Left: labels. Right: icon only with the names kept for assistive tech.">
				<div class="pair tight">
					<Device width={320} label="320 labelled" height={200}>
						<Mini title="List" lines={1} />
						{#snippet bar()}<PhoneBar area="list" {worst} label="Phone bar specimen, 320 labelled" />{/snippet}
					</Device>
					<Device width={320} label="320 icon only" height={200}>
						<Mini title="List" lines={1} />
						{#snippet bar()}<PhoneBar area="list" {worst} iconOnly label="Phone bar specimen, 320 icons" />{/snippet}
					</Device>
				</div>
			</Specimen>
			<Specimen label="375 and 390 px" note="Comfortable widths: labels fit with room to spare.">
				<div class="pair tight">
					<Device width={375} label="375" height={200}>
						<Mini title="Plan" lines={1} />
						{#snippet bar()}<PhoneBar area="plan" {worst} label="Phone bar specimen, 375" />{/snippet}
					</Device>
					<Device width={390} label="390" height={200}>
						<Mini title="Recipes" lines={1} />
						{#snippet bar()}<PhoneBar area="recipes" {worst} label="Phone bar specimen, 390" />{/snippet}
					</Device>
				</div>
			</Specimen>

			<h2>States</h2>
			<Specimen label="Current area per pill" note="One pill is charcoal at a time. /recipes/12, /recipes/tags and /recipes/new/form mark Recipes; /eating-out/3/edit marks Spots.">
				<div class="stack">
					{#each areas as a (a.area)}
						<PhoneBar area={a.area as Area} {worst} label={`Phone bar specimen, ${a.label}`} />
					{/each}
				</div>
			</Specimen>
			<Specimen label="Hidden while a text field has focus" note="The bar goes away and stays out of the accessibility tree while the soft keyboard is up, and comes back on blur. Typing state first, resting state beside it.">
				<div class="pair tight">
					<Device width={375} label="Typing" height={420}>
						<Mini title="List">
							<div class="field">Add an item</div>
							<div class="w-ph keyboard">Soft keyboard</div>
						</Mini>
						{#snippet bar()}<PhoneBar area="list" {worst} typing label="Phone bar specimen, hidden" />{/snippet}
					</Device>
					<Device width={375} label="Resting" height={420}>
						<Mini title="List">
							<div class="field idle">Add an item</div>
						</Mini>
						{#snippet bar()}<PhoneBar area="list" {worst} label="Phone bar specimen, resting" />{/snippet}
					</Device>
				</div>
			</Specimen>
			<Specimen label="Scrolled state" note="data-compact is set after 48 px of scroll. The wireframe keeps both bars as they are; whether anything changes is a gate 5 question. Names stay in both states.">
				<p class="w-note">No change drawn at this stage.</p>
			</Specimen>
		</div>
	</div>
</Frame>

<style>
	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), max-content));
		gap: var(--space-6);
		align-items: start;
	}
	.pair.tight {
		gap: var(--space-4);
	}
	.stack {
		display: grid;
		gap: var(--space-3);
		max-inline-size: 28rem;
	}
	.strip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.strip .w-btn.quiet {
		background: transparent;
		box-shadow: none;
		font-weight: var(--weight-semibold);
	}
	.field {
		min-block-size: var(--target-touch);
		display: flex;
		align-items: center;
		padding-inline: var(--space-4);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-muted);
		font-size: var(--type-body-s-size);
	}
	.field:not(.idle) {
		outline: var(--focus-width) solid var(--ink);
		outline-offset: calc(-1 * var(--focus-width));
	}
	.keyboard {
		min-block-size: 11rem;
		border-radius: var(--radius-item);
	}
</style>
