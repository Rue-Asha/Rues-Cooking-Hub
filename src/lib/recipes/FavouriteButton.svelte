<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import { cubicOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';
	import { pop, reducedMotion } from '#lib/motion.ts';
	import type { Id } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let {
		id,
		title,
		favourite,
		variant = 'glass',
		class: cls = ''
	}: { id: Id; title: string; favourite: boolean; variant?: 'glass' | 'outline'; class?: string } = $props();

	let pressed = $derived(favourite);

	// a ring that leaves the heart as it fills
	function burst(_node: Element): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		return {
			duration: 560,
			easing: cubicOut,
			css: (t) => `transform: scale(${(0.6 + t).toFixed(3)}); opacity: ${(0.7 * (1 - t)).toFixed(3)}`
		};
	}

	async function toggle(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const form = event.currentTarget;
		const body = new FormData(form);
		const next = !pressed;
		pressed = next;
		const res = await fetch(form.action, { method: 'POST', body });
		if (!res.ok) pressed = !next;
		await refreshAll();
	}
</script>

<form class="fav-form {cls}" method="POST" action="/recipes/{id}/favourite" onsubmit={toggle}>
	<input type="hidden" name="favourite" value={pressed ? '0' : '1'} />
	<button
		class="fav-btn {variant}"
		class:pressed
		aria-pressed={pressed}
		aria-label={pressed ? `Remove ${title} from favourites` : `Add ${title} to favourites`}
	>
		{#key pressed}
			{#if pressed}<span class="burst" aria-hidden="true" in:burst></span>{/if}
			<span class="heart" in:pop><Icon name="heart" filled={pressed} /></span>
		{/key}
	</button>
</form>

<style>
	.fav-form {
		display: contents;
	}

	.fav-btn {
		position: relative;
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		padding: 0;
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		background: transparent;
		color: var(--ink);
		transition:
			transform var(--d-fast) var(--ease-out),
			color var(--d-base) var(--ease-out);
	}

	.glass {
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		border-color: var(--glass-border);
	}

	.outline {
		border-color: var(--line);
	}

	.pressed {
		color: var(--brick);
	}

	.fav-btn:hover {
		transform: scale(1.06);
	}

	.fav-btn:active {
		transform: scale(0.92);
	}

	.heart,
	.burst {
		grid-area: 1 / 1;
	}

	.heart {
		display: grid;
	}

	.burst {
		inline-size: 30px;
		block-size: 30px;
		border-radius: var(--r-pill);
		border: 2px solid var(--brick);
		opacity: 0;
		pointer-events: none;
	}
</style>
