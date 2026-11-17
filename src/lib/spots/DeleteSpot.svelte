<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import Sheet from '#lib/plan/Sheet.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Button from '#lib/components/button/Button.svelte';

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
			<Button variant="secondary" autofocus onclick={onclose}>Cancel</Button>
			<Button type="submit" variant="danger" disabled={submitting}><Icon name="trash" size={18} />Delete</Button>
		</div>
	</form>
</Sheet>

<style>
	.foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
