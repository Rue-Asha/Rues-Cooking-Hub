<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import Grey from '../recipes/Grey.svelte';
	import Icon from '../recipes/Icon.svelte';
	import { wire } from '../recipes/util.ts';
	import { parsedText } from './parse.ts';

	type Errors = { title?: boolean; servings?: boolean; minutes?: boolean };
	type Props = {
		recipe?: MockRecipeFull | null;
		photo?: 'none' | 'image' | 'heic' | 'toolarge' | 'link';
		errors?: Errors;
		saving?: boolean;
		save?: 'bar' | 'head';
		limit?: number | null;
		cancelTo?: string;
		worst?: boolean;
		newTags?: string[];
		suggestions?: string[];
		parts?: ('basics' | 'ing' | 'met' | 'notes' | 'photo' | 'tags' | 'actions')[] | null;
	};
	let { recipe = null, photo = 'none', errors = {}, saving = false, save = 'bar', limit = null, cancelTo = 'recipes', worst = false, newTags = [], suggestions = ['Baking', 'Breakfast', 'Dessert', 'Quick'], parts = null }: Props = $props();

	const uid = $props.id();
	const has = (part: string) => !parts || (parts as string[]).includes(part);
	const ingredients = $derived(recipe?.ingredients.length ? recipe.ingredients : [{ title: null, lines: [''] }]);
	const steps = $derived(recipe?.steps.length ? recipe.steps : [{ title: null, lines: [''] }]);
	const tags = $derived(recipe?.tags ?? []);
	const cut = <T,>(items: T[]) => (limit === null ? items : items.slice(0, limit));
	const fileName = $derived(photo === 'heic' ? 'IMG_4821.HEIC' : photo === 'toolarge' ? 'sunday-roast-original.jpg' : photo === 'image' ? 'pumpkin-soup.jpg' : '');
	const hasImage = $derived(photo === 'image' || photo === 'link');
</script>

{#snippet actions(extra: string)}
	<div class="actions {extra}">
		<a class="w-btn quiet" href={wire(cancelTo, worst)}>Cancel</a>
		<button type="button" class="w-btn primary" disabled={saving} aria-disabled={saving}>{saving ? 'Saving…' : 'Save recipe'}</button>
	</div>
{/snippet}

<form class="form" class:solo={parts !== null} aria-label="Recipe form" onsubmit={(e) => e.preventDefault()}>
	{#if save === 'head' && has('actions')}{@render actions('head-actions')}{/if}

	<div class="main" class:gone={parts !== null && !has('basics') && !has('ing') && !has('met') && !has('notes')}>
		{#if has('basics')}
<section class="w-card" aria-labelledby="{uid}-basics">
			<div class="w-card-head"><h2 id="{uid}-basics">The recipe</h2></div>
			<div class="w-field">
				<label for="{uid}-title">Title</label>
				<input id="{uid}-title" class="w-input" value={errors.title ? '' : (recipe?.title ?? '')} aria-invalid={errors.title ?? false} aria-describedby={errors.title ? `${uid}-title-e` : undefined} />
				{#if errors.title}<p class="w-error" id="{uid}-title-e"><Icon name="alert" size={14} />Title is required</p>{/if}
			</div>
			<div class="w-field">
				<label for="{uid}-desc">Description <span class="w-opt">(optional)</span></label>
				<textarea id="{uid}-desc" class="w-input" rows="3">{recipe?.description ?? ''}</textarea>
			</div>
			<div class="trio">
				<div class="w-field">
					<label for="{uid}-serv">Servings</label>
					<input id="{uid}-serv" class="w-input" inputmode="numeric" value={errors.servings ? '0' : (recipe?.servings ?? 2)} aria-invalid={errors.servings ?? false} aria-describedby={errors.servings ? `${uid}-serv-e` : undefined} />
				</div>
				<div class="w-field">
					<label for="{uid}-prep">Prep, min</label>
					<input id="{uid}-prep" class="w-input" inputmode="numeric" value={errors.minutes ? '1.5' : (recipe?.prepMinutes ?? '')} aria-invalid={errors.minutes ?? false} aria-describedby={errors.minutes ? `${uid}-min-e` : undefined} />
				</div>
				<div class="w-field">
					<label for="{uid}-cook">Cook, min</label>
					<input id="{uid}-cook" class="w-input" inputmode="numeric" value={recipe?.cookMinutes ?? ''} />
				</div>
			</div>
			{#if errors.servings}<p class="w-error" id="{uid}-serv-e"><Icon name="alert" size={14} />Servings must be at least 1</p>{/if}
			{#if errors.minutes}<p class="w-error" id="{uid}-min-e"><Icon name="alert" size={14} />Enter whole minutes, 0 or more</p>{/if}
			<div class="w-field">
				<label for="{uid}-src">Source <span class="w-opt">(optional)</span></label>
				<input id="{uid}-src" class="w-input" type="url" value={recipe?.sourceUrl ?? ''} />
			</div>
		</section>
{/if}

		{#if has('ing')}
<section class="w-card" aria-labelledby="{uid}-ing">
			<div class="w-card-head"><h2 id="{uid}-ing">Ingredients</h2></div>
			{#each ingredients as section, s (s)}
				<div class="section" role="group" aria-label="Ingredient section {s + 1}">
					<div class="section-head">
						<input class="w-input" aria-label="Section title" placeholder="Section title (optional)" value={section.title ?? ''} />
						{#if ingredients.length > 1}<button type="button" class="w-btn quiet s">Remove section</button>{/if}
					</div>
					{#each cut(section.lines) as line, n (n)}
						<div class="line">
							<div class="line-main">
								<input class="w-input" aria-label="Ingredient line" value={line} />
								{#if section.lines.length > 1}<button type="button" class="w-icon" aria-label="Remove line"><Icon name="x" /></button>{/if}
							</div>
							{#if line}<p class="parsed w-hint" role="group" aria-label="Parsed ingredient">{parsedText(line)}</p>{/if}
						</div>
					{/each}
					{#if limit !== null && section.lines.length > limit}<p class="w-hint">… and {section.lines.length - limit} more lines</p>{/if}
					<button type="button" class="w-btn s add"><Icon name="plus" size={16} />Add line</button>
				</div>
			{/each}
			<button type="button" class="w-btn add"><Icon name="plus" size={16} />Add ingredient section</button>
		</section>
{/if}

		{#if has('met')}
<section class="w-card" aria-labelledby="{uid}-met">
			<div class="w-card-head"><h2 id="{uid}-met">Method</h2></div>
			{#each steps as section, s (s)}
				<div class="section" role="group" aria-label="Step section {s + 1}">
					<div class="section-head">
						<input class="w-input" aria-label="Section title" placeholder="Section title (optional)" value={section.title ?? ''} />
						{#if steps.length > 1}<button type="button" class="w-btn quiet s">Remove section</button>{/if}
					</div>
					{#each cut(section.lines) as line, n (n)}
						<div class="line-main step">
							<textarea class="w-input" rows="3" aria-label="Step {n + 1}" placeholder={n === 0 && s === 0 ? 'Describe the first step' : ''}>{line}</textarea>
							{#if section.lines.length > 1}<button type="button" class="w-icon" aria-label="Remove step"><Icon name="x" /></button>{/if}
						</div>
					{/each}
					<button type="button" class="w-btn s add"><Icon name="plus" size={16} />Add step</button>
				</div>
			{/each}
			<button type="button" class="w-btn add"><Icon name="plus" size={16} />Add step section</button>
		</section>
{/if}

		{#if has('notes')}
<section class="w-card" aria-labelledby="{uid}-notes">
			<div class="w-card-head"><h2 id="{uid}-notes">Notes</h2></div>
			<textarea class="w-input" rows="4" aria-label="Notes" placeholder="Tips, variations, storage. Markdown works.">{recipe?.notes ?? ''}</textarea>
		</section>
{/if}
	</div>

	<aside class="side" class:gone={!has('photo') && !has('tags')}>
		{#if has('photo')}
<section class="w-card" aria-labelledby="{uid}-photo">
			<div class="w-card-head"><h2 id="{uid}-photo">Photo</h2></div>
			{#if hasImage}<Grey label="Photo" ratio="4 / 3" />{:else}<Grey plate ratio="4 / 3" />{/if}
			<div class="photo-actions">
				<button type="button" class="w-btn s">{hasImage ? 'Replace' : 'Add photo'}</button>
				{#if hasImage}<button type="button" class="w-btn quiet s">Remove image</button>{/if}
				<input class="sr-only" type="file" accept="image/*" aria-label="Photo file" tabindex="-1" />
			</div>
			{#if fileName}<p class="w-hint">{fileName}</p>{/if}
			{#if photo === 'heic'}<p class="w-error" role="alert"><Icon name="alert" size={14} />That file isn't an image</p>{/if}
			{#if photo === 'toolarge'}<p class="w-error" role="alert"><Icon name="alert" size={14} />Images can be at most 15 MB</p>{/if}
			<div class="w-field">
				<label for="{uid}-link">Image link</label>
				<input id="{uid}-link" class="w-input" placeholder="Or paste an image link" value={photo === 'link' ? 'https://example.com/images/pumpkin-soup.jpg' : ''} />
			</div>
		</section>
{/if}

		{#if has('tags')}
<section class="w-card" aria-labelledby="{uid}-tags">
			<div class="w-card-head"><h2 id="{uid}-tags">Tags</h2><span class="w-note">{tags.length}</span></div>
			<ul class="w-chips picked" aria-label="Selected tags">
				{#each tags.slice(0, 12) as tag (tag)}
					<li class="w-tag" class:new={newTags.includes(tag)}>{tag}{#if newTags.includes(tag)}<span class="mark">new</span>{/if}<button type="button" class="w-icon x" aria-label="Remove {tag}"><Icon name="x" size={14} /></button></li>
				{/each}
			</ul>
			{#if tags.length > 12}<p class="w-hint">+{tags.length - 12} more tags</p>{/if}
			<div class="w-field">
				<label for="{uid}-tag" class="sr-only">Add a tag</label>
				<input id="{uid}-tag" class="w-input" placeholder="Add a tag" />
			</div>
			<div class="w-chips" role="group" aria-label="Tag suggestions">
				{#each suggestions.filter((t) => !tags.includes(t)) as tag (tag)}<button type="button" class="w-chip"><Icon name="plus" size={14} />{tag}</button>{/each}
			</div>
		</section>
{/if}
	</aside>

	{#if save === 'bar' && has('actions')}{@render actions('bar-actions')}{/if}
</form>

<style>
	.form {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}

	.main,
	.side {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		min-inline-size: 0;
	}

	.side {
		order: -1;
	}

	.gone {
		display: none;
	}

	.form.solo {
		grid-template-columns: minmax(0, 1fr);
	}

	.trio {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
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

	.line-main.step {
		align-items: flex-start;
	}

	.line-main :global(.w-input),
	.section-head :global(.w-input) {
		flex: 1;
	}

	.line {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
	}

	.parsed {
		padding-inline-start: var(--space-4);
	}

	.add {
		justify-self: start;
	}

	.photo-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.picked {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.picked .w-tag {
		gap: var(--space-1);
		padding-inline-end: var(--space-1);
	}

	.picked .x {
		inline-size: var(--target);
		block-size: var(--target);
	}

	.mark {
		font-size: var(--type-overline-size);
		text-transform: uppercase;
		letter-spacing: var(--type-overline-tracking);
		color: var(--ink-secondary);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}

	.bar-actions {
		position: sticky;
		inset-block-end: calc(var(--target-touch) + var(--space-8));
		z-index: var(--z-raised);
		padding: var(--space-3);
		border-radius: var(--radius-card-s);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}

	@media (min-width: 768px) {
		.form:not(.solo) {
			grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
			align-items: start;
		}

		.side {
			order: 0;
		}

		.bar-actions,
		.head-actions {
			grid-column: 1 / -1;
		}

		.bar-actions {
			inset-block-end: var(--space-3);
		}
	}
</style>
