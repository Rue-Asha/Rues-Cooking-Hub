<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import Device from '../Device.svelte';
	import Mini from '../Mini.svelte';
	import PhoneBar from '../PhoneBar.svelte';
	import PhoneTop from '../PhoneTop.svelte';
	import Specimen from '../Specimen.svelte';

	const worst = $derived(page.url.searchParams.get('data') === 'worst');
</script>

<svelte:head><title>Phone placement · wireframe</title></svelte:head>

<Frame area="home" plus="hidden">
	<div class="w-page">
		<header class="w-head">
			<p class="w-kicker">Shell</p>
			<h1>Brand, Search recipes and Add recipe on the phone</h1>
			<p class="w-lede">Two ways to keep all three reachable on every screen next to the round plus. Pick one at gate 4. Every screen shows the choice with the wireframe controls on top: Phone placement A or B.</p>
		</header>

		<div class="w-states">
			<h2>A. A top strip with both actions in sight</h2>
			<p class="w-note">Brand left, Search as an icon, Add recipe as a button. Zero taps. On Recipes the strip's Add recipe and the round plus do the same thing; on every other area they differ.</p>
			<div class="row">
				<Specimen label="Recipes, 375 px">
					<Device width={375} label="A Recipes 375" height={420}>
						{#snippet top()}<PhoneTop area="recipes" placement="a" {worst} />{/snippet}
						<Mini title="Recipes" />
						{#snippet bar()}<PhoneBar area="recipes" {worst} label="Phone bar specimen, A Recipes" />{/snippet}
					</Device>
				</Specimen>
				<Specimen label="Eating Out, 375 px" note="Search spots and Add spot replace the recipe actions; the brand stays.">
					<Device width={375} label="A Eating Out 375" height={420}>
						{#snippet top()}<PhoneTop area="eating-out" placement="a" {worst} />{/snippet}
						<Mini title="Eating Out" />
						{#snippet bar()}<PhoneBar area="eating-out" {worst} label="Phone bar specimen, A Eating Out" />{/snippet}
					</Device>
				</Specimen>
				<Specimen label="320 px and the phone strip name" note="Below about 360 px the brand shows as its mark only; the accessible name stays Rues Cooking Hub.">
					<Device width={320} label="A 320" height={420}>
						{#snippet top()}<PhoneTop area="plan" placement="a" {worst} />{/snippet}
						<Mini title="Plan" />
						{#snippet bar()}<PhoneBar area="plan" {worst} label="Phone bar specimen, A 320" />{/snippet}
					</Device>
				</Specimen>
			</div>

			<h2>B. A top strip with one menu button</h2>
			<p class="w-note">Brand left, one more-actions button; one tap shows Search recipes and Add recipe. A quieter strip, one tap before each action. The round plus stays the only add button in sight.</p>
			<div class="row">
				<Specimen label="Recipes, menu closed">
					<Device width={375} label="B closed" height={420}>
						{#snippet top()}<PhoneTop area="recipes" placement="b" {worst} />{/snippet}
						<Mini title="Recipes" />
						{#snippet bar()}<PhoneBar area="recipes" {worst} label="Phone bar specimen, B closed" />{/snippet}
					</Device>
				</Specimen>
				<Specimen label="Recipes, menu open">
					<Device width={375} label="B open" height={420}>
						{#snippet top()}<PhoneTop area="recipes" placement="b" {worst} open />{/snippet}
						<Mini title="Recipes" />
						{#snippet bar()}<PhoneBar area="recipes" {worst} label="Phone bar specimen, B open" />{/snippet}
					</Device>
				</Specimen>
				<Specimen label="Eating Out, menu open">
					<Device width={375} label="B Eating Out" height={420}>
						{#snippet top()}<PhoneTop area="eating-out" placement="b" {worst} open />{/snippet}
						<Mini title="Eating Out" />
						{#snippet bar()}<PhoneBar area="eating-out" {worst} label="Phone bar specimen, B Eating Out" />{/snippet}
					</Device>
				</Specimen>
			</div>

			<h2>Both</h2>
			<ul class="facts">
				<li>The strip scrolls away with the page; only the bottom bar is fixed, so the reading area stays tall.</li>
				<li>Search recipes lands on Recipes with its field focused, also when Recipes is already open.</li>
				<li>On the recipe form every one of these asks Discard changes? first when something was edited.</li>
			</ul>
		</div>
	</div>
</Frame>

<style>
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 25.5rem), max-content));
		gap: var(--space-6);
		align-items: start;
	}
	.facts {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		padding-inline-start: var(--space-5);
		max-inline-size: var(--measure);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		color: var(--ink-secondary);
	}
</style>
