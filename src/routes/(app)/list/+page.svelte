<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicInOut, cubicOut } from 'svelte/easing';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import type { TransitionConfig } from 'svelte/transition';
	import AddFromPlan from '#lib/list/AddFromPlan.svelte';
	import CategoryMenu from '#lib/list/CategoryMenu.svelte';
	import Item from '#lib/list/Item.svelte';
	import { flipOptions, reducedMotion, rise, stagger } from '#lib/motion.ts';
	import { nameKey } from '#lib/shopping/aggregate.ts';
	import { CATEGORIES, type Category, type Id, type ShoppingItem } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

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

	// no entrance for what the page renders on arrival; the categories rise in through CSS instead
	let live = false;
	let leavingPage = false;
	let intro = $state(true);
	onMount(() => {
		setTimeout(() => (live = true));
		setTimeout(() => (intro = false), 1200);
	});
	beforeNavigate(() => (leavingPage = true));

	let arrivals = 0;
	function arrive(node: Element): TransitionConfig {
		if (!live || leavingPage) return { duration: 0 };
		if (arrivals++ === 0) queueMicrotask(() => (arrivals = 0));
		return rise(node, { delay: 80 + stagger(arrivals - 1), y: 14 });
	}

	let leaves = 0;
	// Svelte pins a leaving row with an inline translate before this runs; keep it or the row jumps
	function leave(node: Element): TransitionConfig {
		if (reducedMotion() || leavingPage) return { duration: 0 };
		if (leaves++ === 0) queueMicrotask(() => (leaves = 0));
		const pinned = (node as HTMLElement).style.transform;
		return {
			delay: stagger(leaves - 1),
			duration: 260,
			easing: cubicOut,
			css: (t, u) => `transform: ${pinned} translateX(${(u * 18).toFixed(2)}px); opacity: ${t}`
		};
	}

	// A row that changes section flies from its old place to its new one. Like svelte's crossfade, but it only
	// translates: rows in Checked are narrower, and crossfade's scale would squeeze the text on the way.
	const sending = new Map<Id, Element>();
	const receiving = new Map<Id, Element>();

	function glide(from: Element, node: Element, intro: boolean): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		const a = from.getBoundingClientRect();
		const b = node.getBoundingClientRect();
		const dx = a.left - b.left;
		const dy = a.top - b.top;
		const base = getComputedStyle(node).transform;
		const pinned = base === 'none' ? '' : base;
		return {
			duration: Math.min(620, 320 + Math.sqrt(Math.hypot(dx, dy)) * 10),
			easing: cubicInOut,
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
			delay: leaving ? 300 : 0,
			duration: 240,
			easing: cubicOut,
			css: (t) => `opacity: ${t}; transform: ${pinned} scale(${(0.97 + 0.03 * t).toFixed(3)})`
		};
	}

	const startEdit = (item: ShoppingItem) => {
		editError = null;
		editing = editing === item.id ? null : item.id;
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

	// Checking fills the box and draws the strike in place first, then the row flies into Checked;
	// unchecking flies it straight back.
	const FILL_MS = 260;

	const submitCheck: SubmitFunction = ({ formData }) => {
		const id = Number(formData.get('id'));
		const hold = { checked: formData.get('checked') === '1', at: ++order };
		let shown: Promise<void> = Promise.resolve();
		if (!hold.checked || reducedMotion()) {
			ticking.delete(id);
			flipped.set(id, hold);
		} else {
			ticking.set(id, hold.at);
			flipped.set(id, { checked: false, at: hold.at });
			shown = new Promise((resolve) =>
				setTimeout(() => {
					if (flipped.get(id)?.at === hold.at) flipped.set(id, hold);
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
		};
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
		}
		return async ({ result, update }) => {
			if (result.type === 'failure') editError = { id, message: String(result.data?.error) };
			else if (editing === id) editing = null;
			await update({ reset: false });
			hidden.delete(id);
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
		oncancel={() => (editing = null)}
		{submitCheck}
		{submitEdit}
	/>
{/snippet}

<svelte:head>
	<title>List · Rues Cooking Hub</title>
</svelte:head>

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={['Shopping list', `${open.length} open`]} />
			<h1>Things to <em>buy</em></h1>
		</div>
		<div class="tools">
			<form class="add" method="POST" action="?/add" use:enhance>
				<label class="add-field">
					<Icon name="plus" size={18} />
					<span class="visually-hidden">Add an item</span>
					<input name="text" placeholder="Add an item, e.g. 2 l oat milk" autocomplete="off" enterkeyhint="done" />
				</label>
			</form>
			<Button
				variant="olive"
				icon="calendar"
				arrow={false}
				aria-haspopup="dialog"
				aria-expanded={planning}
				onclick={() => (planning = !planning)}
			>
				Add from plan
			</Button>
			{#if planning}
				<AddFromPlan week={data.week} onclose={() => (planning = false)} onadded={added} />
			{/if}
		</div>
	</header>

	<p class="notice" role="status">{#if notice}<span in:rise={{ y: 8 }}><Icon name="sparkle" size={16} />{notice}</span>{/if}</p>

	<section class="open" aria-labelledby="open-title">
		<div class="section-head">
			<h2 id="open-title" data-section-heading>To buy</h2>
			<p class="sub">By aisle</p>
		</div>
		{#if groups.length === 0}
			<div class="empty" in:rise={{ y: 10 }}>
				<p class="empty-title">Nothing to buy</p>
				<p>Type an item above, or add the ingredients of the meals you planned.</p>
			</div>
		{/if}
		<div class="cats" class:intro>
			{#each groups as group, gi (group.id)}
				<article
					class="cat"
					style:--delay="{stagger(gi)}ms"
					animate:flip={flipOptions()}
					in:category={{ leaving: false }}
					out:category={{ leaving: true }}
				>
					<header class="cat-head">
						<h3 id="cat-{group.id}">{group.label}</h3>
						<span class="cat-count tnum">{group.items.length}</span>
					</header>
					<ul aria-labelledby="cat-{group.id}">
						{#each group.items as item (keys.get(item.id))}
							<li
								animate:flip={flipOptions()}
								in:receive|global={{ key: item.id }}
								out:send|global={{ key: item.id }}
							>
								{@render row(item)}
							</li>
						{/each}
					</ul>
				</article>
			{/each}
		</div>
	</section>

	{#if items.length > 0}
		<section class="checked" aria-labelledby="checked-title">
			<div class="section-head">
				<h2 id="checked-title" data-section-heading>
					Checked {#key done.length}<span class="tnum" in:rise={{ y: 6 }}>{done.length}</span>{/key}
				</h2>
				<form method="POST" action="?/clear" use:enhance={submitClear}>
					<Button variant="danger" type="submit" icon="trash" arrow={false} disabled={done.length === 0}>
						Clear checked
					</Button>
				</form>
			</div>
			{#if done.length === 0}<p class="hint" in:rise={{ y: 6 }}>Tick things off as you shop; they gather here.</p>{/if}
			<ul class="checked-list" aria-label="Checked items">
				{#each done as item (item.id)}
					<li animate:flip={flipOptions()} in:receive|global={{ key: item.id }} out:send|global={{ key: item.id }}>
						{@render row(item)}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<form class="visually-hidden" method="POST" action="?/category" use:enhance={submitCategory} bind:this={categoryForm}>
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
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-7);
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-5);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
	}

	.tools {
		position: relative;
		display: flex;
		gap: var(--s-2);
		inline-size: min(100%, 640px);
	}

	.add {
		display: flex;
		flex: 1;
	}

	.notice {
		min-block-size: 0;
		margin-block: calc(-1 * var(--s-5)) calc(-1 * var(--s-2));
		font-size: 14px;
		font-weight: 500;
		color: var(--olive);
	}

	.notice:empty {
		display: none;
	}

	.notice span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px 6px 10px;
		border-radius: var(--r-pill);
		background: var(--olive-wash);
	}

	.add-field {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		min-block-size: 48px;
		padding: 0 var(--s-5);
		border-radius: var(--r-pill);
		background: var(--white);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-card);
		color: var(--olive);
		transition:
			border-color var(--d-fast) var(--ease-out),
			box-shadow var(--d-fast) var(--ease-out);
	}

	.add-field:focus-within {
		border-color: var(--olive);
	}

	.add-field input {
		flex: 1;
		min-inline-size: 0;
		min-block-size: 46px;
		border: 0;
		background: none;
		font-size: 15px;
	}

	.add-field input:focus-visible {
		box-shadow: none;
	}

	.add-field input::placeholder {
		color: var(--ink-2);
	}

	.section-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-4);
		margin-block-end: var(--s-4);
	}

	.sub {
		font-size: 14px;
		color: var(--ink-2);
	}

	.cats {
		position: relative;
		columns: 2;
		column-gap: var(--s-4);
	}

	.cat {
		break-inside: avoid;
		margin-block-end: var(--s-4);
		padding: var(--s-5) var(--s-6) var(--s-3);
		border-radius: var(--r-panel);
		background: var(--surface);
		box-shadow: var(--shadow-card);
	}

	.intro .cat {
		animation: rise-in var(--d-slow) var(--ease-out) var(--delay, 0ms) backwards;
	}

	@keyframes rise-in {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.intro .cat {
			animation: none;
		}
	}

	.cat-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding-block-end: var(--s-2);
	}

	.cat-head h3 {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 360;
	}

	.cat-count {
		font-family: var(--font-display);
		font-size: 18px;
		color: var(--ink-2);
	}

	.cat li {
		border-block-start: 1px solid var(--line);
		background: var(--surface);
	}

	.section-head h2 span {
		display: inline-block;
		font-size: 0.7em;
		color: var(--ink-2);
	}

	.hint {
		font-size: 14px;
		color: var(--ink-2);
	}

	.checked-list {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: var(--s-6);
		padding: var(--s-2) var(--s-6);
		border-radius: var(--r-panel);
		background: var(--sand);
	}

	.checked-list:empty {
		display: none;
	}

	.checked-list li {
		min-inline-size: 0;
		background: var(--sand);
		border-radius: var(--r-xs);
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-2);
		padding: var(--s-9) var(--s-5);
		border-radius: var(--r-panel);
		border: 1px dashed var(--line);
		text-align: center;
		color: var(--ink-2);
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: var(--t-display-3);
		font-weight: 300;
		color: var(--ink);
	}

	@media (max-width: 1023px) {
		.head {
			flex-direction: column;
			align-items: stretch;
		}

		.tools {
			inline-size: 100%;
			flex-direction: column;
		}

		.section-head {
			flex-wrap: wrap;
		}

		.cats {
			columns: 1;
		}

		.cat {
			padding: var(--s-4) var(--s-5) var(--s-2);
		}

		.checked-list {
			grid-template-columns: 1fr;
			padding: var(--s-1) var(--s-5);
		}
	}
</style>
