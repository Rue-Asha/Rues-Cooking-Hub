<script module lang="ts">
	// a recipe without a photo gets a plate with its title's first letter; the title picks one of the two plate tints
	export const plateOf = (title: string): 1 | 2 => (([...title].reduce((n, c) => n + c.codePointAt(0)!, 0) % 2) + 1) as 1 | 2;
	export const initialOf = (title: string): string => [...title.trim()][0] ?? '?';
</script>

<script lang="ts">
	type Props = { title: string; imageId: number | null; ratio?: string };
	let { title, imageId, ratio = '1 / 1' }: Props = $props();

	const plate = $derived(plateOf(title));
	const initial = $derived(initialOf(title));
</script>

{#if imageId !== null}
	<img class="pic" src="/images/{imageId}" alt="" loading="lazy" style:aspect-ratio={ratio} />
{:else}
	<span class="pic plate" data-plate={plate} role="img" aria-label="No photo yet" style:aspect-ratio={ratio}>{initial}</span>
{/if}

<style>
	.pic {
		display: block;
		inline-size: 100%;
		min-inline-size: 0;
		border-radius: var(--radius-panel);
		object-fit: cover;
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
