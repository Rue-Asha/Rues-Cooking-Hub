<script lang="ts">
	import { detail, fallbackDraft, importDraft, parsed, photo } from '#lib/mockups/fixtures.ts';
	import Button from '#lib/ui/Button.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

	// /__mockups/import-fallback renders this page with fallback set
	let { fallback = false }: { fallback?: boolean } = $props();

	const url = $derived(fallback ? fallbackDraft.url : importDraft.url);
	const title = $derived(fallback ? fallbackDraft.title : 'Roasted pumpkin soup with sage brown butter');
	const image = $derived(fallback ? fallbackDraft.image : detail.recipe.image);
	const brownButter = ['60 g butter', '1 bunch sage', '2 slices sourdough, cubed'];
</script>

<div class="column page" data-column>
	<header data-page-header>
		<Kicker parts={['Recipes', 'New']} />
		<h1>Bring a recipe <em>home</em></h1>
	</header>

	<section class="band" aria-label="Import from a link">
		<img src={photo('penne-arrabbiata')} alt="" />
		<GlassPanel as="form" strong class="import" onsubmit={(e: SubmitEvent) => e.preventDefault()}>
			<label class="url-label" for="url">Paste a link to a recipe page</label>
			<div class="url-row">
				<div class="url-field">
					<Icon name="link" size={18} />
					<input id="url" type="url" value={url} />
				</div>
				<Button type="submit">Import</Button>
			</div>
			<p class="url-help">
				Works with most recipe sites. Nothing to import?
				<a href="/__mockups/import">Start from scratch <Icon name="arrow-right" size={14} /></a>
			</p>
		</GlassPanel>
	</section>

	<section class="preview" aria-labelledby="preview-title">
		<div class="preview-head">
			<h2 id="preview-title" data-section-heading>{fallback ? 'Fill in the rest' : 'Check and save'}</h2>
			<div class="save">
				<Button variant="secondary" arrow={false}>Cancel</Button>
				<Button variant="olive">Save recipe</Button>
			</div>
		</div>

		{#if fallback}
			<div class="banner fail" role="alert">
				<Icon name="alert" size={20} />
				<div>
					<p class="banner-title">Couldn’t read a recipe from this page</p>
					<p>We kept the link, the title and the photo from {fallbackDraft.site}. Add ingredients and steps below.</p>
				</div>
			</div>
		{:else}
			<div class="banner ok">
				<Icon name="check" size={20} />
				<div>
					<p class="banner-title">Read from {importDraft.site}</p>
					<p>Everything stays editable. New tags are created when you save.</p>
				</div>
			</div>
		{/if}

		<div class="form">
			<div class="meta">
				<h3 class="col-title">Details</h3>
				<div class="image">
					<img src={image} alt="" />
					<div class="image-actions">
						<Button variant="ghost" arrow={false} icon="image" class="on-photo">Replace</Button>
						<IconButton icon="x" label="Remove image" />
					</div>
				</div>
				<label class="field">
					<span>Title</span>
					<input value={title} />
				</label>
				<label class="field">
					<span>Description <i>optional</i></span>
					<textarea rows="3">{fallback ? '' : detail.recipe.description}</textarea>
				</label>
				<div class="trio">
					<label class="field"><span>Servings</span><input class="tnum" value={fallback ? '2' : '4'} inputmode="numeric" /></label>
					<label class="field"><span>Prep, min</span><input class="tnum" value={fallback ? '' : '15'} inputmode="numeric" /></label>
					<label class="field"><span>Cook, min</span><input class="tnum" value={fallback ? '' : '40'} inputmode="numeric" /></label>
				</div>
				<div class="field">
					<span>Tags</span>
					<div class="tags">
						{#if !fallback}
							{#each importDraft.tags as t (t.name)}
								<Chip
									label={t.existing ? t.name : `${t.name} · new`}
									icon={t.existing ? undefined : 'sparkle'}
									class={t.existing ? '' : 'new-tag'}
									active={t.existing}
								/>
							{/each}
						{/if}
						<input class="tag-input" placeholder="Add a tag" aria-label="Add a tag" />
					</div>
				</div>
				<label class="field">
					<span>Source</span>
					<input value={url} />
				</label>
			</div>

			<div class="lines">
				<h3 class="col-title">Ingredients</h3>
				{#if fallback}
					<div class="empty-lines">
						{#each ['e.g. 1 hispi cabbage', 'e.g. 50 g white miso', 'e.g. 2 tbsp butter, soft'] as ph (ph)}
							<div class="line"><Icon name="grip" size={16} /><input placeholder={ph} aria-label="Ingredient line" /></div>
						{/each}
					</div>
				{:else}
					{#each parsed as line (line.text)}
						<div class="line">
							<Icon name="grip" size={16} />
							<div class="line-body">
								<input value={line.text} aria-label="Ingredient line" />
								<p class="parse">
									{#if line.quantity}<span class="tok q tnum">{line.quantity}</span>{/if}
									{#if line.unit}<span class="tok u">{line.unit}</span>{/if}
									<span class="name">{line.name}</span>
									{#if line.note}<span class="note">{line.note}</span>{/if}
									{#if !line.quantity}<span class="note">no amount</span>{/if}
								</p>
							</div>
						</div>
					{/each}
					<input class="section-title" value="For the sage brown butter" aria-label="Section title" />
					{#each brownButter as text (text)}
						<div class="line">
							<Icon name="grip" size={16} />
							<div class="line-body"><input value={text} aria-label="Ingredient line" /></div>
						</div>
					{/each}
				{/if}
				<div class="add-row">
					<Button variant="ghost" arrow={false} icon="plus">Add line</Button>
					<Button variant="ghost" arrow={false} icon="plus">Add section</Button>
				</div>

				<h3 class="col-title steps-title">Method</h3>
				{#if fallback}
					<textarea class="steps" rows="5" aria-label="Steps" placeholder="One step per line. Leave an empty line to start a new section."></textarea>
				{:else}
					<ol class="step-list">
						{#each detail.steps[0].lines as text, i (text)}
							<li><span class="no tnum">{String(i + 1).padStart(2, '0')}</span><textarea rows="2" aria-label="Step {i + 1}">{text}</textarea></li>
						{/each}
					</ol>
				{/if}
			</div>
		</div>
		<div class="save save-bottom">
			<Button variant="secondary" arrow={false}>Cancel</Button>
			<Button variant="olive">Save recipe</Button>
		</div>
	</section>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-7);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	h1 em {
		color: var(--brick);
	}

	.band {
		position: relative;
		display: grid;
		place-items: center;
		min-block-size: 300px;
		padding: var(--s-8) var(--s-6);
		border-radius: var(--r-frame);
		overflow: hidden;
		isolation: isolate;
	}

	.band > img {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		z-index: -1;
	}

	.band :global(.import) {
		inline-size: min(100%, 720px);
		padding: var(--s-6) var(--s-7);
	}

	.url-label {
		display: block;
		margin-block-end: var(--s-3);
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 360;
	}

	.url-row {
		display: flex;
		gap: var(--s-2);
	}

	.url-field {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		min-inline-size: 0;
		min-block-size: 52px;
		padding: 0 var(--s-5);
		border-radius: var(--r-pill);
		background: var(--white);
		border: 1px solid var(--line);
	}

	.url-field input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: none;
		font-size: 15px;
	}

	.url-row :global(.btn) {
		min-block-size: 52px;
	}

	.url-help {
		margin-block-start: var(--s-3);
		font-size: 14px;
		color: var(--ink);
	}

	.url-help a {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-block-size: 32px;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.preview {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	.preview-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.save {
		display: flex;
		gap: var(--s-2);
	}

	.save-bottom {
		display: none;
	}

	.banner {
		display: flex;
		align-items: flex-start;
		gap: var(--s-3);
		padding: var(--s-4) var(--s-5);
		border-radius: var(--r-md);
		font-size: 14px;
	}

	.banner-title {
		font-weight: 600;
		font-size: 15px;
	}

	.ok {
		background: var(--olive-soft);
		color: var(--ink);
	}

	.ok :global(.icon) {
		color: var(--olive);
	}

	.fail {
		background: var(--brick-soft);
		color: var(--ink);
	}

	.fail :global(.icon),
	.fail .banner-title {
		color: var(--brick);
	}

	.form {
		display: grid;
		grid-template-columns: 420px 1fr;
		gap: var(--s-6);
		align-items: start;
	}

	.meta,
	.lines {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-6);
		border-radius: var(--r-panel);
		background: var(--surface);
		box-shadow: var(--shadow-card);
	}

	.col-title {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 360;
	}

	.steps-title {
		margin-block-start: var(--s-4);
	}

	.image {
		position: relative;
		aspect-ratio: 16 / 10;
		border-radius: var(--r-md);
		overflow: hidden;
	}

	.image img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.image-actions {
		position: absolute;
		inset-inline: var(--s-3);
		inset-block-end: var(--s-3);
		display: flex;
		justify-content: space-between;
	}

	.image-actions :global(.on-photo) {
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		min-block-size: 44px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field > span {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.field i {
		font-weight: 400;
		color: var(--ink-2);
	}

	input,
	textarea {
		min-block-size: 46px;
		padding: 11px 14px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--white);
		font-size: 15px;
		line-height: 1.45;
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

	.trio {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--s-3);
	}

	.trio .field {
		min-inline-size: 0;
	}

	.field input,
	.field textarea {
		inline-size: 100%;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
		padding: 6px;
		border-radius: var(--r-md);
		border: 1px solid var(--line);
		background: var(--white);
	}

	.tags :global(.new-tag) {
		border-style: dashed;
		border-color: var(--brick);
		color: var(--brick);
	}

	.tag-input {
		flex: 1;
		min-inline-size: 100px;
		min-block-size: 40px;
		border: 0;
		padding: 0 8px;
	}

	.line {
		display: flex;
		align-items: flex-start;
		gap: var(--s-2);
		color: var(--stone);
	}

	.line > :global(.icon) {
		margin-block-start: 15px;
	}

	.line-body {
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
		min-inline-size: 0;
	}

	.line input {
		flex: 1;
		inline-size: 100%;
		min-block-size: 42px;
		padding-block: 9px;
		color: var(--ink);
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

	.empty-lines {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.section-title {
		margin-block-start: var(--s-2);
		border-style: dashed;
		background: transparent;
		font-family: var(--font-display);
		font-style: italic;
		font-size: 18px;
		color: var(--olive);
	}

	.add-row {
		display: flex;
		gap: var(--s-2);
	}

	.step-list {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.step-list li {
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr);
		align-items: start;
	}

	.step-list textarea,
	textarea.steps {
		inline-size: 100%;
	}

	.form > * {
		min-inline-size: 0;
	}

	.no {
		padding-block-start: 10px;
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 300;
		color: var(--brick);
	}

	@media (min-width: 1024px) {
		.lines {
			display: grid;
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 1023px) {
		.band {
			min-block-size: 0;
			padding: var(--s-4);
			margin-inline: calc(-1 * var(--gutter));
			border-radius: 0;
		}

		.band :global(.import) {
			padding: var(--s-5);
		}

		.url-label {
			font-size: 20px;
		}

		.url-row {
			flex-direction: column;
		}

		.preview-head .save {
			display: none;
		}

		.save-bottom {
			display: flex;
		}

		.save-bottom :global(.btn:last-child) {
			flex: 1;
		}

		.form {
			grid-template-columns: 1fr;
		}

		.meta,
		.lines {
			padding: var(--s-5) var(--s-4);
		}

		.add-row {
			flex-wrap: wrap;
		}
	}
</style>
