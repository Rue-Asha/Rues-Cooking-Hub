import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const contract = readFileSync('docs/functional-contract.md', 'utf8');
const product = readFileSync('PRODUCT.md', 'utf8');
const copySection = contract.slice(contract.indexOf('## 6. Copy list'), contract.indexOf('## 7.'));

test('Scenario: Contract covers Eating Out', () => {
	expect(contract).toContain('J16.');
	for (const route of ['/eating-out', '/eating-out/new', '/eating-out/[id]', '/eating-out/[id]/edit']) {
		expect(contract).toMatch(new RegExp(`^### 4\\.\\d+ \`${route.replace(/[[\]/]/g, '\\$&')}\``, 'm'));
		expect(contract).toMatch(new RegExp(`^\\| \`${route.replace(/[[\]/]/g, '\\$&')}\` \\|`, 'm'));
	}
	expect(copySection).toContain('Search spots');
	expect(copySection).toContain('Add spot');
	expect(contract).toContain('16 of 16 covered');
});

test('Scenario: Product names five areas', () => {
	const context = product.slice(product.indexOf('## Operating Context'));
	expect(context).toMatch(/Five areas:/);
	expect(context).toContain('Eating Out');
});
