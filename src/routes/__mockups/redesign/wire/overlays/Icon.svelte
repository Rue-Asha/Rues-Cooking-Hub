<script module lang="ts">
	export type IconName = 'more' | 'plus' | 'chev-left' | 'chev-right' | 'chev-down' | 'search' | 'check' | 'close' | 'trash' | 'alert' | 'grip' | 'tag' | 'minus';
</script>

<script lang="ts">
	let { name }: { name: IconName } = $props();
</script>

<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
	{#if name === 'more'}
		<circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
	{:else if name === 'plus'}
		<path d="M12 5v14M5 12h14" />
	{:else if name === 'chev-left'}
		<path d="m15 6-6 6 6 6" />
	{:else if name === 'chev-right'}
		<path d="m9 6 6 6-6 6" />
	{:else if name === 'chev-down'}
		<path d="m6 9 6 6 6-6" />
	{:else if name === 'search'}
		<circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" />
	{:else if name === 'check'}
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	{:else if name === 'close'}
		<path d="M6 6l12 12M18 6 6 18" />
	{:else if name === 'trash'}
		<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" />
	{:else if name === 'alert'}
		<circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" />
	{:else if name === 'grip'}
		<circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" />
	{:else if name === 'minus'}
		<path d="M5 12h14" />
	{:else if name === 'tag'}
		<path d="M4 4h8l8 8-8 8-8-8z" /><circle cx="8.5" cy="8.5" r="1" />
	{/if}
</svg>
