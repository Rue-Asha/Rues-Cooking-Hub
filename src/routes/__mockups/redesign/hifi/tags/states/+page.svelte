<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../home/State.svelte';
	import TagsBody from '../TagsBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const few = $derived(data.tags.slice(0, 4));
	const unused = $derived([...data.tags.slice(0, 3), { name: 'Dessert', count: 0 }]);
</script>

<svelte:head><title>Tags, states · hi-fi</title></svelte:head>

<Frame area="recipes">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>Tag states</li></ul>
			<h1 data-long>Tag <em class="accent-word">states</em></h1>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<div class="states">
			<State label="No tags" note="All tags deleted: one line and the way back to recipes.">
				<TagsBody tags={[]} worst={data.worst} />
			</State>
			<State label="One tag" note="“1 tag”, “1 recipe”.">
				<TagsBody tags={data.tags.slice(0, 1).map((t) => ({ ...t, count: 1 }))} worst={data.worst} />
			</State>
			<State label="Rename open" note="The field replaces the row's actions, takes focus, Escape cancels.">
				<TagsBody tags={few} renaming={few[1].name} worst={data.worst} />
			</State>
			<State label="Rename: empty name" note="The error is attached to the field.">
				<TagsBody tags={few} renaming={few[1].name} renameValue=" " renameError worst={data.worst} />
			</State>
			<State label="Merged" note="Renaming onto an existing name merges; the outcome is announced here.">
				<TagsBody tags={few.slice(0, 3)} status="Merged {few[0].name} into {few[1].name}" worst={data.worst} />
			</State>
			<State label="Delete" note="Delete opens the “Delete tag” dialog (see the overlays screen); the unused tag reads “0 recipes”. The armed row is shown here.">
				<TagsBody tags={unused} deleting={unused[1].name} worst={data.worst} />
			</State>
			<State label="Long names, many tags" note="Names wrap inside the row; counts and actions stay in view.">
				<TagsBody tags={data.tags} renaming={data.tags[0].name} worst={data.worst} />
			</State>
		</div>
	</div>
</Frame>

<style>
	.states {
		display: grid;
		gap: var(--space-8);
		min-inline-size: 0;
	}
</style>
