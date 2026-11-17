<!-- A week stepper inside a dialog: round steps either side of the range and what it holds. -->
<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Icon from './Icon.svelte';

	type Props = { label: string; range: string; sub?: string; prev: string; next: string; nextDisabled?: boolean; onprev?: () => void; onnext?: () => void };
	let { label, range, sub, prev, next, nextDisabled = false, onprev, onnext }: Props = $props();
</script>

<div class="stepper" role="group" aria-label={label}>
	<Button size="s" icon label={prev} onclick={onprev}><Icon name="chev-left" /></Button>
	<p class="range"><span>{range}</span>{#if sub}<span class="sub">{sub}</span>{/if}</p>
	<Button size="s" icon label={next} disabled={nextDisabled} onclick={onnext}><Icon name="chev-right" /></Button>
</div>

<style>
	.stepper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-1-5);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.range {
		display: grid;
		flex: 1;
		gap: var(--space-0-5);
		min-inline-size: 0;
		text-align: center;
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
		overflow-wrap: anywhere;
	}
	.sub {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-weight: var(--weight-regular);
		color: var(--ink-secondary);
	}
	.stepper :global(.btn.icon) {
		background: var(--surface-sunken);
		box-shadow: none;
	}
</style>
