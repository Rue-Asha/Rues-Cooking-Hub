import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COPY, tagsShowAll } from './copy.ts';

const contract = readFileSync('docs/functional-contract.md', 'utf8');
const copyList = contract.slice(contract.indexOf('## 6. Copy list'), contract.indexOf('## 7.'));

const leaves = (value: unknown): string[] =>
	typeof value === 'string' ? [value] : Object.values(value as object).flatMap(leaves);

describe('copy', () => {
	it('Scenario: Contract strings stay', () => {
		const missing = leaves(COPY).filter((text) => !copyList.includes(text));
		expect(missing).toEqual([]);
	});

	it('Scenario: New strings are in the contract', () => {
		const added = [
			'Add to your kitchen',
			'Add recipe',
			'Add to plan',
			'Add an item',
			'Add spot',
			'Recipe',
			'Plan entry',
			'List item',
			'Paste a link or write one by hand',
			'Put a recipe or a note on a day',
			'Add a line to the shopping list',
			'Show all N tags',
			'Show fewer tags',
			'Search spots',
			'No tags yet',
			'Tags are added while you edit a recipe.'
		];
		for (const text of added) expect(copyList, text).toContain(text);
		expect(Object.values(COPY.contextAdd)).toEqual(['Add to your kitchen', 'Add recipe', 'Add to plan', 'Add an item', 'Add spot']);
		expect(tagsShowAll('N')).toBe('Show all N tags');
		expect(COPY.phoneLabel.spots).toBe('Spots');
	});
});
