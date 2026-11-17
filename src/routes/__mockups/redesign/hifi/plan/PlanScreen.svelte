<script lang="ts">
	import { page } from '$app/state';
	import Button from '../shell/Button.svelte';
	import Frame from '../../Frame.svelte';
	import CopyWeek from '../overlays/CopyWeek.svelte';
	import Icon from '../overlays/Icon.svelte';
	import NoticeHost from '../overlays/NoticeHost.svelte';
	import { notify } from '../overlays/notice.svelte.ts';
	import { areaPath, link } from '../shell/links.ts';
	import Picker from './Picker.svelte';
	import Week from './Week.svelte';
	import { entriesText, planFor, type PlanView } from './data.ts';

	type Props = { kind?: PlanView['kind'] };
	let { kind = 'current' }: Props = $props();
	const view = $derived(planFor(new URL(page.url.href), kind));
	const worst = $derived(view.worst);
	const self = $derived(link(areaPath.plan, worst));
	const past = $derived(link(`${areaPath.plan}/past`, worst));
	const hasToday = $derived(view.todayIndex !== -1);
	let copy = $state(false);
	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<Frame area="plan" photo={view.photo}>
	<header class="screen-head plan-head">
		<div class="screen-lead">
			<ul class="kicker">
				<li>Meal plan</li>
				<li>Week {view.weekNumber}</li>
				<li>{view.range}</li>
				{#if hasToday}
					<li>Day&nbsp;<span class="position">{pad(view.todayIndex + 1)}<span class="of"><span class="sr-only">&nbsp;of&nbsp;</span><span aria-hidden="true">&nbsp;/&nbsp;</span>07</span></span></li>
				{/if}
			</ul>
			<h1>{view.title[0]}<em class="accent-word">{view.title[1]}</em></h1>
		</div>
		<div class="seg-bar plan-bar">
			<div class="seg week-step" role="group" aria-label="Week">
				<Button variant="secondary" size="s" icon label="Previous week" href={kind === 'past' ? '#' : kind === 'future' ? self : past}><Icon name="chev-left" /></Button>
				<span class="seg-text"><span class="seg-label">Week {view.weekNumber}</span><span class="seg-value">{view.range}</span></span>
				<Button variant="secondary" size="s" icon label="Next week" href={kind === 'past' ? self : '#'}><Icon name="chev-right" /></Button>
			</div>
			<div class="seg"><Button variant="quiet" size="s" href={self} aria-current={kind === 'current' || kind === 'empty' ? 'page' : undefined}>This week</Button></div>
			<div class="seg-actions"><Button variant="primary" arrow onclick={() => (copy = true)}>Copy week</Button></div>
		</div>
		{#if view.entries}
			<ul class="screen-facts" data-surface={hasToday ? undefined : 'inverse'} aria-label="Planned per meal">
				<li class="facts-caption" aria-hidden="true">Planned per meal</li>
				{#each view.perSlot as s (s.label)}<li><span class="n">{s.n.toLocaleString('en-GB')}</span>{s.label}</li>{/each}
			</ul>
		{/if}
	</header>

	<div class="screen-body" data-settle>
		<div class="layout">
			<div class="main"><Week {view} /></div>
			<Picker recipes={view.recipes} />
		</div>
	</div>
</Frame>

<CopyWeek live bind:open={copy} sourceRange={kind === 'past' ? '14 – 20 September' : kind === 'future' ? '8 – 14 March' : '12 – 18 October'} sourceCount={worst ? 61 : 14} shownCount={view.entries} oncopy={() => notify(`Copied ${entriesText(worst ? 61 : 14)} into this week`)} />
<NoticeHost />

<style>
	/* the week's facts read on a solid card, never on glass over the photo; the charcoal belongs to the Today row, or to these facts when no day is today */
	.plan-head :global(.screen-facts:not([data-surface='inverse'])) {
		background: var(--surface-card);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}
	.plan-bar {
		background: var(--surface-card);
	}
	.week-step {
		gap: var(--space-2);
	}
	.week-step .seg-text {
		min-inline-size: 8.5em;
		text-align: center;
	}
	.layout {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		min-inline-size: 0;
	}
	.main {
		min-inline-size: 0;
		display: grid;
		gap: var(--space-3);
	}
	/* below the posture switch drag has no job: the Add dialog's own search takes over */
	.layout > :global(.picker) {
		display: none;
	}
	@media (max-width: 767px) {
		.week-step {
			justify-content: space-between;
		}
		.plan-bar .seg:not(.week-step) {
			justify-content: center;
		}
	}
	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 15.5rem;
		}
		.layout > :global(.picker) {
			display: grid;
			position: sticky;
			inset-block-start: var(--space-4);
			max-block-size: calc(100dvh - var(--space-8));
		}
	}
</style>
