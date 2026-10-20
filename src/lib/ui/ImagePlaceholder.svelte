<script lang="ts">
	let { label = 'No photo yet', size = 'card', class: cls = '' }: { label?: string; size?: 'card' | 'hero' | 'thumb'; class?: string } =
		$props();
</script>

<div class="placeholder {size} {cls}" role="img" aria-label={label}>
	<svg viewBox="0 0 120 80" aria-hidden="true">
		<circle cx="60" cy="40" r="26" />
		<circle cx="60" cy="40" r="18" />
		<path d="M22 18v14a4 4 0 0 0 8 0V18M26 18v44" />
		<path d="M98 62V18c-5 3-7 9-7 16 0 4 3 7 7 7" />
	</svg>
	{#if size !== 'thumb'}<span>{label}</span>{/if}
</div>

<style>
	.placeholder {
		display: grid;
		place-content: center;
		justify-items: center;
		gap: var(--s-2);
		inline-size: 100%;
		block-size: 100%;
		background:
			radial-gradient(circle at 50% 42%, var(--surface) 0, transparent 60%),
			var(--sand);
		color: var(--ink-2);
	}

	svg {
		inline-size: min(46%, 132px);
		fill: none;
		stroke: var(--stone);
		stroke-width: 1.4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.hero svg {
		inline-size: min(40%, 220px);
		stroke-width: 1;
	}

	.thumb svg {
		inline-size: 80%;
		stroke-width: 2.4;
	}

	span {
		font-size: var(--t-small);
		font-weight: 500;
		letter-spacing: 0.02em;
	}
</style>
