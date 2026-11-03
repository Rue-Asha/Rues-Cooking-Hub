import { COPY } from '#lib/copy.ts';
import { resolveImage } from '#lib/recipes/save.ts';
import { createSpot, getSpot, markVisited, spotErrors, updateSpot } from '#lib/server/spots.ts';
import type { Id, Price, SpotInput } from '#lib/types.ts';
import { parseScore } from './score.ts';

// imageFailed: the link could not be downloaded; imageKept: ... and the spot still has the image it had before
export type SpotSaved = { id: Id; imageFailed: boolean; imageKept: boolean };
export type SpotSaveResult = SpotSaved | { errors: Record<string, string> };

const text = (form: FormData, key: string): string => {
	const v = form.get(key);
	return typeof v === 'string' ? v : '';
};

function scoreOf(raw: string): { hundredths: number } | { error: string } {
	const score = parseScore(raw);
	if (score.ok) return { hundredths: score.hundredths };
	return { error: score.reason === 'empty' ? COPY.scoreRequired : COPY.scoreInvalid };
}

export async function saveSpotFromForm(form: FormData, existingId?: Id): Promise<SpotSaveResult> {
	const status = text(form, 'status') === 'visited' ? 'visited' : 'want';
	const errors: Record<string, string> = {};
	let scoreHundredths: number | null = null;
	if (status === 'visited') {
		const score = scoreOf(text(form, 'score'));
		if ('error' in score) errors.score = score.error;
		else scoreHundredths = score.hundredths;
	}
	const price = text(form, 'price');
	const input: SpotInput = {
		name: text(form, 'name'),
		status,
		scoreHundredths,
		price: /^[1-4]$/.test(price) ? (Number(price) as Price) : null,
		city: text(form, 'city'),
		neighbourhood: text(form, 'neighbourhood'),
		address: text(form, 'address'),
		website: text(form, 'website'),
		notes: text(form, 'notes'),
		imageId: null,
		tagNames: form.getAll('tag').filter((t) => typeof t === 'string')
	};
	// a score that did not parse leaves null, which spotErrors would report as missing: the parse message wins
	Object.assign(errors, { ...spotErrors(input), ...errors });
	if (Object.keys(errors).length > 0) return { errors };

	const existing = existingId === undefined ? null : getSpot(existingId);
	const image = await resolveImage(form, existing?.imageId ?? null);
	if ('error' in image) return { errors: { image: image.error } };
	input.imageId = image.imageId;

	const imageKept = image.imageFailed && image.imageId !== null;
	if (existingId === undefined) return { id: createSpot(input), imageFailed: image.imageFailed, imageKept };
	updateSpot(existingId, input);
	return { id: existingId, imageFailed: image.imageFailed, imageKept };
}

export function visitFromForm(form: FormData, id: Id): { ok: true } | { errors: { score: string } } {
	const score = scoreOf(text(form, 'score'));
	if ('error' in score) return { errors: { score: score.error } };
	markVisited(id, score.hundredths);
	return { ok: true };
}

// a spot saved without its photo opens the edit form with the notice, so the photo can be added right away
export const spotSavedLocation = ({ id, imageFailed, imageKept }: SpotSaved): string =>
	imageFailed ? `/eating-out/${id}/edit?imageFailed=${imageKept ? 'kept' : '1'}` : `/eating-out/${id}`;
