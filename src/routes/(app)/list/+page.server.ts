import { error, fail } from '@sveltejs/kit';
import { COPY } from '#lib/copy.ts';
import { addDays, isIsoDate, weekStart } from '#lib/dates.ts';
import { today } from '#lib/server/clock.ts';
import {
	addFromPlan,
	addManual,
	clearChecked,
	deleteItem,
	listItems,
	setCategory,
	setChecked,
	updateItem
} from '#lib/server/shopping.ts';
import { parseAmounts } from '#lib/shopping/aggregate.ts';
import { CATEGORIES, type Category } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

function itemId(form: FormData): number {
	const id = Number(form.get('id'));
	if (!Number.isInteger(id) || id < 1) error(400, 'Bad item');
	return id;
}

const text = (form: FormData, key: string) => String(form.get(key) ?? '');

export const load: PageServerLoad = () => {
	const monday = weekStart(today());
	return { items: listItems(), week: { from: monday, to: addDays(monday, 6) } };
};

export const actions: Actions = {
	add: async ({ request }) => {
		addManual(text(await request.formData(), 'text'));
	},
	edit: async ({ request }) => {
		const form = await request.formData();
		const id = itemId(form);
		const amounts = parseAmounts(text(form, 'amount'));
		if (amounts === null) return fail(400, { edit: id, error: COPY.amountInvalid });
		updateItem(id, { name: text(form, 'name'), amounts });
	},
	delete: async ({ request }) => {
		deleteItem(itemId(await request.formData()));
	},
	check: async ({ request }) => {
		const form = await request.formData();
		setChecked(itemId(form), form.get('checked') === '1');
	},
	clear: () => {
		clearChecked();
	},
	category: async ({ request }) => {
		const form = await request.formData();
		const category = text(form, 'category');
		if (!CATEGORIES.some((c) => c.id === category)) error(400, 'Bad category');
		setCategory(itemId(form), category as Category);
	},
	plan: async ({ request }) => {
		const form = await request.formData();
		const dates = [text(form, 'from'), text(form, 'to')];
		if (!dates.every(isIsoDate)) return fail(400, { plan: { kind: 'invalid' as const } });
		const [from, to] = dates.sort();
		return { plan: addFromPlan(from, to) };
	}
};
