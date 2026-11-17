<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { flipOptions, pop, reducedMotion } from '#lib/motion.ts';
	import { fold } from '#lib/text.ts';
	import type { Tag } from '#lib/types.ts';
	import Field from '#lib/components/field/Field.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	// `selected` holds names; the typed-but-unconfirmed text is posted too (it is the `tag` input itself)
	let {
		tags,
		selected = $bindable(),
		pending = $bindable()
	}: { tags: Tag[]; selected: string[]; pending: string } = $props();

	const known = $derived(new Map(tags.map((t) => [fold(t.name), t.name])));
	const isNew = (name: string) => !known.has(fold(name));
	const suggestions = $derived.by(() => {
		const q = fold(pending);
		const taken = new Set(selected.map(fold));
		return tags.filter((t) => !taken.has(fold(t.name)) && fold(t.name).includes(q)).slice(0, 4);
	});

	let root: HTMLElement;

	function add(raw: string) {
		const typed = raw.normalize('NFC').trim().replace(/\s+/g, ' ');
		if (!typed || selected.some((s) => fold(s) === fold(typed))) return;
		selected.push(known.get(fold(typed)) ?? typed);
	}

	function remove(name: string) {
		selected.splice(selected.indexOf(name), 1);
		root.querySelector<HTMLInputElement>('input:not([type=hidden])')?.focus();
	}

	// a comma confirms what came before it, which also covers pasting "a, b, c"
	function onInput() {
		if (!pending.includes(',')) return;
		const parts = pending.split(',');
		pending = parts.pop() ?? '';
		parts.forEach(add);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			add(pending);
			pending = '';
		} else if (event.key === 'Backspace' && pending === '' && selected.length > 0) {
			selected.pop();
		}
	}

	const leave = () => ({ duration: reducedMotion() ? 0 : 140 });
</script>

<div class="tags" bind:this={root}>
	{#if selected.length > 0}
		<ul class="chips" aria-label="Selected tags">
			{#each selected as name (fold(name))}
				<li class="chip" animate:flip={flipOptions()} in:pop out:fade={leave()}>
					<input type="hidden" name="tag" value={name} />
					<span class="t">{name}</span>
					{#if isNew(name)}<span class="mark">new</span>{/if}
					<button type="button" class="x" aria-label="Remove {name}" onclick={() => remove(name)}><Icon name="x" size={14} /></button>
				</li>
			{/each}
		</ul>
	{/if}
	<Field
		label="Add a tag"
		hideLabel
		name="tag"
		bind:value={pending}
		oninput={onInput}
		onkeydown={onKeydown}
		placeholder="Add a tag"
		autocomplete="off"
		enterkeyhint="done"
	/>
	{#if suggestions.length > 0}
		<div class="chips" role="group" aria-label="Tag suggestions">
			{#each suggestions as tag (tag.id)}
				<span animate:flip={flipOptions()} in:pop out:fade={leave()}>
					<button
						type="button"
						class="chip suggest"
						data-press
						onclick={() => {
							add(tag.name);
							pending = '';
						}}
					><Icon name="plus" size={14} /><span class="t">{tag.name}</span></button>
				</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.tags {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
		min-inline-size: 0;
	}
	.chips > span {
		display: contents;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-xs), var(--target));
		padding-inline: var(--space-3);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
	}
	.t {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		text-align: start;
	}
	.mark {
		font-size: var(--type-overline-size);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
	.x {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--target);
		block-size: var(--target);
		margin-inline-end: calc(-1 * var(--space-2));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: none;
		color: var(--ink);
	}
	.suggest {
		border: 0;
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-weight: var(--weight-medium);
	}
</style>
