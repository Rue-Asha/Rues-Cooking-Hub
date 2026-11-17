<!-- Add from plan (List): a quick range or two dates, then every planned recipe's ingredients land on the list. -->
<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Choice from './Choice.svelte';
	import Field from './Field.svelte';
	import Notice from './Notice.svelte';
	import Overlay from './Overlay.svelte';

	type Props = { live?: boolean; open?: boolean; variant?: 'default' | 'working' | 'nothing' | 'dates'; onadd?: () => void };
	let { live = false, open = $bindable(false), variant = 'default', onadd }: Props = $props();

	const seed = () => ({
		range: variant === 'nothing' ? 'Next week' : variant === 'dates' ? '' : 'This week',
		from: variant === 'dates' ? '' : variant === 'nothing' ? '2026-10-26' : '2026-10-19',
		to: variant === 'dates' ? '' : variant === 'nothing' ? '2026-11-01' : '2026-10-25',
		touched: variant === 'dates',
		message: variant === 'nothing'
	});
	let range = $state(seed().range);
	let from = $state(seed().from);
	let to = $state(seed().to);
	let touched = $state(seed().touched);
	let message = $state(seed().message);
	$effect(() => {
		if (open) {
			range = 'This week';
			from = '2026-10-19';
			to = '2026-10-25';
			touched = false;
			message = false;
		}
	});
	$effect(() => {
		if (range === 'This week') [from, to] = ['2026-10-19', '2026-10-25'];
		else if (range === 'Next week') [from, to] = ['2026-10-26', '2026-11-01'];
	});
	const error = $derived(touched && (!from || !to) ? 'Choose a start and an end date' : undefined);
	function add() {
		touched = true;
		if (!from || !to) return;
		if (range === 'Next week') message = true;
		else {
			open = false;
			onadd?.();
		}
	}
</script>

{#snippet content()}
	<p class="lede">Ingredients of every recipe planned in these days, scaled to their servings.</p>
	<Choice legend="Quick ranges" options={[{ label: 'This week' }, { label: 'Next week' }]} bind:value={range} columns={2} />
	<div class="dates">
		<Field label="From" type="date" bind:value={from} error={error && !from ? error : undefined} />
		<Field label="To" type="date" bind:value={to} error={error && from && !to ? error : undefined} />
	</div>
	{#if message}<Notice kind="alert">Nothing planned in this range</Notice>{/if}
{/snippet}
{#snippet buttons()}
	<Button variant="quiet" onclick={() => (open = false)}>Cancel</Button>
	<Button variant="primary" loading={variant === 'working'} loadingLabel="" onclick={add}>{variant === 'working' ? 'Adding…' : 'Add to list'}</Button>
{/snippet}

<Overlay {live} bind:open title="Add from plan" kicker="Shopping list" children={content} actions={buttons} />

<style>
	.lede {
		color: var(--ink-secondary);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}
	.dates {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: start;
		gap: var(--space-3);
	}
	@media (max-width: 767px) {
		.dates {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
