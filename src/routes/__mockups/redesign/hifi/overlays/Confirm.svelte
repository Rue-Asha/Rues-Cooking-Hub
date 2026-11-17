<!-- A confirmation: the title asks with the object, the body gives the consequence, "Cancel" has focus, the verb is the danger pill. -->
<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Icon from './Icon.svelte';
	import Overlay from './Overlay.svelte';

	type Props = { live?: boolean; open?: boolean; title: string; kicker: string; body?: string; verb: string; cancel?: string; onconfirm?: () => void };
	let { live = false, open = $bindable(false), title, kicker, body, verb, cancel = 'Cancel', onconfirm }: Props = $props();
</script>

{#snippet text()}<p class="body">{body}</p>{/snippet}
{#snippet buttons()}
	<Button variant="quiet" class={live ? undefined : 'ring'} autofocus={live} onclick={() => (open = false)}>{cancel}</Button>
	<Button
		variant="danger"
		onclick={() => {
			open = false;
			onconfirm?.();
		}}><span class="verb"><Icon name="trash" />{verb}</span></Button
	>
{/snippet}

<Overlay {live} bind:open {title} {kicker} alert children={body ? text : undefined} actions={buttons} />

<style>
	/* drawn open, the ringed pill is the one that has focus */
	:global(.btn.ring) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.verb {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}
	.body {
		color: var(--ink-secondary);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		overflow-wrap: anywhere;
	}
</style>
