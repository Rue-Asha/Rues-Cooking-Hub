<!-- "Add to plan" on the recipe page: pick a day and a meal in the shown week, then the servings. -->
<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Choice from './Choice.svelte';
	import Field from './Field.svelte';
	import Icon from './Icon.svelte';
	import Notice from './Notice.svelte';
	import Overlay from './Overlay.svelte';
	import Stepper from './Stepper.svelte';
	import { areaPath, link } from '../shell/links.ts';

	type Day = { short: string; weekday: string; day: number };
	type Props = { live?: boolean; open?: boolean; recipe: string; servings: number; range: string; days: Day[]; todayShort: string; variant?: 'pick' | 'error' | 'added'; added?: string };
	let { live = false, open = $bindable(false), recipe, servings, range, days, todayShort, variant = 'pick', added = 'Wednesday · Dinner' }: Props = $props();

	const seed = () => ({ day: todayShort, count: variant === 'error' ? '0' : String(servings), done: variant === 'added', touched: variant === 'error' });
	let day = $state(seed().day);
	let meal = $state('Dinner');
	let count = $state(seed().count);
	let done = $state(seed().done);
	let touched = $state(seed().touched);
	$effect(() => {
		if (open) done = variant === 'added';
	});
	const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((label) => ({ label }));
	const invalid = $derived(!(Number.parseInt(count, 10) >= 1));
	const error = $derived(touched && invalid ? 'Servings must be at least 1' : undefined);
	const step = (by: number) => {
		touched = true;
		count = String(Math.max(0, (Number.parseInt(count, 10) || 0) + by));
	};
	const add = () => {
		touched = true;
		if (!invalid) done = true;
	};
</script>

{#snippet content()}
	{#if done}
		<Notice>Added to {added}</Notice>
	{:else}
		<Stepper label="Week" {range} prev="Earlier week" next="Later week" />
		<Choice legend="Day" options={days.map((d) => ({ label: d.short, sub: String(d.day), value: d.short, name: `${d.weekday} ${d.day}` }))} bind:value={day} columns={7} narrow={4} compact />
		<Choice legend="Meal" options={meals} bind:value={meal} columns={4} narrow={2} compact />
		<div class="servings" role="group" aria-label="Servings">
			<Button size="s" icon label="Fewer servings" onclick={() => step(-1)}><Icon name="minus" /></Button>
			<div class="num"><Field label="Servings" bind:value={count} inputmode="numeric" {error} onblur={() => (touched = true)} /></div>
			<Button size="s" icon label="More servings" onclick={() => step(1)}><Icon name="plus" /></Button>
		</div>
	{/if}
{/snippet}
{#snippet buttons()}
	{#if done}
		<Button variant="quiet" onclick={() => (open = false)}>Done</Button>
		<Button variant="primary" arrow href={link(areaPath.plan)}>Open the week</Button>
	{:else}
		<Button variant="quiet" onclick={() => (open = false)}>Cancel</Button>
		<Button variant="primary" onclick={add}>Add to plan</Button>
	{/if}
{/snippet}

<Overlay {live} bind:open title="Add to plan" kicker={recipe} children={content} actions={buttons} />

<style>
	.servings {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
	}
	.num {
		flex: 1;
		min-inline-size: 0;
	}
	.servings :global(.btn.icon) {
		margin-block-start: calc(var(--type-label-line) * var(--type-label-size) + var(--space-1-5));
	}
</style>
