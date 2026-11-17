<script lang="ts" module>
	export type IconName = 'home' | 'book' | 'calendar' | 'basket' | 'pin' | 'search' | 'plus' | 'close' | 'heart' | 'clock' | 'arrow' | 'check' | 'back' | 'chevron';
</script>

<script lang="ts">
	let { name, size = 18 }: { name: IconName; size?: number } = $props();

	const paths: Record<IconName, string> = {
		home: 'M4 11l8-7 8 7M6 10v10h12V10',
		book: 'M5 19.5V5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5 2.5 2.5 0 0 0 7.5 22H19v-5',
		calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
		basket: 'M3 9h18l-2 11H5zM8 9l4-6 4 6',
		pin: 'M12 21s6-5.4 6-10.5a6 6 0 0 0-12 0C6 15.6 12 21 12 21zM12 8.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
		search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
		plus: 'M12 5v14M5 12h14',
		close: 'M6 6l12 12M18 6L6 18',
		heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z',
		clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2',
		arrow: 'M5 12h14M13 6l6 6-6 6',
		check: 'M5 12.5l4.5 4.5L19 7.5',
		back: 'M19 12H5M11 6l-6 6 6 6',
		chevron: 'M9 6l6 6-6 6'
	};
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
