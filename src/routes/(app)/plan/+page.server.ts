import { error, fail } from '@sveltejs/kit';
import { addDays, isIsoDate, weekDays, weekStart } from '#lib/dates.ts';
import { ValidationError } from '#lib/errors.ts';
import { today } from '#lib/server/clock.ts';
import { addEntry, copyWeek, deleteEntry, entriesInRange, moveEntry, updateEntry, weekEntries } from '#lib/server/plan.ts';
import { listRecipes } from '#lib/server/recipes.ts';
import { SLOTS, type Slot } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

// how many earlier weeks "Copy week" can take from
const SOURCE_WEEKS = 26;

export const load: PageServerLoad = ({ url }) => {
	const now = today();
	const param = url.searchParams.get('week') ?? '';
	const monday = weekStart(isIsoDate(param) ? param : now);
	const counts = new Map<string, number>();
	for (const e of entriesInRange(addDays(monday, -7 * SOURCE_WEEKS), addDays(monday, -1)))
		counts.set(weekStart(e.date), (counts.get(weekStart(e.date)) ?? 0) + 1);
	return {
		monday,
		today: now,
		thisMonday: weekStart(now),
		days: weekDays(monday),
		entries: weekEntries(monday),
		sources: Array.from({ length: SOURCE_WEEKS }, (_, i) => {
			const source = addDays(monday, -7 * (i + 1));
			return { monday: source, count: counts.get(source) ?? 0 };
		}),
		recipes: listRecipes({ sort: 'title' }).map(({ id, title, imageId, servings, totalMinutes, tags }) => ({
			id,
			title,
			imageId,
			servings,
			totalMinutes,
			tags
		}))
	};
};

const slotOf = (value: FormDataEntryValue | null): Slot => {
	const slot = SLOTS.find((s) => s.id === value);
	if (!slot) error(400, 'Unknown slot');
	return slot.id;
};

const dateOf = (value: FormDataEntryValue | null): string => {
	if (typeof value !== 'string' || !isIsoDate(value)) error(400, 'Unknown date');
	return value;
};

// a rejected value comes back as field messages for the form that sent it
const guard = (write: () => void) => {
	try {
		write();
	} catch (e) {
		if (e instanceof ValidationError) return fail(400, { errors: e.errors });
		throw e;
	}
	return { ok: true };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const form = await request.formData();
		const date = dateOf(form.get('date'));
		const slot = slotOf(form.get('slot'));
		const position = form.get('position');
		return guard(() => {
			const id =
				form.get('kind') === 'text'
					? addEntry({ date, slot, text: String(form.get('text') ?? '') })
					: addEntry({
							date,
							slot,
							recipeId: Number(form.get('recipeId')),
							servings: Number(form.get('servings'))
						});
			// a recipe dropped on an entry goes in before it
			if (position !== null) moveEntry(id, { date, slot, position: Number(position) });
		});
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		return guard(() => {
			if (form.has('servings')) updateEntry(id, { servings: Number(form.get('servings')) });
			else updateEntry(id, { text: String(form.get('text') ?? '') });
		});
	},

	move: async ({ request }) => {
		const form = await request.formData();
		const position = form.get('position');
		moveEntry(Number(form.get('id')), {
			date: dateOf(form.get('date')),
			slot: slotOf(form.get('slot')),
			...(position === null ? {} : { position: Number(position) })
		});
		return { ok: true };
	},

	copy: async ({ request }) => {
		const form = await request.formData();
		const from = weekStart(dateOf(form.get('from')));
		const to = weekStart(dateOf(form.get('to')));
		if (from === to) error(400, 'Pick another week to copy from');
		return { copied: copyWeek(from, to).copied };
	},

	delete: async ({ request }) => {
		deleteEntry(Number((await request.formData()).get('id')));
		return { ok: true };
	}
};
