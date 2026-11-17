import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = 'src/routes/__mockups/redesign';
const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('Gate 4 wireframes: shell and Home', () => {
	it('has a page for every shell and Home screen', () => {
		for (const slug of ['wire/shell', 'wire/shell/plus', 'wire/shell/placement', 'wire/shell/eating-out', 'wire/home']) {
			expect(existsSync(join(root, slug, '+page.svelte')), slug).toBe(true);
		}
	});

	it('the Frame shows both bars with the five areas, the spot actions and the round plus', () => {
		const frame = read('Frame.svelte');
		expect(frame).toContain('TopBar');
		expect(frame).toContain('PhoneBar');
		const links = read('wire/shell/links.ts');
		for (const label of ['Search recipes', 'Add recipe', 'Search spots', 'Add spot', 'Eating Out', 'Home', 'Recipes', 'Plan', 'List', 'Spots']) expect(links).toContain(label);
		expect(read('wire/shell/PhoneBar.svelte')).toContain('class="plus"');
	});

	it('the Home choice sheet offers Recipe, Plan entry and List item', () => {
		const sheet = read('wire/shell/HomeSheet.svelte');
		for (const label of ['Recipe', 'Plan entry', 'List item']) expect(sheet).toContain(label);
	});
});
