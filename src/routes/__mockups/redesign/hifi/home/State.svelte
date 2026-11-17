<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, note, children }: { label: string; note: string; children: Snippet } = $props();
</script>

<section class="state" aria-label={label}>
	<header>
		<h3 class="ruled">{label}</h3>
		<p>{note}</p>
	</header>
	{@render children()}
</section>

<style>
	.state {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	header {
		display: grid;
		gap: var(--space-1);
	}
	p {
		max-inline-size: var(--measure);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
</style>
