<script lang="ts" module>
	const paths = {
		home: 'M4 11l8-7 8 7M6 10v10h12V10',
		book: 'M5 19.5V5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5 2.5 2.5 0 0 0 7.5 22H19v-5',
		calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
		basket: 'M3 9h18l-2 11H5zM8 9l4-6 4 6',
		search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
		heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z',
		clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2',
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
		copy: 'M8 8h12v12H8zM4 16V4h12',
		trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
		edit: 'M5 19h3.5L18.5 9 15 5.5 5 15.5zM13 7.5l3.5 3.5',
		grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
		image: 'M5 5h14v14H5zM5 15.5l4-4 3.5 3.5 2.5-2.5L19 16.5M15 9.5h.01',
		sort: 'M7 5v14M4 16l3 3 3-3M17 19V5M14 8l3-3 3 3',
		x: 'M6 6l12 12M18 6 6 18',
		alert: 'M12 4 2.8 19.5h18.4zM12 10v4M12 17h.01',
		sparkle: 'M12 4c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6z',
		move: 'M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3',
		dots: 'M6 12h.01M12 12h.01M18 12h.01',
		pin: 'M12 21s6-5.4 6-10.5a6 6 0 0 0-12 0C6 15.6 12 21 12 21zM12 8.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
		tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01',
		fork: 'M8 3.5v5.5a2 2 0 0 0 4 0V3.5M10 3.5V21M17 21V3.5c-2 1-3 3.5-3 6.5 0 2 1.2 3 3 3'
	} as const;

	export type IconName = keyof typeof paths;
</script>

<script lang="ts">
	let {
		name,
		size = 20,
		stroke = 1.75,
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
