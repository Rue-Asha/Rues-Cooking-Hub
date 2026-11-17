<script lang="ts">
	import Icon from './Icon.svelte';

	type Option = { label: string; sub?: string; value?: string; name?: string };
	type Props = { legend: string; options: Option[]; value?: string; columns?: number; narrow?: number; compact?: boolean; focused?: string };
	let { legend, options, value = $bindable(), columns, narrow, compact = false, focused }: Props = $props();
	const key = (o: Option) => o.value ?? o.label;
	let group: HTMLDivElement;

	function onkey(event: KeyboardEvent, i: number) {
		const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		const next = (i + step + options.length) % options.length;
		value = key(options[next]);
		group.querySelectorAll<HTMLElement>('[role=radio]')[next]?.focus();
	}
</script>

<div class="wrap">
<div class="group" role="radiogroup" aria-label={legend} bind:this={group} style:--cols={columns} style:--narrow={narrow}>
	{#each options as o, i (key(o))}
		{@const on = value === key(o)}
		<button
			type="button"
			role="radio"
			class="opt"
			class:compact
			class:ring={focused === key(o)}
			aria-checked={on}
			aria-label={o.name}
			tabindex={on || (i === 0 && !options.some((x) => key(x) === value)) ? 0 : -1}
			data-press
			onclick={() => (value = key(o))}
			onkeydown={(e) => onkey(e, i)}
		>
			<span class="mark" aria-hidden="true">{#if on}<Icon name="check" size={12} />{/if}</span>
			<span class="l">{o.label}</span>
			{#if o.sub}<span class="s">{o.sub}</span>{/if}
		</button>
	{/each}
</div>
</div>

<style>
	.wrap {
		container-type: inline-size;
		min-inline-size: 0;
	}
	.group {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
		gap: var(--space-1-5);
		min-inline-size: 0;
	}
	.group[style*='--cols'] {
		grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
	}
	/* a chip label never breaks inside a word: a group that cannot fit its columns drops to --narrow of them */
	@container (max-width: 22rem) {
		.group[style*='--narrow'] {
			grid-template-columns: repeat(var(--narrow), minmax(0, 1fr));
		}
	}
	@container (max-width: 13rem) {
		.group[style*='--narrow: 4'] {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	.opt {
		position: relative;
		display: grid;
		justify-items: center;
		align-content: center;
		gap: var(--space-0-5);
		min-block-size: max(var(--control-height), var(--target));
		min-inline-size: 0;
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
	}
	.mark {
		display: none;
		place-items: center;
		inline-size: var(--space-4);
		block-size: var(--space-4);
		border-radius: var(--radius-round);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.opt[aria-checked='true'] {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}
	.opt[aria-checked='true'] .mark {
		display: grid;
		position: absolute;
		inset-block-start: calc(-1 * var(--space-1-5));
		inset-inline-end: calc(-1 * var(--space-0-5));
	}
	.opt:not(.compact) {
		grid-auto-flow: column;
		justify-content: center;
		gap: var(--space-2);
	}
	.opt:not(.compact) .mark {
		position: static;
	}
	.l {
		overflow-wrap: normal;
		hyphens: none;
	}
	.s {
		font-size: var(--type-caption-size);
		font-weight: var(--weight-regular);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
	.opt.compact {
		padding-inline: var(--space-0-5);
		gap: 0;
	}
	.opt.ring {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	@media (hover: hover) {
		.opt[aria-checked='false']:hover {
			background: var(--surface-control-solid-hover);
		}
	}
</style>
