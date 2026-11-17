<script lang="ts">
	let { label = 'Photo', ratio = '4 / 3', plate = false, caption = true }: { label?: string; ratio?: string; plate?: boolean; caption?: boolean } = $props();
</script>

{#if plate}
	<div class="grey" style:aspect-ratio={ratio} role="img" aria-label="No photo yet">{#if caption}<span>No photo yet</span>{/if}</div>
{:else}
	<div class="grey" style:aspect-ratio={ratio} aria-hidden="true">{#if caption}<span>{label}</span>{/if}</div>
{/if}

<style>
	.grey {
		display: grid;
		place-items: center;
		inline-size: 100%;
		min-inline-size: 0;
		border-radius: var(--radius-panel);
		background: var(--surface-tint-strong);
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
	}
</style>
