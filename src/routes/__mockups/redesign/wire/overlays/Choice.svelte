<script lang="ts">
	type Option = { label: string; sub?: string; checked?: boolean };
	type Props = { legend: string; options: Option[]; columns?: number; compact?: boolean };
	let { legend, options, columns, compact = false }: Props = $props();
</script>

<div class="group" role="radiogroup" aria-label={legend} style:--cols={columns}>
	{#each options as o (o.label)}
		<button type="button" role="radio" aria-checked={!!o.checked} class="opt" class:compact>
			<span class="l">{o.label}</span>
			{#if o.sub}<span class="s">{o.sub}</span>{/if}
		</button>
	{/each}
</div>

<style>
	.group { display: grid; grid-template-columns: repeat(var(--cols, auto-fit), minmax(0, 1fr)); gap: var(--space-1-5); min-inline-size: 0; }
	.group:not([style*='--cols']) { grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr)); }
	.opt {
		display: grid;
		justify-items: center;
		align-content: center;
		gap: var(--space-0-5);
		min-block-size: var(--target-touch);
		padding: var(--space-1-5) var(--space-3);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-control-solid);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-align: center;
		min-inline-size: 0;
	}
	.opt[aria-checked='true'] { background: var(--surface-inverse); color: var(--ink-on-inverse); box-shadow: none; }
	.l { overflow-wrap: anywhere; }
	.s { font-size: var(--type-caption-size); font-weight: var(--weight-regular); color: var(--ink-secondary); }
	.opt[aria-checked='true'] .s { color: var(--ink-on-inverse-secondary); }
</style>
