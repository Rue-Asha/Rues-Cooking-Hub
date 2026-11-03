import { describe, expect, it } from 'vitest';
import { formatScore, parseScore } from './score.ts';

describe('parseScore', () => {
	it('Scenario: Valid scores parse to hundredths', () => {
		const read = (raw: string) => parseScore(raw);

		expect(['8.75', '8,75', '10', '1', ' 9.5 ', '10.00'].map(read)).toEqual(
			[875, 875, 1000, 100, 950, 1000].map((hundredths) => ({ ok: true, hundredths }))
		);
	});

	it('Scenario: Invalid scores are rejected', () => {
		const reasons = ['0.99', '10.01', '8.755', 'abc', '8.', ',5', ''].map((raw) => {
			const r = parseScore(raw);
			return r.ok ? 'ok' : r.reason;
		});

		expect(reasons).toEqual(['invalid', 'invalid', 'invalid', 'invalid', 'invalid', 'invalid', 'empty']);
	});

	it('treats whitespace only as empty and refuses exponents, signs and a second separator', () => {
		expect(parseScore('   ')).toEqual({ ok: false, reason: 'empty' });
		for (const raw of ['1e1', '+8', '-8', '8.7.5', '8,7,5', '008', '8 .5'])
			expect(parseScore(raw), raw).toEqual({ ok: false, reason: 'invalid' });
	});
});

describe('formatScore', () => {
	it('Scenario: Scores display with two decimals and a dot', () => {
		expect([900, 875, 1000, 810].map(formatScore)).toEqual(['9.00', '8.75', '10.00', '8.10']);
	});
});
