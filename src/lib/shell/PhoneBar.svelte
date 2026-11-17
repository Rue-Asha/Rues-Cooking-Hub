<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import { hideOnType } from '#lib/components/scroll-cue/cue.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { areas, type Area } from '#lib/nav.ts';
	import { addHref, contextAdd } from './context-add.svelte.ts';
	import { pill } from './pill.ts';

	type Props = { area: Area; compact: boolean; plusHidden: boolean; onhome: () => void };
	let { area, compact, plusHidden, onhome }: Props = $props();

	const href = $derived(addHref(area));
	const label = $derived(COPY.contextAdd[area]);

	// the hide-on-type cue sets data-hidden; the bar must also leave the accessibility tree and the tab order.
	// The bar's real height goes to --dock-block-size, so what floats above it (the form's Save capsule) clears it.
	function typing(dock: HTMLElement) {
		const cue = hideOnType(dock);
		const size = new ResizeObserver(() => document.documentElement.style.setProperty('--dock-block-size', `${dock.offsetHeight}px`));
		size.observe(dock);
		const sync = () => (dock.inert = dock.hasAttribute('data-hidden'));
		const watch = new MutationObserver(sync);
		watch.observe(dock, { attributes: true, attributeFilter: ['data-hidden'] });
		sync();
		return {
			destroy() {
				watch.disconnect();
				size.disconnect();
				document.documentElement.style.removeProperty('--dock-block-size');
				cue.destroy();
			}
		};
	}

	function add(event: MouseEvent) {
		if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		contextAdd(area);
	}
</script>

<nav class="dock" aria-label="Main" data-bar="phone" data-nav="bar" data-compact={compact ? '' : undefined} use:typing>
	<ul class="dock-tabs" data-pill use:pill={areas.find((a) => a.area === area)?.href}>
		{#each areas as a (a.area)}
			<li>
				<a href={a.href} aria-current={a.area === area ? 'page' : undefined} data-press><Icon name={a.icon} size={20} stroke={1.75} /><span>{a.phoneLabel}</span></a>
			</li>
		{/each}
	</ul>
	{#if area === 'home'}
		<button type="button" class="dock-add" aria-label={label} aria-haspopup="dialog" hidden={plusHidden} inert={plusHidden} data-press="round" data-focus="halo" onclick={onhome}>
			<Icon name="plus" size={24} stroke={1.75} />
		</button>
	{:else if href}
		<a class="dock-add" {href} aria-label={label} hidden={plusHidden} inert={plusHidden} data-press="round" data-focus="halo" onclick={add}><Icon name="plus" size={24} stroke={1.75} /></a>
	{:else}
		<button type="button" class="dock-add" aria-label={label} hidden={plusHidden} inert={plusHidden} data-press="round" data-focus="halo" onclick={add}>
			<Icon name="plus" size={24} stroke={1.75} />
		</button>
	{/if}
</nav>

<style>
	.dock-add[hidden] {
		display: none;
	}

	/* a hairline rim keeps the charcoal "+" apart from a charcoal card scrolling under it */
	.dock-add:not(:focus-visible) {
		box-shadow: var(--ring-on-inverse), var(--shadow-lift);
	}
</style>
