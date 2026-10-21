<script lang="ts">
	import { checked, list, openCount } from '#lib/mockups/fixtures.ts';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

	// mockup motion state: "lemons" was just ticked and is sliding into Checked
	const leaving = 'lemons';
</script>

{#snippet item(name: string, amount: string, opts: { plan?: boolean; extra?: string; done?: boolean; leaving?: boolean })}
	<li class="item" class:done={opts.done} class:leaving={opts.leaving}>
		<button type="button" class="check" role="checkbox" aria-checked={opts.done ? 'true' : 'false'} aria-label="Bought {name}">
			<span class="box">{#if opts.done}<Icon name="check" size={14} stroke={2.4} />{/if}</span>
		</button>
		<span class="name">
			{name}
			{#if opts.plan}<span class="from" title="From the plan"><Icon name="calendar" size={13} /></span>{/if}
		</span>
		<span class="amount tnum">
			{amount}
			{#if opts.extra}<span class="extra">{opts.extra}</span>{/if}
		</span>
	</li>
{/snippet}

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={['Shopping list', `${openCount} open`]} />
			<h1>Things to <em>buy</em></h1>
		</div>
		<form class="add" onsubmit={(e) => e.preventDefault()}>
			<label class="add-field">
				<Icon name="plus" size={18} />
				<span class="visually-hidden">Add an item</span>
				<input placeholder="Add an item, e.g. 2 l oat milk" />
			</label>
			<Button variant="olive" icon="calendar" arrow={false}>Add from plan</Button>
		</form>
	</header>

	<section class="open" aria-labelledby="open-title">
		<div class="section-head">
			<h2 id="open-title" data-section-heading>To buy</h2>
			<p class="sub">By aisle · 19 – 25 October from the plan</p>
		</div>
		<div class="cats">
			{#each list as cat (cat.category)}
				<article class="cat">
					<header class="cat-head">
						<h3>{cat.category}</h3>
						<span class="cat-count tnum">{cat.items.length}</span>
					</header>
					<ul>
						{#each cat.items as it (it.name)}
							{@render item(it.name, it.amount, {
								plan: it.origin === 'plan',
								extra: it.fromPlan,
								done: it.name === leaving,
								leaving: it.name === leaving
							})}
						{/each}
					</ul>
				</article>
			{/each}
		</div>
	</section>

	<section class="checked" aria-labelledby="checked-title">
		<div class="section-head">
			<h2 id="checked-title" data-section-heading>Checked <span class="tnum">{checked.length}</span></h2>
			<Button variant="danger" arrow={false} icon="trash">Clear checked</Button>
		</div>
		<ul class="checked-list">
			{#each checked as it (it.name)}
				{@render item(it.name, it.amount, { done: true, plan: true })}
			{/each}
		</ul>
	</section>
</div>

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

	.add {
		display: flex;
		gap: var(--s-2);
		inline-size: min(100%, 560px);
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
	}

	.add-field input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: none;
		font-size: 15px;
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

	h2 span {
		font-size: 0.7em;
		color: var(--ink-2);
	}

	.cats {
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

	.item {
		display: grid;
		grid-template-columns: 44px 1fr auto;
		align-items: center;
		gap: 4px;
		min-block-size: 52px;
		border-block-start: 1px solid var(--line);
		transition:
			transform var(--d-base) var(--ease-out),
			opacity var(--d-base) var(--ease-out);
	}

	.check {
		display: grid;
		place-items: center;
		inline-size: 44px;
		block-size: 44px;
		margin-inline-start: -10px;
		border: 0;
		border-radius: var(--r-pill);
		background: none;
	}

	.box {
		display: grid;
		place-items: center;
		inline-size: 24px;
		block-size: 24px;
		border-radius: var(--r-pill);
		border: 1.5px solid var(--stone);
		color: var(--white);
		transition: transform var(--d-fast) var(--ease-spring);
	}

	.done .box {
		background: var(--olive);
		border-color: var(--olive);
	}

	.name {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 15px;
		font-weight: 500;
	}

	.from {
		display: inline-grid;
		color: var(--stone);
	}

	.amount {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 15px;
		color: var(--ink);
	}

	.extra {
		font-size: 12px;
		color: var(--olive);
	}

	.done .name,
	.done .amount {
		text-decoration: line-through;
		text-decoration-color: var(--stone);
		color: var(--ink-2);
	}

	.leaving {
		opacity: 0.55;
		transform: translateY(6px);
	}

	.leaving .box {
		transform: scale(1.12);
	}

	.checked-list {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: var(--s-6);
		padding: var(--s-2) var(--s-6);
		border-radius: var(--r-panel);
		background: var(--sand);
	}

	.checked-list .item {
		border-block-start-color: transparent;
	}

	@media (max-width: 1023px) {
		.head {
			flex-direction: column;
			align-items: stretch;
		}

		.add {
			inline-size: 100%;
			flex-direction: column;
		}

		.section-head {
			flex-wrap: wrap;
		}

		.sub {
			flex-basis: 100%;
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
