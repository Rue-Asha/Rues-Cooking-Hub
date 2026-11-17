<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Icon from '../../recipes/Icon.svelte';
	import Specimen from '../../recipes/Specimen.svelte';
	import '../../recipes/wire.css';
	import RecipeForm from '../RecipeForm.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const r = $derived(data.recipe);
</script>

<svelte:head><title>Recipe form, states (wireframe)</title></svelte:head>

<Frame area="recipes" plus="hidden">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>Form states</li></ul>
			<h1 data-long>Recipe form states</h1>
		</div>
	</div>
	<div class="screen-body w-states">
		<Specimen label="Photo: none" note="Plate, one Add photo button, optional image link.">
			<RecipeForm recipe={null} photo="none" parts={['photo']} worst={data.worst} />
		</Specimen>
		<Specimen label="Photo: chosen" note="File name shown; Replace and Remove image.">
			<RecipeForm recipe={r} photo="image" parts={['photo']} worst={data.worst} />
		</Specimen>
		<Specimen label="Photo: HEIC file" note="Shown at once, before upload; saving without the image stays possible.">
			<RecipeForm recipe={null} photo="heic" parts={['photo']} worst={data.worst} />
		</Specimen>
		<Specimen label="Photo: over 15 MB">
			<RecipeForm recipe={null} photo="toolarge" parts={['photo']} worst={data.worst} />
		</Specimen>
		<Specimen label="Photo: pasted link" note="The link previews when it loads.">
			<RecipeForm recipe={null} photo="link" parts={['photo']} worst={data.worst} />
		</Specimen>
		<Specimen label="Tags" note="Selected tags with Remove, a “new” marker for names created on save, suggestions as one-tap additions.">
			<RecipeForm recipe={r} parts={['tags']} newTags={r.tags.slice(-1)} worst={data.worst} />
		</Specimen>
		<Specimen label="Validation errors" note="Each error sits under its field; after a failed save focus moves to the first invalid one.">
			<RecipeForm recipe={r} errors={{ title: true, servings: true, minutes: true }} parts={['basics']} worst={data.worst} />
		</Specimen>
		<Specimen label="Saving" note="One Save recipe; it reads “Saving…” and is disabled.">
			<RecipeForm recipe={r} saving parts={['actions']} worst={data.worst} />
		</Specimen>
		<Specimen label="Restored draft" note="A notice above the form; Discard draft clears it. New and imported recipes only.">
			<div class="w-body">
				<div class="w-status" role="status">
					<Icon name="check" />
					<div>
						<strong>Restored your unsaved draft</strong>
						<div class="w-status-actions"><button type="button" class="w-btn s">Discard draft</button></div>
					</div>
				</div>
				<RecipeForm recipe={r} parts={['basics']} worst={data.worst} />
			</div>
		</Specimen>
		<Specimen label="Sections: one and many" note="One section by default; titled sections add Remove section. First two lines of each shown.">
			<RecipeForm recipe={r} limit={2} parts={['ing', 'met']} worst={data.worst} />
		</Specimen>
		<Specimen label="Save placement B (candidate)" note="Alternative to the sticky bottom bar: Cancel and Save recipe in the head of the form, above the fields.">
			<RecipeForm recipe={r} limit={2} save="head" parts={['actions', 'basics']} worst={data.worst} />
		</Specimen>
	</div>
</Frame>
