<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import Sheet from '#lib/plan/Sheet.svelte';
	import Button from '#lib/components/button/Button.svelte';
	import ScoreField from './ScoreField.svelte';

	let { open, name, onclose }: { open: boolean; name: string; onclose: () => void } = $props();

	let score = $state('');
	let error = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (open) {
			score = '';
			error = '';
		}
	});

	const submit: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			if (result.type === 'failure') error = (result.data as { errors: { score: string } }).errors.score;
			else {
				await update();
				onclose();
			}
			submitting = false;
		};
	};
</script>

<Sheet {open} kicker={name} title="Mark visited" {onclose}>
	<form method="POST" action="?/visit" use:enhance={submit}>
		<ScoreField bind:value={score} {error} oninput={() => (error = '')} />
		<div class="foot">
			<Button variant="quiet" onclick={onclose}>Cancel</Button>
			<Button type="submit" variant="primary" disabled={submitting}>Save</Button>
		</div>
	</form>
</Sheet>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
