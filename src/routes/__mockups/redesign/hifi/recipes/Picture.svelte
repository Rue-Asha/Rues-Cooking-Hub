<!-- A recipe's photo, or the plate with its initial ("No photo yet"): never a gradient. -->
<script lang="ts">
	type Props = { title: string; image: string | null; ratio?: string; round?: boolean };
	let { title, image, ratio = '1 / 1', round = false }: Props = $props();

	const plate = $derived((([...title].reduce((n, c) => n + c.codePointAt(0)!, 0) % 2) + 1) as 1 | 2);
	const initial = $derived([...title.trim()][0] ?? '?');
</script>

{#if image}
	<img class="pic" class:round src={image} alt="" loading="lazy" style:aspect-ratio={ratio} />
{:else}
	<span class="pic plate" class:round data-plate={plate} role="img" aria-label="No photo yet" style:aspect-ratio={ratio}>{initial}</span>
{/if}

<style>
	.pic {
		display: block;
		inline-size: 100%;
		min-inline-size: 0;
		border-radius: var(--radius-panel);
		object-fit: cover;
	}
	.round {
		border-radius: var(--radius-round);
	}
	.plate {
		display: grid;
		place-items: center;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-m-size);
		line-height: 1;
		color: var(--ink);
		box-shadow: var(--ring-hairline);
	}
	.plate[data-plate='1'] {
		background: var(--surface-plate-1);
	}
	.plate[data-plate='2'] {
		background: var(--surface-plate-2);
	}
</style>
