<!-- Copy week: choose the source week (step 1), then confirm once when the shown week already has entries (step 2). -->
<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Notice from './Notice.svelte';
	import Overlay from './Overlay.svelte';
	import Stepper from './Stepper.svelte';

	type Props = { live?: boolean; open?: boolean; variant?: 'source' | 'empty' | 'confirm'; latest?: boolean; sourceRange: string; sourceCount: number; shownCount: number; oncopy?: () => void };
	let { live = false, open = $bindable(false), variant = 'source', latest = variant !== 'empty', sourceRange, sourceCount, shownCount, oncopy }: Props = $props();

	const seed = () => (variant === 'confirm' ? 'confirm' : 'source');
	let step = $state<'source' | 'confirm'>(seed());
	let nothing = $state(false);
	$effect(() => {
		if (open) {
			step = variant === 'confirm' ? 'confirm' : 'source';
			nothing = false;
		}
	});
	const entries = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'entry' : 'entries'}`;
	const empty = $derived(variant === 'empty');
	const sub = $derived(empty ? 'No entries in this week' : entries(sourceCount));
	function copy() {
		if (empty) nothing = true;
		else if (shownCount > 0 && step === 'source') step = 'confirm';
		else {
			open = false;
			oncopy?.();
		}
	}
</script>

{#snippet content()}
	{#if step === 'confirm'}
		<p class="confirm">This week already has {entries(shownCount)}. The copied entries are added after them.</p>
	{:else}
		<Stepper label="Copy from" range={sourceRange} {sub} prev="Earlier week" next="Later week" nextDisabled={latest} />
		{#if nothing || (empty && variant === 'empty' && !live)}<Notice kind="alert">Nothing to copy</Notice>{/if}
	{/if}
{/snippet}
{#snippet buttons()}
	{#if step === 'confirm'}
		<Button variant="quiet" onclick={() => (step = 'source')}>Back</Button>
		<Button variant="primary" onclick={copy}>Add anyway</Button>
	{:else}
		<Button variant="quiet" onclick={() => (open = false)}>Cancel</Button>
		<Button variant="primary" onclick={copy}>{empty ? 'Copy' : `Copy ${entries(sourceCount)}`}</Button>
	{/if}
{/snippet}

<Overlay {live} bind:open title="Copy week" kicker="Meal plan" children={content} actions={buttons} />

<style>
	.confirm {
		padding-inline-start: var(--space-3-5);
		box-shadow: var(--rule-start);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		overflow-wrap: anywhere;
	}
</style>
