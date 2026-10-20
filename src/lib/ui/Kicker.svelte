<script lang="ts">
	let { parts, tone = 'ink', class: cls = '' }: { parts: string[]; tone?: 'ink' | 'light' | 'brick'; class?: string } =
		$props();
</script>

<p class="kicker {tone} {cls}">
	{#each parts as part, i (i)}{#if i > 0}<span class="dash" aria-hidden="true"></span>{/if}<span>{part}</span>{/each}
</p>

<style>
	.kicker {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0 var(--s-3);
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--t-kicker);
		font-weight: 500;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		line-height: 1.6;
		color: var(--ink-2);
	}

	.light {
		color: var(--on-dark);
	}

	.brick {
		color: var(--brick);
	}

	.dash {
		inline-size: 18px;
		block-size: 1px;
		background: currentColor;
		opacity: 0.6;
	}
</style>
