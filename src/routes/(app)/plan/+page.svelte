<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import { MediaQuery } from 'svelte/reactivity';
	import { fly } from 'svelte/transition';
	import { addDays } from '#lib/dates.ts';
	import { reducedMotion } from '#lib/motion.ts';
	import CopyWeek from '#lib/plan/CopyWeek.svelte';
	import { ghost, grabbed, land, placed, placeKey, setBoard, type Board, type Place } from '#lib/plan/dnd.ts';
	import MoveTo from '#lib/plan/MoveTo.svelte';
	import RecipePicker from '#lib/plan/RecipePicker.svelte';
	import RecipeRail from '#lib/plan/RecipeRail.svelte';
	import Week, { weekNumber, weekRange } from '#lib/plan/Week.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import type { Id, PlanEntry, Slot } from '#lib/types.ts';
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
	const kicker = $derived(heading.lead === 'Week' ? [range] : [`Week ${number}`, range]);

	let target = $state<{ date: string; slot: Slot } | null>(null);
	let copying = $state(false);
	let moving = $state<PlanEntry | null>(null);

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

<div class="column page" data-column data-sveltekit-noscroll data-sveltekit-keepfocus>
	<header class="head">
		{#key data.monday}
			<div data-page-header in:fly={{ x: reducedMotion() ? 0 : direction * 24, duration: reducedMotion() ? 0 : 320 }}>
				<Kicker parts={kicker} />
				<h1>{heading.lead} <em>{heading.word}</em></h1>
			</div>
		{/key}
		<div class="controls">
			<Button class="copy" variant="ghost" arrow={false} icon="copy" title="Copy week" onclick={() => (copying = true)}>Copy week</Button>
			<Button variant="secondary" arrow={false} href="/plan?week={data.thisMonday}">This week</Button>
			<div class="round-nav">
				<ArrowButton variant="outline" direction="left" label="Previous week" href="/plan?week={prev}" />
				<ArrowButton variant="dark" label="Next week" href="/plan?week={next}" />
			</div>
		</div>
	</header>

	<div class="board">
		<RecipeRail recipes={data.recipes} />
		{#key data.monday}
			<div class="week-slide" in:fly={{ x: reducedMotion() ? 0 : direction * 36, duration: reducedMotion() ? 0 : 360 }}>
				<Week days={data.days} today={data.today} {entries} onadd={(date, slot) => (target = { date, slot })} />
			</div>
		{/key}
	</div>
</div>

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

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-7);
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-4);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--s-2);
	}

	.round-nav {
		display: inline-flex;
		gap: var(--s-2);
		color: var(--ink);
	}

	.board {
		display: grid;
		grid-template-columns: 248px minmax(0, 1fr);
		gap: var(--s-4);
		align-items: start;
	}

	.week-slide {
		min-inline-size: 0;
	}

	@media (max-width: 1023px) {
		.head {
			flex-direction: column;
			align-items: stretch;
		}

		.controls {
			justify-content: space-between;
		}

		.round-nav {
			order: -1;
		}

		.board {
			display: block;
		}
	}

	/* three controls do not fit a narrow phone, so the copy button keeps only its icon and the label for screen readers */
	@media (max-width: 479px) {
		.controls :global(.copy) {
			padding: 0;
			inline-size: 48px;
		}

		.controls :global(.copy .label) {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}

		.controls :global(.copy .icon) {
			margin: 0;
		}
	}

	@media (min-width: 1024px) and (max-width: 1179px) {
		.board {
			grid-template-columns: 208px minmax(0, 1fr);
		}
	}
</style>
