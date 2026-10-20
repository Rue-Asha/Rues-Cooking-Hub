import { describe, expect, it } from 'vitest';
import { renderInline, renderMarkdown } from './markdown.ts';

describe('renderMarkdown', () => {
	it('Scenario: Notes render Markdown', () => {
		const html = renderMarkdown('**Crispy** edges, see [this](https://example.com)');

		expect(html).toContain('<strong>Crispy</strong>');
		expect(html).toMatch(/<a href="https:\/\/example\.com"[^>]*>this<\/a>/);
	});

	it('Scenario: Unsafe link schemes stay text', () => {
		const html = renderMarkdown('[x](javascript:alert(1))');

		expect(html).not.toMatch(/<a[^>]*href="javascript:/i);
		expect(html).toContain('[x](javascript:alert(1))');
	});

	it('keeps mailto links', () => {
		expect(renderMarkdown('[me](mailto:rue@example.com)')).toContain('<a href="mailto:rue@example.com"');
	});

	it('drops data: and vbscript: links', () => {
		const html = renderMarkdown('[a](data:text/html,<b>x</b>) [b](vbscript:msgbox) [c](JAVASCRIPT:alert(1))');

		expect(html).not.toContain('<a');
	});

	it('shows raw HTML as text', () => {
		const html = renderMarkdown('<script>window.__pwned=1</script><img src=x onerror="window.__pwned=2">');

		expect(html).not.toContain('<script');
		expect(html).not.toContain('<img');
		expect(html).toContain('&lt;script&gt;');
	});

	it('leaves bare URLs as text', () => {
		expect(renderMarkdown('see https://example.com')).not.toContain('<a');
	});

	it('renders an empty string for blank notes', () => {
		expect(renderMarkdown('  ')).toBe('');
	});
});

describe('renderInline', () => {
	it('renders a step line without a paragraph', () => {
		expect(renderInline('Fold in the *butter*')).toBe('Fold in the <em>butter</em>');
	});

	it('keeps raw HTML as text', () => {
		expect(renderInline('<b>hot</b>')).toBe('&lt;b&gt;hot&lt;/b&gt;');
	});
});
