import { readFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import sharp from 'sharp';

export interface FixtureServer {
	url: string;
	close(): Promise<void>;
}

const dirs = [new URL('./fixtures/import/', import.meta.url), new URL('../fixtures/import/', import.meta.url)];

async function page(name: string): Promise<Buffer | null> {
	for (const dir of dirs) {
		try {
			return await readFile(new URL(name, dir));
		} catch {
			// next directory
		}
	}
	return null;
}

const jpeg = (name: string) =>
	sharp({ create: { width: 640, height: 480, channels: 3, background: name === 'pie' ? '#b4432f' : '#55633f' } })
		.jpeg()
		.toBuffer();

// Serves the import fixtures to the app server so e2e never reaches a real site:
//   /pages/<name>.html[?delay=<ms>]  e2e/fixtures/import/ first, then fixtures/import/
//   /img/<name>.jpg                  a generated JPEG; /img/missing.jpg answers 404
//   /status/<code>                   an empty page with that status
export async function startFixtureServer(): Promise<FixtureServer> {
	const server: Server = createServer(async (req, res) => {
		const url = new URL(req.url ?? '/', 'http://fixture');
		const [, kind, file = ''] = url.pathname.split('/');
		if (kind === 'status') {
			res.writeHead(Number(file) || 500).end();
		} else if (kind === 'img' && /^[a-z-]+\.jpg$/.test(file) && file !== 'missing.jpg') {
			res.writeHead(200, { 'content-type': 'image/jpeg' }).end(await jpeg(file.slice(0, -4)));
		} else if (kind === 'pages' && /^[a-z0-9-]+\.html$/.test(file)) {
			const body = await page(file);
			if (!body) return void res.writeHead(404).end();
			await new Promise((resolve) => setTimeout(resolve, Number(url.searchParams.get('delay')) || 0));
			res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(body);
		} else {
			res.writeHead(404).end();
		}
	});
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	const { port } = server.address() as AddressInfo;
	return {
		url: `http://127.0.0.1:${port}`,
		close: () =>
			new Promise<void>((resolve) => {
				server.closeAllConnections();
				server.close(() => resolve());
			})
	};
}
