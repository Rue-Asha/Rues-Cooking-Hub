<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import { page } from '$app/state';
	import { MediaQuery } from 'svelte/reactivity';
	import { fly } from 'svelte/transition';
	import Button from '#lib/components/button/Button.svelte';
	import { addDays } from '#lib/dates.ts';
	import { reducedMotion } from '#lib/motion.ts';
	import CopyWeek from '#lib/plan/CopyWeek.svelte';
	import { ghost, grabbed, land, placed, placeKey, setBoard, type Board, type Place } from '#lib/plan/dnd.ts';
	import MoveTo from '#lib/plan/MoveTo.svelte';
	import RecipePicker from '#lib/plan/RecipePicker.svelte';
	import RecipeRail from '#lib/plan/RecipeRail.svelte';
	import Week, { weekNumber, weekRange } from '#lib/plan/Week.svelte';
	import { registerContextAdd, takeAddFlag } from '#lib/shell/context-add.svelte.ts';
	import { useStage } from '#lib/shell/stage.svelte.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { SLOTS, type Id, type PlanEntry, type Slot } from '#lib/types.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const range = $derived(weekRange(data.monday, data.today));

	const prev = $derived(addDays(data.monday, -7));
	const next = $derived(addDays(data.monday, 7));
	const number = $derived(weekNumber(data.monday));
	const heading = $derived(
		data.monday === data.thisMonday
			? { lead: 'This', word: 'week' }
			: data.monday === addDays(data.thisMonday, 7)
				? { lead: 'Next', word: 'week' }
				: data.monday === addDays(data.thisMonday, -7)
					? { lead: 'Last', word: 'week' }
					: { lead: 'Week', word: String(number) }
	);
	const todayIndex = $derived(data.days.indexOf(data.today));
	const pad = (n: number) => String(n).padStart(2, '0');
	const perSlot = $derived(SLOTS.map((s) => ({ label: s.label, n: data.entries.filter((e) => e.slot === s.id).length })));

	// the first picture of a planned recipe is the stage behind the head
	useStage(() => {
		const id = data.entries.find((e) => e.recipe?.imageId != null)?.recipe?.imageId;
		return id == null ? null : `/images/${id}`;
	});

	let target = $state<{ date: string; slot: Slot } | null>(null);
	let copying = $state(false);
	let moving = $state<PlanEntry | null>(null);

	// the "+" of the phone bar and ?add=1 open the dialog for today's Dinner, else Monday Dinner of the shown week
	const contextTarget = () => ({ date: todayIndex === -1 ? data.monday : data.today, slot: 'dinner' as Slot });
	$effect(() => registerContextAdd(() => (target = contextTarget())));
	$effect(() => {
		if (!takeAddFlag(new URL(page.url.href))) return;
		const at = contextTarget();
		// opened from a link on another page there is no opener to go back to; the slot's own add button stands in
		document.querySelector<HTMLElement>(`[data-date="${at.date}"][data-slot="${at.slot}"] .slot-add`)?.focus({ preventScroll: true });
		target = at;
	});

	// a move shows at once and the server's answer replaces it
	let entries = $derived(data.entries);

	async function post(action: string, fields: Record<string, string | number | undefined>) {
		const body = new FormData();
		for (const [k, v] of Object.entries(fields)) if (v !== undefined) body.set(k, String(v));
		await fetch(`?/${action}`, { method: 'POST', body, headers: { 'x-sveltekit-action': 'true' } });
		await refreshAll();
	}

	function move(id: Id, to: Place & { position?: number }) {
		entries = placed(entries, id, to);
		return post('move', { id, ...to });
	}

	// the menu that opened the sheet is gone by the time it closes, so the focus goes back to the entry, wherever it now is
	const refocus = (id: Id) =>
		document
			.querySelector<HTMLElement>(`[data-entry="${id}"]:not([inert] *, [aria-hidden] *) [aria-haspopup="menu"]`)
			?.focus();

	// drag & drop is for a mouse on the desktop grid; touch and the phone layout use "Move to…"
	const fine = new MediaQuery('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
	const drag = $state<Board['drag']>({ item: null, over: null, before: null });

	function dropPlace(e: DragEvent) {
		const el = e.target instanceof Element ? e.target : null;
		const cell = el?.closest<HTMLElement>('[data-slot][data-date]');
		if (!cell) return null;
		const before = el?.closest<HTMLElement>('[data-entry]:not([inert] *)')?.dataset.entry;
		return { date: cell.dataset.date!, slot: cell.dataset.slot as Slot, before: before ? Number(before) : null };
	}

	function dragover(e: DragEvent) {
		if (!drag.item) return;
		const at = dropPlace(e);
		drag.over = at && placeKey(at.date, at.slot);
		drag.before = at?.before ?? null;
		if (!at) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = drag.item.kind === 'recipe' ? 'copy' : 'move';
	}

	function drop(e: DragEvent) {
		const item = drag.item;
		const at = dropPlace(e);
		if (!item || !at) return;
		e.preventDefault();
		board.end();
		// dropping a card on itself leaves it where it was
		if (item.kind === 'entry' && at.before === item.id) return;
		const siblings = entries.filter((x) => x.date === at.date && x.slot === at.slot && !(item.kind === 'entry' && x.id === item.id));
		const index = siblings.findIndex((x) => x.id === at.before);
		const position = index < 0 ? undefined : index;
		land(e, item);
		if (item.kind === 'entry') move(item.id, { date: at.date, slot: at.slot, position });
		else post('add', { kind: 'recipe', recipeId: item.id, servings: item.servings, date: at.date, slot: at.slot, position });
	}

	const board = setBoard({
		drag,
		get canDrag() {
			return fine.current;
		},
		start(e, item, source) {
			if (!e.dataTransfer) return;
			e.dataTransfer.effectAllowed = item.kind === 'recipe' ? 'copy' : 'move';
			e.dataTransfer.setData('text/plain', source.textContent?.trim() ?? '');
			grabbed(e, source);
			ghost(e, source);
			drag.item = item;
		},
		end() {
			drag.item = null;
			drag.over = null;
			drag.before = null;
		},
		moveTo(entry) {
			moving = entry;
			document.addEventListener('close', () => refocus(entry.id), { capture: true, once: true });
		}
	});

	// the week slides in from the side it lies on; reduced motion swaps it in place
	let shown: string | null = null;
	let direction = $state(1);
	$effect.pre(() => {
		const monday = data.monday;
		if (shown !== null && monday !== shown) direction = monday > shown ? 1 : -1;
		shown = monday;
	});
</script>

<svelte:document
	ondragover={dragover}
	ondrop={drop}
	ondragleave={(e) => {
		if (e.relatedTarget === null) drag.over = drag.before = null;
	}}
/>

<svelte:head>
	<title>Plan · Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head plan-head">
	<div class="screen-lead">
		<ul class="kicker">
			<li>Meal plan</li>
			<li>Week {number}</li>
			<li>{range}</li>
			{#if todayIndex !== -1}
				<li>Day&nbsp;<span class="position">{pad(todayIndex + 1)}<span class="of"><span class="sr-only">&nbsp;of&nbsp;</span><span aria-hidden="true">&nbsp;/&nbsp;</span>07</span></span></li>
			{/if}
		</ul>
		<h1>{heading.lead} <em class="accent-word">{heading.word}</em></h1>
	</div>
	<div class="seg-bar plan-bar">
		<div class="seg week-step" role="group" aria-label="Week">
			<Button variant="secondary" size="s" icon label="Previous week" href="/plan?week={prev}" data-sveltekit-keepfocus><Icon name="chevron-left" size={20} /></Button>
			<span class="seg-text"><span class="seg-label">Week {number}</span><span class="seg-value">{range}</span></span>
			<Button variant="secondary" size="s" icon label="Next week" href="/plan?week={next}" data-sveltekit-keepfocus><Icon name="chevron-right" size={20} /></Button>
		</div>
		<div class="seg">
			<Button variant="quiet" size="s" href="/plan?week={data.thisMonday}" aria-current={data.monday === data.thisMonday ? 'page' : undefined} data-sveltekit-keepfocus>This week</Button>
		</div>
		<div class="seg-actions"><Button variant="primary" arrow onclick={() => (copying = true)}>Copy week</Button></div>
	</div>
	{#if data.entries.length > 0}
		<ul class="screen-facts" data-surface={todayIndex === -1 ? 'inverse' : undefined} aria-label="Planned per meal">
			<li class="facts-caption" aria-hidden="true">Planned per meal</li>
			{#each perSlot as s (s.label)}<li><span class="n">{s.n.toLocaleString('en-GB')}</span>{s.label}</li>{/each}
		</ul>
	{/if}
</header>

<!-- portalled dialogs sit before the body, never last: the page's teardown removes everything from its first to its last top-level node -->
<CopyWeek
	open={copying}
	monday={data.monday}
	today={data.today}
	existing={data.entries.length}
	sources={data.sources}
	onclose={() => (copying = false)}
/>
<RecipePicker {target} recipes={data.recipes} onclose={() => (target = null)} />
<MoveTo
	entry={moving}
	days={data.days}
	today={data.today}
	onmove={(to) => {
		if (moving) move(moving.id, to);
		moving = null;
	}}
	onclose={() => (moving = null)}
/>

<div class="screen-body" data-settle>
	<div class="layout">
		<div class="main">
			{#if data.entries.length === 0}<p class="plan-empty">Nothing planned yet — tap + to add a meal</p>{/if}
			{#key data.monday}
				<div class="week-slide" in:fly={{ x: reducedMotion() ? 0 : direction * 36, duration: reducedMotion() ? 0 : 360 }}>
					<Week days={data.days} today={data.today} {entries} onadd={(date, slot) => (target = { date, slot })} />
				</div>
			{/key}
		</div>
		<RecipeRail recipes={data.recipes} />
	</div>
</div>

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
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	.week-slide {
		min-inline-size: 0;
	}

	/* one line for a week with nothing in it; on a mouse desktop the picker and the add controls say it already */
	.plan-empty {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-item);
		background: var(--surface-card);
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
	}

	@media (hover: hover) and (pointer: fine) and (min-width: 1024px) {
		.plan-empty {
			display: none;
		}
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
	}
</style>
