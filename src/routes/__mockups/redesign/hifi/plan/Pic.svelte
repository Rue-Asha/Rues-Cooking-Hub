<script lang="ts">
	import { initial, plate } from './data.ts';

	let { title, image }: { title: string; image: string | null } = $props();
</script>

{#if image}
	<img class="thumb" src={image} alt="" loading="lazy" />
{:else}
	<span class="thumb plate" data-plate={plate(title)} role="img" aria-label="No photo yet">{initial(title)}</span>
{/if}

<style>
	.plate[data-plate='1'] {
		background: var(--surface-plate-1);
	}
	.plate[data-plate='2'] {
		background: var(--surface-plate-2);
	}
	.plate {
		box-shadow: var(--ring-hairline);
	}
</style>
