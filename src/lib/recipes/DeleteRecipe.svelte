<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import Sheet from '#lib/plan/Sheet.svelte';
	import Button from '#lib/ui/Button.svelte';

	let { open, title, usage, onclose }: { open: boolean; title: string; usage: number; onclose: () => void } = $props();

	let submitting = $state(false);

	const submit: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	};
</script>

<Sheet {open} kicker="Delete recipe" title="Delete “{title}”?" {onclose}>
	<form method="POST" action="?/delete" use:enhance={submit}>
		{#if usage > 0}
			<p class="usage">
				{usage === 1
					? "It's used in 1 plan entry; it'll stay in the plan as text."
					: `It's used in ${usage} plan entries; they'll stay in the plan as text.`}
			</p>
		{/if}
		<div class="foot">
			<Button variant="secondary" arrow={false} onclick={onclose}>Cancel</Button>
			<Button type="submit" variant="danger" icon="trash" disabled={submitting}>Delete</Button>
		</div>
	</form>
</Sheet>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	.usage {
		padding: var(--s-3) var(--s-4);
		border-radius: var(--r-sm);
		background: var(--brick-soft);
		color: var(--brick);
		font-size: 14px;
		font-weight: 500;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		padding-block-start: var(--s-3);
		border-block-start: 1px solid var(--line);
	}
</style>
