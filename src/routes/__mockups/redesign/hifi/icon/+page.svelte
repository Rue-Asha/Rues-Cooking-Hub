<script lang="ts">
	import { page } from '$app/state';
	import { mockData } from '../../fixtures.ts';
	import chosen from './icon.svg';
	import chosen16 from './icon-16.svg';
	import chosen32 from './icon-32.svg';
	import notes from './notes.svg';
	import creative from './creative.svg';
	import hatA from './variants/hat-a.svg';
	import hatA16 from './variants/hat-a-16.svg';
	import hatA32 from './variants/hat-a-32.svg';
	import hatB from './variants/hat-b.svg';
	import hatB16 from './variants/hat-b-16.svg';
	import hatB32 from './variants/hat-b-32.svg';
	import hatC from './variants/hat-c.svg';
	import hatC16 from './variants/hat-c-16.svg';
	import hatC32 from './variants/hat-c-32.svg';

	const worst = $derived(mockData(new URL(page.url.href)).worst);

	const hatField = '#527752';
	const oldField = '#B3206B';

	const variants = [
		{ id: 'a', name: 'Toque', src: hatA, hint: { 16: hatA16, 32: hatA32 }, bg: hatField, tag: 'candidate', idea: 'Classic puffed toque: three lobes on a banded base, one white 32 line.' },
		{ id: 'b', name: 'Pleated toque', src: hatB, hint: { 16: hatB16, 32: hatB32 }, bg: hatField, tag: 'candidate', idea: 'The same toque, wider, with two pleat lines running from the lobe notches toward the band.' },
		{ id: 'c', name: 'Solid toque', src: hatC, hint: { 16: hatC16, 32: hatC32 }, bg: hatField, tag: 'candidate', idea: 'The puff as the one solid white shape, a gap, then the band as a line: reads at 16 px by mass.' },
		{ id: 'prev', name: 'A Splash', src: chosen, hint: { 16: chosen16, 32: chosen32 }, bg: oldField, tag: 'previous', idea: 'The earlier berry recipe card with a drop. Kept for comparison.' }
	];
	const family = [
		...variants.slice(0, 3).map((v) => ({ id: v.id, name: `Cooking Hub ${v.id} · ${v.name}`, src: v.src, hint: v.hint, bg: v.bg })),
		{ id: 'notes', name: 'Notes Archive (Filed)', src: notes, hint: {}, bg: '#2148E0' },
		{ id: 'creative', name: 'Creative Archive (Kept)', src: creative, hint: {}, bg: '#317F1F' }
	];

	const small = [16, 32] as const;
	const pick = (v: { src: string; hint: Record<number, string> }, size: number) => v.hint[size] ?? v.src;
	const grounds = [
		{ name: 'Light ground', tone: 'light' },
		{ name: 'Dark ground', tone: 'dark' }
	];
</script>

<svelte:head><title>Icon · Rues Cooking Hub</title></svelte:head>

{#snippet mark(src: string, size: number, shape: 'circle' | 'squircle' | 'maskable' | 'maskable-squircle', grey = false, bg = hatField)}
	<span class="mark {shape}" class:grey style:--size="{size}px" style:--bg={bg}>
		<img {src} alt="" width={size} height={size} class:inset={shape.startsWith('maskable')} />
	</span>
{/snippet}

<main class="page" data-data={worst ? 'worst' : 'normal'}>
	<section class="card panel" data-surface="solid" aria-labelledby="h">
		<div class="card-head"><h1 id="h">Master <em class="accent-word">icon</em>: chef's hat</h1></div>
		<p class="card-note">Request #14: Cooking Hub becomes a chef's hat (toque) on a rosemary field, <code>{hatField}</code> (Rue picked rosemary and hat-b on 2026-11-16). Three drafts, each with a hand-hinted <code>-16</code> (pixel grid, details dropped) and <code>-32</code> (strokes on whole pixels). The field colour is the first <code>&lt;rect&gt;</code> / <code>&lt;circle&gt;</code> fill of each <code>variants/hat-*.svg</code> and <code>hatField</code> in this page. A Splash stays below as previous.</p>
		<ol class="legend">
			{#each variants as v (v.id)}
				<li class:picked={v.tag === 'candidate'}>
					{@render mark(v.src, 96, 'circle', false, v.bg)}
					<div class="legend-text">
						<p class="type-overline">{v.id} · {v.tag}</p>
						<h2>{v.name}</h2>
						<p>{v.idea}</p>
						<code>variants/{v.id === 'prev' ? '../icon' : 'hat-' + v.id}.svg</code>
					</div>
				</li>
			{/each}
		</ol>
	</section>

	{#each grounds as g (g.tone)}
		<section class="card panel" data-surface="solid" aria-label={g.name}>
			<h2>{g.name}</h2>
			<div class="ground {g.tone}">
				<figure>
					<figcaption class="type-overline">Favicon 16 and 32 px, colour then greyscale (hand-hinted -16 / -32 files)</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell">
								<div class="set">
									{#each small as s (s)}{@render mark(pick(v, s), s, 'circle', false, v.bg)}{/each}
									{#each small as s (s)}{@render mark(pick(v, s), s, 'circle', true, v.bg)}{/each}
								</div>
								<span class="size">{v.id} · {v.name}</span>
							</div>
						{/each}
					</div>
				</figure>
				<figure>
					<figcaption class="type-overline">180 px: apple-touch under the iOS squircle, maskable under a squircle, maskable under a circle</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell">
								<div class="set">
									{@render mark(v.src, 180, 'squircle', false, v.bg)}
									{@render mark(v.src, 180, 'maskable-squircle', false, v.bg)}
									{@render mark(v.src, 180, 'maskable', false, v.bg)}
								</div>
								<span class="size">{v.id} · {v.name}</span>
							</div>
						{/each}
					</div>
				</figure>
				<figure>
					<figcaption class="type-overline">180 px greyscale</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell solo" style:--size="180px">{@render mark(v.src, 180, 'circle', true)}<span class="size">{v.id} · {v.name}</span></div>
						{/each}
					</div>
				</figure>
				<figure>
					<figcaption class="type-overline">512 px, maskable under a circle</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell solo" style:--size="512px">{@render mark(v.src, 512, 'maskable', false, v.bg)}<span class="size">{v.id} · {v.name}</span></div>
						{/each}
					</div>
				</figure>
			</div>
		</section>
	{/each}

	<section class="card panel" data-surface="solid" aria-labelledby="family">
		<h2 id="family">Beside Notes Archive and Creative Archive</h2>
		<p class="card-note">The three hats beside Notes Archive and Creative Archive (their colours as drawn today).</p>
		{#each grounds as g (g.tone)}
			<div class="ground {g.tone}">
				<p class="type-overline">{g.name}: 16, 32, 180 and 512 px</p>
				<div class="row">
					{#each family as f (f.id)}
						<div class="cell">
							<div class="set">
								{#each [16, 32, 180] as s (s)}{@render mark(pick(f, s), s, 'circle', false, f.bg)}{/each}
								{#each [16, 32] as s (s)}{@render mark(pick(f, s), s, 'circle', true, f.bg)}{/each}
							</div>
							<div class="cell solo" style:--size="512px">{@render mark(f.src, 512, 'circle', false, f.bg)}</div>
							<span class="size">{f.name}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</section>
</main>

<style>
	.page {
		display: grid;
		gap: var(--space-4);
		max-inline-size: var(--frame-max-width);
		margin-inline: auto;
		padding: var(--space-4);
		background: var(--surface-page);
		min-block-size: 100dvh;
		min-inline-size: 0;
	}
	.panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.card-head h1 {
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
	}
	.legend {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, calc(var(--space-16) * 4)), 1fr));
		gap: var(--space-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.legend li {
		display: flex;
		align-items: start;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.legend li:not(.picked) {
		opacity: 0.7;
	}
	.legend-text {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
	}
	.legend .mark {
		flex: none;
	}
	.ground {
		display: grid;
		gap: var(--space-6);
		padding: var(--space-6);
		border-radius: var(--radius-panel);
		min-inline-size: 0;
	}
	.ground.light {
		background: var(--surface-sunken);
	}
	.ground.dark {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	figure {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		min-inline-size: 0;
	}
	figcaption {
		color: inherit;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--space-6);
		min-inline-size: 0;
	}
	.cell {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.cell > .solo {
		inline-size: min(var(--size), 100%);
	}
	.cell.solo {
		inline-size: max(min(var(--size), 100%), var(--space-16));
	}
	.set {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.size {
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.mark {
		display: block;
		flex: none;
		inline-size: var(--size);
		aspect-ratio: 1;
		overflow: hidden;
	}
	.solo .mark {
		inline-size: min(var(--size), 100%);
	}
	.mark img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
	}
	.circle {
		border-radius: var(--radius-round);
	}
	.squircle,
	.maskable-squircle {
		border-radius: var(--radius-frame);
		background: var(--bg);
	}
	.maskable {
		border-radius: var(--radius-round);
		background: var(--bg);
	}
	.inset {
		scale: 0.8;
	}
	.grey {
		filter: grayscale(1);
	}
</style>
