<script lang="ts">
	import { page } from '$app/state';
	import Button from '../overlays/Button.svelte';
	import Frame from '../../Frame.svelte';
	import Picker from './Picker.svelte';
	import Week from './Week.svelte';
	import { planFor, type PlanView } from './data.ts';

	type Props = { kind?: PlanView['kind']; picker?: 'idle' | 'empty' };
	let { kind = 'current', picker = 'idle' }: Props = $props();
	const view = $derived(planFor(new URL(page.url.href), kind));
</script>

<Frame area="plan">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Meal plan</li><li>Week {view.weekNumber}</li><li>{view.range}</li></ul>
			<h1>{view.heading}</h1>
		</div>
		<div class="seg-bar" role="group" aria-label="Week">
			<div class="seg week-step">
				<Button variant="quiet" size="s" icon="chev-left" label="Previous week" />
				<span class="seg-text"><span class="seg-label">Week {view.weekNumber}</span><span class="seg-value">{view.range}</span></span>
				<Button variant="quiet" size="s" icon="chev-right" label="Next week" />
			</div>
			<div class="seg"><Button variant="quiet" size="s" disabled={view.kind !== 'past'}>This week</Button></div>
			<div class="seg-actions"><Button variant="primary">Copy week</Button></div>
		</div>
	</div>
	<div class="screen-body">
		<div class="layout">
			<div class="main"><Week {view} /></div>
			<Picker recipes={view.recipes} state={picker} />
		</div>
	</div>
</Frame>

<style>
	.week-step { gap: var(--space-2); }
	.layout { display: grid; gap: var(--space-4); min-inline-size: 0; align-items: start; }
	.main { display: grid; gap: var(--space-3); min-inline-size: 0; }
	/* below the posture switch the picker has no job (no drag on touch): the Add dialog's own search takes over */
	.layout > :global(.picker) { display: none; }
	@media (min-width: 1024px) {
		.layout { grid-template-columns: minmax(0, 1fr) 16rem; }
		.layout > :global(.picker) { display: grid; position: sticky; inset-block-start: var(--space-4); }
	}
</style>
