<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import Sheet from '#lib/plan/Sheet.svelte';
	import Button from '#lib/ui/Button.svelte';

	let { open, name, onclose }: { open: boolean; name: string; onclose: () => void } = $props();

	let submitting = $state(false);

	const submit: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	};
</script>

<Sheet {open} kicker="Delete spot" title="Delete “{name}”?" {onclose}>
	<form method="POST" action="?/delete" use:enhance={submit}>
		<div class="foot">
			<Button variant="secondary" arrow={false} onclick={onclose}>Cancel</Button>
			<Button type="submit" variant="danger" icon="trash" disabled={submitting}>Delete</Button>
		</div>
	</form>
</Sheet>

<style>
	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		padding-block-start: var(--s-3);
		border-block-start: 1px solid var(--line);
	}
</style>
