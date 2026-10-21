import { COPY } from '#lib/copy.ts';
import { ImageError } from '#lib/errors.ts';
import { storeImage, storeImageFromUrl } from '#lib/server/images.ts';
import { createRecipe, getRecipe, updateRecipe } from '#lib/server/recipes.ts';
import type { Id, RecipeInput, Section } from '#lib/types.ts';

// imageFailed: the link could not be downloaded; imageKept: ... and the recipe still has the image it had before
export type Saved = { id: Id; imageFailed: boolean; imageKept: boolean };
export type SaveResult = Saved | { errors: Record<string, string> };

const text = (form: FormData, key: string): string => {
	const v = form.get(key);
	return typeof v === 'string' ? v : '';
};

// empty is "no time"; anything else must be a whole number
function minutes(form: FormData, key: string, errors: Record<string, string>): number | null {
	const raw = text(form, key).trim();
	if (!raw) return null;
	if (!/^\d+$/.test(raw)) errors[key] = COPY.minutesInvalid;
	return Number(raw);
}

// A section starts at its title field; the lines that follow in document order belong to it.
function sections(form: FormData, titleKey: string, lineKey: string): Section<string>[] {
	const out: Section<string>[] = [];
	for (const [key, value] of form.entries()) {
		if (typeof value !== 'string') continue;
		if (key === titleKey) out.push({ title: value, lines: [] });
		else if (key === lineKey) {
			if (out.length === 0) out.push({ title: null, lines: [] });
			out[out.length - 1].lines.push(value);
		}
	}
	return out;
}

type Resolved = { imageId: Id | null; imageFailed: boolean } | { error: string };

// An uploaded file wins over a link, a link over "Remove image"; with none of them the stored image stays.
// A broken file is the user's to fix, a broken link only costs the new image: the stored one stays.
async function resolveImage(form: FormData, stored: Id | null): Promise<Resolved> {
	const file = form.get('image');
	if (file instanceof File && file.size > 0) {
		try {
			return { imageId: await storeImage(new Uint8Array(await file.arrayBuffer())), imageFailed: false };
		} catch (e) {
			if (!(e instanceof ImageError)) throw e;
			return { error: e.reason === 'too-large' ? COPY.tooLarge : COPY.notImage };
		}
	}
	const url = text(form, 'imageUrl').trim();
	if (url) {
		try {
			return { imageId: await storeImageFromUrl(url), imageFailed: false };
		} catch (e) {
			if (!(e instanceof ImageError)) throw e;
			return { imageId: stored, imageFailed: true };
		}
	}
	return { imageId: text(form, 'removeImage') === '1' ? null : stored, imageFailed: false };
}

export async function saveFromForm(form: FormData, existingId?: Id): Promise<SaveResult> {
	const errors: Record<string, string> = {};
	if (!text(form, 'title').trim()) errors.title = COPY.titleRequired;
	const servings = /^\s*\d+\s*$/.test(text(form, 'servings')) ? Number(text(form, 'servings')) : 0;
	if (servings < 1) errors.servings = COPY.servingsMin;
	const prepMinutes = minutes(form, 'prepMinutes', errors);
	const cookMinutes = minutes(form, 'cookMinutes', errors);
	if (Object.keys(errors).length > 0) return { errors };

	const existing = existingId === undefined ? null : getRecipe(existingId);
	const image = await resolveImage(form, existing?.imageId ?? null);
	if ('error' in image) return { errors: { image: image.error } };

	const input: RecipeInput = {
		title: text(form, 'title'),
		description: text(form, 'description'),
		sourceUrl: text(form, 'sourceUrl'),
		servings,
		prepMinutes,
		cookMinutes,
		notes: text(form, 'notes'),
		favourite: existing?.favourite ?? false,
		imageId: image.imageId,
		tagNames: form.getAll('tag').filter((t) => typeof t === 'string'),
		ingredients: sections(form, 'ingredientSection', 'ingredientLine'),
		steps: sections(form, 'stepSection', 'stepLine')
	};
	const imageKept = image.imageFailed && image.imageId !== null;
	if (existingId === undefined) return { id: createRecipe(input), imageFailed: image.imageFailed, imageKept };
	updateRecipe(existingId, input);
	return { id: existingId, imageFailed: image.imageFailed, imageKept };
}

// A recipe saved without its image opens the edit form with the notice, so the photo can be added right away.
export const savedLocation = ({ id, imageFailed, imageKept }: Saved): string =>
	imageFailed ? `/recipes/${id}/edit?imageFailed=${imageKept ? 'kept' : '1'}` : `/recipes/${id}`;
