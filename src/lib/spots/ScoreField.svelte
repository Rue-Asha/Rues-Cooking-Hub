<script lang="ts">
	import { rise } from '#lib/motion.ts';

	let {
		value = $bindable(),
		error = '',
		id = 'f-score',
		oninput
	}: { value: string; error?: string; id?: string; oninput?: () => void } = $props();
</script>

<div class="field">
	<label for={id}>Score</label>
	<div class="row">
		<input
			{id}
			class="tnum"
			name="score"
			inputmode="decimal"
			autocomplete="off"
			bind:value
			{oninput}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${id}-error` : undefined}
		/>
		<span class="hint tnum">1.00–10.00</span>
	</div>
	{#if error}<p class="error" id="{id}-error" role="alert" transition:rise={{ y: 6 }}>{error}</p>{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
	}

	label {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	input {
		inline-size: 140px;
		min-block-size: 46px;
		padding: 11px 14px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--white);
		font-size: 15px;
		line-height: 1.45;
		transition: border-color var(--d-fast) var(--ease-out);
	}

	input:focus-visible {
		border-color: var(--olive);
		box-shadow: 0 0 0 3px var(--olive-wash);
	}

	input[aria-invalid='true'] {
		border-color: var(--brick);
		box-shadow: 0 0 0 3px var(--brick-wash);
	}

	.hint {
		font-size: var(--t-small);
		color: var(--ink-2);
	}

	.error {
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--brick);
	}

	@media (max-width: 1023px) {
		input {
			font-size: 16px;
		}
	}
</style>
