<script lang="ts" module>
	export type IconName =
		| 'plus'
		| 'minus'
		| 'close'
		| 'check'
		| 'search'
		| 'calendar'
		| 'back'
		| 'arrow'
		| 'chev-left'
		| 'chev-right'
		| 'more'
		| 'grip'
		| 'trash'
		| 'move'
		| 'tag'
		| 'alert'
		| 'copy';
</script>

<script lang="ts">
	let { name, size = 18 }: { name: IconName; size?: number } = $props();

	const paths: Record<IconName, string> = {
		plus: 'M12 5v14M5 12h14',
		minus: 'M5 12h14',
		close: 'M6 6l12 12M18 6L6 18',
		check: 'M5 12.5l4.5 4.5L19 7.5',
		search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
		calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
		back: 'M19 12H5M11 6l-6 6 6 6',
		arrow: 'M5 12h14M13 6l6 6-6 6',
		'chev-left': 'M15 6l-6 6 6 6',
		'chev-right': 'M9 6l6 6-6 6',
		more: 'M5 12h.01M12 12h.01M19 12h.01',
		grip: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
		trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
		move: 'M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3',
		tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01',
		alert: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7.5v5M12 16.5h.01',
		copy: 'M8 8h12v12H8zM4 16V4h12'
	};
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={name === 'more' ? 3 : 1.75} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
