<script lang="ts">
	import type { Area } from '#lib/nav.ts';
	import { hideOnType } from '#lib/components/scroll-cue/cue.ts';
	import Icon from './Icon.svelte';
	import { areaPath, areas, link, phoneIcon, plusLabel } from './links.ts';
	import { pill } from './pill.ts';

	type Props = {
		area: Area;
		worst?: boolean;
		label?: string;
		plus?: 'shown' | 'hidden';
		onplus?: (event: Event) => void;
		plusHref?: string;
		'data-specimen'?: boolean;
		'data-hidden'?: boolean;
	};
	let { area, worst = false, label = 'Main', plus = 'shown', onplus, plusHref, ...rest }: Props = $props();
	// a specimen is drawn, so it neither reacts to the gallery's own focus nor loses its drawn data-hidden
	const watch = (dock: HTMLElement) => (rest['data-specimen'] ? undefined : hideOnType(dock));
</script>

<nav class="dock" aria-label={`${label} tabs`} {...rest} use:watch>
	<ul class="dock-tabs" data-pill use:pill>
		{#each areas as a (a.area)}
			<li><a href={link(areaPath[a.area], worst)} aria-current={a.area === area ? 'page' : undefined} data-press><Icon name={phoneIcon[a.area]} size={20} /><span>{a.phone}</span></a></li>
		{/each}
	</ul>
	{#if plus === 'shown'}
		{#if plusHref}
			<a class="dock-add" href={plusHref} aria-label={plusLabel[area]} data-press="round" data-focus="halo"><Icon name="plus" size={24} /></a>
		{:else}
			<button type="button" class="dock-add" aria-label={plusLabel[area]} aria-haspopup="dialog" data-press="round" data-focus="halo" onclick={onplus}><Icon name="plus" size={24} /></button>
		{/if}
	{/if}
</nav>
