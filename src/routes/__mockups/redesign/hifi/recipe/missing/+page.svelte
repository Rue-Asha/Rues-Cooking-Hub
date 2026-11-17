<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Button from '../../shell/Button.svelte';
	import Ic from '../../recipes/Ic.svelte';
	import { go } from '../../recipes/util.ts';
	import State from '../../home/State.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
</script>

<svelte:head><title>Recipe not found · hi-fi</title></svelte:head>

<Frame area="recipes" plus="shown">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipe</li><li>404</li></ul>
			<h1>Recipe not <em class="accent-word">found</em></h1>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<section class="card gone" data-surface="solid" aria-label="Recipe not found">
			<p>This recipe doesn't exist, or it was deleted.</p>
			<Button href={go.recipes(data.worst)}><Ic name="back" />Back to recipes</Button>
		</section>

		<div class="states card" data-surface="solid">
			<State label="Edit page, unknown id" note="/recipes/<id>/edit answers with the same card: the form never renders and the bar keeps Recipes current.">
				<section class="card gone" data-surface="solid" aria-label="Recipe not found, edit page">
					<p class="overline">Recipes · Edit</p>
					<h2>Recipe not found</h2>
					<p>This recipe doesn't exist, or it was deleted.</p>
					<Button href={go.recipes(data.worst)}><Ic name="back" />Back to recipes</Button>
				</section>
			</State>
		</div>
	</div>
</Frame>

<style>
	.gone {
		display: grid;
		gap: var(--space-3);
		justify-items: start;
		padding: var(--space-6);
		max-inline-size: 36rem;
	}
	.gone p {
		color: var(--ink-secondary);
	}
	.gone h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.overline {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		text-transform: uppercase;
	}
	.states {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-5);
		max-inline-size: 36rem;
	}
	.states .gone {
		padding: 0;
		background: none;
		box-shadow: none;
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}
</style>
