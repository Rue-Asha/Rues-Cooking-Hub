<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Specimen from '../../recipes/Specimen.svelte';
	import '../../recipes/wire.css';
	import ImportBody from '../ImportBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const longLink = `https://www.example.com/recipes/${'seasonal-autumn-vegetables-'.repeat(20)}`.slice(0, 400);
</script>

<svelte:head><title>Import, states (wireframe)</title></svelte:head>

<Frame area="recipes" plus="hidden">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>Import states</li></ul>
			<h1 data-long>Bring a recipe home</h1>
		</div>
	</div>
	<div class="screen-body w-states">
		<Specimen label="Reading" note="Button reads “Reading…” and is disabled, the field is read-only, a status says what is happening.">
			<div class="w-body"><ImportBody state="reading" worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Invalid link" note="The error is attached to the field; no preview appears.">
			<div class="w-body"><ImportBody state="invalid" worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Duplicate" note="Names the existing recipe as a link; Import anyway goes on to the preview.">
			<div class="w-body"><ImportBody state="duplicate" worst={data.worst} /></div>
		</Specimen>
		<Specimen label="400-character link" note="The field scrolls inside itself, the status wraps; nothing widens the page.">
			<div class="w-body"><ImportBody state="duplicate" link={longLink} worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Fallback" note="Alert, then the form with what was found (link, title, image link). Form shortened here; the full form is on the Form screen.">
			<div class="w-body"><ImportBody state="fallback" recipe={data.recipe} link={longLink.slice(0, 80)} compact worst={data.worst} /></div>
		</Specimen>
		<Specimen label="Restored draft" note="The link field gives way to the draft's form; Discard draft clears it.">
			<div class="w-body"><ImportBody state="draft" recipe={data.recipe} compact worst={data.worst} /></div>
		</Specimen>
	</div>
</Frame>
