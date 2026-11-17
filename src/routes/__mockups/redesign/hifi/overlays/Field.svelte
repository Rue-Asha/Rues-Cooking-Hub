<!--
	Field: copy of the Design-System primitive (sync.sh <app> --primitive field), the app owns it.
	One change: type also takes "date" (Add from plan). Props: label, value (bindable), hint, error,
	variant (pill | line), type, prefix, suffix, hideLabel, id, plus any <input> attribute.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		label: string;
		value?: string;
		hint?: string;
		error?: string;
		variant?: 'pill' | 'line';
		type?: 'text' | 'search' | 'date';
		icon?: IconName;
		suffix?: string | Snippet;
		hideLabel?: boolean;
		id?: string;
	} & Omit<HTMLInputAttributes, 'type' | 'value' | 'prefix'>;

	const uid = $props.id();
	let { label, value = $bindable(''), hint, error, variant = 'pill', type = 'text', icon, suffix, hideLabel = false, id = uid, ...rest }: Props = $props();

	const describedby = $derived([typeof suffix === 'string' && `${id}-suffix`, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined);
</script>

<div class={['field', variant, { invalid: !!error, disabled: rest.disabled }]}>
	<label class={{ 'sr-only': hideLabel }} for={id}>{label}</label>
	<div class="control">
		{#if icon}<span class="affix" aria-hidden="true"><Icon name={icon} /></span>{/if}
		<input {...rest} {id} {type} bind:value aria-invalid={error ? 'true' : undefined} aria-describedby={describedby} />
		{#if typeof suffix === 'string'}<span class="affix" id="{id}-suffix">{suffix}</span>{:else if suffix}<span class="affix" aria-hidden="true">{@render suffix()}</span>{/if}
	</div>
	{#if hint}<p class="hint" id="{id}-hint">{hint}</p>{/if}
	{#if error}
		<p class="error" id="{id}-error" role="alert"><Icon name="alert" size={14} />{error}</p>
	{/if}
</div>

<style>
	.field {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-1-5);
		min-inline-size: 0;
	}
	label {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		color: var(--ink);
	}
	.control {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-4);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	.control:has(input:focus-visible) {
		outline: var(--focus-width) solid var(--focus-color, var(--focus-ring));
		outline-offset: var(--focus-offset);
	}
	input {
		flex: 1;
		min-inline-size: 0;
		block-size: 100%;
		padding: 0;
		border: 0;
		background: none;
		font-size: var(--type-body-s-size);
		font-variant-numeric: var(--numeric-figures);
		text-overflow: ellipsis;
	}
	input:focus-visible {
		outline: none;
	}
	input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}
	.affix {
		display: inline-flex;
		flex: none;
		color: var(--ink-secondary);
	}
	.line .control {
		padding-inline: 0;
		border-radius: 0;
		background: none;
		box-shadow: none;
		border-block-end: var(--stroke-rule) solid var(--edge-control);
	}
	.hint {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.error {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-weight: var(--weight-semibold);
		color: var(--danger);
		overflow-wrap: anywhere;
	}
	.error :global(svg) {
		display: inline;
		vertical-align: -0.2em;
		margin-inline-end: var(--space-1);
	}
	.invalid.pill .control {
		box-shadow: var(--ring-danger);
	}
	.invalid.line .control {
		border-block-end-color: var(--danger);
	}
	.disabled .control {
		background: var(--surface-sunken);
		opacity: var(--disabled-opacity);
	}
</style>
