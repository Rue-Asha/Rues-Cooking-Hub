<script lang="ts">
	let { index, total, tone = 'ink' }: { index: number; total: number; tone?: 'ink' | 'light' } = $props();
	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<span class="counter tnum {tone}" aria-label="{index} of {total}"
	><span class="now">{pad(index)}</span><span class="sep">/</span>{pad(total)}</span
>

<style>
	.counter {
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 400;
		letter-spacing: 0.04em;
		color: var(--ink-2);
		white-space: nowrap;
	}

	.now {
		color: var(--ink);
	}

	.light,
	.light .now {
		color: var(--white);
	}

	.sep {
		margin-inline: 0.15em;
		opacity: 0.6;
	}
</style>
