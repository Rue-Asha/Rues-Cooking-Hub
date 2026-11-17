<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import Sheet from '#lib/plan/Sheet.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Button from '#lib/components/button/Button.svelte';

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
			<Button variant="secondary" autofocus onclick={onclose}>Cancel</Button>
			<Button type="submit" variant="danger" disabled={submitting}><Icon name="trash" size={18} />Delete</Button>
		</div>
	</form>
</Sheet>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.usage {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-item);
		background: var(--danger-soft);
		color: var(--danger);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		font-weight: var(--type-label-weight);
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
