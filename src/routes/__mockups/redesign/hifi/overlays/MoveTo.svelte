<!-- "Move to…": the alternative to every drag. A day, a meal, and a line that says where the entry lands. -->
<script lang="ts">
	import Button from '../shell/Button.svelte';
	import Choice from './Choice.svelte';
	import Overlay from './Overlay.svelte';

	type Day = { short: string; weekday: string; day: number };
	type Props = { live?: boolean; open?: boolean; entry: string; days: Day[]; currentDay: string; currentMeal: string; startDay?: string; startMeal?: string; onmove?: (day: string, meal: string) => void };
	let { live = false, open = $bindable(false), entry, days, currentDay, currentMeal, startDay = currentDay, startMeal = currentMeal, onmove }: Props = $props();

	const seed = () => ({ day: startDay, meal: startMeal });
	let day = $state(seed().day);
	let meal = $state(seed().meal);
	$effect(() => {
		if (open) {
			day = currentDay;
			meal = currentMeal;
		}
	});
	const unchanged = $derived(day === currentDay && meal === currentMeal);
	const dayName = $derived(days.find((d) => d.short === day)?.weekday ?? '');
	const currentName = $derived(days.find((d) => d.short === currentDay)?.weekday ?? '');
	const summary = $derived(unchanged ? `To the end of ${currentName} · ${currentMeal}` : `Into ${dayName} · ${meal}`);
	const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((label) => ({ label }));
</script>

{#snippet content()}
	<p class="what">{entry}</p>
	<Choice legend="Day" options={days.map((d) => ({ label: d.short, sub: String(d.day), value: d.short, name: `${d.weekday} ${d.day}` }))} bind:value={day} columns={7} narrow={4} compact />
	<Choice legend="Meal" options={meals} bind:value={meal} columns={4} narrow={2} compact />
	<p class="summary" aria-live="polite">{summary}</p>
{/snippet}
{#snippet buttons()}
	<Button variant="quiet" onclick={() => (open = false)}>Cancel</Button>
	<Button
		variant="primary"
		onclick={() => {
			open = false;
			onmove?.(day, meal);
		}}>Move here</Button
	>
{/snippet}

<Overlay {live} bind:open title="Move to…" kicker="Plan entry" label="Move {entry}" children={content} actions={buttons} />

<style>
	.what {
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.summary {
		padding: var(--space-2-5) var(--space-4);
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		overflow-wrap: anywhere;
	}
</style>
