import { describe, expect, it } from 'vitest';
import { fold } from './text.ts';

describe('fold', () => {
	it('lowercases ASCII and umlauts', () => {
		expect(fold('Käse ÄPFEL Öl Über')).toBe('käse äpfel öl über');
	});

	it('trims and collapses runs of whitespace', () => {
		expect(fold('  Main \t Course\n ')).toBe('main course');
	});

	it('normalises decomposed characters to NFC', () => {
		const decomposed = 'Käse';

		expect(fold(decomposed)).toBe('käse');
		expect(fold(decomposed)).toBe(fold('KÄSE'));
	});

	it('returns an empty string for blank input', () => {
		expect(fold('   ')).toBe('');
	});
});
