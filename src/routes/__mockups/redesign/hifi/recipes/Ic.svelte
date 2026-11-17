<!--
	The UI icons these screens need on top of the shell's Icon (same 24 grid, stroke 1.75, round caps): the paths are the
	specimen's PATHS set. Names the shell has go through to it; heart is drawn here because it can be filled.
-->
<script lang="ts" module>
	export type Name = 'minus' | 'edit' | 'trash' | 'alert' | 'chevron-left' | 'users' | 'image' | 'out' | 'tag' | 'heart' | 'search' | 'plus' | 'close' | 'check' | 'clock' | 'arrow' | 'back' | 'chevron' | 'link';
</script>

<script lang="ts">
	import Icon, { type IconName } from '../shell/Icon.svelte';

	let { name, size = 18, fill = false }: { name: Name; size?: number; fill?: boolean } = $props();

	const own: Partial<Record<Name, string>> = {
		minus: 'M5 12h14',
		edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
		trash: 'M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13',
		alert: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7.5v5M12 16.5h.01',
		'chevron-left': 'M15 6l-6 6 6 6',
		users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a7 7 0 0 1 14 0v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a6 6 0 0 0-4-5.6',
		image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9h.01',
		out: 'M7 17L17 7M9 7h8v8',
		tag: 'M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8.5-8.5 8.5zM8 8h.01',
		link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
		heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z'
	};
</script>

{#if own[name]}
	<svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={own[name]} /></svg>
{:else}
	<Icon name={name as IconName} {size} />
{/if}
