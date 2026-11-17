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
	import { flip } from 'svelte/animate';
	import { parseIngredient } from '#lib/ingredients/parse.ts';
	import { arrive, flipOptions, pop, slideOut } from '#lib/motion.ts';
	import { tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Area from './Area.svelte';

	let { kind, sections = $bindable() }: { kind: 'ingredients' | 'steps'; sections: EditorSection[] } = $props();

	const steps = $derived(kind === 'steps');
	const noun = $derived(steps ? 'Step' : 'Ingredient');
	const examples = ['e.g. 2 tbsp olive oil', 'e.g. 200 g butter, softened', 'e.g. 3 eggs'];

	let root: HTMLElement;

	const amount = (q: number) => String(Number(q.toFixed(2)));

	// a step number counts on through the sections, like the recipe page numbers them
	const before = (si: number) => sections.slice(0, si).reduce((n, s) => n + s.lines.length, 0);

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

<div class="editor" bind:this={root}>
	{#each sections as section, si (section.id)}
		<div class="section" role="group" aria-label="{noun} section {si + 1}" animate:flip={flipOptions()} in:arrive out:slideOut>
			<div class="section-head">
				<Field
					label="Section title"
					hideLabel
					name={steps ? 'stepSection' : 'ingredientSection'}
					bind:value={section.title}
					placeholder="Section title (optional)"
					autocomplete="off"
				/>
				{#if sections.length > 1}
					<Button variant="quiet" size="s" onclick={() => removeSection(si)}>Remove section</Button>
				{/if}
			</div>

			<ol class="lines">
				{#each section.lines as line, li (line.id)}
					<li class="line" animate:flip={flipOptions()} in:arrive out:slideOut>
						{#if steps}
							<div class="line-main step">
								<span class="num" aria-hidden="true">{before(si) + li + 1}</span>
								<Area
									label="Step {li + 1}"
									hideLabel
									name="stepLine"
									rows={2}
									bind:value={line.text}
									data-line={line.id}
									placeholder={li === 0 && si === 0 ? 'Describe the first step' : ''}
								/>
								{#if section.lines.length > 1}
									<Button variant="quiet" icon label="Remove step" onclick={() => removeLine(section, li)}>
										<Icon name="x" size={18} />
									</Button>
								{/if}
							</div>
						{:else}
							<div class="line-main">
								<Field
									label="Ingredient line"
									hideLabel
									name="ingredientLine"
									bind:value={line.text}
									data-line={line.id}
									onkeydown={(e: KeyboardEvent) => onEnter(e, section, li)}
									placeholder={examples[li % examples.length]}
									autocomplete="off"
								/>
								{#if section.lines.length > 1}
									<Button variant="quiet" icon label="Remove line" onclick={() => removeLine(section, li)}>
										<Icon name="x" size={18} />
									</Button>
								{/if}
							</div>
							{#if line.text.trim()}
								{@const parsed = parseIngredient(line.text)}
								<div class="parse-wrap" in:arrive>
									<p class="parse" role="group" aria-label="Parsed ingredient">
										{#if parsed.quantity !== null}
											<span class="tok q" data-part="quantity" in:pop>{amount(parsed.quantity)}</span>
										{/if}
										{#if parsed.unit}<span class="tok u" data-part="unit" in:pop>{parsed.unit}</span>{/if}
										{#if parsed.name}<span class="name" data-part="name">{parsed.name}</span>{/if}
										{#if parsed.note}<span class="note" data-part="note">{parsed.note}</span>{/if}
										{#if parsed.quantity === null}<span class="note" data-part="no-amount">no amount</span>{/if}
									</p>
								</div>
							{/if}
						{/if}
					</li>
				{/each}
			</ol>

			<Button size="s" class="add" onclick={() => addLine(section)}>
				<Icon name="plus" size={16} />{steps ? 'Add step' : 'Add line'}
			</Button>
		</div>
	{/each}

	<Button class="add" onclick={addSection}>
		<Icon name="plus" size={16} />Add {steps ? 'step' : 'ingredient'} section
	</Button>
</div>

<style>
	.editor {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.editor :global(.add) {
		justify-self: start;
	}
	.section {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		min-inline-size: 0;
	}
	.section-head,
	.line-main {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-inline-size: 0;
	}
	.section-head > :global(.field),
	.line-main > :global(.field) {
		flex: 1;
	}
	.section-head > :global(.btn),
	.line-main > :global(.btn) {
		flex: none;
	}
	.lines {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
		min-inline-size: 0;
	}
	.line {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
	}
	.line-main.step {
		align-items: flex-start;
	}
	.num {
		flex: none;
		inline-size: var(--space-6);
		padding-block-start: var(--space-2-5);
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
	.parse {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-1-5);
		padding-inline-start: var(--space-4);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink);
		overflow-wrap: anywhere;
		min-inline-size: 0;
	}
	.tok {
		padding-inline: var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-tint-strong);
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}
	.u {
		background: var(--surface-tint);
	}
	.name {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.note {
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}
</style>
