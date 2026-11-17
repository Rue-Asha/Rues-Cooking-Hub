<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = {
		label: string;
		value?: string;
		placeholder?: string;
		hint?: string;
		error?: string;
		type?: 'text' | 'search' | 'date';
		inputmode?: 'text' | 'numeric' | 'decimal';
		hideLabel?: boolean;
		suffix?: string;
		focused?: boolean;
	};
	let { label, value = '', placeholder, hint, error, type = 'text', inputmode, hideLabel = false, suffix, focused = false }: Props = $props();
	const id = $props.id();
</script>

<div class="field" data-focused={focused || undefined}>
	<label class="label" class:sr-only={hideLabel} for={id}>{label}</label>
	<div class="control" class:invalid={!!error}>
		<input {id} {type} {value} {placeholder} {inputmode} aria-invalid={error ? 'true' : undefined} aria-describedby={error || hint ? `${id}-m` : undefined} />
		{#if suffix}<span class="suffix">{suffix}</span>{/if}
	</div>
	{#if error}
		<p class="msg error" id="{id}-m" role="alert"><Icon name="alert" /><span>{error}</span></p>
	{:else if hint}
		<p class="msg" id="{id}-m">{hint}</p>
	{/if}
</div>

<style>
	.field { display: grid; gap: var(--space-1-5); min-inline-size: 0; }
	.label { font-size: var(--type-label-size); line-height: var(--type-label-line); font-weight: var(--type-label-weight); }
	.control {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: var(--control-height);
		padding-inline: var(--space-5);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	.control.invalid { outline: var(--stroke-strong) solid var(--ink); outline-offset: calc(-1 * var(--stroke-strong)); }
	[data-focused] .control { outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset); }
	input {
		flex: 1;
		min-inline-size: 0;
		min-block-size: var(--control-height);
		border: 0;
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: var(--type-body-s-size);
		text-overflow: ellipsis;
	}
	input:focus-visible { outline: none; }
	.suffix { color: var(--ink-secondary); font-size: var(--type-caption-size); white-space: nowrap; }
	.msg { display: flex; align-items: flex-start; gap: var(--space-1-5); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); overflow-wrap: anywhere; }
	.msg.error { color: var(--ink); font-weight: var(--weight-medium); }
	.msg :global(svg) { flex: none; inline-size: 16px; block-size: 16px; margin-block-start: 1px; }
</style>
