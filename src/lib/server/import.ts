import type { ImportResult, RecipeDraft, Section } from '../types.ts';
import { fold } from '../text.ts';

export const IMPORT_TIMEOUT_MS = 10_000;
export const MAX_PAGE_BYTES = 5 * 1024 * 1024;

const ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	ndash: '–',
	mdash: '—',
	hellip: '…',
	lsquo: '‘',
	rsquo: '’',
	ldquo: '“',
	rdquo: '”',
	deg: '°',
	frac12: '½',
	frac13: '⅓',
	frac14: '¼',
	frac34: '¾',
	times: '×',
	eacute: 'é',
	egrave: 'è',
	agrave: 'à',
	ccedil: 'ç',
	auml: 'ä',
	ouml: 'ö',
	uuml: 'ü',
	szlig: 'ß'
};

// one pass, so "&amp;lt;" ends as "&lt;"
function decodeEntities(s: string): string {
	return s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z][a-z0-9]*));/gi, (whole, dec, hex, name) => {
		if (name) return ENTITIES[name.toLowerCase()] ?? whole;
		const code = dec ? Number(dec) : parseInt(hex, 16);
		return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
	});
}

function stripTags(s: string): string {
	return s.replace(/<(?:br\s*\/?|\/p)\s*>/gi, ' ').replace(/<\/?[a-z][^>]*>/gi, '');
}

// strip, decode, strip again: some sites double-encode their markup ("&lt;p&gt;")
function clean(v: unknown): string {
	if (typeof v !== 'string') return '';
	return stripTags(decodeEntities(stripTags(v)))
		.replace(/\s+/g, ' ')
		.trim();
}

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : v == null ? [] : [v]);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const hasType = (o: Record<string, unknown>, type: string) =>
	asArray(o['@type']).some((t) => typeof t === 'string' && t.slice(t.lastIndexOf('/') + 1) === type);

function findRecipe(node: unknown): Record<string, unknown> | null {
	if (Array.isArray(node)) {
		for (const item of node) {
			const found = findRecipe(item);
			if (found) return found;
		}
		return null;
	}
	if (!isObject(node)) return null;
	if (hasType(node, 'Recipe')) return node;
	return findRecipe(node['@graph']);
}

function readJsonLd(html: string): Record<string, unknown> | null {
	for (const m of html.matchAll(/<script\b[^>]*\btype\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
		let json: unknown;
		try {
			json = JSON.parse(m[1]);
		} catch {
			continue;
		}
		const found = findRecipe(json);
		if (found) return found;
	}
	return null;
}

function resolveUrl(raw: string, pageUrl: string): string | null {
	try {
		const u = new URL(raw, pageUrl);
		return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
	} catch {
		return null;
	}
}

function readImage(v: unknown, pageUrl: string): string | null {
	for (const item of asArray(v)) {
		const raw = isObject(item) ? (item.url ?? item.contentUrl) : item;
		const url = typeof raw === 'string' && raw.trim() ? resolveUrl(raw.trim(), pageUrl) : null;
		if (url) return url;
	}
	return null;
}

function readTags(...values: unknown[]): string[] {
	const seen = new Set<string>();
	const names: string[] = [];
	for (const item of values.flatMap(asArray)) {
		for (const part of clean(item).split(',')) {
			const name = part.trim();
			if (name && !seen.has(fold(name))) {
				seen.add(fold(name));
				names.push(name);
			}
		}
	}
	return names;
}

function stepText(v: unknown): string {
	if (typeof v === 'string') return clean(v);
	return isObject(v) ? clean(v.text) || clean(v.name) : '';
}

function readSteps(v: unknown): Section<string>[] {
	const sections: Section<string>[] = [];
	let loose: Section<string> | null = null;
	const addLine = (line: string[]) => {
		if (!line.length) return;
		if (!loose) sections.push((loose = { title: null, lines: [] }));
		loose.lines.push(...line);
	};
	const items = typeof v === 'string' ? v.split(/\r?\n+/) : asArray(v);
	for (const item of items) {
		if (isObject(item) && hasType(item, 'HowToSection')) {
			const lines = asArray(item.itemListElement).map(stepText).filter(Boolean);
			if (lines.length) sections.push({ title: clean(item.name) || null, lines });
			loose = null;
		} else {
			addLine([stepText(item)].filter(Boolean));
		}
	}
	return sections;
}

export function parseDuration(iso: string): number | null {
	const m = /^P(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i.exec(
		iso.trim()
	);
	if (!m) return null;
	const [w, d, h, min, s] = m.slice(1).map(Number);
	const minutes = Math.round((w || 0) * 10080 + (d || 0) * 1440 + (h || 0) * 60 + (min || 0) + (s || 0) / 60);
	return minutes > 0 ? minutes : null;
}

export function parseYield(y: unknown): number | null {
	for (const item of asArray(y)) {
		const n = typeof item === 'number' ? Math.floor(item) : Number(/\d+/.exec(String(item))?.[0]);
		if (n >= 1) return n;
	}
	return null;
}

function minutesOf(v: unknown): number | null {
	return typeof v === 'string' ? parseDuration(v) : null;
}

// null = not a valid http(s) URL
export function normaliseUrl(input: string): string | null {
	let u: URL;
	try {
		u = new URL(input.trim());
	} catch {
		return null;
	}
	if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
	u.hash = '';
	return u.href;
}

// null = error status or over the size limit; network errors and timeouts throw
async function fetchPage(url: string, timeoutMs: number): Promise<{ html: string; url: string } | null> {
	const res = await fetch(url, {
		redirect: 'follow',
		signal: AbortSignal.timeout(timeoutMs),
		headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'Mozilla/5.0 (compatible; RuesCookingHub)' }
	});
	const announced = Number(res.headers.get('content-length'));
	if (!res.ok || !res.body || announced > MAX_PAGE_BYTES) {
		void res.body?.cancel();
		return null;
	}
	const reader = res.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.length;
		if (total > MAX_PAGE_BYTES) {
			void reader.cancel();
			return null;
		}
		chunks.push(value);
	}
	return { html: Buffer.concat(chunks).toString('utf8'), url: res.url };
}

function fallback(sourceUrl: string, meta: { title: string | null; imageUrl: string | null }): ImportResult {
	return {
		kind: 'fallback',
		draft: {
			title: meta.title ?? '',
			description: null,
			sourceUrl,
			servings: 2,
			prepMinutes: null,
			cookMinutes: null,
			imageUrl: meta.imageUrl,
			tagNames: [],
			ingredients: [],
			steps: []
		}
	};
}

export async function readRecipe(url: string, opts?: { timeoutMs?: number }): Promise<ImportResult> {
	const sourceUrl = normaliseUrl(url);
	if (!sourceUrl) return { kind: 'invalid' };
	let page: Awaited<ReturnType<typeof fetchPage>>;
	try {
		page = await fetchPage(sourceUrl, opts?.timeoutMs ?? IMPORT_TIMEOUT_MS);
	} catch {
		page = null;
	}
	if (!page) return fallback(sourceUrl, { title: null, imageUrl: null });
	const draft = extractRecipe(page.html, page.url);
	if (draft) return { kind: 'recipe', draft: { ...draft, sourceUrl } };
	return fallback(sourceUrl, extractMeta(page.html, page.url));
}

export function extractRecipe(html: string, pageUrl: string): RecipeDraft | null {
	const r = readJsonLd(html);
	if (!r) return null;
	const prep = minutesOf(r.prepTime);
	const cook = minutesOf(r.cookTime);
	const lines = asArray(r.recipeIngredient).map(clean).filter(Boolean);
	return {
		title: clean(r.name),
		description: clean(r.description) || null,
		sourceUrl: pageUrl,
		servings: parseYield(r.recipeYield) ?? 2,
		prepMinutes: prep,
		cookMinutes: prep === null && cook === null ? minutesOf(r.totalTime) : cook,
		imageUrl: readImage(r.image, pageUrl),
		tagNames: readTags(r.recipeCategory, r.keywords),
		ingredients: lines.length ? [{ title: null, lines }] : [],
		steps: readSteps(r.recipeInstructions)
	};
}

function metaContent(html: string, key: string): string | null {
	for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
		const attrs: Record<string, string> = {};
		for (const a of tag[0].matchAll(/([a-z][a-z:_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
			attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4];
		}
		if ((attrs.property ?? attrs.name)?.toLowerCase() === key && attrs.content !== undefined) {
			const value = clean(attrs.content);
			if (value) return value;
		}
	}
	return null;
}

export function extractMeta(
	html: string,
	pageUrl: string
): { title: string | null; imageUrl: string | null } {
	const image = metaContent(html, 'og:image');
	return {
		title: metaContent(html, 'og:title') ?? (clean(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]) || null),
		imageUrl: image ? resolveUrl(image, pageUrl) : null
	};
}
