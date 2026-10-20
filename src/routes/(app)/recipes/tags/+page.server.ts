import { error, fail } from '@sveltejs/kit';
import { fold } from '#lib/text.ts';
import { deleteTag, listTags, renameTag } from '#lib/server/tags.ts';
import type { Actions, PageServerLoad } from './$types';

function tagFrom(form: FormData) {
	const id = Number(form.get('id'));
	const tag = listTags().find((t) => t.id === id);
	if (!tag) error(404, 'Not found');
	return tag;
}

export const load: PageServerLoad = () => ({ tags: listTags() });

export const actions: Actions = {
	rename: async ({ request }) => {
		const form = await request.formData();
		const tag = tagFrom(form);
		const name = String(form.get('name') ?? '');
		if (!fold(name)) return fail(400, { id: tag.id, error: 'Enter a name' });
		const { mergedInto } = renameTag(tag.id, name);
		const into = mergedInto === null ? null : listTags().find((t) => t.id === mergedInto);
		return { renamed: tag.id, merged: into ? { from: tag.name, into: into.name } : null };
	},

	delete: async ({ request }) => {
		const tag = tagFrom(await request.formData());
		deleteTag(tag.id);
		return { deleted: tag.name };
	}
};
