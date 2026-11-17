<script lang="ts">
	type Name = 'star' | 'starFill' | 'edit' | 'trash' | 'back' | 'chevronLeft' | 'chevronRight' | 'arrow' | 'plus' | 'minus' | 'x' | 'alert' | 'image' | 'search' | 'link' | 'external' | 'check';
	let { name, size = 18 }: { name: Name; size?: number } = $props();

	const paths: Record<Name, string> = {
		star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z',
		starFill: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z',
		edit: 'M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17zM13.5 8.5l3 3',
		trash: 'M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7M10 11v5M14 11v5',
		back: 'M19 12H5M11 6l-6 6 6 6',
		chevronLeft: 'M15 6l-6 6 6 6',
		chevronRight: 'M9 6l6 6-6 6',
		arrow: 'M5 12h14M13 6l6 6-6 6',
		plus: 'M12 5v14M5 12h14',
		minus: 'M5 12h14',
		x: 'M6 6l12 12M18 6L6 18',
		alert: 'M12 8v5M12 16.5v.01M12 3.5l9.5 16.5h-19z',
		image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5v.01',
		search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20',
		link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
		external: 'M14 4h6v6M20 4l-9 9M18 14v5H5V6h5',
		check: 'M5 12.5l4.5 4.5L19 7.5'
	};
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill={name === 'starFill' ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>
