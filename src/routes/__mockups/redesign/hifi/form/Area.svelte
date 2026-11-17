<!--
	Area: the multi-line sibling of Field (description, steps, notes). Same pill-less control: a rounded panel on
	--surface-raised with the control ring, label above, hint and error below. Props: label, value (bindable), rows, hint,
	error, hideLabel, id, plus any <textarea> attribute.
-->
<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Props = { label: string; value?: string; rows?: number; hint?: string; error?: string; hideLabel?: boolean; id?: string } & Omit<HTMLTextareaAttributes, 'value'>;

	const uid = $props.id();
	let { label, value = $bindable(''), rows = 3, hint, error, hideLabel = false, id = uid, ...rest }: Props = $props();

	// a textarea grows with its text, so no line is ever clipped half-way
	function grow(node: HTMLTextAreaElement) {
		const fit = () => {
			node.style.blockSize = 'auto';
			node.style.blockSize = `${node.scrollHeight + node.offsetHeight - node.clientHeight}px`;
		};
		const ro = new ResizeObserver(fit);
		ro.observe(node);
		node.addEventListener('input', fit);
		fit();
		return {
			destroy() {
				ro.disconnect();
				node.removeEventListener('input', fit);
			}
		};
	}

	const describedby = $derived([hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined);
</script>

<div class={['field', { invalid: !!error }]}>
	<label class={{ 'sr-only': hideLabel }} for={id}>{label}</label>
	<textarea {...rest} {id} {rows} bind:value use:grow aria-invalid={error ? 'true' : undefined} aria-describedby={describedby}></textarea>
	{#if hint}<p class="hint" id="{id}-hint">{hint}</p>{/if}
	{#if error}<p class="error" id="{id}-error">{error}</p>{/if}
</div>

<style>
	.field {
		display: grid;
		gap: var(--space-1-5);
		min-inline-size: 0;
	}
	label {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}
	textarea {
		inline-size: 100%;
		min-inline-size: 0;
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-3) var(--space-4);
		border: 0;
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		resize: none;
		overflow-wrap: anywhere;
	}
	textarea::placeholder {
		color: var(--ink-muted);
		opacity: 1;
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
	}
	.invalid textarea {
		box-shadow: var(--ring-danger);
	}
</style>
