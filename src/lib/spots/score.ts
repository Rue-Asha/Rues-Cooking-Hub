export type ScoreParse = { ok: true; hundredths: number } | { ok: false; reason: 'empty' | 'invalid' };

// string-based on purpose: parseFloat("8.75") * 100 can land on 874.99999
export function parseScore(raw: string): ScoreParse {
	const text = raw.trim();
	if (!text) return { ok: false, reason: 'empty' };
	const m = /^(\d{1,2})(?:[.,](\d{1,2}))?$/.exec(text);
	if (!m) return { ok: false, reason: 'invalid' };
	const hundredths = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
	return hundredths >= 100 && hundredths <= 1000 ? { ok: true, hundredths } : { ok: false, reason: 'invalid' };
}

export function formatScore(hundredths: number): string {
	return `${Math.floor(hundredths / 100)}.${String(hundredths % 100).padStart(2, '0')}`;
}
