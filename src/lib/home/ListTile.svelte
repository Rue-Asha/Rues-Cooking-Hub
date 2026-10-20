<script lang="ts">
	import type { Dashboard } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Tile from '#lib/ui/Tile.svelte';

	let { list }: { list: Dashboard['list'] } = $props();
</script>

<Tile tone="brick" href="/list" class="home-list" data-tile="list">
	<div class="tile-head">
		<h2 class="tile-title">Shopping list</h2>
		<ArrowButton decorative variant="glass" direction="up-right" class="go" />
	</div>
	{#if list.open > 0}
		<p class="big tnum" data-open>{list.open} <span>open</span></p>
		<ul class="ruled">
			{#each list.first as name, i (i)}
				<li style:--i={i}>{name}</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">List is empty</p>
		<p class="hint">Add things as you notice them, or fill it from the plan.</p>
	{/if}
</Tile>

<style>
	.tile-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--s-3);
	}

	.tile-title {
		font-size: 24px;
		font-weight: 360;
		line-height: 1.1;
		color: inherit;
	}

	:global(.home-list .go) {
		background: var(--glass-on-dark);
		border-color: var(--line-on-dark);
		color: var(--on-dark);
		transition: transform var(--d-base) var(--ease-spring);
	}

	:global(a.home-list:hover .go) {
		transform: rotate(45deg);
	}

	.big {
		margin-block: auto var(--s-2);
		font-family: var(--font-display);
		font-size: 52px;
		font-weight: 300;
		line-height: 1;
	}

	.big span {
		margin-inline-start: 4px;
		font-family: var(--font-text);
		font-size: 14px;
		font-weight: 500;
		letter-spacing: 0.04em;
	}

	.ruled li {
		padding-block: 5px;
		border-block-start: 1px solid var(--line-on-dark);
		font-size: 14px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.empty {
		margin-block-start: auto;
		font-family: var(--font-display);
		font-size: 30px;
		font-weight: 300;
		line-height: 1.1;
	}

	.hint {
		margin-block-start: var(--s-2);
		font-size: var(--t-small);
		opacity: 0.85;
	}

	/* the ruled lines draw in under the count, one after another */
	@media (prefers-reduced-motion: no-preference) {
		.ruled li {
			animation: rule-in var(--d-slow) var(--ease-out) backwards;
			animation-delay: calc(380ms + var(--i) * 60ms);
		}

		.big {
			animation: count-in 560ms var(--ease-spring) 260ms backwards;
		}
	}

	@keyframes rule-in {
		from {
			opacity: 0;
			transform: translateX(-12px);
		}
	}

	@keyframes count-in {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.9);
		}
	}

	@media (max-width: 1023px) {
		:global(.home-list.tile) {
			padding: var(--s-5);
		}

		.tile-title {
			font-size: 19px;
		}

		.tile-head :global(.arrow) {
			inline-size: 32px;
			block-size: 32px;
		}

		.big {
			font-size: 48px;
		}

		.big span {
			display: block;
			margin: 4px 0 0;
		}

		.ruled li:nth-child(n + 3) {
			display: none;
		}

		.empty {
			font-size: 24px;
		}
	}
</style>
