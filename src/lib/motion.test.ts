import { readdirSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { OnNavigate } from '$app/navigation';
import { flipOptions, heroName, pop, reducedMotion, rise, slideOut, stagger, viewTransition } from './motion.ts';

function prefersReduced(reduce: boolean) {
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: reduce && query === '(prefers-reduced-motion: reduce)',
		media: query
	}));
}

function properties(css: string): string[] {
	return css
		.split(';')
		.map((d) => d.split(':')[0].trim())
		.filter(Boolean);
}


const srcDir = fileURLToPath(new URL('..', import.meta.url));
const stylesDir = fileURLToPath(new URL('./styles/', import.meta.url));

function sourceFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		const path = `${dir}${e.name}`;
		if (e.isDirectory()) return sourceFiles(`${path}/`);
		return /\.(svelte|css)$/.test(e.name) ? [path] : [];
	});
}

const files = sourceFiles(srcDir).map((path) => {
	const text = readFileSync(path, 'utf8');
	const styles = path.endsWith('.css') ? [text] : [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
	return { path, name: relative(srcDir, path), text, css: styles.join('\n').replace(/\/\*[\s\S]*?\*\//g, '') };
});

// movement and entrances animate transform and opacity; these are the documented exceptions (design-system spec)
const stateColours = ['color', 'background', 'background-color', 'border-color', 'box-shadow', 'outline-color', 'fill', 'stroke'];
const heightExceptions = ['lib/recipes/SectionsEditor.svelte'];
const inlineSizeExceptions = ['lib/shell/AppNav.svelte', 'lib/ui/PillNav.svelte'];

function topLevel(list: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let cur = '';
	for (const ch of list) {
		if (ch === '(') depth++;
		if (ch === ')') depth--;
		if (ch === ',' && depth === 0) {
			out.push(cur.trim());
			cur = '';
		} else cur += ch;
	}
	return [...out, cur.trim()].filter(Boolean);
}

function animatedProperties(css: string, name: string): string[] {
	const found: string[] = [];
	for (const m of css.matchAll(/(?<![-\w])transition(?:-property)?\s*:\s*([^;}]+)/g)) {
		for (const part of topLevel(m[1])) found.push(`${name}: transition ${part.split(/\s+/)[0]}`);
	}
	for (const m of css.matchAll(/@keyframes\s+[-\w]+\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)) {
		for (const decl of m[1].matchAll(/\{([^{}]*)\}/g))
			for (const d of decl[1].split(';')) {
				const prop = d.split(':')[0].trim();
				if (prop && prop !== 'animation-timing-function') found.push(`${name}: keyframes ${prop}`);
			}
	}
	return found;
}

function offenders(): string[] {
	const allowed = ['transform', 'opacity', 'none'];
	const out: string[] = [];
	for (const f of files) {
		for (const entry of animatedProperties(f.css, f.name)) {
			const prop = entry.split(' ').pop()!;
			if (allowed.includes(prop) || stateColours.includes(prop)) continue;
			if (prop === 'inline-size' && inlineSizeExceptions.includes(f.name)) continue;
			out.push(entry);
		}
		for (const m of f.text.matchAll(/\b(?:transition|in|out):(slide|blur|draw)\b/g))
			if (!heightExceptions.includes(f.name)) out.push(`${f.name}: ${m[1]} transition`);
	}
	return out;
}

function stateColourKeyframes(): string[] {
	const out: string[] = [];
	for (const f of files)
		for (const entry of animatedProperties(f.css, f.name))
			if (entry.includes('keyframes') && stateColours.includes(entry.split(' ').pop()!)) out.push(entry);
	return out;
}

const node = {} as Element;
const primitives = { rise: () => rise(node, { delay: 80, y: 20 }), pop: () => pop(node), slideOut: () => slideOut(node) };

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('motion', () => {
	it('reducedMotion follows the media query and is false without matchMedia', () => {
		prefersReduced(true);
		expect(reducedMotion()).toBe(true);
		prefersReduced(false);
		expect(reducedMotion()).toBe(false);
		vi.stubGlobal('matchMedia', undefined);
		expect(reducedMotion()).toBe(false);
	});

	it('Scenario: Reduced motion makes transitions instant', () => {
		prefersReduced(true);
		for (const [name, make] of Object.entries(primitives)) {
			const config = make();
			const instant = (config.duration ?? 0) === 0;
			const fadeOnly = config.css ? properties(config.css(0.5, 0.5)).every((p) => p === 'opacity') : true;
			expect(instant || fadeOnly, name).toBe(true);
			expect(config.delay ?? 0, name).toBe(0);
		}
		expect(flipOptions().duration).toBe(0);
	});

	it('Scenario: Motion animates only transform and opacity', () => {
		for (const reduce of [false, true]) {
			prefersReduced(reduce);
			for (const [name, make] of Object.entries(primitives)) {
				const config = make();
				if (!config.css) continue;
				for (const p of properties(config.css(0.5, 0.5))) expect(['transform', 'opacity'], name).toContain(p);
			}
		}
		prefersReduced(false);
		for (const make of Object.values(primitives)) expect(make().duration).toBeGreaterThan(0);

		expect(files.length).toBeGreaterThan(50);
		expect(offenders()).toEqual([]);
		// colour changes are for state transitions only; a keyframe animation moves or fades
		expect(stateColourKeyframes()).toEqual([]);
	});

	it('Scenario: Components use no raw colour', () => {
		const raw = files
			.filter((f) => !f.path.startsWith(stylesDir))
			.flatMap((f) => [...f.css.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)].map((m) => `${f.name}: ${m[0]}`));
		expect(raw).toEqual([]);
	});

	it('every transition in the app names its property (never all)', () => {
		expect(files.flatMap((f) => (/transition\s*:\s*all\b/.test(f.css) ? [f.name] : []))).toEqual([]);
	});

	it('stagger spaces entrances 40 ms apart and caps the delay', () => {
		expect([0, 1, 2, 3].map(stagger)).toEqual([0, 40, 80, 120]);
		expect(stagger(100)).toBe(stagger(12));
	});

	it('flipOptions glides when motion is allowed', () => {
		prefersReduced(false);
		const { duration, easing } = flipOptions();
		expect(duration).toBeGreaterThan(0);
		expect(easing(0)).toBeCloseTo(0);
		expect(easing(1)).toBeCloseTo(1);
	});

	it('viewTransition starts a transition only when supported and motion is allowed', async () => {
		const navigation = { complete: Promise.resolve() } as unknown as OnNavigate;
		const start = vi.fn((update: () => Promise<void>) => {
			void update();
		});

		prefersReduced(true);
		vi.stubGlobal('document', { startViewTransition: start });
		expect(viewTransition(navigation)).toBeUndefined();
		expect(start).not.toHaveBeenCalled();

		prefersReduced(false);
		vi.stubGlobal('document', {});
		expect(viewTransition(navigation)).toBeUndefined();

		vi.stubGlobal('document', { startViewTransition: start });
		await viewTransition(navigation);
		expect(start).toHaveBeenCalledOnce();
	});

	it('heroName names the shared hero element', () => {
		expect(heroName(12)).toBe('recipe-hero-12');
	});
});
