<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import type { Area } from '#lib/nav.ts';
	import Device from './Device.svelte';
	import Mini from './Mini.svelte';
	import PhoneBar from './PhoneBar.svelte';
	import PhoneStrip from './PhoneStrip.svelte';
	import Spec from './Spec.svelte';
	import TopBar from './TopBar.svelte';
	import { areas, plusLabel } from './links.ts';
	import { pill } from './pill.ts';

	const worst = $derived(page.url.searchParams.get('data') === 'worst');
	// the bar inside the frame is the window width minus the app and frame padding
	const barWidth = (viewport: number) => viewport - 2 * (viewport >= 1100 ? 84 : 52);
	let demo = $state('Normal');
</script>

<svelte:head><title>Shell · hi-fi</title></svelte:head>

<Frame area="home" plus="hidden" photo="village-salad">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Shell</li><li>Gate 5</li></ul>
			<h1>The <em class="accent-word">shell</em></h1>
			<p class="lede">Both bars on every screen. The frame around this page is the real one: the top bar from 1024 px, the phone strip and dock below it.</p>
		</div>
		<ul class="screen-facts" data-surface="inverse" aria-label="Shell in numbers">
			<li><span class="n">5</span>Areas</li>
			<li><span class="n">44</span>px smallest target</li>
			<li><span class="n">320</span>px narrowest window</li>
		</ul>
	</header>

	<div class="screen-body" data-settle>
		<section class="card block" data-surface="solid">
			<div class="card-head"><h2>Desktop top bar</h2><span class="card-note">from 1024 px</span></div>
			<Spec label="Recipe actions, 1280 px window" width={barWidth(1280)} note="Brand, five areas with Eating Out last, Search recipes as a round glass button, Add recipe as a quiet glass pill, so the screen's own primary keeps the one dark arrow pill. The current area is the charcoal pill; sub-routes keep it.">
				<TopBar area="recipes" {worst} label="Top bar specimen" />
			</Spec>
			<Spec label="Spot actions on Eating Out" width={barWidth(1280)} note="Search spots and Add spot take the recipe actions' place; the brand stays.">
				<TopBar area="eating-out" {worst} label="Top bar specimen, Eating Out" />
			</Spec>
			<Spec label="1152 px window" width={barWidth(1152)}>
				<TopBar area="plan" {worst} label="Top bar specimen, 1152" />
			</Spec>
			<Spec label="1024 px window, the narrowest top bar" note="Everything stays on one line; the brand name gives way to the mark below 1180 px." width={barWidth(1024)}>
				<TopBar area="list" {worst} label="Top bar specimen, 1024" />
			</Spec>
		</section>

		<section class="card block" data-surface="solid">
			<div class="card-head"><h2>Phone posture</h2><span class="card-note">below 1024 px</span></div>
			<Spec label="Dock at the widest phone" note="Icon over label pills and the round plus; the strip carries the brand mark, Search and Add recipe. From 1024 px the top bar takes over.">
				<Device width={720} label="Widest phone posture" height={320}>
					{#snippet top()}<PhoneStrip area="recipes" {worst} />{/snippet}
					<Mini title="Recipes" />
					{#snippet bar()}<PhoneBar area="recipes" {worst} data-specimen label="Phone bar specimen, widest" />{/snippet}
				</Device>
			</Spec>
			<Spec label="360 and 375 px, icon over label" note="From 360 px each pill is an outline icon over its label, sized to it; a label that runs out of room is cut with an ellipsis. Below 360 px the dock is icon only and the label stays as the accessible name, a window-width rule, so a 320 px window shows it on the real frame. Every pill and the round plus are at least 44 px.">
				<div class="pair">
					<Device width={360} label="360" height={360}>
						{#snippet top()}<PhoneStrip area="list" {worst} />{/snippet}
						<Mini title="List" />
						{#snippet bar()}<PhoneBar area="list" {worst} data-specimen label="Phone bar specimen, 360" />{/snippet}
					</Device>
					<Device width={375} label="375" height={360}>
						{#snippet top()}<PhoneStrip area="plan" {worst} />{/snippet}
						<Mini title="Plan" />
						{#snippet bar()}<PhoneBar area="plan" {worst} data-specimen label="Phone bar specimen, 375" />{/snippet}
					</Device>
				</div>
			</Spec>
		</section>

		<section class="card block" data-surface="solid">
			<div class="card-head"><h2>States</h2></div>
			<Spec label="Current area per pill" note="One pill is charcoal. /recipes/12, /recipes/tags and /recipes/new/form mark Recipes; /eating-out/3/edit marks Spots.">
				<div class="stack">
					{#each areas as a (a.area)}
						<PhoneBar area={a.area as Area} {worst} data-specimen label={`Phone bar specimen, ${a.label}`} />
					{/each}
				</div>
			</Spec>
			<Spec label="Hidden while a text field has focus" note="On a coarse pointer the dock slides out and leaves the accessibility tree while the soft keyboard is up (data-hidden, set by hideOnType), and returns on blur.">
				<div class="pair">
					<Device width={375} label="Typing" height={400}>
						<Mini title="List"><div class="field typing">Add an item</div><div class="keys">Soft keyboard</div></Mini>
						{#snippet bar()}<PhoneBar area="list" {worst} data-hidden data-specimen label="Phone bar specimen, hidden" />{/snippet}
					</Device>
					<Device width={375} label="Resting" height={400}>
						<Mini title="List"><div class="field">Add an item</div></Mini>
						{#snippet bar()}<PhoneBar area="list" {worst} data-specimen label="Phone bar specimen, resting" />{/snippet}
					</Device>
				</div>
			</Spec>
			<Spec label="Recipe form: round plus hidden" note="/recipes/new, /recipes/new/form and a recipe's edit page: five pills, no plus. Every way out asks Discard changes? first.">
				<Device width={375} label="Recipe form" height={320}>
					<Mini title="Write it down" lines={3} />
					{#snippet bar()}<PhoneBar area="recipes" plus="hidden" {worst} data-specimen label="Phone bar specimen, form" />{/snippet}
				</Device>
			</Spec>
			<Spec label="Scrolled state" note="From 1100 px, once the top of the frame is out of view the top bar becomes a sticky capsule (brand mark, nav, actions) on a solid surface, set by the scrolled action. On the phone the dock is always the card surface and stays above the bottom edge. Names stay in both states; under reduced motion nothing fades in.">
				<Device width={375} label="Dock, scrolled" height={240}>
					<Mini title="Recipes" lines={1} />
					{#snippet bar()}<PhoneBar area="recipes" {worst} data-specimen label="Phone bar specimen, scrolled" />{/snippet}
				</Device>
			</Spec>
			<Spec label="The pill glides" note="Press a pill: the charcoal pill travels to it over 260 ms. Keyboard activation jumps. Reduced motion jumps too.">
				<nav class="demo" aria-label="Glide demo">
					<ul data-pill use:pill>
						{#each ['Normal', 'Worst case', 'Empty'] as v (v)}
							<li><button type="button" aria-pressed={demo === v} onclick={() => (demo = v)}>{v}</button></li>
						{/each}
					</ul>
				</nav>
			</Spec>
		</section>

		<section class="card block" data-surface="solid">
			<div class="card-head"><h2>Round plus labels</h2><span class="card-note">proposed COPY.contextAdd</span></div>
			<ul class="labels">
				{#each areas as a (a.area)}
					<li><span class="ruled">{a.phone}</span><strong>{plusLabel[a.area]}</strong></li>
				{/each}
			</ul>
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
	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), max-content));
		gap: var(--space-4);
		align-items: start;
	}
	.stack {
		display: grid;
		gap: var(--space-3);
		max-inline-size: 28rem;
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
	.field.typing {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.keys {
		display: grid;
		place-items: center;
		min-block-size: 8rem;
		border-radius: var(--radius-item);
		background: var(--surface-tint-strong);
		font-size: var(--type-caption-size);
	}
	.demo {
		justify-self: start;
		max-inline-size: 100%;
		border-radius: var(--radius-pill);
		background: var(--surface-glass-strong);
		box-shadow: var(--elevation-menu);
	}
	.demo ul {
		display: flex;
		gap: var(--space-0-5);
		margin: 0;
		padding: var(--space-1);
		list-style: none;
	}
	.demo button {
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-4);
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--ink);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	.demo button[aria-pressed='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.labels {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.labels li {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
</style>
