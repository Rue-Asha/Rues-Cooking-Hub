<script lang="ts" module>
	export type IconName = 'home' | 'book' | 'calendar' | 'basket' | 'pin' | 'search' | 'plus' | 'close' | 'more' | 'heart' | 'clock' | 'arrow';
</script>

<script lang="ts">
	let { name, size = 20 }: { name: IconName; size?: number } = $props();

	const paths: Record<IconName, string> = {
		home: 'M4 11 12 4l8 7v9h-5v-6H9v6H4z',
		book: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11',
		calendar: 'M5 6h14v14H5zM5 10h14M9 3v5M15 3v5',
		basket: 'M4 9h16l-1.6 10H5.6zM8 9l3-5M16 9l-3-5',
		pin: 'M12 21s6-5.4 6-10.5a6 6 0 0 0-12 0C6 15.600 12 21 12 21zM12 8.500a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
		search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM16 16l4 4',
		plus: 'M12 5v14M5 12h14',
		close: 'M6 6l12 12M18 6 6 18',
		more: 'M6 12h.01M12 12h.01M18 12h.01',
		heart: 'M12 20s-7-4.400-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.600-7 10-7 10z',
		clock: 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM12 8v4l3 2',
		arrow: 'M5 12h14M13 6l6 6-6 6'
	};
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
