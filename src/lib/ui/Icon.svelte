<script lang="ts" module>
	const paths = {
		home: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z',
		book: 'M5 4.5h9.5A2.5 2.5 0 0 1 17 7v13H7.5A2.5 2.5 0 0 1 5 17.5zM5 17.5A2.5 2.5 0 0 1 7.5 15H17M9 8.5h4.5',
		calendar: 'M5 6.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1zM4 10.5h16M8.5 4v4M15.5 4v4',
		basket: 'M4 9.5h16l-1.6 9a1.5 1.5 0 0 1-1.5 1.2H7.1a1.5 1.5 0 0 1-1.5-1.2zM8 9.5 11 4M16 9.5 13 4M9.5 13v3.5M14.5 13v3.5',
		search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.3 15.3 20 20',
		heart: 'M12 19.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 6.9a4.3 4.3 0 0 1 7.5 2.6c0 5.6-7.5 10-7.5 10z',
		clock: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 7.5V12l3 2',
		users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M16 5.5a3 3 0 0 1 0 5.5M17.5 14.3c1.6.6 2.6 2.4 3 4.7',
		plus: 'M12 5v14M5 12h14',
		minus: 'M5 12h14',
		'arrow-right': 'M5 12h14M13 6l6 6-6 6',
		'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
		'arrow-up-right': 'M7 17 17 7M8.5 7H17v8.5',
		'chevron-down': 'm6 9.5 6 6 6-6',
		'chevron-left': 'm14.5 6-6 6 6 6',
		'chevron-right': 'm9.5 6 6 6-6 6',
		link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
		check: 'm5 12.5 4.5 4.5L19 7.5',
		copy: 'M9 9h10v10H9zM15 9V5H5v10h4',
		trash: 'M5 7h14M10 7V5h4v2M7 7l1 12.5h8L17 7M10.5 11v5M13.5 11v5',
		edit: 'M5 19h3.5L18.5 9 15 5.5 5 15.5zM13 7.5l3.5 3.5',
		grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
		image: 'M5 5h14v14H5zM5 15.5l4-4 3.5 3.5 2.5-2.5L19 16.5M15 9.5h.01',
		sort: 'M7 5v14M4 16l3 3 3-3M17 19V5M14 8l3-3 3 3',
		x: 'M6 6l12 12M18 6 6 18',
		alert: 'M12 4 2.8 19.5h18.4zM12 10v4M12 17h.01',
		sparkle: 'M12 4c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6z',
		move: 'M12 4v16M12 4 9 7M12 4l3 3M12 20l-3-3M12 20l3-3M4 12h16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3',
		dots: 'M6 12h.01M12 12h.01M18 12h.01',
		fork: 'M8 3.5v5.5a2 2 0 0 0 4 0V3.5M10 3.5V21M17 21V3.5c-2 1-3 3.5-3 6.5 0 2 1.2 3 3 3'
	} as const;

	export type IconName = keyof typeof paths;
</script>

<script lang="ts">
	let {
		name,
		size = 20,
		stroke = 1.6,
		filled = false,
		label
	}: { name: IconName; size?: number; stroke?: number; filled?: boolean; label?: string } = $props();
</script>

<svg
	class="icon"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={filled ? 'currentColor' : 'none'}
	stroke="currentColor"
	stroke-width={name === 'grip' || name === 'dots' ? 3 : stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<path d={paths[name]} />
</svg>

<style>
	.icon {
		flex: none;
	}
</style>
