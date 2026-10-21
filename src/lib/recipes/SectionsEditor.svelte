<script lang="ts" module>
	import type { Section } from '#lib/types.ts';

	export interface EditorLine {
		id: number;
		text: string;
	}
	export interface EditorSection {
		id: number;
		title: string;
		lines: EditorLine[];
	}

	let uid = 0;
	const nextId = () => ++uid;

	// a form always shows at least one section with `blankLines` empty lines to type into
	export function toEditor(sections: Section<string>[], blankLines: number): EditorSection[] {
		const make = (s: Section<string>): EditorSection => ({
			id: nextId(),
			title: s.title ?? '',
			lines: s.lines.map((text) => ({ id: nextId(), text }))
		});
		if (sections.length > 0) return sections.map(make);
		return [make({ title: null, lines: Array.from({ length: blankLines }, () => '') })];
	}

	export const plain = (sections: EditorSection[]) =>
		sections.map((s) => [s.title, s.lines.map((l) => l.text)] as const);
</script>

<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { parseIngredient } from '#lib/ingredients/parse.ts';
	import { pop, reducedMotion } from '#lib/motion.ts';
	import { tick } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';

	let { kind, sections = $bindable() }: { kind: 'ingredients' | 'steps'; sections: EditorSection[] } = $props();

	const steps = $derived(kind === 'steps');
	const noun = $derived(steps ? 'Step' : 'Ingredient');
	const examples = ['e.g. 2 tbsp olive oil', 'e.g. 200 g butter, softened', 'e.g. 3 eggs'];

	let root: HTMLElement;

	// Rows make room for each other, so they animate height and opacity (slide), unlike the transform-only entrances.
	const collapse = () => ({ duration: reducedMotion() ? 0 : 240, easing: cubicOut });
	const amount = (q: number) => String(Number(q.toFixed(2)));

	async function addLine(section: EditorSection, after = section.lines.length - 1) {
		const line = { id: nextId(), text: '' };
		section.lines.splice(after + 1, 0, line);
		await tick();
		root.querySelector<HTMLElement>(`[data-line="${line.id}"]`)?.focus();
	}

	function removeLine(section: EditorSection, index: number) {
		section.lines.splice(index, 1);
	}

	async function addSection() {
		const lines = [{ id: nextId(), text: '' }];
		const section = { id: nextId(), title: '', lines };
		sections.push(section);
		await tick();
		root.querySelector<HTMLElement>(`[data-line="${lines[0].id}"]`)?.focus();
	}

	function removeSection(index: number) {
		sections.splice(index, 1);
	}

	// Enter would otherwise submit the whole form from a line input
	function onEnter(event: KeyboardEvent, section: EditorSection, index: number) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		addLine(section, index);
	}
</script>

<div class="editor" class:steps bind:this={root}>
	{#each sections as section, si (section.id)}
		<div class="section" role="group" aria-label="{noun} section {si + 1}" transition:slide={collapse()}>
			<div class="section-head">
				<input
					class="section-title"
					name={steps ? 'stepSection' : 'ingredientSection'}
					bind:value={section.title}
					placeholder="Section title (optional)"
					aria-label="Section title"
				/>
				{#if sections.length > 1}
					<IconButton icon="trash" label="Remove section" variant="plain" onclick={() => removeSection(si)} />
				{/if}
			</div>

			<ol class="lines">
				{#each section.lines as line, li (line.id)}
					<li class="line" transition:slide={collapse()}>
						{#if steps}
							<span class="no tnum">{String(li + 1).padStart(2, '0')}</span>
							<textarea
								name="stepLine"
								rows="2"
								bind:value={line.text}
								data-line={line.id}
								aria-label="Step {li + 1}"
								placeholder={li === 0 ? 'Describe the first step' : ''}
							></textarea>
						{:else}
							<div class="line-body">
								<input
									name="ingredientLine"
									bind:value={line.text}
									data-line={line.id}
									onkeydown={(e) => onEnter(e, section, li)}
									aria-label="Ingredient line"
									placeholder={examples[li % examples.length]}
									autocomplete="off"
								/>
								{#if line.text.trim()}
									{@const parsed = parseIngredient(line.text)}
									<div class="parse-wrap" transition:slide={collapse()}>
										<p class="parse" role="group" aria-label="Parsed ingredient">
											{#if parsed.quantity !== null}
												<span class="tok q tnum" data-part="quantity" in:pop>{amount(parsed.quantity)}</span>
											{/if}
											{#if parsed.unit}<span class="tok u" data-part="unit" in:pop>{parsed.unit}</span>{/if}
											{#if parsed.name}<span class="name" data-part="name">{parsed.name}</span>{/if}
											{#if parsed.note}<span class="note" data-part="note">{parsed.note}</span>{/if}
											{#if parsed.quantity === null}<span class="note" data-part="no-amount">no amount</span>{/if}
										</p>
									</div>
								{/if}
							</div>
						{/if}
						{#if section.lines.length > 1}
							<IconButton
								icon="x"
								label="Remove {steps ? 'step' : 'line'}"
								variant="plain"
								onclick={() => removeLine(section, li)}
							/>
						{/if}
					</li>
				{/each}
			</ol>

			<Button variant="ghost" arrow={false} icon="plus" onclick={() => addLine(section)}>
				{steps ? 'Add step' : 'Add line'}
			</Button>
		</div>
	{/each}

	<Button variant="secondary" arrow={false} icon="plus" onclick={addSection}>
		Add {steps ? 'step' : 'ingredient'} section
	</Button>
</div>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-4);
	}

	.section {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-2);
		inline-size: 100%;
	}

	.section-head {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		inline-size: 100%;
	}

	.lines {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		inline-size: 100%;
	}

	.line {
		display: flex;
		align-items: flex-start;
		gap: var(--s-2);
	}

	.line-body {
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
		min-inline-size: 0;
	}

	.parse {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		padding-inline-start: 4px;
		font-size: 12px;
		color: var(--ink);
	}

	.tok {
		display: inline-block;
		padding: 2px 8px;
		border-radius: var(--r-pill);
		font-weight: 600;
	}

	.q {
		background: var(--olive-soft);
		color: var(--olive);
	}

	.u {
		background: var(--sand);
		color: var(--ink);
	}

	.name {
		font-weight: 500;
	}

	.note {
		font-style: italic;
		color: var(--ink-2);
	}

	.steps .line {
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr) auto;
	}

	.no {
		padding-block-start: 10px;
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 300;
		color: var(--brick);
	}

	input,
	textarea {
		inline-size: 100%;
		min-block-size: 46px;
		padding: 11px 14px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--white);
		font-size: 15px;
		line-height: 1.45;
	}

	.line input {
		min-block-size: 42px;
		padding-block: 9px;
	}

	textarea {
		resize: vertical;
		field-sizing: content;
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--ink-2);
	}

	input:focus-visible,
	textarea:focus-visible {
		border-color: var(--olive);
		box-shadow: 0 0 0 3px var(--olive-wash);
		border-radius: var(--r-sm);
	}

	.section-title {
		flex: 1;
		border-style: dashed;
		background: transparent;
		font-family: var(--font-display);
		font-style: italic;
		font-size: 18px;
		color: var(--olive);
	}
</style>
