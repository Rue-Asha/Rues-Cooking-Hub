<script lang="ts">
	import { location, priceLevels, spotTagChips, topSpots, visited, want, type MockSpot } from '#lib/mockups/spots.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import Kicker from '#lib/ui/Kicker.svelte';

	const here = '/__mockups/eating-out';
	const detail = visited[0];
	const pending = want[0];
	const host = (url: string) => new URL(url).host;
	const formTags = ['Ramen', 'Casual', 'Late'];
</script>

{#snippet segment(items: { label: string; count?: number }[], active: number, label: string)}
	<div class="segment" role="group" aria-label={label}>
		{#each items as item, i (item.label)}
			<button type="button" aria-pressed={i === active} class:on={i === active}>
				{item.label}
				{#if item.count !== undefined}<span class="n tnum">{item.count}</span>{/if}
			</button>
		{/each}
	</div>
{/snippet}

{#snippet price(s: MockSpot)}{#if s.price}<span class="price tnum">{s.price}</span>{/if}{/snippet}

{#snippet spotCard(s: MockSpot, ranked: boolean)}
	{#if s.score}
		<Card
			href={here}
			title={s.name}
			subtitle={location(s)}
			image={s.image}
			tags={s.tags}
			heart={false}
			rank={ranked ? s.rank : null}
		>
			{#snippet badge()}{s.score}{/snippet}
			{#snippet extra()}{@render price(s)}{/snippet}
		</Card>
	{:else}
		<Card href={here} title={s.name} subtitle={location(s)} image={s.image} tags={s.tags} heart={false}>
			{#snippet extra()}{@render price(s)}{/snippet}
		</Card>
	{/if}
{/snippet}

<div class="column page" data-column>
	<header class="head">
		<div data-page-header>
			<Kicker parts={['Spots', '7 places']} />
			<h1>Eating <em>Out</em></h1>
		</div>
		<div class="head-side">
			<p>4 places visited, 3 still on the want-to-go list.</p>
			<Button href={here} variant="olive" class="add">Add spot</Button>
		</div>
	</header>

	<section class="list" aria-labelledby="list-title">
		<div class="section-head">
			<div>
				<h2 id="list-title" data-section-heading>List</h2>
				<p class="section-sub">Visited sorted by score, with ranks; ties share one</p>
			</div>
		</div>

		<div class="controls">
			{@render segment(
				[
					{ label: 'Visited', count: 4 },
					{ label: 'Want to go', count: 3 }
				],
				0,
				'Status'
			)}
			<label class="search">
				<Icon name="search" size={18} />
				<span class="visually-hidden">Search spots</span>
				<input type="search" placeholder="Search spots, areas or tags" />
			</label>
			<button type="button" class="select sort">
				<Icon name="sort" size={18} />
				<span>Highest score</span>
				<Icon name="chevron-down" size={16} />
			</button>
		</div>

		<div class="chips" role="group" aria-label="Filter spots">
			{#each spotTagChips as tag, i (tag)}<Chip label={tag} active={i === 4} />{/each}
			<span class="rule" aria-hidden="true"></span>
			<button type="button" class="select city"><span>City: All</span><Icon name="chevron-down" size={16} /></button>
			<span class="rule" aria-hidden="true"></span>
			{#each priceLevels as level (level)}<Chip label={level} />{/each}
		</div>

		<div class="grid">
			{#each visited as s (s.id)}{@render spotCard(s, true)}{/each}
		</div>

		<div class="subhead">
			<h3>Want to go</h3>
			<p>Same cards, no score and no rank</p>
		</div>
		<div class="grid">
			{#each want as s (s.id)}{@render spotCard(s, false)}{/each}
			<a class="add-tile" href={here}>
				<span class="plus"><Icon name="plus" size={22} /></span>
				<span class="add-title">Add a place</span>
				<span class="add-sub">A tip from a friend, a corner you walked past</span>
			</a>
		</div>
	</section>

	<section class="spot" aria-labelledby="spot-title">
		<div class="section-head">
			<div>
				<h2 id="spot-title" data-section-heading>Spot page</h2>
				<p class="section-sub">Hero, glass panel, then the places to go next</p>
			</div>
		</div>

		<div class="hero">
			<img src={detail.image} alt="" />
			<div class="hero-controls">
				<ArrowButton href={here} variant="glass" direction="left" label="Back to Eating Out" />
			</div>
		</div>

		<div class="panel-row">
			<GlassPanel as="div" strong class="info">
				<Kicker parts={[detail.neighbourhood ?? '', detail.city ?? '']} />
				<div class="name-row">
					<h3 class="spot-name">Brasserie <em>Lumière</em></h3>
					<span class="score tnum">{detail.score}</span>
				</div>
				<div class="facts">
					<span class="price tnum">{detail.price}</span>
					<span class="dot" aria-hidden="true"></span>
					<span>{location(detail)}</span>
				</div>
				<div class="tags">
					{#each detail.tags as tag (tag)}<Chip static label={tag} />{/each}
				</div>
				<div class="actions">
					<Button variant="secondary" arrow={false} icon="edit">Edit</Button>
					<Button variant="danger" arrow={false} icon="trash">Delete</Button>
				</div>
			</GlassPanel>

			<div class="details">
				<div class="row">
					<div class="row-main">
						<p class="label">Address</p>
						<p class="value">{detail.address}</p>
					</div>
					<a class="open" href={here}>Open in Maps <Icon name="arrow-up-right" size={16} /></a>
				</div>
				<div class="row">
					<div class="row-main">
						<p class="label">Website</p>
						<p class="value">{host(detail.website ?? '')}</p>
					</div>
					<a class="open" href={here}>Visit <Icon name="arrow-up-right" size={16} /></a>
				</div>
				<div class="row notes">
					<div class="row-main">
						<p class="label">Notes</p>
						<p class="value prose">{detail.notes}</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="add-form" aria-labelledby="add-title">
		<div class="section-head">
			<div>
				<h2 id="add-title" data-section-heading>Add spot</h2>
				<p class="section-sub">Only the name is required; Visited asks for a score</p>
			</div>
			<div class="save top">
				<Button variant="secondary" arrow={false}>Cancel</Button>
				<Button variant="olive" arrow={false}>Save spot</Button>
			</div>
		</div>

		<form class="form" onsubmit={(e) => e.preventDefault()} novalidate>
			<div class="card">
				<h3 class="col-title">The place</h3>
				<div class="field">
					<span class="label">Photo <i>optional</i></span>
					<div class="frame">
						<img src="/mockups/spot-ramen.jpg" alt="" />
						<div class="frame-actions">
							<Button variant="ghost" arrow={false} icon="image" class="on-photo">Replace</Button>
							<IconButton icon="trash" label="Remove photo" />
						</div>
					</div>
				</div>
				<div class="field">
					<label for="f-name">Name</label>
					<input id="f-name" value="Kuro Ramen" autocomplete="off" />
				</div>
				<div class="field">
					<span class="label">Status</span>
					{@render segment([{ label: 'Want to go' }, { label: 'Visited' }], 1, 'Status')}
				</div>
				<div class="field score-field">
					<label for="f-score">Score</label>
					<div class="score-row">
						<input id="f-score" class="tnum" value="8,75" inputmode="decimal" autocomplete="off" />
						<span class="hint tnum">1.00–10.00</span>
					</div>
				</div>
			</div>

			<div class="card">
				<h3 class="col-title">Details</h3>
				<div class="field">
					<span class="label">Spot tags <i>optional</i></span>
					<div class="tag-box">
						{#each formTags as tag (tag)}
							<span class="tag">{tag}<span class="x" aria-hidden="true"><Icon name="x" size={14} /></span></span>
						{/each}
						<span class="entry">Add a tag</span>
					</div>
				</div>
				<div class="field">
					<span class="label">Price <i>optional</i></span>
					<div class="prices" role="group" aria-label="Price">
						{#each priceLevels as level, i (level)}<Chip label={level} active={i === 1} />{/each}
						<button type="button" class="clear">Clear</button>
					</div>
				</div>
				<div class="pair">
					<div class="field">
						<label for="f-city">City <i>optional</i></label>
						<input id="f-city" value="Berlin" autocomplete="off" />
					</div>
					<div class="field">
						<label for="f-area">Neighbourhood <i>optional</i></label>
						<input id="f-area" value="Kreuzberg" autocomplete="off" />
					</div>
				</div>
				<div class="field">
					<label for="f-address">Address <i>optional</i></label>
					<input id="f-address" value="Oranienstraße 42, 10999 Berlin" autocomplete="off" />
				</div>
				<div class="field">
					<label for="f-website">Website <i>optional</i></label>
					<input id="f-website" value="kuro-ramen.example" aria-invalid="true" aria-describedby="e-website" autocomplete="off" />
					<p class="error" id="e-website" role="alert">Enter a valid web address (http or https)</p>
				</div>
				<div class="field">
					<label for="f-notes">Notes <i>optional</i></label>
					<textarea id="f-notes" rows="3">Spicy miso with the extra egg. Open until 1 am, cash only after 10.</textarea>
				</div>
			</div>

			<div class="save bottom">
				<Button variant="secondary" arrow={false}>Cancel</Button>
				<Button variant="olive" arrow={false}>Save spot</Button>
			</div>
		</form>
	</section>

	<section class="visit" aria-labelledby="visit-title">
		<div class="section-head">
			<div>
				<h2 id="visit-title" data-section-heading>Mark visited</h2>
				<p class="section-sub">Rises from the bottom on phone, a centred panel on desktop</p>
			</div>
		</div>

		<div class="stage">
			<img class="behind" src={pending.image} alt="" />
			<div class="behind-panel">
				<Kicker parts={[pending.neighbourhood ?? '', pending.city ?? '']} tone="light" />
				<p class="behind-name">Weinbar <em>Kupfer</em></p>
			</div>
			<div class="veil" aria-hidden="true"></div>
			<div class="sheet" role="group" aria-label="Mark visited">
				<header>
					<div>
						<p class="sheet-kicker">{pending.name}</p>
						<h3 class="sheet-title">Mark visited</h3>
					</div>
					<button type="button" class="close" aria-label="Close"><Icon name="x" size={18} /></button>
				</header>
				<div class="field score-field">
					<label for="v-score">Score</label>
					<div class="score-row">
						<input id="v-score" class="tnum" value="9,25" inputmode="decimal" autocomplete="off" />
						<span class="hint tnum">1.00–10.00</span>
					</div>
				</div>
				<div class="sheet-foot">
					<Button variant="secondary" arrow={false}>Cancel</Button>
					<Button variant="olive" arrow={false} icon="check">Save</Button>
				</div>
			</div>
		</div>
	</section>

	<section class="top-spots" aria-labelledby="top-title">
		<div class="section-head">
			<div>
				<h2 id="top-title" data-section-heading>Top spots</h2>
				<p class="section-sub">The row on Home, after Recently added</p>
			</div>
			<a class="more" href={here}>All spots <Icon name="arrow-right" size={16} /></a>
		</div>
		<div class="grid">
			{#each topSpots as s (s.id)}{@render spotCard(s, false)}{/each}
		</div>
	</section>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-9);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-6);
	}

	.head h1 {
		margin-block-start: var(--s-3);
	}

	h1 em,
	h3 em {
		color: var(--brick);
	}

	.head-side {
		display: flex;
		align-items: center;
		gap: var(--s-5);
		color: var(--ink-2);
		font-size: 15px;
	}

	.head-side p {
		max-inline-size: 24ch;
		text-align: right;
	}

	.head-side :global(.add) {
		display: none;
	}

	.section-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.section-sub {
		margin-block-start: 4px;
		font-size: 14px;
		color: var(--ink-2);
	}

	.more {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-block-size: 44px;
		font-size: 14px;
		font-weight: 500;
	}

	.subhead {
		display: flex;
		align-items: baseline;
		gap: var(--s-3);
		margin-block-start: var(--s-4);
	}

	.subhead h3 {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 360;
	}

	.subhead p {
		font-size: 14px;
		color: var(--ink-2);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--s-5) var(--s-4);
	}

	.price {
		margin-inline-end: 2px;
		font-size: var(--t-small);
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--ink);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	.segment {
		display: inline-flex;
		gap: 4px;
		padding: 4px;
		border-radius: var(--r-pill);
		background: var(--ink-wash);
	}

	.segment button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-block-size: 44px;
		padding: 0 var(--s-5);
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		font-size: 15px;
		font-weight: 500;
		white-space: nowrap;
	}

	.segment .on {
		background: var(--dark);
		color: var(--on-dark);
		box-shadow: var(--shadow-card);
	}

	.n {
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.on .n {
		color: var(--on-dark);
		opacity: 0.8;
	}

	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-inline-size: 0;
		min-block-size: 44px;
		padding: 0 var(--s-4);
		margin-inline-start: auto;
		max-inline-size: 360px;
		border-radius: var(--r-pill);
		background: var(--surface);
		border: 1px solid var(--line);
		color: var(--ink-2);
	}

	.search input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: transparent;
		font-size: 14px;
		color: var(--ink);
	}

	.search input::placeholder {
		color: var(--ink-2);
	}

	.select {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex: none;
		min-block-size: 44px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: transparent;
		font-size: 14px;
		font-weight: 500;
	}

	.chips {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.rule {
		flex: none;
		inline-size: 1px;
		block-size: 24px;
		margin-inline: var(--s-2);
		background: var(--line);
	}

	.add-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--s-2);
		padding: var(--s-5);
		border: 1.5px dashed var(--line);
		border-radius: var(--r-card);
		text-align: center;
		transition: transform var(--d-base) var(--ease-out);
	}

	.add-tile:hover {
		transform: translateY(-3px);
	}

	.plus {
		display: grid;
		place-items: center;
		inline-size: 48px;
		block-size: 48px;
		border-radius: var(--r-pill);
		background: var(--olive-wash);
		color: var(--olive);
	}

	.add-title {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 360;
		line-height: 1.1;
	}

	.add-sub {
		max-inline-size: 22ch;
		font-size: 14px;
		color: var(--ink-2);
	}

	.hero {
		position: relative;
		block-size: clamp(380px, 52vh, 480px);
		margin-inline: calc(50% - 50vw);
		overflow: hidden;
		border-end-start-radius: var(--r-frame);
		border-end-end-radius: var(--r-frame);
	}

	.hero img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.hero-controls {
		display: none;
	}

	.panel-row {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: 1fr 440px;
		gap: var(--s-4);
		align-items: end;
		margin-block-start: -200px;
	}

	.panel-row :global(.info) {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-7);
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: var(--s-4);
	}

	.spot-name {
		font-family: var(--font-display);
		font-size: var(--t-display-2);
		font-weight: 300;
		letter-spacing: -0.015em;
		line-height: 1.05;
	}

	.score {
		display: inline-flex;
		align-items: center;
		flex: none;
		min-block-size: 40px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		background: var(--dark);
		color: var(--on-dark);
		font-size: 18px;
		font-weight: 600;
	}

	.facts {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		font-size: 15px;
		color: var(--ink-2);
	}

	.facts .price {
		font-size: 15px;
	}

	.dot {
		inline-size: 4px;
		block-size: 4px;
		border-radius: var(--r-pill);
		background: var(--stone);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
		margin-block-start: var(--s-2);
	}

	.details {
		display: flex;
		flex-direction: column;
		padding: var(--s-2) var(--s-6);
		border-radius: var(--r-panel);
		background: var(--surface);
		box-shadow: var(--shadow-float);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
		padding-block: var(--s-4);
		border-block-start: 1px solid var(--line);
	}

	.row:first-child {
		border-block-start: 0;
	}

	.row-main {
		min-inline-size: 0;
	}

	.label {
		font-size: var(--t-kicker);
		font-weight: 500;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.value {
		margin-block-start: 4px;
		font-size: 15px;
		line-height: 1.45;
	}

	.prose {
		color: var(--ink-2);
	}

	.open {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		min-block-size: 44px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--ink);
		font-size: 14px;
		font-weight: 500;
	}

	.form {
		display: grid;
		grid-template-columns: 420px 1fr;
		gap: var(--s-6);
		align-items: start;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		min-inline-size: 0;
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

	.save {
		display: flex;
		gap: var(--s-2);
	}

	.save.bottom {
		display: none;
		grid-column: 1 / -1;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
	}

	.field > label,
	.field > .label {
		font-size: var(--t-small);
		font-weight: 600;
		letter-spacing: 0;
		text-transform: none;
		color: var(--ink);
	}

	.field i {
		font-weight: 400;
		font-style: normal;
		color: var(--ink-2);
	}

	input,
	textarea {
		inline-size: 100%;
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
	}

	input[aria-invalid='true'] {
		border-color: var(--brick);
		box-shadow: 0 0 0 3px var(--brick-wash);
	}

	.error {
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--brick);
	}

	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-3);
	}

	.frame {
		position: relative;
		aspect-ratio: 16 / 10;
		border-radius: var(--r-md);
		overflow: hidden;
		background: var(--sand);
	}

	.frame img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.frame-actions {
		position: absolute;
		inset-inline: var(--s-3);
		inset-block-end: var(--s-3);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.frame-actions :global(.on-photo) {
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		-webkit-backdrop-filter: var(--glass-filter);
		min-block-size: 44px;
	}

	.score-row {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	.score-row input {
		inline-size: 140px;
	}

	.hint {
		font-size: var(--t-small);
		color: var(--ink-2);
	}

	.tag-box {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
		padding: 6px;
		border-radius: var(--r-md);
		border: 1px solid var(--line);
		background: var(--white);
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-block-size: 40px;
		padding: 0 10px 0 var(--s-4);
		border-radius: var(--r-pill);
		background: var(--olive);
		color: var(--white);
		font-size: 14px;
		font-weight: 500;
	}

	.x {
		display: grid;
		place-items: center;
		opacity: 0.8;
	}

	.entry {
		flex: 1;
		min-inline-size: 110px;
		padding: 0 8px;
		font-size: 15px;
		color: var(--ink-2);
	}

	.prices {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}

	.clear {
		min-block-size: 44px;
		padding: 0 var(--s-2);
		border: 0;
		background: none;
		font-size: 14px;
		font-weight: 500;
		color: var(--brick);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.stage {
		position: relative;
		display: grid;
		place-items: center;
		min-block-size: 440px;
		border-radius: var(--r-panel);
		overflow: hidden;
		isolation: isolate;
	}

	.behind {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.behind-panel {
		position: absolute;
		inset-inline: var(--s-6);
		inset-block-start: var(--s-6);
		color: var(--white);
	}

	.behind-name {
		margin-block-start: var(--s-2);
		font-family: var(--font-display);
		font-size: var(--t-display-2);
		font-weight: 300;
		line-height: 1.05;
	}

	.behind-name em {
		color: var(--white);
	}

	.veil {
		position: absolute;
		inset: 0;
		background: var(--backdrop);
	}

	.sheet {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
		inline-size: min(560px, 100% - 2 * var(--gutter));
		padding: var(--s-6);
		border-radius: var(--r-panel);
		background: var(--surface);
		box-shadow: var(--shadow-lift);
	}

	.sheet header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--s-3);
	}

	.sheet-kicker {
		font-size: var(--t-kicker);
		font-weight: 500;
		letter-spacing: var(--tracking-kicker);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.sheet-title {
		margin-block-start: var(--s-1);
		font-family: var(--font-display);
		font-size: var(--t-display-3);
		font-weight: 360;
		line-height: 1.05;
	}

	.close {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		margin: -6px -8px 0 0;
		border: 0;
		border-radius: var(--r-pill);
		background: var(--ink-wash);
		color: var(--ink);
	}

	.sheet-foot {
		display: flex;
		justify-content: flex-end;
		gap: var(--s-2);
	}

	@media (max-width: 1023px) {
		.page {
			gap: var(--s-8);
		}

		.head-side p {
			display: none;
		}

		.head-side :global(.add) {
			display: inline-flex;
		}

		.controls {
			flex-wrap: wrap;
		}

		.segment {
			display: flex;
			flex: 0 0 100%;
		}

		.segment button {
			flex: 1;
			justify-content: center;
		}

		.search {
			max-inline-size: none;
			margin-inline-start: 0;
		}

		.sort span {
			display: none;
		}

		.chips {
			margin-inline: calc(-1 * var(--gutter));
			padding-inline: var(--gutter);
		}

		.grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--s-3);
		}

		.add-tile {
			padding: var(--s-4);
		}

		.add-title {
			font-size: 19px;
		}

		.add-sub {
			font-size: 13px;
		}

		.subhead {
			flex-direction: column;
			gap: 2px;
		}

		.hero {
			block-size: 360px;
		}

		.hero-controls {
			position: absolute;
			inset-block-start: var(--s-4);
			inset-inline: var(--gutter);
			display: flex;
		}

		.panel-row {
			grid-template-columns: 1fr;
			margin-block-start: -72px;
		}

		.panel-row :global(.info) {
			padding: var(--s-5);
		}

		.name-row {
			align-items: flex-start;
		}

		.details {
			padding: var(--s-1) var(--s-5);
		}

		.row {
			flex-wrap: wrap;
		}

		.form {
			grid-template-columns: 1fr;
			gap: var(--s-4);
		}

		.card {
			padding: var(--s-5) var(--s-4);
		}

		.save.top {
			display: none;
		}

		.save.bottom {
			display: flex;
		}

		.save.bottom :global(.btn:last-child) {
			flex: 1;
		}

		.stage {
			place-items: end center;
			min-block-size: 560px;
		}

		.behind-panel {
			inset-inline: var(--s-4);
			inset-block-start: var(--s-4);
		}

		.sheet {
			inline-size: 100%;
			padding: var(--s-5) var(--s-4);
			border-radius: var(--r-panel) var(--r-panel) 0 0;
		}

		.sheet-foot :global(.btn:last-child) {
			flex: 1;
		}

		.more {
			align-self: flex-end;
		}
	}
</style>
