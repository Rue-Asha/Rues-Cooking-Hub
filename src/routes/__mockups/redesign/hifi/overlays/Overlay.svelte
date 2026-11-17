<!-- One dialog, two ways: live (the real Sheet, modal, opened by a trigger) or drawn open as a specimen. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sheet from '../shell/Sheet.svelte';
	import Dialog from './Dialog.svelte';

	type Props = { live?: boolean; open?: boolean; title: string; kicker?: string; label?: string; alert?: boolean; onclose?: () => void; children?: Snippet; actions?: Snippet };
	let { live = false, open = $bindable(false), title, kicker, label, alert = false, onclose, children, actions }: Props = $props();
</script>

{#if live}
	<Sheet bind:open {title} {kicker} {onclose} children={children ?? empty} {actions} />
{:else}
	<Dialog {title} {kicker} {label} {alert} {children} {actions} />
{/if}

{#snippet empty()}{/snippet}
