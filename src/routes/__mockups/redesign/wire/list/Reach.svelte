<script lang="ts">
	let { dock = false }: { dock?: boolean } = $props();
</script>

<div class="phone" role="img" aria-label={dock ? 'Phone with the add field docked above the bar, in easy reach' : 'Phone with the add field at the top, in hard reach'}>
	<div class="band hard"><span class="zone">Hard to reach</span>
		<div class="title">Things to buy</div>
		{#if !dock}<div class="field">Add an item</div>{/if}
		{#if dock}<div class="plan">Add from plan</div>{/if}
	</div>
	<div class="band ok"><span class="zone">Reachable</span>
		<div class="row"></div><div class="row"></div><div class="row"></div>
	</div>
	<div class="band easy"><span class="zone">Easy</span>
		{#if !dock}<div class="row"></div>{/if}
		{#if dock}<div class="field">Add an item</div>{/if}
		<div class="bar"><span>Home</span><span class="on">List</span><span>Spots</span><span class="plus">+</span></div>
	</div>
</div>

<style>
	.phone { display: grid; grid-template-rows: 1fr 1fr 1.25fr; inline-size: 13rem; block-size: 27rem; border: var(--stroke-hairline) solid var(--edge-control); border-radius: var(--radius-card-s); overflow: hidden; font-size: var(--type-caption-size); }
	.band { position: relative; display: grid; gap: var(--space-1-5); align-content: start; padding: var(--space-6) var(--space-2) var(--space-2); }
	.hard { background: var(--surface-sunken); }
	.ok { background: var(--surface-tint); }
	.easy { background: var(--surface-tint-strong); align-content: end; }
	.zone { position: absolute; inset-block-start: var(--space-1); inset-inline-start: var(--space-2); color: var(--ink-secondary); font-size: var(--type-overline-size); letter-spacing: var(--type-overline-tracking); text-transform: uppercase; }
	.title { font-family: var(--font-display); font-size: var(--type-display-s-size); }
	.field, .plan { display: flex; align-items: center; min-block-size: var(--control-height-s); padding-inline: var(--space-3); border-radius: var(--radius-pill); background: var(--surface-raised); box-shadow: var(--ring-control); color: var(--ink-secondary); }
	.plan { background: var(--surface-inverse); color: var(--ink-on-inverse); box-shadow: none; }
	.row { min-block-size: var(--space-8); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--ring-hairline); }
	.bar { display: flex; align-items: center; gap: var(--space-1); padding: var(--space-1); border-radius: var(--radius-pill); background: var(--surface-raised); box-shadow: var(--ring-hairline); }
	.bar span { flex: 1; text-align: center; padding-block: var(--space-1); border-radius: var(--radius-pill); }
	.bar .on { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.bar .plus { flex: none; inline-size: var(--space-8); background: var(--surface-inverse); color: var(--ink-on-inverse); }
</style>
