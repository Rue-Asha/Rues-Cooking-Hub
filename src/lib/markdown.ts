import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false, linkify: false });

// a link with any other scheme (or none) is not parsed and stays as its source text
md.validateLink = (url) => /^(https?|mailto):/i.test(url.trim());

export function renderMarkdown(source: string): string {
	return source.trim() ? md.render(source) : '';
}

export function renderInline(source: string): string {
	return md.renderInline(source);
}
