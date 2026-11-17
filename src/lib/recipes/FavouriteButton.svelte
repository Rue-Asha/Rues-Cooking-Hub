<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import type { Id } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let {
		id,
		title,
		favourite,
		variant = 'glass',
		class: cls = ''
	}: { id: Id; title: string; favourite: boolean; variant?: 'glass' | 'outline' | 'plain'; class?: string } = $props();

	let pressed = $derived(favourite);

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
		class="heart {variant}"
		data-press="round"
		data-focus={pressed ? 'halo' : undefined}
		aria-pressed={pressed}
		aria-label={pressed ? `Remove ${title} from favourites` : `Add ${title} to favourites`}
	>
		<Icon name="heart" size={20} stroke={1.75} filled={pressed} />
	</button>
</form>

<style>
	.fav-form {
		display: contents;
	}
	.heart {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height), var(--target));
		block-size: max(var(--control-height), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink);
	}
	.glass {
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
	}
	.outline {
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	@media (hover: hover) {
		.heart:hover {
			background: var(--surface-control-solid-hover);
		}
	}
	.heart[aria-pressed='true'] {
		background: var(--surface-inverse);
		box-shadow: none;
		color: var(--ink-on-inverse);
	}
	.heart[aria-pressed='true']:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}
</style>
