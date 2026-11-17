import { link } from '../shell/links.ts';

export const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`;

export function total(prep: number | null, cook: number | null): number | null {
	if (prep === null && cook === null) return null;
	return (prep ?? 0) + (cook ?? 0);
}

export function timesLine(prep: number | null, cook: number | null): string | null {
	const sum = total(prep, cook);
	if (sum === null) return null;
	return [prep !== null ? `Prep ${prep} min` : null, cook !== null ? `Cook ${cook} min` : null, `${sum} min total`].filter(Boolean).join(' · ');
}

// the mockup photo's file name, which is what Frame's photo prop takes
export const photoName = (image: string | null) => image?.replace('/mockups/', '').replace('.jpg', '');

// non-Latin content gets its own lang so the hyphenation and fonts follow it
export const lang = (text: string) => (/[^\u0000-ɏ]/.test(text) ? 'und' : undefined);

export const pad = (n: number, digits: number) => String(n).padStart(Math.max(2, digits), '0');

export const go = {
	recipes: (worst: boolean) => link('hifi/recipes', worst),
	recipe: (worst: boolean) => link('hifi/recipe', worst),
	import: (worst: boolean) => link('hifi/import', worst),
	form: (worst: boolean) => link('hifi/form', worst),
	edit: (worst: boolean) => link('hifi/form/edit', worst),
	tags: (worst: boolean) => link('hifi/tags', worst),
	overlays: (worst: boolean) => link('hifi/overlays', worst)
};

// The worst-case fixtures cut long texts at an exact length, mid-word. A long text that ends on a letter is shown cut back to
// its last whole word with an ellipsis, as the real page clamps it; short texts and finished sentences pass untouched.
export function tidy(text: string): { text: string; cut: boolean } {
	const trimmed = text.trimEnd();
	if (trimmed.length < 100 || !/\p{L}$/u.test(trimmed) || !trimmed.includes(' ')) return { text, cut: false };
	return { text: trimmed.slice(0, trimmed.lastIndexOf(' ')), cut: true };
}
export const clip = (text: string) => {
	const t = tidy(text);
	return t.cut ? `${t.text}…` : t.text;
};
