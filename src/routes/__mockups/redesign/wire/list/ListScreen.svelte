<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import Button from '../overlays/Button.svelte';
	import Field from '../overlays/Field.svelte';
	import ListBody from './ListBody.svelte';
	import { listFor, type ListView } from './data.ts';

	type Props = { kind?: ListView['kind']; dock?: boolean };
	let { kind = 'list', dock = false }: Props = $props();
	const view = $derived(listFor(new URL(page.url.href), kind));

	// the dock leaves the frame: a glass ancestor would make `fixed` follow the frame, not the screen
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}
</script>

<Frame area="list">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Shopping list</li><li>{view.open.toLocaleString('en-GB')} open</li></ul>
			<h1>Things to buy</h1>
		</div>
		<div class="bar">
			<div class="seg-bar add-bar" class:dock-hidden={dock}>
				<div class="seg add"><Field label="Add an item" hideLabel placeholder="Add an item, e.g. 2 l oat milk" /></div>
			</div>
			<div class="from-plan"><Button variant="primary">Add from plan</Button></div>
		</div>
	</div>
	<div class="screen-body" class:dock>
		<ListBody {view} />
	</div>
</Frame>

{#if dock}
	<div class="dock-bar" use:portal>
		<div class="seg-bar add-bar"><div class="seg add"><Field label="Add an item" hideLabel placeholder="Add an item, e.g. 2 l oat milk" /></div></div>
	</div>
{/if}

<style>
	.bar { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); min-inline-size: 0; }
	.add-bar { flex: 1 1 22rem; max-inline-size: 36rem; justify-self: stretch; }
	.add { flex: 1; padding-inline: var(--space-1); }
	.add :global(.field) { inline-size: 100%; }
	.from-plan { flex: none; }
		.dock-bar { display: none; }
	@media (max-width: 767px) {
		.bar { display: grid; }
		.from-plan :global(.btn) { inline-size: 100%; }
		.dock-hidden { display: none; }
		.dock-bar {
			display: block;
			position: fixed;
			z-index: var(--z-rail);
			inset-inline: var(--space-3);
			inset-block-end: calc(var(--space-3) + var(--target-touch) + var(--space-5));
		}
		.dock-bar .add-bar { inline-size: 100%; max-inline-size: none; }
		.screen-body.dock { padding-block-end: calc(var(--target-touch) * 2 + var(--space-8)); }
	}
</style>
