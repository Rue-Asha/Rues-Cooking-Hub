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
	import { rise } from '#lib/motion.ts';
	import { COPY } from '#lib/copy.ts';
	import type { Id } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';

	// `url`, `removed` and `picked` (the chosen file's name) are posted with the form and also drive the form's unsaved check
	let {
		imageId = null,
		url = $bindable(''),
		removed = $bindable(false),
		picked = $bindable(''),
		error = '',
		onchange
	}: {
		imageId?: Id | null;
		url: string;
		removed: boolean;
		picked: string;
		error?: string;
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
	<span class="label" id="image-label">Photo</span>
	<div class="frame" data-image-frame aria-labelledby="image-label">
		{#key src ?? (picked ? 'file' : 'none')}
			<div class="layer" in:swap out:swap={{ leaving: true }}>
				{#if src}
					<img {src} alt="" referrerpolicy="no-referrer" onerror={() => (previewBroken = true)} />
				{:else}
					<ImagePlaceholder label={picked || 'No photo yet'} />
				{/if}
			</div>
		{/key}
		<div class="actions">
			<Button variant="ghost" arrow={false} icon="image" class="on-photo" onclick={() => fileInput.click()}>
				{hasImage ? 'Replace' : 'Add photo'}
			</Button>
			{#if hasImage}
				<span class="remove" in:rise={{ y: 6 }}>
					<IconButton icon="x" label="Remove image" onclick={remove} />
				</span>
			{/if}
		</div>
	</div>

	<input
		bind:this={fileInput}
		class="visually-hidden"
		type="file"
		name="image"
		accept="image/*"
		tabindex="-1"
		aria-label="Photo file"
		onchange={onFile}
	/>
	<input type="hidden" name="removeImage" value={removed ? '1' : ''} />

	<input
		class="link"
		name="imageUrl"
		type="url"
		bind:value={url}
		oninput={onUrl}
		onchange={confirmUrl}
		placeholder="Or paste an image link"
		aria-label="Image link"
		aria-invalid={message ? 'true' : undefined}
		aria-describedby={message ? 'e-image' : undefined}
		autocomplete="off"
	/>
	{#if message}<p class="error" id="e-image" role="alert" transition:rise={{ y: 6 }}>{message}</p>{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
	}

	.label {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.frame {
		position: relative;
		display: grid;
		aspect-ratio: 16 / 10;
		border-radius: var(--r-md);
		overflow: hidden;
		isolation: isolate;
		background: var(--sand);
	}

	.layer {
		grid-area: 1 / 1;
		min-inline-size: 0;
		min-block-size: 0;
	}

	.layer img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.actions {
		position: absolute;
		inset-inline: var(--s-3);
		inset-block-end: var(--s-3);
		display: flex;
		align-items: center;
		justify-content: space-between;
		z-index: 1;
	}

	.actions :global(.on-photo) {
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		min-block-size: 44px;
	}

	.remove :global(.icon-btn) {
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		border-color: var(--glass-border);
	}

	.link {
		inline-size: 100%;
		min-block-size: 46px;
		padding: 11px 14px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--white);
		font-size: 15px;
		line-height: 1.45;
		transition: border-color var(--d-fast) var(--ease-out);
	}

	.link::placeholder {
		color: var(--ink-2);
	}

	.link:focus-visible {
		border-color: var(--olive);
		box-shadow: 0 0 0 3px var(--olive-wash);
		border-radius: var(--r-sm);
	}

	.link[aria-invalid='true'] {
		border-color: var(--brick);
		box-shadow: 0 0 0 3px var(--brick-wash);
	}

	.error {
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--brick);
	}
</style>
