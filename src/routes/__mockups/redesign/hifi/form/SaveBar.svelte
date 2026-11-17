<!--
	The one Save of the recipe form, in a bar that sticks to the bottom edge (gate 4: no second Save in the head). On the phone
	it sits above the phone bar. It is moved to <body>: inside .frame a fixed bar would follow the frame's backdrop-filter, not
	the viewport. Save names the form it belongs to, since it no longer lives inside it.
-->
<script lang="ts">
	import Button from '../shell/Button.svelte';
	import { go } from '../recipes/util.ts';

	type Props = { form: string; cancelTo: 'recipes' | 'recipe'; saving?: boolean; worst?: boolean };
	let { form, cancelTo, saving = false, worst = false }: Props = $props();

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		// focused fields scroll clear of the bar (base.css reads this on the root)
		document.documentElement.style.setProperty('--sticky-block-end', 'calc(var(--space-16) + var(--space-4))');
		return {
			destroy() {
				node.remove();
				document.documentElement.style.removeProperty('--sticky-block-end');
			}
		};
	}
</script>

<div class="savebar" use:portal>
	<div class="capsule" role="group" aria-label="Save">
		<Button variant="quiet" href={cancelTo === 'recipe' ? go.recipe(worst) : go.recipes(worst)}>Cancel</Button>
		<Button variant="primary" arrow type="submit" {form} loading={saving} loadingLabel="">{saving ? 'Saving…' : 'Save recipe'}</Button>
	</div>
</div>

<style>
	.savebar {
		position: fixed;
		inset-inline: var(--space-2);
		inset-block-end: calc(max(var(--space-2), env(safe-area-inset-bottom)) + var(--target-touch) + var(--space-5));
		z-index: var(--z-rail);
		display: flex;
		justify-content: center;
		pointer-events: none;
	}
	.capsule {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		inline-size: min(100%, 32rem);
		padding: var(--space-1-5);
		border-radius: var(--radius-pill);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		pointer-events: auto;
	}
	@media (min-width: 1024px) {
		.savebar {
			inset-block-end: max(var(--space-4), env(safe-area-inset-bottom));
		}
		.capsule {
			inline-size: auto;
			justify-content: flex-end;
		}
	}
</style>
