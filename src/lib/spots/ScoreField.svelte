<script lang="ts">
	import Field from '#lib/components/field/Field.svelte';

	let {
		value = $bindable(),
		error = '',
		id = 'f-score',
		oninput
	}: { value: string; error?: string; id?: string; oninput?: () => void } = $props();
</script>

<Field {id} label="Score" name="score" inputmode="decimal" autocomplete="off" bind:value {error} {oninput}>
	{#snippet suffix()}/ 10{/snippet}
</Field>
