<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Specimen from '../../recipes/Specimen.svelte';
	import '../../recipes/wire.css';
	import TagsBody from '../TagsBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const few = $derived(data.tags.slice(0, 4));
	const first = $derived(data.tags[0].name);
	const second = $derived(data.tags[1].name);
	const unused = $derived([...data.tags.slice(0, 3), { name: 'Dessert', count: 0 }]);
</script>

<svelte:head><title>Tags, states (wireframe)</title></svelte:head>

<Frame area="recipes">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>Tag states</li></ul>
			<h1 data-long>Manage tags</h1>
		</div>
	</div>
	<div class="screen-body w-states">
		<Specimen label="No tags" note="All tags deleted: one line and the way back to recipes.">
			<div class="w-body"><TagsBody tags={[]} /></div>
		</Specimen>
		<Specimen label="One tag">
			<div class="w-body"><TagsBody tags={data.tags.slice(0, 1)} /></div>
		</Specimen>
		<Specimen label="Rename open" note="The field replaces the row's actions, takes focus, Escape cancels.">
			<div class="w-body"><TagsBody tags={few} renaming={few[1].name} /></div>
		</Specimen>
		<Specimen label="Rename: empty name" note="Error attached to the field.">
			<div class="w-body"><TagsBody tags={few} renaming={few[1].name} renameValue=" " renameError /></div>
		</Specimen>
		<Specimen label="Merged" note="Renaming onto an existing name merges; the outcome is announced here.">
			<div class="w-body"><TagsBody tags={few.slice(0, 3)} status="Merged {first} into {second}" /></div>
		</Specimen>
		<Specimen label="Delete entry" note="The row's Delete opens the dialog; the unused tag shows “0 recipes”.">
			<div class="w-body"><TagsBody tags={unused} deleting={unused[1].name} /></div>
		</Specimen>
		<Specimen label="Long names, many tags" note="Names wrap inside the row; counts and actions stay in view.">
			<div class="w-body"><TagsBody tags={data.tags} renaming={data.tags[0].name} /></div>
		</Specimen>
	</div>
</Frame>
