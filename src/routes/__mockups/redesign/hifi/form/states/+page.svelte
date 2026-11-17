<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Button from '../../shell/Button.svelte';
	import State from '../../home/State.svelte';
	import Notice from '../Notice.svelte';
	import RecipeForm from '../RecipeForm.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const r = $derived(data.recipe);
</script>

<svelte:head><title>Recipe form, states · hi-fi</title></svelte:head>

<Frame area="recipes" plus="hidden">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>Form states</li></ul>
			<h1 data-long>Recipe form <em class="accent-word">states</em></h1>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<div class="states">
			<State label="Photo: none" note="The plate, one Add photo button, an optional image link.">
				<RecipeForm recipe={null} photo="none" parts={['photo']} worst={data.worst} />
			</State>
			<State label="Photo: chosen" note="File name shown; Replace and Remove image.">
				<RecipeForm recipe={r} photo="image" parts={['photo']} worst={data.worst} />
			</State>
			<State label="Photo: HEIC file" note="Shown at once, before upload; saving without the image stays possible.">
				<RecipeForm recipe={null} photo="heic" parts={['photo']} worst={data.worst} />
			</State>
			<State label="Photo: over 15 MB" note="Same place, same words.">
				<RecipeForm recipe={null} photo="toolarge" parts={['photo']} worst={data.worst} />
			</State>
			<State label="Photo: pasted link" note="The link previews when it loads.">
				<RecipeForm recipe={null} photo="link" parts={['photo']} worst={data.worst} />
			</State>
			<State label="Tags" note="Selected tags with Remove, a “new” marker for names created on save, suggestions as one-tap additions.">
				<RecipeForm recipe={r} parts={['tags']} newTags={r.tags.slice(-1)} worst={data.worst} />
			</State>
			<State label="Validation errors" note="Each error sits under its field; after a failed save focus moves to the first invalid one.">
				<RecipeForm recipe={r} errors={{ title: true, servings: true, minutes: true }} parts={['basics']} worst={data.worst} />
			</State>
			<State label="Saving" note="One Save recipe in the bar; it reads “Saving…” and is disabled. Shown inline here.">
				<RecipeForm recipe={r} saving save="inline" parts={['actions']} worst={data.worst} />
			</State>
			<State label="Restored draft" note="A notice above the form; Discard draft clears it. New and imported recipes only.">
				<div class="stack">
					<Notice title="Restored your unsaved draft">
						{#snippet actions()}<Button size="s">Discard draft</Button>{/snippet}
					</Notice>
					<RecipeForm recipe={r} parts={['basics']} worst={data.worst} />
				</div>
			</State>
			<State label="Sections: one and many" note="One section by default; titled sections add Remove section. The first two lines of each are shown.">
				<RecipeForm recipe={r} limit={2} parts={['ing', 'met']} worst={data.worst} />
			</State>
		</div>
	</div>
</Frame>

<style>
	/* the busy spinner is frozen in the specimens: an endless animation keeps the screenshots from ever settling */
	:global(.states .btn .spinner) {
		animation: none;
	}
	.states,
	.stack {
		display: grid;
		gap: var(--space-8);
		min-inline-size: 0;
	}
	.stack {
		gap: var(--space-4);
	}
</style>
