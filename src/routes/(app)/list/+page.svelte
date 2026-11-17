<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import type { TransitionConfig } from 'svelte/transition';
	import AddFromPlan from '#lib/list/AddFromPlan.svelte';
	import CategoryMenu from '#lib/list/CategoryMenu.svelte';
	import Item from '#lib/list/Item.svelte';
	import { arrive as settleIn, easeOut, flipOnPage, reducedMotion, rise, stagger } from '#lib/motion.ts';
	import { nameKey } from '#lib/shopping/aggregate.ts';
	import { CATEGORIES, type Category, type Id, type ShoppingItem } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import { registerContextAdd, takeAddFlag } from '#lib/shell/context-add.svelte.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import Status from '#lib/ui/Status.svelte';

	let { data } = $props();

	// ids already gone from the screen while the server catches up
	const hidden = new SvelteSet<Id>();
	// categories already moved on screen while the server catches up
	const moved = new SvelteMap<Id, Category>();
	// check states already shown while the server catches up; `at` orders fresh rows at the end of Checked
	const flipped = new SvelteMap<Id, { checked: boolean; at: number }>();
	// rows whose box fills and whose name is struck before they move
	const ticking = new SvelteMap<Id, number>();
	let order = 0;

	const items = $derived(
		data.items
			.filter((i) => !hidden.has(i.id))
			.map((i) => {
				const category = moved.get(i.id) ?? i.category;
				const checked = flipped.get(i.id)?.checked ?? i.checked;
				return category === i.category && checked === i.checked ? i : { ...i, category, checked };
			})
	);
	const open = $derived(items.filter((i) => !i.checked));
	const done = $derived([
		...items.filter((i) => i.checked && !flipped.has(i.id)),
		...items
			.filter((i) => i.checked && flipped.has(i.id))
			.sort((a, b) => flipped.get(a.id)!.at - flipped.get(b.id)!.at)
	]);
	const groups = $derived(
		CATEGORIES.map((c) => ({ ...c, items: open.filter((i) => i.category === c.id) })).filter((g) => g.items.length > 0)
	);

	// Open rows are keyed by name, so a regenerated plan item that keeps its name stays put instead of leaving and
	// arriving again under its new id. A name can repeat (an open manual and plan row, a rename), then the id decides.
	const keys = $derived.by(() => {
		const out = new Map<Id, string>();
		const used = new Set<string>();
		for (const i of open) {
			const key = `${i.origin}:${nameKey(i.name)}`;
			out.set(i.id, used.has(key) ? `id:${i.id}` : key);
			used.add(key);
		}
		return out;
	});

	let editing = $state<Id | null>(null);
	let planning = $state(false);
	let notice = $state('');
	let noticeTimer: ReturnType<typeof setTimeout> | undefined;

	function added(count: number) {
		planning = false;
		notice = `Added ${count} ${count === 1 ? 'item' : 'items'} from the plan`;
		clearTimeout(noticeTimer);
		noticeTimer = setTimeout(() => (notice = ''), 6000);
	}
	let menu = $state<{ item: ShoppingItem; anchor: HTMLElement } | null>(null);
	let categoryForm: HTMLFormElement;
	let move = $state<{ id: Id; category: Category } | null>(null);
	let editError = $state<{ id: Id; message: string } | null>(null);
	const itemsText = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'item' : 'items'}`;

	// no entrance for what the page renders on arrival; the categories rise in through CSS instead
	let live = false;
	let leavingPage = false;
	// the page settles in on a full page load only
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');
	const focusAdd = () => document.getElementById('add-item')?.focus();
	// the "+" focuses the field inside its tap so the phone keyboard opens
	$effect(() => registerContextAdd(focusAdd));
	onMount(() => {
		if (takeAddFlag(new URL(page.url.href))) focusAdd();
		setTimeout(() => (live = true));
	});
	beforeNavigate(() => (leavingPage = true));

	let arrivals = 0;
	function arrive(node: Element): TransitionConfig {
		if (!live || leavingPage) return { duration: 0 };
		if (arrivals++ === 0) queueMicrotask(() => (arrivals = 0));
		return settleIn(node, { delay: stagger(arrivals - 1) });
	}

	let leaves = 0;
	// Svelte pins a leaving row with an inline translate before this runs; keep it or the row jumps
	function leave(node: Element): TransitionConfig {
		if (reducedMotion() || leavingPage) return { duration: 0 };
		if (leaves++ === 0) queueMicrotask(() => (leaves = 0));
		const pinned = (node as HTMLElement).style.transform;
		return {
			delay: stagger(leaves - 1),
			duration: 160,
			easing: easeOut,
			css: (t, u) => `transform: ${pinned} translateX(${(u * 12).toFixed(2)}px); opacity: ${t}`
		};
	}

	// A row that changes section flies from its old place to its new one. Like svelte's crossfade, but it only
	// translates: rows in Checked are narrower, and crossfade's scale would squeeze the text on the way.
	const sending = new Map<Id, Element>();
	const receiving = new Map<Id, Element>();
	// the whole flight, whatever the distance: one tunable, on --motion-glide
	const FLIGHT_MS = 260;

	function glide(from: Element, node: Element, intro: boolean): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		const a = from.getBoundingClientRect();
		const b = node.getBoundingClientRect();
		const dx = a.left - b.left;
		const dy = a.top - b.top;
		const base = getComputedStyle(node).transform;
		const pinned = base === 'none' ? '' : base;
		return {
			duration: FLIGHT_MS,
			easing: easeOut,
			// the arriving copy carries the movement; the leaving one is gone by halfway
			css: (t, u) =>
				`transform: ${pinned} translate(${(u * dx).toFixed(2)}px, ${(u * dy).toFixed(2)}px); opacity: ${
					intro ? Math.min(1, t * 2) : Math.max(0, t * 2 - 1)
				}`
		};
	}

	function pair(mine: Map<Id, Element>, other: Map<Id, Element>, intro: boolean) {
		return (node: Element, { key }: { key: Id }) => {
			mine.set(key, node);
			return () => {
				const counterpart = other.get(key);
				if (counterpart) {
					other.delete(key);
					return glide(counterpart, node, intro);
				}
				mine.delete(key);
				return intro ? arrive(node) : leave(node);
			};
		};
	}

	const send = pair(sending, receiving, false);
	const receive = pair(receiving, sending, true);

	function category(node: Element, { leaving }: { leaving: boolean }): TransitionConfig {
		if (!live || leavingPage || reducedMotion()) return { duration: 0 };
		const pinned = (node as HTMLElement).style.transform;
		// a category that empties waits for its last row to fly out before it fades
		return {
			delay: leaving ? 160 : 0,
			duration: 160,
			easing: easeOut,
			css: (t) => `opacity: ${t}; transform: ${pinned} scale(${(0.97 + 0.03 * t).toFixed(3)})`
		};
	}

	const startEdit = (item: ShoppingItem) => {
		editError = null;
		editing = editing === item.id ? null : item.id;
	};

	// The editor leaves with a transition, inert, and a row that changes section is replaced by its flying copy: either
	// way the focus inside is lost, so it goes to the live control, never to <body>.
	async function focusLive(selector: string) {
		await tick();
		[...document.querySelectorAll<HTMLElement>(selector)].find((el) => !el.closest('[inert]'))?.focus();
	}
	const closeEdit = (id: Id) => {
		editing = null;
		void focusLive(`[data-edit="${id}"]`);
	};

	async function pickCategory(id: Id, category: Category) {
		moved.set(id, category);
		move = { id, category };
		await tick();
		categoryForm.requestSubmit();
		// the row now lives in another category; its old copy is flying out and takes no focus
		[...document.querySelectorAll<HTMLElement>(`[data-move="${id}"]`)].find((b) => !b.closest('[inert]'))?.focus();
	}

	const submitCategory: SubmitFunction = ({ formData }) => {
		const id = Number(formData.get('id'));
		const category = formData.get('category');
		return async ({ update }) => {
			await update();
			if (moved.get(id) === category) moved.delete(id);
		};
	};

	// Checking fills the box and strikes the name in place first, then the row flies into Checked;
	// unchecking flies it straight back.
	const FILL_MS = 260;

	const submitCheck: SubmitFunction = ({ formData }) => {
		const id = Number(formData.get('id'));
		const hold = { checked: formData.get('checked') === '1', at: ++order };
		let shown: Promise<void> = Promise.resolve();
		const refocus = () => {
			const at = document.activeElement;
			if (at === document.body || at?.closest(`[data-check="${id}"]`)) void focusLive(`[data-check="${id}"]`);
		};
		if (!hold.checked || reducedMotion()) {
			ticking.delete(id);
			flipped.set(id, hold);
			refocus();
		} else {
			ticking.set(id, hold.at);
			flipped.set(id, { checked: false, at: hold.at });
			shown = new Promise((resolve) =>
				setTimeout(() => {
					if (flipped.get(id)?.at === hold.at) {
						flipped.set(id, hold);
						refocus();
					}
					resolve();
				}, FILL_MS)
			);
			// the copy that flies out keeps its filled look until it has landed
			setTimeout(() => ticking.get(id) === hold.at && ticking.delete(id), FILL_MS + 900);
		}
		return async ({ update }) => {
			await update({ reset: false });
			await shown;
			if (flipped.get(id)?.at === hold.at) flipped.delete(id);
			// a successful update() resets the focus to <body>
			refocus();
		};
	};

	// the field stays focused for the next item (and the phone keyboard stays up)
	const submitAdd: SubmitFunction = () => async ({ update }) => {
		await update();
		await focusLive('#add-item');
	};

	const submitClear: SubmitFunction = () => {
		const ids = done.map((i) => i.id);
		for (const id of ids) hidden.add(id);
		return async ({ update }) => {
			await update();
			for (const id of ids) hidden.delete(id);
		};
	};

	const submitEdit: SubmitFunction = ({ formData, submitter }) => {
		const id = Number(formData.get('id'));
		const deleting = submitter?.getAttribute('formaction') === '?/delete';
		if (deleting) {
			hidden.add(id);
			editing = null;
			void focusLive('#add-item');
		}
		return async ({ result, update }) => {
			if (result.type === 'failure') editError = { id, message: String(result.data?.error) };
			else if (editing === id) editing = null;
			await update({ reset: false });
			hidden.delete(id);
			// after the update: a rename can re-key the row
			if (result.type !== 'failure' && !deleting) void focusLive(`[data-edit="${id}"]`);
		};
	};
</script>

{#snippet row(item: ShoppingItem)}
	<Item
		{item}
		done={item.checked || ticking.has(item.id)}
		editing={editing === item.id}
		error={editError?.id === item.id ? editError.message : null}
		moving={menu?.item.id === item.id}
		onedit={() => startEdit(item)}
		onmove={(anchor) => (menu = { item, anchor })}
		oncancel={() => closeEdit(item.id)}
		{submitCheck}
		{submitEdit}
	/>
{/snippet}

<svelte:head>
	<title>List · Rues Cooking Hub</title>
</svelte:head>

<header class="screen-head">
	<div class="screen-lead">
		<ul class="kicker">
			<li>Shopping list</li>
			<li>{open.length.toLocaleString('en-GB')} open</li>
		</ul>
		<h1>Things to <em class="accent-word">buy</em></h1>
	</div>
	<form class="seg-bar list-bar" method="POST" action="?/add" use:enhance={submitAdd}>
		<div class="seg add-item">
			<Field id="add-item" name="text" label="Add an item" hideLabel placeholder="Add an item, e.g. 2 l oat milk" autocomplete="off" enterkeyhint="done">
				{#snippet prefix()}<Icon name="plus" size={18} />{/snippet}
			</Field>
		</div>
		<div class="seg-actions">
			<Button variant="primary" arrow aria-haspopup="dialog" aria-expanded={planning} onclick={() => (planning = !planning)}>
				Add from plan
			</Button>
		</div>
	</form>
	{#if groups.length > 2}
		<ul class="screen-facts" aria-label="Open per aisle">
			<li class="facts-caption" aria-hidden="true">Open per aisle</li>
			{#each groups as group (group.id)}
				<li><span class="n">{group.items.length.toLocaleString('en-GB')}</span>{group.label}</li>
			{/each}
		</ul>
	{/if}
</header>

{#if planning}
	<AddFromPlan week={data.week} onclose={() => (planning = false)} onadded={added} />
{/if}

<div class="screen-body" data-settle={settle ? '' : undefined}>
	<div role="status">
		{#if notice}
			<div class="notice"><Status live={false}>{notice}</Status></div>
		{/if}
	</div>

	<div class="layout">
		<section class="to-buy card" data-surface="solid" aria-labelledby="open-title">
			<div class="card-head">
				<h2 id="open-title">To buy</h2>
				<p class="card-note">By aisle</p>
			</div>
			{#if groups.length === 0}
				<div class="empty" in:rise={{ y: 10 }}>
					<h3>Nothing to buy</h3>
					<p>Type an item above, or add the ingredients of the meals you planned.</p>
				</div>
			{/if}
			<div class="aisles">
				{#each groups as group (group.id)}
					<article
						class="aisle"
						animate:flipOnPage
						in:category={{ leaving: false }}
						out:category={{ leaving: true }}
					>
						<div class="aisle-head">
							<h3 class="ruled" id="cat-{group.id}">{group.label}</h3>
							<span class="card-note">{itemsText(group.items.length)}</span>
						</div>
						<ul class="items" aria-labelledby="cat-{group.id}">
							{#each group.items as item (keys.get(item.id))}
								<li animate:flipOnPage in:receive|global={{ key: item.id }} out:send|global={{ key: item.id }}>
									{@render row(item)}
								</li>
							{/each}
						</ul>
					</article>
				{/each}
			</div>
		</section>

		<section class="checked card" data-surface="inverse" aria-labelledby="checked-title">
			<h2 class="checked-head" id="checked-title">
				<span class="ruled">Checked</span> {#key done.length}<span class="checked-n" in:rise={{ y: 6 }}>{done.length.toLocaleString('en-GB')}</span>{/key}
			</h2>
			{#if done.length === 0}<p class="checked-empty" in:rise={{ y: 6 }}>Tick things off as you shop; they gather here.</p>{/if}
			<ul class="items checked-list" aria-label="Checked items">
				{#each done as item (item.id)}
					<li animate:flipOnPage in:receive|global={{ key: item.id }} out:send|global={{ key: item.id }}>
						{@render row(item)}
					</li>
				{/each}
			</ul>
			<form method="POST" action="?/clear" use:enhance={submitClear}>
				<Button size="s" type="submit" class="clear" disabled={done.length === 0}>Clear checked</Button>
			</form>
		</section>
	</div>
</div>

<form class="sr-only" method="POST" action="?/category" use:enhance={submitCategory} bind:this={categoryForm}>
	<input type="hidden" name="id" value={move?.id ?? ''} />
	<input type="hidden" name="category" value={move?.category ?? ''} />
</form>

{#if menu}
	{@const { item, anchor } = menu}
	<CategoryMenu
		name={item.name}
		current={item.category}
		{anchor}
		onpick={(category) => pickCategory(item.id, category)}
		onclose={() => (menu = null)}
	/>
{/if}

<style>
	.list-bar {
		inline-size: min(100%, 40rem);
		background: var(--surface-card);
	}

	/* the aisle counts read on a solid card, never on glass over the photo */
	.screen-head :global(.screen-facts:not([data-surface='inverse'])) {
		background: var(--surface-card);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}

	/* the nine aisle counts would push a long list a screen down; the aisle heads already carry them */
	@media (max-width: 767px) {
		.screen-head :global(.screen-facts) {
			display: none;
		}
	}

	.add-item {
		flex: 1;
		min-inline-size: 0;
		padding-inline-start: var(--space-1);
	}

	/* the field takes the bar's spare width, so the placeholder is not cut */
	.add-item > :global(.field) {
		flex: 1;
	}

	.notice {
		min-inline-size: 0;
	}

	.layout {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		min-inline-size: 0;
	}

	.to-buy {
		display: grid;
		gap: var(--space-5);
		min-inline-size: 0;
		padding: var(--space-5) var(--space-4);
	}

	.aisles {
		position: relative;
		columns: 1;
	}

	.aisle {
		break-inside: avoid;
		margin-block-end: var(--space-6);
	}

	.aisle-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		margin-block-end: var(--space-1);
	}

	.items {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.items > li {
		min-inline-size: 0;
		box-shadow: var(--rule-below);
	}

	.empty {
		display: grid;
		gap: var(--space-2);
		justify-items: start;
		max-inline-size: var(--measure);
		padding: var(--space-6) var(--space-2) var(--space-2);
	}

	.empty h3 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}

	.empty p {
		color: var(--ink-secondary);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}

	.checked {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		min-inline-size: 0;
		padding: var(--space-5);
	}

	.checked-head {
		display: flex;
		align-items: baseline;
		gap: var(--space-4);
		font-family: var(--font-ui);
	}

	.checked-head .ruled {
		color: var(--ink-on-inverse-secondary);
	}

	.checked-n {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-l-size);
		line-height: 1;
		letter-spacing: var(--type-display-l-tracking);
		font-variant-numeric: var(--numeric-figures);
	}

	.checked-empty {
		max-inline-size: 30ch;
		font-size: var(--type-body-s-size);
		color: var(--ink-on-inverse-secondary);
	}

	.checked-list {
		position: relative;
	}

	.checked-list:empty {
		display: none;
	}

	.checked-list > li {
		box-shadow: var(--rule-below-on-inverse);
	}

	.checked :global(.clear) {
		justify-self: start;
		background: var(--surface-inverse-tint);
		box-shadow: var(--ring-control-on-inverse);
		color: var(--ink-on-inverse);
	}

	.checked :global(.clear:disabled) {
		color: var(--ink-on-inverse-secondary);
	}

	@media (hover: hover) {
		.checked :global(.clear:not(:disabled):hover) {
			background: var(--surface-inverse-tint-strong);
		}
	}

	@media (min-width: 768px) {
		.to-buy {
			padding: var(--space-6) var(--space-7);
		}

		.aisles {
			columns: 2 18rem;
			column-gap: var(--space-9);
		}
	}

	@media (min-width: 1100px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 18.75rem;
		}
	}
</style>
