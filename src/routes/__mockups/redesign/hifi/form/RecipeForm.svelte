<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import Button from '../shell/Button.svelte';
	import Ic from '../recipes/Ic.svelte';
	import Picture from '../recipes/Picture.svelte';
	import { go } from '../recipes/util.ts';
	import Area from './Area.svelte';
	import Field from './Field.svelte';
	import { parsedText } from './parse.ts';
	import SaveBar from './SaveBar.svelte';

	type Errors = { title?: boolean; servings?: boolean; minutes?: boolean };
	type Part = 'basics' | 'ing' | 'met' | 'notes' | 'photo' | 'tags' | 'actions';
	type Props = {
		recipe?: MockRecipeFull | null;
		photo?: 'none' | 'image' | 'heic' | 'toolarge' | 'link';
		errors?: Errors;
		saving?: boolean;
		// "bar" is the sticky Save (the screens), "inline" a plain row at the end (the state specimens)
		save?: 'bar' | 'inline';
		limit?: number | null;
		cancelTo?: 'recipes' | 'recipe';
		heading?: string;
		worst?: boolean;
		newTags?: string[];
		suggestions?: string[];
		parts?: Part[] | null;
	};
	let { recipe = null, photo = 'none', errors = {}, saving = false, save = 'bar', limit = null, cancelTo = 'recipes', heading = 'The recipe', worst = false, newTags = [], suggestions = ['Baking', 'Breakfast', 'Dessert', 'Quick'], parts = null }: Props = $props();

	const uid = $props.id();
	const has = (part: Part) => !parts || parts.includes(part);
	const ingredients = $derived(recipe?.ingredients.length ? recipe.ingredients : [{ title: null, lines: [''] }]);
	const steps = $derived(recipe?.steps.length ? recipe.steps : [{ title: null, lines: [''] }]);
	const tags = $derived(recipe?.tags ?? []);
	const cut = <T,>(items: T[]) => (limit === null ? items : items.slice(0, limit));
	const fileName = $derived(photo === 'heic' ? 'IMG_4821.HEIC' : photo === 'toolarge' ? 'sunday-roast-original.jpg' : photo === 'image' ? 'pumpkin-soup.jpg' : '');
	const hasImage = $derived(photo === 'image' || photo === 'link');
	const stepStart = $derived(steps.map((_, i) => steps.slice(0, i).reduce((sum, section) => sum + section.lines.length, 0)));
	const solo = $derived(parts !== null);
</script>

<form id="{uid}-form" class="form" class:solo aria-label="Recipe form" onsubmit={(e) => e.preventDefault()}>
	{#if has('basics')}
		<div class="main-lead">
			<section class="card" data-surface="solid" aria-labelledby="{uid}-basics">
				<div class="card-head"><h2 id="{uid}-basics">{heading}</h2></div>
				<Field label="Title" value={errors.title ? '' : (recipe?.title ?? '')} error={errors.title ? 'Title is required' : undefined} />
				<Area label="Description (optional)" rows={3} value={recipe?.description ?? ''} />
				<div class="trio">
					<Field label="Servings" inputmode="numeric" autocomplete="off" value={errors.servings ? '0' : String(recipe?.servings ?? 2)} error={errors.servings ? 'Servings must be at least 1' : undefined} />
					<Field label="Prep, min" inputmode="numeric" autocomplete="off" value={errors.minutes ? '1.5' : String(recipe?.prepMinutes ?? '')} error={errors.minutes ? 'Enter whole minutes, 0 or more' : undefined} />
					<Field label="Cook, min" inputmode="numeric" autocomplete="off" value={String(recipe?.cookMinutes ?? '')} />
				</div>
				<Field label="Source (optional)" type="url" inputmode="url" autocapitalize="off" value={recipe?.sourceUrl ?? ''} />
			</section>
		</div>
	{/if}

	{#if has('photo') || has('tags')}
		<aside class="side">
			{#if has('photo')}
				<section class="card" data-surface="solid" aria-labelledby="{uid}-photo">
					<div class="card-head"><h2 id="{uid}-photo">Photo</h2></div>
					<Picture title={recipe?.title ?? 'New recipe'} image={hasImage ? (recipe?.image ?? '/mockups/pumpkin-soup.jpg') : null} ratio={hasImage ? '4 / 3' : '16 / 9'} />
					<div class="photo-actions">
						<Button size="s">{hasImage ? 'Replace' : 'Add photo'}</Button>
						{#if hasImage}<Button variant="quiet" size="s">Remove image</Button>{/if}
						<input class="sr-only" type="file" accept="image/*" aria-label="Photo file" tabindex="-1" />
					</div>
					{#if fileName}<p class="hint">{fileName}</p>{/if}
					{#if photo === 'heic'}<p class="error" role="alert"><Ic name="alert" size={14} />That file isn't an image</p>{/if}
					{#if photo === 'toolarge'}<p class="error" role="alert"><Ic name="alert" size={14} />Images can be at most 15 MB</p>{/if}
					<Field label="Image link" type="url" inputmode="url" autocapitalize="off" placeholder="Or paste an image link" value={photo === 'link' ? 'https://example.com/images/pumpkin-soup.jpg' : ''} />
				</section>
			{/if}

			{#if has('tags')}
				<section class="card" data-surface="solid" aria-labelledby="{uid}-tags">
					<div class="card-head"><h2 id="{uid}-tags">Tags</h2><span class="card-note">{tags.length}</span></div>
					{#if tags.length}
						<ul class="chips" aria-label="Selected tags">
							{#each tags.slice(0, 12) as tag (tag)}
								<li class="chip">
									<span class="t">{tag}</span>
									{#if newTags.includes(tag)}<span class="mark">new</span>{/if}
									<button type="button" class="x" aria-label="Remove {tag}"><Ic name="close" size={14} /></button>
								</li>
							{/each}
						</ul>
					{/if}
					{#if tags.length > 12}<p class="hint">+{tags.length - 12} more tags</p>{/if}
					<Field label="Add a tag" hideLabel placeholder="Add a tag" autocomplete="off" />
					<div class="chips" role="group" aria-label="Tag suggestions">
						{#each suggestions.filter((t) => !tags.includes(t)) as tag (tag)}<button type="button" class="chip suggest" data-press><Ic name="plus" size={14} />{tag}</button>{/each}
					</div>
				</section>
			{/if}
		</aside>
	{/if}

	{#if has('ing') || has('met') || has('notes')}
		<div class="main-rest">
			{#if has('ing')}
				<section class="card" data-surface="solid" aria-labelledby="{uid}-ing">
					<div class="card-head"><h2 id="{uid}-ing">Ingredients</h2></div>
					{#each ingredients as section, s (s)}
						<div class="section" role="group" aria-label="Ingredient section {s + 1}">
							<div class="section-head">
								<Field label="Section title" hideLabel placeholder="Section title (optional)" value={section.title ?? ''} />
								{#if ingredients.length > 1}<Button variant="quiet" size="s">Remove section</Button>{/if}
							</div>
							{#each cut(section.lines) as line, n (n)}
								<div class="line">
									<div class="line-main">
										<Field label="Ingredient line" hideLabel value={line} />
										{#if section.lines.length > 1}<Button variant="quiet" icon label="Remove line"><Ic name="close" /></Button>{/if}
									</div>
									{#if line}<p class="parsed" role="group" aria-label="Parsed ingredient">{parsedText(line)}</p>{/if}
								</div>
							{/each}
							{#if limit !== null && section.lines.length > limit}<p class="parsed">… and {section.lines.length - limit} more lines</p>{/if}
							<Button size="s" class="add"><Ic name="plus" size={16} />Add line</Button>
						</div>
					{/each}
					<Button class="add"><Ic name="plus" size={16} />Add ingredient section</Button>
				</section>
			{/if}

			{#if has('met')}
				<section class="card" data-surface="solid" aria-labelledby="{uid}-met">
					<div class="card-head"><h2 id="{uid}-met">Method</h2></div>
					{#each steps as section, s (s)}
						<div class="section" role="group" aria-label="Step section {s + 1}">
							<div class="section-head">
								<Field label="Section title" hideLabel placeholder="Section title (optional)" value={section.title ?? ''} />
								{#if steps.length > 1}<Button variant="quiet" size="s">Remove section</Button>{/if}
							</div>
							{#each cut(section.lines) as line, n (n)}
								<div class="line-main step">
									<span class="num" aria-hidden="true">{stepStart[s] + n + 1}</span>
									<Area label="Step {stepStart[s] + n + 1}" hideLabel rows={3} placeholder={n === 0 && s === 0 ? 'Describe the first step' : ''} value={line} />
									{#if section.lines.length > 1}<Button variant="quiet" icon label="Remove step"><Ic name="close" /></Button>{/if}
								</div>
							{/each}
							<Button size="s" class="add"><Ic name="plus" size={16} />Add step</Button>
						</div>
					{/each}
					<Button class="add"><Ic name="plus" size={16} />Add step section</Button>
				</section>
			{/if}

			{#if has('notes')}
				<section class="card" data-surface="solid" aria-labelledby="{uid}-notes">
					<div class="card-head"><h2 id="{uid}-notes">Notes</h2></div>
					<Area label="Notes" hideLabel rows={4} placeholder="Tips, variations, storage. Markdown works." value={recipe?.notes ?? ''} />
				</section>
			{/if}
		</div>
	{/if}

	{#if has('actions') && save === 'inline'}
		<div class="actions">
			<Button variant="quiet" href={cancelTo === 'recipe' ? go.recipe(worst) : go.recipes(worst)}>Cancel</Button>
			<Button variant="primary" arrow type="submit" loading={saving} loadingLabel="">{saving ? 'Saving…' : 'Save recipe'}</Button>
		</div>
	{/if}
</form>

{#if has('actions') && save === 'bar'}<SaveBar form="{uid}-form" {cancelTo} {saving} {worst} />{/if}

<style>
	.form {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.main-lead,
	.main-rest,
	.side {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		min-inline-size: 0;
	}
	.card {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.card-head h2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
	}
	.trio {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
		gap: var(--space-3);
		min-inline-size: 0;
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
	.line-main.step {
		align-items: flex-start;
	}
	.line-main .num {
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
	.line {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
	}
	.parsed {
		padding-inline-start: var(--space-4);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}
	.form :global(.add) {
		justify-self: start;
	}
	.photo-actions {
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
	.error {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-weight: var(--weight-semibold);
		color: var(--danger);
	}
	.error :global(svg) {
		display: inline;
		vertical-align: -0.15em;
		margin-inline-end: var(--space-1);
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
	.chip .t {
		min-inline-size: 0;
		overflow-wrap: anywhere;
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
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	@media (min-width: 768px) {
		.form:not(.solo) {
			grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
			grid-template-rows: auto 1fr;
			align-items: start;
		}
		.form:not(.solo) > .main-lead {
			grid-area: 1 / 1;
		}
		.form:not(.solo) > .main-rest {
			grid-area: 2 / 1;
		}
		.form:not(.solo) > .side {
			grid-area: 1 / 2 / span 2;
		}
	}
</style>
