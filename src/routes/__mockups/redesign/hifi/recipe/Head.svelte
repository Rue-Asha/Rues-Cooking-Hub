<script lang="ts">
	import type { MockRecipeFull } from '../../fixtures.ts';
	import { lang, tidy } from '../recipes/util.ts';
	import '../recipes/title.css';

	type Props = { recipe: MockRecipeFull; hide?: { tags?: boolean; description?: boolean; image?: boolean } };
	let { recipe, hide = {} }: Props = $props();

	const shown = $derived(tidy(recipe.title));
	const words = $derived(shown.text.trim().split(/\s+/));
	const last = $derived(words.at(-1) ?? '');
	const before = $derived(words.slice(0, -1).join(' '));
	const tags = $derived(hide.tags ? [] : recipe.tags);
	const bare = $derived(hide.image || !recipe.image);
</script>

<div class="screen-lead">
	{#if bare}<span class="thumb plate" role="img" aria-label="No photo yet">{[...recipe.title.trim()][0] ?? '?'}</span>{/if}
	<ul class="kicker">
		<li>Recipe</li>
		{#each tags.slice(0, 3) as tag (tag)}<li lang={lang(tag)}>{tag}</li>{/each}
	</ul>
	<h1 data-long={recipe.title.length > 60 ? '' : undefined}>{#if before}{before}{' '}{/if}<em class="accent-word">{last}</em>{shown.cut ? '…' : ''}</h1>
	{#if recipe.description && !hide.description}<p class="lede">{recipe.description}</p>{/if}
</div>

<style>
	.thumb {
		--thumb: var(--space-14);
	}
</style>
