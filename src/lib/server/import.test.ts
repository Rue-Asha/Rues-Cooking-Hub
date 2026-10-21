import { readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	extractMeta,
	extractRecipe,
	MAX_PAGE_BYTES,
	normaliseUrl,
	parseDuration,
	parseYield,
	readRecipe
} from './import.ts';

const fixtureDir = new URL('../../../fixtures/import/', import.meta.url);
const expected: Record<
	string,
	{
		url: string;
		title?: string;
		servings?: number;
		prepMinutes?: number | null;
		cookMinutes?: number | null;
		imageUrl?: string | null;
		tagNames?: string[];
		ingredients?: number;
		steps?: number;
	}
> = JSON.parse(readFileSync(new URL('expected.json', fixtureDir), 'utf8'));

const page = (...ld: unknown[]) =>
	`<html><head>${ld
		.map((x) => `<script type="application/ld+json">${typeof x === 'string' ? x : JSON.stringify(x)}</script>`)
		.join('')}</head></html>`;
const recipe = (extra: Record<string, unknown> = {}) => ({
	'@context': 'https://schema.org',
	'@type': 'Recipe',
	name: 'Pie',
	recipeIngredient: ['1 apple'],
	recipeInstructions: ['Bake.'],
	...extra
});
const countLines = (sections: { lines: string[] }[]) => sections.reduce((n, s) => n + s.lines.length, 0);

describe('extractRecipe', () => {
	const recipeFixtures = Object.entries(expected).filter(([, e]) => e.ingredients);

	it('Scenario: Recipe is read from saved real pages', () => {
		expect(recipeFixtures.length).toBeGreaterThanOrEqual(3);
		for (const [file, e] of recipeFixtures) {
			const draft = extractRecipe(readFileSync(new URL(file, fixtureDir), 'utf8'), e.url);

			expect(draft, file).not.toBeNull();
			expect(draft!.title, file).toBe(e.title);
			expect(countLines(draft!.ingredients), file).toBe(e.ingredients);
			expect(draft!.ingredients.every((s) => s.lines.every((l) => l.trim() !== ''))).toBe(true);
			expect(countLines(draft!.steps), file).toBe(e.steps);
			expect(draft!.servings, file).toBe(e.servings);
			expect(draft!.prepMinutes, file).toBe(e.prepMinutes);
			expect(draft!.cookMinutes, file).toBe(e.cookMinutes);
			expect(draft!.imageUrl, file).toBe(e.imageUrl);
			expect(draft!.tagNames, file).toEqual(e.tagNames);
			expect(draft!.sourceUrl).toBe(e.url);
		}
	});

	it('decodes entities in real page text', () => {
		const draft = extractRecipe(
			readFileSync(new URL('butter-chicken.html', fixtureDir), 'utf8'),
			expected['butter-chicken.html'].url
		);

		expect(draft!.description).toContain("you'll find this rich enough");
		expect(draft!.description).not.toContain('&#39;');
	});

	it('returns null for a page without Recipe data', () => {
		const html = readFileSync(new URL('no-recipe.html', fixtureDir), 'utf8');

		expect(extractRecipe(html, 'https://www.eat-this.org/')).toBeNull();
		expect(extractRecipe('<html></html>', 'https://x.org/')).toBeNull();
	});

	it('Scenario: Recipe found inside @graph', () => {
		const html = page({
			'@context': 'https://schema.org',
			'@graph': [
				{ '@type': 'WebPage', name: 'Not this' },
				{ '@type': 'Organization', name: 'Nor this' },
				recipe({ '@type': ['Recipe'], name: 'Graph pie', recipeYield: '6' })
			]
		});
		const draft = extractRecipe(html, 'https://example.com/r/pie');

		expect(draft).toMatchObject({ title: 'Graph pie', servings: 6, sourceUrl: 'https://example.com/r/pie' });
		expect(draft!.ingredients).toEqual([{ title: null, lines: ['1 apple'] }]);
		expect(draft!.steps).toEqual([{ title: null, lines: ['Bake.'] }]);
	});

	it('finds the Recipe in arrays, in @type arrays and behind invalid JSON', () => {
		const html = page(
			'{ not json',
			[{ '@type': 'BreadcrumbList' }, recipe({ '@type': ['Recipe', 'NewsArticle'], name: 'Array pie' })],
			recipe({ name: 'Second' })
		);

		expect(extractRecipe(html, 'https://example.com/')!.title).toBe('Array pie');
		expect(extractRecipe(page(recipe({ '@type': 'https://schema.org/Recipe' })), 'https://x.org/')).not.toBeNull();
	});

	it('Scenario: HowToSection becomes step sections', () => {
		const html = page(
			recipe({
				recipeInstructions: [
					{
						'@type': 'HowToSection',
						name: 'Dough',
						itemListElement: [
							{ '@type': 'HowToStep', text: 'Mix flour and water.' },
							{ '@type': 'HowToStep', text: 'Knead.' }
						]
					},
					{
						'@type': 'HowToSection',
						name: 'Filling',
						itemListElement: [{ '@type': 'HowToStep', text: 'Slice the apples.' }]
					}
				]
			})
		);

		expect(extractRecipe(html, 'https://example.com/')!.steps).toEqual([
			{ title: 'Dough', lines: ['Mix flour and water.', 'Knead.'] },
			{ title: 'Filling', lines: ['Slice the apples.'] }
		]);
	});

	it('reads steps given as one string, strings, HowToSteps and a mix', () => {
		const steps = (recipeInstructions: unknown) =>
			extractRecipe(page(recipe({ recipeInstructions })), 'https://x.org/')!.steps;

		expect(steps('One.\nTwo.\r\n\r\nThree.')).toEqual([{ title: null, lines: ['One.', 'Two.', 'Three.'] }]);
		expect(steps(['A', { '@type': 'HowToStep', name: 'Name only' }, { '@type': 'HowToStep', text: 'T', name: 'N' }])).toEqual([
			{ title: null, lines: ['A', 'Name only', 'T'] }
		]);
		expect(
			steps([
				'Loose first.',
				{ '@type': 'HowToSection', name: 'Part', itemListElement: ['In part.'] },
				{ '@type': 'HowToStep', text: 'Loose last.' }
			])
		).toEqual([
			{ title: null, lines: ['Loose first.'] },
			{ title: 'Part', lines: ['In part.'] },
			{ title: null, lines: ['Loose last.'] }
		]);
		expect(steps([{ '@type': 'HowToSection', name: 'Empty', itemListElement: [] }])).toEqual([]);
	});

	it('strips tags and decodes entities in text', () => {
		const draft = extractRecipe(
			page(
				recipe({
					name: 'Mac &amp; Cheese &#8211; the <i>best</i>',
					description: '<p>Rich &amp; creamy.</p><p>Don&#39;t skip it &lt;3 &frac12; cup</p>',
					recipeIngredient: ['2&nbsp;cups <b>milk</b>', '  ', '1 tsp salt'],
					recipeInstructions: ['Heat <a href="/x">the milk</a>&hellip;']
				})
			),
			'https://x.org/'
		)!;

		expect(draft.title).toBe('Mac & Cheese – the best');
		expect(draft.description).toBe("Rich & creamy. Don't skip it <3 ½ cup");
		expect(draft.ingredients).toEqual([{ title: null, lines: ['2 cups milk', '1 tsp salt'] }]);
		expect(draft.steps[0].lines).toEqual(['Heat the milk…']);
	});

	it('uses empty sections and defaults when fields are missing', () => {
		const draft = extractRecipe(page({ '@type': 'Recipe', name: 'Bare' }), 'https://x.org/')!;

		expect(draft).toEqual({
			title: 'Bare',
			description: null,
			sourceUrl: 'https://x.org/',
			servings: 2,
			prepMinutes: null,
			cookMinutes: null,
			imageUrl: null,
			tagNames: [],
			ingredients: [],
			steps: []
		});
	});

	it('maps durations, with only totalTime as cook minutes', () => {
		const times = (extra: Record<string, unknown>) => {
			const d = extractRecipe(page(recipe(extra)), 'https://x.org/')!;
			return [d.prepMinutes, d.cookMinutes];
		};

		expect(times({ prepTime: 'PT15M', cookTime: 'PT1H' })).toEqual([15, 60]);
		expect(times({ totalTime: 'PT45M' })).toEqual([null, 45]);
		expect(times({ prepTime: 'PT10M', totalTime: 'PT10M' })).toEqual([10, null]);
		expect(times({ prepTime: 'soon' })).toEqual([null, null]);
	});

	it('Scenario: Categories and keywords become tag names', () => {
		const draft = extractRecipe(
			page(recipe({ recipeCategory: 'Dessert', keywords: 'baking, Dessert,  quick ' })),
			'https://x.org/'
		)!;

		expect(draft.tagNames).toEqual(['Dessert', 'baking', 'quick']);
	});

	it('reads tag names from arrays and comma strings inside arrays', () => {
		const draft = extractRecipe(
			page(recipe({ recipeCategory: ['Main', 'Soup, Winter'], keywords: ['soup', ' ', 'Quick'] })),
			'https://x.org/'
		)!;

		expect(draft.tagNames).toEqual(['Main', 'Soup', 'Winter', 'Quick']);
	});

	it('Scenario: Relative image URL is resolved', () => {
		const draft = extractRecipe(page(recipe({ image: { url: '/img/pie.jpg' } })), 'https://example.com/r/pie')!;

		expect(draft.imageUrl).toBe('https://example.com/img/pie.jpg');
	});

	it('reads image as string, object, array and rejects non-http URLs', () => {
		const image = (v: unknown) => extractRecipe(page(recipe({ image: v })), 'https://example.com/r/pie')!.imageUrl;

		expect(image('https://cdn.org/a.jpg')).toBe('https://cdn.org/a.jpg');
		expect(image('a.jpg')).toBe('https://example.com/r/a.jpg');
		expect(image('//cdn.org/b.jpg')).toBe('https://cdn.org/b.jpg');
		expect(image([{ '@type': 'ImageObject', url: 'https://cdn.org/c.jpg' }, 'https://cdn.org/d.jpg'])).toBe('https://cdn.org/c.jpg');
		expect(image({ contentUrl: '/e.jpg' })).toBe('https://example.com/e.jpg');
		expect(image('data:image/png;base64,AAAA')).toBeNull();
		expect(image(undefined)).toBeNull();
		expect(image([])).toBeNull();
	});
});

describe('parseDuration', () => {
	it('Scenario: ISO 8601 durations become minutes', () => {
		expect(parseDuration('PT1H30M')).toBe(90);
		expect(parseDuration('PT45M')).toBe(45);
		expect(parseDuration('P0DT0H20M')).toBe(20);
		expect(parseDuration('soon')).toBeNull();
	});

	it('handles days, weeks, seconds, lower case and empty durations', () => {
		expect(parseDuration('P1DT2H')).toBe(26 * 60);
		expect(parseDuration('P1W')).toBe(7 * 24 * 60);
		expect(parseDuration('PT90S')).toBe(2);
		expect(parseDuration('pt5m')).toBe(5);
		expect(parseDuration('PT1.5H')).toBe(90);
		expect(parseDuration('PT0M')).toBeNull();
		expect(parseDuration('P')).toBeNull();
		expect(parseDuration('PT')).toBeNull();
		expect(parseDuration('')).toBeNull();
	});
});

describe('parseYield', () => {
	it('Scenario: recipeYield becomes servings', () => {
		expect(parseYield('4 servings')).toBe(4);
		expect(parseYield(['6', '6 portions'])).toBe(6);
		expect(parseYield(8)).toBe(8);
		expect(parseYield(undefined)).toBeNull();
		expect(
			extractRecipe(page(recipe({ recipeYield: '4 servings' })), 'https://x.org/')!.servings
		).toBe(4);
		expect(extractRecipe(page(recipe({ recipeYield: ['6', '6 portions'] })), 'https://x.org/')!.servings).toBe(6);
		expect(extractRecipe(page(recipe({ recipeYield: 8 })), 'https://x.org/')!.servings).toBe(8);
		expect(extractRecipe(page(recipe()), 'https://x.org/')!.servings).toBe(2);
	});

	it('handles words, zero and unusable values', () => {
		expect(parseYield('Makes 12')).toBe(12);
		expect(parseYield('serves 4-6')).toBe(4);
		expect(parseYield('a few')).toBeNull();
		expect(parseYield(0)).toBeNull();
		expect(parseYield('0 servings')).toBeNull();
		expect(parseYield(null)).toBeNull();
		expect(parseYield({})).toBeNull();
		expect(parseYield([])).toBeNull();
	});
});

describe('normaliseUrl', () => {
	it('keeps http and https URLs, trims and drops the hash', () => {
		expect(normaliseUrl('  https://example.com/r/pie#ingredients ')).toBe('https://example.com/r/pie');
		expect(normaliseUrl('http://example.com')).toBe('http://example.com/');
		expect(normaliseUrl('https://example.com/r?a=1&b=2')).toBe('https://example.com/r?a=1&b=2');
	});

	it('returns null for other schemes and non-URLs', () => {
		for (const bad of ['file:///etc/passwd', 'ftp://x.org/r', 'javascript:alert(1)', 'not a url', 'example.com/pie', '']) {
			expect(normaliseUrl(bad), bad).toBeNull();
		}
	});
});

describe('extractMeta', () => {
	it('prefers og:title over <title> and resolves og:image', () => {
		const html = `<head><title>Plain title</title>
			<meta property="og:image" content="/img/pie.jpg">
			<meta content="Grandma&#39;s Pie" property="og:title"></head>`;

		expect(extractMeta(html, 'https://example.com/r/pie')).toEqual({
			title: "Grandma's Pie",
			imageUrl: 'https://example.com/img/pie.jpg'
		});
	});

	it('falls back to <title> and ignores og:image sub-properties', () => {
		const html = `<title>
			Soup &amp; Bread </title><meta property="og:image:width" content="900"><meta name='og:image' content='https://cdn.org/s.jpg'>`;

		expect(extractMeta(html, 'https://example.com/')).toEqual({ title: 'Soup & Bread', imageUrl: 'https://cdn.org/s.jpg' });
	});

	it('returns nulls when there is nothing', () => {
		expect(extractMeta('<html><title> </title></html>', 'https://example.com/')).toEqual({ title: null, imageUrl: null });
	});

	it('reads the saved fallback fixture', () => {
		const e = expected['no-recipe.html'];

		expect(extractMeta(readFileSync(new URL('no-recipe.html', fixtureDir), 'utf8'), e.url)).toEqual({
			title: e.title,
			imageUrl: e.imageUrl
		});
	});
});

describe('readRecipe', () => {
	const servers: Server[] = [];
	afterEach(() => {
		vi.restoreAllMocks();
		for (const s of servers.splice(0)) {
			s.closeAllConnections();
			s.close();
		}
	});

	async function serve(handler: (req: IncomingMessage, res: ServerResponse) => void): Promise<string> {
		const server = createServer(handler);
		servers.push(server);
		await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
		return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
	}
	const html = (body: string) => (_: IncomingMessage, res: ServerResponse) => {
		res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
		res.end(body);
	};
	const bare = (sourceUrl: string) => ({
		kind: 'fallback',
		draft: expect.objectContaining({ sourceUrl, title: '', imageUrl: null, ingredients: [], steps: [], tagNames: [] })
	});

	it('reads a recipe page and follows redirects', async () => {
		const base = await serve((req, res) => {
			if (req.url === '/old') {
				res.writeHead(301, { location: '/r/pie' }).end();
				return;
			}
			html(readFileSync(new URL('easy-pancakes.html', fixtureDir), 'utf8'))(req, res);
		});
		const result = await readRecipe(`${base}/old#top`);

		expect(result.kind).toBe('recipe');
		if (result.kind !== 'recipe') return;
		expect(result.draft).toMatchObject({ title: 'Easy pancakes', servings: 12, sourceUrl: `${base}/old` });
	});

	it('Scenario: Page without Recipe data falls back to meta tags', async () => {
		const base = await serve(
			html(`<html><head><title>Other</title><meta property="og:title" content="Grandma's Pie">
				<meta property="og:image" content="https://cdn.example.org/pie.jpg"></head><body>No recipe</body></html>`)
		);
		const result = await readRecipe(`${base}/pie`);

		expect(result.kind).toBe('fallback');
		expect(result).toMatchObject({
			draft: {
				title: "Grandma's Pie",
				imageUrl: 'https://cdn.example.org/pie.jpg',
				sourceUrl: `${base}/pie`,
				description: null,
				ingredients: [],
				steps: [],
				tagNames: []
			}
		});
	});

	it('Scenario: Unreachable page is a fallback', async () => {
		const base = await serve(html(''));
		const server = servers.pop()!;
		await new Promise<void>((resolve) => server.close(() => resolve()));

		expect(await readRecipe(`${base}/gone`)).toEqual(bare(`${base}/gone`));
	});

	it('Scenario: Blocked page is a fallback', async () => {
		const base = await serve((_, res) => {
			res.writeHead(403, { 'content-type': 'text/html' });
			res.end('<title>Access denied</title><meta property="og:title" content="Blocked">');
		});

		expect(await readRecipe(`${base}/r`)).toEqual(bare(`${base}/r`));
	});

	it('Scenario: Slow page times out', async () => {
		const base = await serve(() => {});
		const started = Date.now();
		const result = await readRecipe(`${base}/slow`, { timeoutMs: 200 });

		expect(result).toEqual(bare(`${base}/slow`));
		expect(Date.now() - started).toBeLessThan(2000);
	});

	it('times out a page that stalls after the headers', async () => {
		const base = await serve((_, res) => {
			res.writeHead(200, { 'content-type': 'text/html' });
			res.write('<html><head><title>Half');
		});
		const result = await readRecipe(`${base}/stall`, { timeoutMs: 200 });

		expect(result).toEqual(bare(`${base}/stall`));
	});

	it('Scenario: Oversized page is a fallback', async () => {
		let written = 0;
		let closed: () => void;
		const clientGone = new Promise<void>((resolve) => (closed = resolve));
		const base = await serve((_, res) => {
			res.writeHead(200, { 'content-type': 'text/html' });
			const chunk = Buffer.alloc(64 * 1024, 'a');
			const pump = () => {
				while (!res.destroyed) {
					written += chunk.length;
					if (!res.write(chunk)) return void res.once('drain', pump);
				}
			};
			res.on('close', () => closed());
			pump();
		});
		const result = await readRecipe(`${base}/huge`, { timeoutMs: 5000 });
		await clientGone;

		expect(result).toEqual(bare(`${base}/huge`));
		expect(written).toBeGreaterThan(MAX_PAGE_BYTES);
		expect(written).toBeLessThan(MAX_PAGE_BYTES * 4);
	});

	it('rejects an oversized page announced by content-length without reading it', async () => {
		const base = await serve((_, res) => {
			res.writeHead(200, { 'content-type': 'text/html', 'content-length': String(MAX_PAGE_BYTES + 1) });
			res.write('x');
		});

		expect(await readRecipe(`${base}/huge`, { timeoutMs: 2000 })).toEqual(bare(`${base}/huge`));
	});

	it('Scenario: Only http and https URLs are fetched', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch');

		for (const bad of ['file:///etc/passwd', 'ftp://x.org/r', 'not a url']) {
			expect(await readRecipe(bad), bad).toEqual({ kind: 'invalid' });
		}
		expect(fetchSpy).not.toHaveBeenCalled();
	});
});
