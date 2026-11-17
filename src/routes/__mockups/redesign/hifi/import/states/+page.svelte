<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../home/State.svelte';
	import ImportBody from '../ImportBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const longLink = `https://www.example.com/recipes/${'seasonal-autumn-vegetables-'.repeat(20)}`.slice(0, 400);
</script>

<svelte:head><title>Import, states · hi-fi</title></svelte:head>

<Frame area="recipes" plus="hidden">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Recipes</li><li>Import states</li></ul>
			<h1 data-long>Import <em class="accent-word">states</em></h1>
		</div>
	</header>

	<div class="screen-body" data-settle>
		<div class="states">
			<State label="Reading" note="The button reads “Reading…” and is disabled, the field is read-only, a status says what is happening.">
				<ImportBody state="reading" worst={data.worst} />
			</State>
			<State label="Invalid link" note="The error is attached to the field; no preview appears.">
				<ImportBody state="invalid" worst={data.worst} />
			</State>
			<State label="Duplicate" note="Names the existing recipe as a link; Import anyway goes on to the preview.">
				<ImportBody state="duplicate" worst={data.worst} />
			</State>
			<State label="400-character link" note="The field scrolls inside itself, the status wraps; nothing widens the page.">
				<ImportBody state="duplicate" link={longLink} worst={data.worst} />
			</State>
			<State label="Fallback" note="An alert, then the form with what was found (link, title, image link). The form is shortened here; the full form is on its own screen.">
				<ImportBody state="fallback" recipe={data.recipe} link={longLink.slice(0, 80)} compact save="inline" worst={data.worst} />
			</State>
			<State label="Restored draft" note="The link field gives way to the draft's form; Discard draft clears it.">
				<ImportBody state="draft" recipe={data.recipe} compact save="inline" worst={data.worst} />
			</State>
		</div>
	</div>
</Frame>

<style>
	/* the busy spinner is frozen in the specimens: an endless animation keeps the screenshots from ever settling */
	:global(.states .btn .spinner) {
		animation: none;
	}
	.states {
		display: grid;
		gap: var(--space-8);
		min-inline-size: 0;
	}
</style>
