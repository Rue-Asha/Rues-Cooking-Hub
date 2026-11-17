<script lang="ts" module>
	import { cubicOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';
	import { reducedMotion } from '#lib/motion.ts';

	// mirrors MAX_UPLOAD_BYTES in the server's images.ts, which pulls in sharp and cannot ship to the browser
	const MAX_BYTES = 15 * 1024 * 1024;

	// the new picture settles in from slightly zoomed while the old one fades behind it
	function swap(_node: Element, { leaving = false }: { leaving?: boolean } = {}): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		return {
			duration: leaving ? 220 : 400,
			easing: cubicOut,
			css: (t, u) => (leaving ? `opacity: ${t}` : `opacity: ${t}; transform: scale(${(1 + u * 0.05).toFixed(3)})`)
		};
	}
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import type { Id } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	// `url`, `removed` and `picked` (the chosen file's name) are posted with the form and also drive the form's unsaved check
	let {
		imageId = null,
		url = $bindable(''),
		removed = $bindable(false),
		picked = $bindable(''),
		error = '',
		title = '',
		untitled = '',
		onchange
	}: {
		imageId?: Id | null;
		url: string;
		removed: boolean;
		picked: string;
		error?: string;
		// the plate shows the title's first letter; before there is one, the letter of `untitled` ("New recipe"), else it stays neutral
		title?: string;
		untitled?: string;
		onchange?: () => void;
	} = $props();

	let fileInput: HTMLInputElement;
	let localError = $state('');
	let objectUrl = $state<string | null>(null);
	// the link is previewed once confirmed (blur or Enter), not on every keystroke
	// svelte-ignore state_referenced_locally
	let previewUrl = $state(url.trim());
	let previewBroken = $state(false);

	const linkPreview = $derived(/^https?:\/\//i.test(previewUrl) && !previewBroken && url.trim() === previewUrl);
	const src = $derived(objectUrl ?? (linkPreview ? previewUrl : !picked && !removed && imageId !== null ? `/images/${imageId}` : null));
	const hasImage = $derived(picked !== '' || url.trim() !== '' || (imageId !== null && !removed));
	const message = $derived(localError || error);

	const named = $derived(title.trim() || untitled);
	const initial = $derived([...named][0] ?? '');
	const plate = $derived((([...named].reduce((n, c) => n + c.codePointAt(0)!, 0) % 2) + 1) as 1 | 2);

	function forget() {
		if (objectUrl) URL.revokeObjectURL(objectUrl);
		objectUrl = null;
	}

	function onFile() {
		const file = fileInput.files?.[0] ?? null;
		forget();
		localError = '';
		onchange?.();
		if (!file) {
			picked = '';
			return;
		}
		if (file.size > MAX_BYTES) {
			fileInput.value = '';
			picked = '';
			localError = COPY.tooLarge;
			return;
		}
		picked = file.name;
		url = '';
		previewUrl = '';
		removed = false;
		if (file.type.startsWith('image/')) objectUrl = URL.createObjectURL(file);
	}

	function onUrl() {
		if (url.trim() === '') return;
		forget();
		fileInput.value = '';
		picked = '';
		removed = false;
		localError = '';
		onchange?.();
	}

	function confirmUrl() {
		previewUrl = url.trim();
		previewBroken = false;
	}

	function remove() {
		forget();
		fileInput.value = '';
		picked = '';
		url = '';
		previewUrl = '';
		removed = true;
		localError = '';
		onchange?.();
	}

	onDestroy(forget);
</script>

<div class="field">
	<div class="picture" class:empty={!hasImage} data-image-frame>
		{#key src ?? (picked ? 'file' : 'none')}
			<div class="layer" in:swap out:swap={{ leaving: true }}>
				{#if src}
					<img {src} alt="" referrerpolicy="no-referrer" onerror={() => (previewBroken = true)} />
				{:else}
					<span class="plate" data-plate={initial ? plate : 0} role="img" aria-label={picked || 'No photo yet'}>
						{#if initial}{initial}{:else}<Icon name="image" size={32} />{/if}
					</span>
				{/if}
			</div>
		{/key}
	</div>
	<div class="actions">
		<Button size="s" onclick={() => fileInput.click()}>{hasImage ? 'Replace' : 'Add photo'}</Button>
		{#if hasImage}<Button variant="quiet" size="s" onclick={remove}>Remove image</Button>{/if}
	</div>
	{#if picked}<p class="hint">{picked}</p>{/if}
	<input
		bind:this={fileInput}
		class="sr-only"
		type="file"
		name="image"
		accept="image/*"
		tabindex="-1"
		aria-label="Photo file"
		onchange={onFile}
	/>
	<input type="hidden" name="removeImage" value={removed ? '1' : ''} />
	<Field
		label="Image link"
		name="imageUrl"
		type="url"
		inputmode="url"
		autocapitalize="off"
		autocomplete="off"
		placeholder="Or paste an image link"
		bind:value={url}
		oninput={onUrl}
		onchange={confirmUrl}
		error={message}
	/>
</div>

<style>
	.field {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.picture {
		display: grid;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-panel);
		overflow: hidden;
		isolation: isolate;
		background: var(--surface-sunken);
	}
	/* the empty plate is a wide strip (signed hi-fi); a chosen photo keeps its 4:3. Keyed on the choice, not on
	   :has(img): a link previews on blur, so the frame grew under the pointer between mousedown and mouseup on Save */
	.picture.empty {
		aspect-ratio: 16 / 9;
	}
	.layer {
		grid-area: 1 / 1;
		min-inline-size: 0;
		min-block-size: 0;
	}
	.layer img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
	.plate {
		display: grid;
		place-items: center;
		inline-size: 100%;
		block-size: 100%;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-m-size);
		line-height: 1;
		color: var(--ink-secondary);
		background: var(--surface-sunken);
		box-shadow: var(--ring-hairline);
	}
	.plate[data-plate='1'] {
		color: var(--ink);
		background: var(--surface-plate-1);
	}
	.plate[data-plate='2'] {
		color: var(--ink);
		background: var(--surface-plate-2);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.hint {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}
</style>
