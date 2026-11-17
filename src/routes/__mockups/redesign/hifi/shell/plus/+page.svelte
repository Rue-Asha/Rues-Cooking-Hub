<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import Button from '../Button.svelte';
	import Device from '../Device.svelte';
	import HomeChoices from '../HomeChoices.svelte';
	import Mini from '../Mini.svelte';
	import PhoneBar from '../PhoneBar.svelte';
	import PhoneStrip from '../PhoneStrip.svelte';
	import Spec from '../Spec.svelte';

	const worst = $derived(page.url.searchParams.get('data') === 'worst');
</script>

<svelte:head><title>Round plus · hi-fi</title></svelte:head>

<Frame area="home" plus="hidden" photo="spaghetti-pomodoro">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Shell</li><li>Gate 5</li></ul>
			<h1>The round <em class="accent-word">plus</em></h1>
			<p class="lede">One round button beside the pill group, acting for the area you are in. A recipe page counts as Recipes, a spot page as Spots.</p>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<section class="card block" data-surface="solid">
			<div class="card-head"><h2>Per area</h2></div>
			<div class="grid">
				<Spec label="Home" note="Opens the choice sheet: Recipe, Plan entry, List item.">
					<Device width={375} label="Home plus" height={520}>
						{#snippet top()}<PhoneStrip area="home" {worst} />{/snippet}
						<Mini title="What's cooking, Rue?" lines={1} />
						<div class="sheet">
							<header><h4>Add to your kitchen</h4><span class="close" aria-hidden="true">×</span></header>
							<HomeChoices {worst} />
						</div>
						{#snippet bar()}<PhoneBar area="home" {worst} data-specimen label="Phone bar specimen, Home plus" />{/snippet}
					</Device>
				</Spec>
				<Spec label="Recipes" note="Goes to Add recipe (the link field). Same on a recipe page and on Manage tags.">
					<Device width={375} label="Recipes plus" height={320}>
						{#snippet top()}<PhoneStrip area="recipes" {worst} />{/snippet}
						<Mini title="Recipes" />
						<p class="go">Opens <strong>Add recipe</strong></p>
						{#snippet bar()}<PhoneBar area="recipes" {worst} data-specimen label="Phone bar specimen, Recipes plus" />{/snippet}
					</Device>
				</Spec>
				<Spec label="Plan" note="Opens the Add dialog for today's Dinner; when today is not in the shown week, for Monday Dinner. No day or meal choice inside.">
					<Device width={375} label="Plan plus" height={420}>
						{#snippet top()}<PhoneStrip area="plan" {worst} />{/snippet}
						<div class="dialog">
							<p class="kick">Add to plan</p>
							<h4>Wednesday · Dinner</h4>
							<div class="field">Search recipes</div>
							<Button variant="primary" arrow>Add to plan</Button>
						</div>
						{#snippet bar()}<PhoneBar area="plan" {worst} data-specimen label="Phone bar specimen, Plan plus" />{/snippet}
					</Device>
				</Spec>
				<Spec label="List" note="Focuses the Add an item field in the same tap, so the keyboard opens; the bar hides while the field has focus.">
					<Device width={375} label="List plus" height={320}>
						{#snippet top()}<PhoneStrip area="list" {worst} />{/snippet}
						<Mini title="Shopping list"><div class="field on">Add an item</div></Mini>
						{#snippet bar()}<PhoneBar area="list" {worst} data-specimen label="Phone bar specimen, List plus" />{/snippet}
					</Device>
				</Spec>
				<Spec label="Spots" note="Goes to Add spot. Same on a spot page.">
					<Device width={375} label="Spots plus" height={320}>
						{#snippet top()}<PhoneStrip area="eating-out" {worst} />{/snippet}
						<Mini title="Eating Out" />
						<p class="go">Opens <strong>Add spot</strong></p>
						{#snippet bar()}<PhoneBar area="eating-out" {worst} data-specimen label="Phone bar specimen, Spots plus" />{/snippet}
					</Device>
				</Spec>
				<Spec label="Recipe form: plus hidden" note="No nested add while editing; the five pills stay.">
					<Device width={375} label="Recipe form" height={320}>
						{#snippet top()}<PhoneStrip area="recipes" {worst} />{/snippet}
						<Mini title="Write it down" lines={3} />
						{#snippet bar()}<PhoneBar area="recipes" plus="hidden" {worst} data-specimen label="Phone bar specimen, form" />{/snippet}
					</Device>
				</Spec>
			</div>
		</section>

		<section class="card block" data-surface="solid">
			<div class="card-head"><h2>Home choice sheet</h2></div>
			<Spec label="Sheet at 320 px" note="A modal dialog: Escape, Close, a tap outside and the browser's back all close it and return focus to the plus. Each row is at least 44 px tall. From 768 px it is a centred dialog. Open it for real with the plus on Home.">
				<Device width={320} label="Sheet 320" height={420}>
					<div class="sheet">
						<header><h4>Add to your kitchen</h4><span class="close" aria-hidden="true">×</span></header>
						<HomeChoices {worst} />
					</div>
				</Device>
			</Spec>
		</section>
	</div>
</Frame>

<style>
	.block {
		display: grid;
		gap: var(--space-6);
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 25.5rem), 1fr));
		gap: var(--space-8) var(--space-6);
		align-items: start;
	}
	.sheet {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
		border-radius: var(--radius-card);
		background: var(--surface-glass-strong);
		box-shadow: var(--elevation-card);
		min-inline-size: 0;
	}
	.sheet header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.sheet h4,
	.dialog h4 {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
	}
	.close {
		display: grid;
		place-items: center;
		inline-size: var(--target-touch);
		block-size: var(--target-touch);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.go {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-card);
		box-shadow: var(--shadow-rim);
		font-size: var(--type-body-s-size);
	}
	.dialog {
		display: grid;
		gap: var(--space-3);
		justify-items: start;
		padding: var(--space-5);
		border-radius: var(--radius-card);
		background: var(--surface-glass-strong);
		box-shadow: var(--elevation-card);
	}
	.kick {
		font-size: var(--type-kicker-size);
		letter-spacing: var(--type-kicker-tracking);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
	.field {
		display: flex;
		align-items: center;
		align-self: stretch;
		min-block-size: var(--target-touch);
		padding-inline: var(--space-4);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-muted);
		font-size: var(--type-body-s-size);
	}
	.field.on {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
</style>
